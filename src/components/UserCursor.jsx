import { FaMousePointer } from 'react-icons/fa'

const UserCursor = ({ user }) => {
  if (!user || !user.x || !user.y) return null
  
  return (
    <div 
      className="user-cursor"
      style={{ 
        transform: `translate(${user.x}px, ${user.y}px)`,
        color: user.color || '#eab308'
      }}
    >
      <FaMousePointer size={16} />
      <div 
        className="absolute top-5 left-2 px-2 py-1 text-xs font-medium text-white rounded-md whitespace-nowrap"
        style={{ backgroundColor: user.color || '#eab308' }}
      >
        {user.name}
      </div>
    </div>
  )
}

export default UserCursor
