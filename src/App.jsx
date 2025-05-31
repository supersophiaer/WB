import { useEffect, useState } from 'react'
import Whiteboard from './components/Whiteboard'
import Toolbar from './components/Toolbar'
import UserPanel from './components/UserPanel'
import { useSocket } from './context/SocketContext'
import { useUser } from './context/UserContext'
import { useTheme } from './context/ThemeContext'
import JoinModal from './components/JoinModal'
import Minimap from './components/Minimap'
import ZoomControls from './components/ZoomControls'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const { socket, connected } = useSocket()
  const { user, setUser } = useUser()
  const { isDarkMode } = useTheme()
  const [showJoinModal, setShowJoinModal] = useState(true)
  const [roomId, setRoomId] = useState(() => {
    // Get room ID from URL or generate a random one
    const params = new URLSearchParams(window.location.search)
    return params.get('room') || Math.random().toString(36).substring(2, 8)
  })

  useEffect(() => {
    // Update URL with room ID for sharing
    const url = new URL(window.location)
    url.searchParams.set('room', roomId)
    window.history.pushState({}, '', url)
  }, [roomId])

  const handleJoin = (userData) => {
    setUser(userData)
    setShowJoinModal(false)
  }

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {!connected && <div className="loading-indicator"></div>}
      
      {showJoinModal ? (
        <JoinModal onJoin={handleJoin} roomId={roomId} />
      ) : (
        <>
          <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-2 flex justify-between items-center`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mr-2">
                <path d="M2 3h20"></path>
                <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                <path d="m7 21 5-5 5 5"></path>
              </svg>
              <h1 className="text-xl font-bold">Collaborative Whiteboard</h1>
            </div>
            <div className="flex items-center">
              <div className={`mr-4 text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                Room: <span className={`font-mono ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} px-2 py-1 rounded`}>{roomId}</span>
              </div>
              <ThemeToggle />
              <div className="ml-4">
                <UserPanel />
              </div>
            </div>
          </header>
          
          <main className="flex-1 relative overflow-hidden">
            <Toolbar />
            <Whiteboard />
            <Minimap />
            <ZoomControls />
          </main>
        </>
      )}
    </div>
  )
}

export default App
