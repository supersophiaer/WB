import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { FaUser, FaUsers, FaCircle } from 'react-icons/fa'

const UserPanel = () => {
  const { user } = useUser()
  const [showUserList, setShowUserList] = useState(false)
  
  // Mock data for active users since we're not using the cursors from WhiteboardContext
  const activeUsers = user ? [
    {
      id: user.id,
      name: user.name,
      color: user.color
    }
  ] : []
  
  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 transition-colors"
        onClick={() => setShowUserList(!showUserList)}
      >
        <FaUsers className="text-primary-500" />
        <span className="font-medium">{activeUsers.length} Online</span>
      </button>
      
      {showUserList && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-20 animate-fadeIn">
          <div className="p-3 border-b border-slate-200">
            <h3 className="font-medium text-slate-800">Active Users</h3>
          </div>
          
          <ul className="p-2 max-h-60 overflow-y-auto">
            {activeUsers.map(activeUser => (
              <li 
                key={activeUser.id} 
                className={`flex items-center space-x-2 p-2 rounded-md ${
                  activeUser.id === user?.id ? 'bg-primary-50' : 'hover:bg-slate-50'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: activeUser.color || '#eab308' }}
                >
                  <FaUser />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {activeUser.name}
                    {activeUser.id === user?.id && " (You)"}
                  </div>
                </div>
                <FaCircle className="text-primary-500 text-xs" />
              </li>
            ))}
            
            {activeUsers.length === 0 && (
              <li className="p-3 text-center text-slate-500">
                No active users
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default UserPanel
