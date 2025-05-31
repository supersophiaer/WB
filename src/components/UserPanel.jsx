import { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useUser } from '../context/UserContext'

const UserPanel = () => {
  const { users } = useSocket()
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-full px-3 py-1"
        onClick={togglePanel}
      >
        <div 
          className="w-3 h-3 rounded-full bg-green-500"
          title="Online"
        ></div>
        <span>{users.length} online</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="p-3 border-b border-gray-700 font-medium">
            Users Online
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {users.map(u => (
              <li 
                key={u.id} 
                className={`flex items-center p-3 ${u.id === user?.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: u.color }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {u.name} {u.id === user?.id && <span className="text-xs text-gray-400">(you)</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default UserPanel
