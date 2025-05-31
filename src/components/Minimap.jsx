import { useEffect, useRef } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'

const Minimap = () => {
  const { elements, canvasRef, viewTransform, dispatch } = useWhiteboard()
  const minimapRef = useRef(null)
  const viewportRef = useRef(null)
  const scale = 0.1 // Scale factor for the minimap

  useEffect(() => {
    if (!minimapRef.current || !canvasRef.current) return
    
    const minimapCanvas = minimapRef.current
    const ctx = minimapCanvas.getContext('2d')
    const mainCanvas = canvasRef.current
    
    // Set minimap canvas size
    minimapCanvas.width = 200
    minimapCanvas.height = 150
    
    // Clear minimap
    ctx.fillStyle = '#242424'
    ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)
    
    // Draw a scaled-down version of the main canvas
    ctx.save()
    ctx.scale(scale, scale)
    
    // Draw all elements
    elements.forEach(element => {
      ctx.strokeStyle = element.color || '#ffffff'
      ctx.lineWidth = element.size || 5
      ctx.fillStyle = element.color || '#ffffff'
      
      switch (element.type) {
        case 'line':
          ctx.beginPath()
          ctx.moveTo(element.x1, element.y1)
          ctx.lineTo(element.x2, element.y2)
          ctx.stroke()
          break
        case 'rectangle':
          const minX = Math.min(element.x1, element.x2)
          const minY = Math.min(element.y1, element.y2)
          const width = Math.abs(element.x2 - element.x1)
          const height = Math.abs(element.y2 - element.y1)
          
          ctx.beginPath()
          ctx.rect(minX, minY, width, height)
          if (element.fill) {
            ctx.fill()
          }
          ctx.stroke()
          break
        case 'circle':
          const centerX = (element.x1 + element.x2) / 2
          const centerY = (element.y1 + element.y2) / 2
          const radius = Math.sqrt(
            Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)
          ) / 2
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          if (element.fill) {
            ctx.fill()
          }
          ctx.stroke()
          break
        case 'pen':
          if (!element.points || element.points.length < 2) break
          
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)
          
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y)
          }
          
          ctx.stroke()
          break
        default:
          break
      }
    })
    
    ctx.restore()
    
    // Update viewport indicator
    if (viewportRef.current && mainCanvas) {
      const vpRect = viewportRef.current
      
      const vpWidth = mainCanvas.width * scale / viewTransform.scale
      const vpHeight = mainCanvas.height * scale / viewTransform.scale
      const vpX = -viewTransform.offsetX * scale / viewTransform.scale
      const vpY = -viewTransform.offsetY * scale / viewTransform.scale
      
      vpRect.style.width = `${vpWidth}px`
      vpRect.style.height = `${vpHeight}px`
      vpRect.style.left = `${vpX}px`
      vpRect.style.top = `${vpY}px`
    }
  }, [elements, viewTransform])

  const handleMinimapClick = (e) => {
    if (!canvasRef.current) return
    
    const rect = minimapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert minimap coordinates to main canvas coordinates
    const mainX = x / scale
    const mainY = y / scale
    
    // Calculate new offset to center the view on the clicked point
    const newOffsetX = -mainX * viewTransform.scale + canvasRef.current.width / 2
    const newOffsetY = -mainY * viewTransform.scale + canvasRef.current.height / 2
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      }
    })
  }

  return (
    <div className="minimap">
      <canvas
        ref={minimapRef}
        width="200"
        height="150"
        onClick={handleMinimapClick}
      />
      <div
        ref={viewportRef}
        className="minimap-viewport"
      />
    </div>
  )
}

export default Minimap
