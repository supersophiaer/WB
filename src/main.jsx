import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import { SocketProvider } from './context/SocketContext'
import { WhiteboardProvider } from './context/WhiteboardContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <WhiteboardProvider>
            <App />
          </WhiteboardProvider>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
