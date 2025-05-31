import { useState } from 'react'
import { useUser } from '../context/UserContext'

const JoinModal = ({ onJoin, roomId }) => {
  const { createUser } = useUser()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    
    const user = createUser(name.trim())
    onJoin(user)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
            <path d="M2 3h20"></path>
            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
            <path d="m7 21 5-5 5 5"></path>
          </svg>
          <h2 className="text-2xl font-bold">Join Whiteboard</h2>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-700 rounded p-3 mb-4 flex items-center">
            <span className="text-gray-400 mr-2">Room:</span>
            <span className="font-mono bg-gray-600 px-2 py-1 rounded">{roomId}</span>
          </div>
          
          <p className="text-gray-300 mb-4">
            You're about to join a collaborative whiteboard session. Enter your name to continue.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your name"
              autoFocus
            />
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Join Whiteboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinModal
