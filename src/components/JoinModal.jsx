import { useState } from 'react'
import { FaUser, FaPalette, FaLink, FaArrowRight } from 'react-icons/fa'

const JoinModal = ({ onJoin, roomId }) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#84cc16')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name.trim()) return
    
    onJoin({
      id: Math.random().toString(36).substring(2, 10),
      name: name.trim(),
      color
    })
  }
  
  const handleCopyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Room link copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy room link:', err)
      })
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 text-white">
          <h2 className="text-2xl font-bold">Join Whiteboard</h2>
          <p className="mt-2 opacity-90">Collaborate in real-time with your team</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room ID</label>
            <div className="flex items-center">
              <div className="flex-1 bg-slate-100 px-4 py-2 rounded-lg font-mono text-slate-800 border border-slate-200">
                {roomId}
              </div>
              <button 
                type="button"
                className="ml-2 p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={handleCopyRoomLink}
                title="Copy Room Link"
              >
                <FaLink />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Share this ID with others to collaborate</p>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaUser />
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">Your Color</label>
            <div className="flex items-center">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaPalette />
                </div>
                <input
                  type="text"
                  id="colorHex"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="ml-2 h-10 w-10 rounded border border-slate-300 cursor-pointer"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <span>Join Whiteboard</span>
            <FaArrowRight className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinModal
