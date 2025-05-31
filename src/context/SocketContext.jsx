import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useUser } from './UserContext'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState([])
  const userContext = useUser() // Store the entire context instead of destructuring

  useEffect(() => {
    const socketInstance = io('/', {
      autoConnect: false,
      transports: ['websocket']
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    socketInstance.on('users', (connectedUsers) => {
      setUsers(connectedUsers)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket && userContext?.user) { // Safely access user property
      socket.auth = { user: userContext.user }
      socket.connect()
    }
  }, [socket, userContext?.user]) // Use optional chaining in dependency array

  return (
    <SocketContext.Provider value={{ socket, connected, users }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
