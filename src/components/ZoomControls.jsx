import { FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa'
import { useWhiteboard } from '../context/WhiteboardContext'

const ZoomControls = () => {
  const { viewTransform, dispatch } = useWhiteboard()
  
  const handleZoomIn = () => {
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        scale: viewTransform.scale * 1.2
      }
    })
  }
  
  const handleZoomOut = () => {
    dispatch({
      type: 'SET_VIEW_TRANSFORM',
      payload: {
        ...viewTransform,
        scale: viewTransform.scale / 1.2
      }
    })
  }
  
  const handleResetView = () => {
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
    <div className="zoom-controls bg-white shadow-md border border-slate-200">
      <button 
        className="zoom-button bg-white hover:bg-slate-100 text-slate-700"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <FaSearchPlus />
      </button>
      
      <div className="zoom-level bg-white text-slate-700">
        {Math.round(viewTransform.scale * 100)}%
      </div>
      
      <button 
        className="zoom-button bg-white hover:bg-slate-100 text-slate-700"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <FaSearchMinus />
      </button>
      
      <button 
        className="zoom-button bg-white hover:bg-slate-100 text-slate-700"
        onClick={handleResetView}
        title="Reset View"
      >
        <FaExpand />
      </button>
    </div>
  )
}

export default ZoomControls
