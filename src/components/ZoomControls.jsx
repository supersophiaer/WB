import React from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'
import { FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa'

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
  
  const handleReset = () => {
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
    <div className="zoom-controls bg-white shadow-lg rounded-lg border border-slate-200 flex items-center">
      <button 
        className="zoom-button text-slate-700 hover:bg-slate-100 transition-colors duration-200"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <FaSearchMinus />
      </button>
      
      <div className="zoom-level text-slate-700 font-medium">
        {Math.round(viewTransform.scale * 100)}%
      </div>
      
      <button 
        className="zoom-button text-slate-700 hover:bg-slate-100 transition-colors duration-200"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <FaSearchPlus />
      </button>
      
      <button 
        className="zoom-button text-slate-700 hover:bg-slate-100 transition-colors duration-200"
        onClick={handleReset}
        title="Reset View"
      >
        <FaExpand />
      </button>
    </div>
  )
}

export default ZoomControls
