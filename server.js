import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server)

// Serve static files
app.use(express.static(join(__dirname, 'dist')))

// Store connected users and whiteboard elements
const rooms = new Map()

io.on('connection', (socket) => {
  const user = socket.handshake.auth.user
  let currentRoom = null
  
  if (!user || !user.id) {
    socket.disconnect()
    return
  }
  
  // Extract room ID from the referer URL
  const referer = socket.handshake.headers.referer || ''
  const urlParams = new URLSearchParams(referer.split('?')[1] || '')
  const roomId = urlParams.get('room') || 'default'
  
  currentRoom = roomId
  
  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      elements: []
    })
  }
  
  const room = rooms.get(roomId)
  
  // Add user to room
  room.users.set(user.id, {
    id: user.id,
    name: user.name,
    color: user.color
  })
  
  // Join socket room
  socket.join(roomId)
  
  // Send current users and elements to the new user
  socket.emit('users', Array.from(room.users.values()))
  socket.emit('elements', room.elements)
  
  // Notify other users about the new user
  socket.to(roomId).emit('users', Array.from(room.users.values()))
  
  // Handle cursor movement
  socket.on('cursor-move', (cursor) => {
    if (!room.users.has(user.id)) return
    
    const updatedUser = {
      ...room.users.get(user.id),
      cursor
    }
    
    room.users.set(user.id, updatedUser)
    socket.to(roomId).emit('cursor-move', user.id, cursor)
  })
  
  // Handle element updates
  socket.on('element-update', (element) => {
    const elementIndex = room.elements.findIndex(el => el.id === element.id)
    
    if (elementIndex !== -1) {
      room.elements[elementIndex] = element
    }
    
    socket.to(roomId).emit('element-update', element)
  })
  
  // Handle element additions
  socket.on('element-add', (element) => {
    room.elements.push(element)
    socket.to(roomId).emit('element-add', element)
  })
  
  // Handle element deletions
  socket.on('element-delete', (elementId) => {
    room.elements = room.elements.filter(el => el.id !== elementId)
    socket.to(roomId).emit('element-delete', elementId)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    if (!currentRoom || !rooms.has(currentRoom)) return
    
    const room = rooms.get(currentRoom)
    
    // Remove user from room
    room.users.delete(user.id)
    
    // Notify other users
    io.to(currentRoom).emit('users', Array.from(room.users.values()))
    
    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(currentRoom)
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
