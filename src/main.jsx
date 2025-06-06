import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SocketProvider } from './context/SocketContext'
import { WhiteboardProvider } from './context/WhiteboardContext'
import { UserProvider } from './context/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <SocketProvider>
        <WhiteboardProvider>
          <App />
        </WhiteboardProvider>
      </SocketProvider>
    </UserProvider>
  </React.StrictMode>,
)
