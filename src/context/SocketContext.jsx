import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useUser } from './UserContext'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState([])
  const { user } = useUser()

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
    if (socket && user) {
      socket.auth = { user }
      socket.connect()
    }
  }, [socket, user])

  return (
    <SocketContext.Provider value={{ socket, connected, users }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
