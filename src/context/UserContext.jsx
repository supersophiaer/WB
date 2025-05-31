import { createContext, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  const generateRandomColor = () => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4caf50', '#8bc34a', '#cddc39', 
      '#ffc107', '#ff9800', '#ff5722'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const createUser = (name) => {
    return {
      id: uuidv4(),
      name,
      color: generateRandomColor(),
      cursor: { x: 0, y: 0 }
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, createUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
