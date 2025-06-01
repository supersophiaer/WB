import React, { useEffect, useRef } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'

const Minimap = () => {
  const { elements, viewTransform, canvasRef } = useWhiteboard()
  const minimapRef = useRef(null)
  const viewportRef = useRef(null)
  
  useEffect(() => {
    if (!minimapRef.current || !canvasRef.current) return
    
    const minimapCanvas = minimapRef.current
    const minimapContext = minimapCanvas.getContext('2d')
    const mainCanvas = canvasRef.current
    
    // Set minimap size
    minimapCanvas.width = 200
    minimapCanvas.height = 150
    
    // Clear minimap
    minimapContext.fillStyle = '#ffffff'
    minimapContext.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)
    
    // Draw grid pattern
    minimapContext.beginPath()
    minimapContext.strokeStyle = '#f1f5f9'
    minimapContext.lineWidth = 0.5
    
    const gridSize = 5
    for (let x = 0; x < minimapCanvas.width; x += gridSize) {
      minimapContext.moveTo(x, 0)
      minimapContext.lineTo(x, minimapCanvas.height)
    }
    
    for (let y = 0; y < minimapCanvas.height; y += gridSize) {
      minimapContext.moveTo(0, y)
      minimapContext.lineTo(minimapCanvas.width, y)
    }
    
    minimapContext.stroke()
    
    // Draw a scaled-down version of the main canvas
    if (mainCanvas.width > 0 && mainCanvas.height > 0) {
      const scaleX = minimapCanvas.width / mainCanvas.width
      const scaleY = minimapCanvas.height / mainCanvas.height
      
      minimapContext.drawImage(
        mainCanvas, 
        0, 0, mainCanvas.width, mainCanvas.height,
        0, 0, minimapCanvas.width, minimapCanvas.height
      )
      
      // Update viewport indicator
      if (viewportRef.current) {
        const viewportWidth = mainCanvas.width / viewTransform.scale
        const viewportHeight = mainCanvas.height / viewTransform.scale
        const viewportX = -viewTransform.offsetX / viewTransform.scale
        const viewportY = -viewTransform.offsetY / viewTransform.scale
        
        viewportRef.current.style.width = `${viewportWidth * scaleX}px`
        viewportRef.current.style.height = `${viewportHeight * scaleY}px`
        viewportRef.current.style.left = `${viewportX * scaleX}px`
        viewportRef.current.style.top = `${viewportY * scaleY}px`
      }
    }
  }, [elements, viewTransform, canvasRef])
  
  return (
    <div className="minimap bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden">
      <canvas ref={minimapRef} className="w-full h-full" />
      <div ref={viewportRef} className="minimap-viewport" />
    </div>
  )
}

export default Minimap
