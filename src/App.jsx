import { useEffect, useState } from 'react'
import Whiteboard from './components/Whiteboard'
import Toolbar from './components/Toolbar'
import UserPanel from './components/UserPanel'
import { useSocket } from './context/SocketContext'
import { useUser } from './context/UserContext'
import JoinModal from './components/JoinModal'
import Minimap from './components/Minimap'
import ZoomControls from './components/ZoomControls'

function App() {
  const { socket, connected } = useSocket()
  const { user, setUser } = useUser()
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
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {!connected && <div className="loading-indicator"></div>}
      
      {showJoinModal ? (
        <JoinModal onJoin={handleJoin} roomId={roomId} />
      ) : (
        <>
          <header className="bg-white border-b border-slate-200 p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mr-2">
                <path d="M2 3h20"></path>
                <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                <path d="m7 21 5-5 5 5"></path>
              </svg>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Collaborative Whiteboard</h1>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-sm flex items-center">
                <span className="mr-2">Room:</span> 
                <span className="font-mono bg-slate-100 px-3 py-1.5 rounded-md text-primary-600 border border-slate-200">{roomId}</span>
              </div>
              <UserPanel />
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
