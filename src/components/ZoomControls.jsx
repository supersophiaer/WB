import { useWhiteboard } from '../context/WhiteboardContext'
import { FaPlus, FaMinus, FaExpand } from 'react-icons/fa'

const ZoomControls = () => {
  const { viewTransform, dispatch, canvasRef } = useWhiteboard()
  
  const handleZoomIn = () => {
    const newScale = Math.min(viewTransform.scale * 1.2, 5)
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        scale: newScale
      }
    })
  }
  
  const handleZoomOut = () => {
    const newScale = Math.max(viewTransform.scale / 1.2, 0.1)
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        scale: newScale
      }
    })
  }
  
  const handleResetZoom = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        scale: 1,
        offsetX: 0,
        offsetY: 0
      }
    })
  }
  
  return (
    <div className="zoom-controls">
      <button 
        className="zoom-button"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <FaPlus />
      </button>
      
      <div className="zoom-level">
        {Math.round(viewTransform.scale * 100)}%
      </div>
      
      <button 
        className="zoom-button"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <FaMinus />
      </button>
      
      <button 
        className="zoom-button"
        onClick={handleResetZoom}
        title="Reset View"
      >
        <FaExpand />
      </button>
    </div>
  )
}

export default ZoomControls
