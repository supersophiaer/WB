import { useEffect, useRef, useState } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'
import { useSocket } from '../context/SocketContext'
import { useUser } from '../context/UserContext'
import { v4 as uuidv4 } from 'uuid'
import UserCursor from './UserCursor'

const Whiteboard = () => {
  const {
    elements,
    dispatch,
    canvasRef,
    createElement,
    updateElement,
    drawElement,
    selectedElement,
    action,
    tool,
    color,
    size,
    fill,
    text,
    updateCursor,
    cursors,
    setCursors,
    viewTransform
  } = useWhiteboard()
  
  const { socket } = useSocket()
  const { user } = useUser()
  const [isDrawing, setIsDrawing] = useState(false)
  const containerRef = useRef(null)
  const [panStart, setPanStart] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = containerRef.current
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        redrawCanvas()
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleElementUpdate = (element) => {
      dispatch({ 
        type: 'UPDATE_ELEMENT', 
        payload: element 
      })
    }

    const handleElementAdd = (element) => {
      dispatch({ 
        type: 'ADD_ELEMENT', 
        payload: element 
      })
    }

    const handleElementDelete = (elementId) => {
      dispatch({ 
        type: 'DELETE_ELEMENT', 
        payload: elementId 
      })
    }

    const handleCursorMove = (userId, cursor) => {
      setCursors(prev => ({
        ...prev,
        [userId]: cursor
      }))
    }

    socket.on('element-update', handleElementUpdate)
    socket.on('element-add', handleElementAdd)
    socket.on('element-delete', handleElementDelete)
    socket.on('cursor-move', handleCursorMove)

    return () => {
      socket.off('element-update', handleElementUpdate)
      socket.off('element-add', handleElementAdd)
      socket.off('element-delete', handleElementDelete)
      socket.off('cursor-move', handleCursorMove)
    }
  }, [socket, dispatch, setCursors])

  // Draw elements when they change
  useEffect(() => {
    redrawCanvas()
  }, [elements, viewTransform])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply view transform
    context.save()
    context.translate(viewTransform.offsetX, viewTransform.offsetY)
    context.scale(viewTransform.scale, viewTransform.scale)
    
    // Draw all elements
    elements.forEach(element => {
      drawElement(context, element)
    })
    
    context.restore()
  }

  const getTransformedPoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (clientX - rect.left - viewTransform.offsetX) / viewTransform.scale
    const y = (clientY - rect.top - viewTransform.offsetY) / viewTransform.scale
    return { x, y }
  }

  const handleMouseDown = (e) => {
    if (e.button !== 0) return // Only left mouse button
    
    const { x, y } = getTransformedPoint(e.clientX, e.clientY)
    
    if (tool === 'select') {
      const element = getElementAtPosition(x, y)
      if (element) {
        dispatch({ type: 'SET_SELECTED_ELEMENT', payload: element })
        dispatch({ type: 'SET_ACTION', payload: 'moving' })
      } else {
        dispatch({ type: 'SET_SELECTED_ELEMENT', payload: null })
        dispatch({ type: 'SET_ACTION', payload: 'panning' })
        setPanStart({ x: e.clientX, y: e.clientY })
      }
    } else if (tool === 'pan') {
      dispatch({ type: 'SET_ACTION', payload: 'panning' })
      setPanStart({ x: e.clientX, y: e.clientY })
    } else {
      setIsDrawing(true)
      
      const id = uuidv4()
      const newElement = createElement(
        id, x, y, x, y, tool, 
        { color, size, fill, text, userId: user?.id }
      )
      
      dispatch({ type: 'ADD_ELEMENT', payload: newElement })
      dispatch({ type: 'SET_ACTION', payload: 'drawing' })
      
      if (socket) {
        socket.emit('element-add', newElement)
      }
    }
  }

  const handleMouseMove = (e) => {
    const { x, y } = getTransformedPoint(e.clientX, e.clientY)
    
    // Update cursor position
    updateCursor(e.clientX, e.clientY)
    
    // Show tooltip for elements
    if (tool === 'select' && !action) {
      const element = getElementAtPosition(x, y)
      if (element) {
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          text: element.type === 'text' ? element.text : `${element.type} (${element.id.slice(0, 4)})`
        })
      } else {
        setTooltip(null)
      }
    } else {
      setTooltip(null)
    }
    
    if (action === 'panning' && panStart) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      
      dispatch({
        type: 'SET_VIEW_TRANSFORM',
        payload: {
          ...viewTransform,
          offsetX: viewTransform.offsetX + dx,
          offsetY: viewTransform.offsetY + dy
        }
      })
      
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    if (!isDrawing) return
    
    const index = elements.length - 1
    const element = elements[index]
    
    if (!element) return
    
    if (element.type === 'pen') {
      const newPoints = [...element.points, { x, y }]
      const updatedElement = { ...element, points: newPoints, x2: x, y2: y }
      
      dispatch({ type: 'UPDATE_ELEMENT', payload: updatedElement })
      
      if (socket) {
        socket.emit('element-update', updatedElement)
      }
    } else {
      const updatedElement = { ...element, x2: x, y2: y }
      
      dispatch({ type: 'UPDATE_ELEMENT', payload: updatedElement })
      
      if (socket) {
        socket.emit('element-update', updatedElement)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    dispatch({ type: 'SET_ACTION', payload: null })
    setPanStart(null)
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (e.shiftKey) {
        dispatch({ type: 'REDO' })
      } else {
        dispatch({ type: 'UNDO' })
      }
    }
    
    if (e.key === 'Delete' && selectedElement) {
      dispatch({ type: 'DELETE_ELEMENT', payload: selectedElement.id })
      
      if (socket) {
        socket.emit('element-delete', selectedElement.id)
      }
    }
  }

  const getElementAtPosition = (x, y) => {
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      
      if (isPointInElement(x, y, element)) {
        return element
      }
    }
    
    return null
  }

  const isPointInElement = (x, y, element) => {
    const { x1, y1, x2, y2, type } = element
    
    if (type === 'rectangle') {
      const minX = Math.min(x1, x2)
      const maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2)
      const maxY = Math.max(y1, y2)
      
      return x >= minX && x <= maxX && y >= minY && y <= maxY
    } else if (type === 'circle') {
      const centerX = (x1 + x2) / 2
      const centerY = (y1 + y2) / 2
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2
      
      return Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) <= Math.pow(radius, 2)
    } else if (type === 'line') {
      const a = { x: x1, y: y1 }
      const b = { x: x2, y: y2 }
      const c = { x, y }
      
      const offset = distance(a, b) - (distance(a, c) + distance(b, c))
      return Math.abs(offset) < 5
    } else if (type === 'pen') {
      if (!element.points || element.points.length === 0) return false
      
      for (let i = 0; i < element.points.length; i++) {
        const point = element.points[i]
        if (Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5) {
          return true
        }
      }
      
      return false
    } else if (type === 'text') {
      const textWidth = element.text.length * (element.size || size)
      const textHeight = (element.size || size) * 2
      
      return x >= x1 && x <= x1 + textWidth && y >= y1 - textHeight && y <= y1
    } else if (type === 'image') {
      const minX = Math.min(x1, x2)
      const maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2)
      const maxY = Math.max(y1, y2)
      
      return x >= minX && x <= maxX && y >= minY && y <= maxY
    }
    
    return false
  }

  const distance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  }

  return (
    <div 
      ref={containerRef}
      className="whiteboard-container relative w-full h-full overflow-hidden bg-gray-900"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {Object.entries(cursors).map(([userId, cursor]) => {
        const remoteUser = user && userId !== user.id ? 
          { id: userId, ...cursor } : null
        
        return remoteUser ? (
          <UserCursor key={userId} user={remoteUser} />
        ) : null
      })}
      
      {tooltip && (
        <div 
          className="tooltip"
          style={{ 
            left: tooltip.x + 10, 
            top: tooltip.y + 10 
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

export default Whiteboard
