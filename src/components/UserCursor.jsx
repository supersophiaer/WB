import { useEffect, useRef } from 'react'

const UserCursor = ({ user }) => {
  const cursorRef = useRef(null)

  useEffect(() => {
    if (!cursorRef.current || !user || !user.cursor) return
    
    cursorRef.current.style.transform = `translate(${user.cursor.x}px, ${user.cursor.y}px)`
  }, [user])

  if (!user || !user.cursor) return null

  return (
    <div
      ref={cursorRef}
      className="user-cursor"
      data-name={user.name}
      style={{
        transform: `translate(${user.cursor.x}px, ${user.cursor.y}px)`,
        color: user.color,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}

export default UserCursor
