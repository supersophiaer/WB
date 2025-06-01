import { useEffect, useRef } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'

const Minimap = () => {
  const { elements, viewTransform, canvasRef, dispatch } = useWhiteboard()
  const minimapRef = useRef(null)
  const viewportRef = useRef(null)
  const isDraggingRef = useRef(false)
  
  // Draw minimap
  useEffect(() => {
    if (!minimapRef.current || !canvasRef.current) return
    
    const minimapCanvas = minimapRef.current
    const minimapContext = minimapCanvas.getContext('2d')
    const mainCanvas = canvasRef.current
    
    // Set minimap size
    minimapCanvas.width = minimapCanvas.parentElement.clientWidth
    minimapCanvas.height = minimapCanvas.parentElement.clientHeight
    
    // Clear minimap
    minimapContext.fillStyle = '#ffffff'
    minimapContext.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)
    
    // Draw grid
    minimapContext.beginPath()
    minimapContext.strokeStyle = '#f1f5f9'
    minimapContext.lineWidth = 0.5
    
    const gridSize = 10
    for (let x = 0; x < minimapCanvas.width; x += gridSize) {
      minimapContext.moveTo(x, 0)
      minimapContext.lineTo(x, minimapCanvas.height)
    }
    
    for (let y = 0; y < minimapCanvas.height; y += gridSize) {
      minimapContext.moveTo(0, y)
      minimapContext.lineTo(minimapCanvas.width, y)
    }
    
    minimapContext.stroke()
    
    // Calculate scale factor between main canvas and minimap
    const scaleX = minimapCanvas.width / mainCanvas.width
    const scaleY = minimapCanvas.height / mainCanvas.height
    
    // Draw elements on minimap
    minimapContext.save()
    minimapContext.scale(scaleX, scaleY)
    
    elements.forEach(element => {
      const { type, x1, y1, x2, y2, color } = element
      
      minimapContext.strokeStyle = color || '#eab308'
      minimapContext.fillStyle = color || '#eab308'
      minimapContext.lineWidth = 1 / Math.min(scaleX, scaleY)
      
      switch (type) {
        case 'rectangle':
          minimapContext.beginPath()
          minimapContext.rect(x1, y1, x2 - x1, y2 - y1)
          minimapContext.stroke()
          break
          
        case 'circle':
          const centerX = (x1 + x2) / 2
          const centerY = (y1 + y2) / 2
          const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2
          
          minimapContext.beginPath()
          minimapContext.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          minimapContext.stroke()
          break
          
        case 'line':
          minimapContext.beginPath()
          minimapContext.moveTo(x1, y1)
          minimapContext.lineTo(x2, y2)
          minimapContext.stroke()
          break
          
        case 'pen':
          if (!element.points || element.points.length < 2) return
          
          minimapContext.beginPath()
          minimapContext.moveTo(element.points[0].x, element.points[0].y)
          
          for (let i = 1; i < element.points.length; i++) {
            minimapContext.lineTo(element.points[i].x, element.points[i].y)
          }
          
          minimapContext.stroke()
          break
          
        default:
          break
      }
    })
    
    minimapContext.restore()
    
    // Update viewport rectangle
    if (viewportRef.current) {
      const viewport = viewportRef.current
      
      // Calculate viewport position and size
      const vpWidth = (mainCanvas.width / viewTransform.scale) * scaleX
      const vpHeight = (mainCanvas.height / viewTransform.scale) * scaleY
      const vpX = (-viewTransform.offsetX / viewTransform.scale) * scaleX
      const vpY = (-viewTransform.offsetY / viewTransform.scale) * scaleY
      
      viewport.style.width = `${vpWidth}px`
      viewport.style.height = `${vpHeight}px`
      viewport.style.transform = `translate(${vpX}px, ${vpY}px)`
    }
  }, [elements, viewTransform])
  
  const handleMinimapClick = (e) => {
    if (!minimapRef.current || !canvasRef.current) return
    
    const minimapCanvas = minimapRef.current
    const mainCanvas = canvasRef.current
    
    // Calculate scale factor between main canvas and minimap
    const scaleX = minimapCanvas.width / mainCanvas.width
    const scaleY = minimapCanvas.height / mainCanvas.height
    
    // Get click position relative to minimap
    const rect = minimapCanvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert to main canvas coordinates
    const mainX = x / scaleX
    const mainY = y / scaleY
    
    // Calculate new offset to center the view on the clicked point
    const newOffsetX = -(mainX * viewTransform.scale - mainCanvas.width / 2)
    const newOffsetY = -(mainY * viewTransform.scale - mainCanvas.height / 2)
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      }
    })
  }
  
  const handleViewportMouseDown = (e) => {
    e.stopPropagation()
    isDraggingRef.current = true
  }
  
  const handleMinimapMouseMove = (e) => {
    if (!isDraggingRef.current || !minimapRef.current || !canvasRef.current) return
    
    const minimapCanvas = minimapRef.current
    const mainCanvas = canvasRef.current
    
    // Calculate scale factor between main canvas and minimap
    const scaleX = minimapCanvas.width / mainCanvas.width
    const scaleY = minimapCanvas.height / mainCanvas.height
    
    // Get mouse position relative to minimap
    const rect = minimapCanvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert to main canvas coordinates
    const mainX = x / scaleX
    const mainY = y / scaleY
    
    // Calculate new offset to center the view on the mouse position
    const newOffsetX = -(mainX * viewTransform.scale - mainCanvas.width / 2)
    const newOffsetY = -(mainY * viewTransform.scale - mainCanvas.height / 2)
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      }
    })
  }
  
  const handleMinimapMouseUp = () => {
    isDraggingRef.current = false
  }
  
  return (
    <div className="minimap">
      <canvas
        ref={minimapRef}
        className="w-full h-full"
        onClick={handleMinimapClick}
        onMouseMove={handleMinimapMouseMove}
        onMouseUp={handleMinimapMouseUp}
        onMouseLeave={handleMinimapMouseUp}
      />
      <div
        ref={viewportRef}
        className="minimap-viewport"
        onMouseDown={handleViewportMouseDown}
      />
    </div>
  )
}

export default Minimap
