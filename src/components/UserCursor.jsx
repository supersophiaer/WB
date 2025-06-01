import React from 'react'

const UserCursor = ({ user }) => {
  const { x, y, name, color } = user
  
  const cursorColor = color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  
  return (
    <div 
      className="user-cursor"
      style={{ 
        transform: `translate(${x}px, ${y}px)`,
      }}
      data-name={name || `User ${user.id.slice(0, 4)}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M5 3L19 12L12 13L9 20L5 3Z" 
          fill={cursorColor} 
          stroke="white" 
          strokeWidth="1.5"
        />
      </svg>
      <div 
        className="absolute top-6 left-0 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap"
        style={{ 
          backgroundColor: cursorColor,
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {name || `User ${user.id.slice(0, 4)}`}
      </div>
    </div>
  )
}

export default UserCursor
