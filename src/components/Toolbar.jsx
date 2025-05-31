import { useState } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'
import { FaPen, FaSquare, FaCircle, FaFont, FaImage, FaEraser, FaHandPaper, FaMouse, FaUndo, FaRedo, FaTrash, FaSave, FaDownload, FaMagic } from 'react-icons/fa'
import { HexColorPicker } from 'react-colorful'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'

const Toolbar = () => {
  const { 
    tool, 
    color, 
    size, 
    fill, 
    dispatch, 
    canvasRef,
    selectedElement
  } = useWhiteboard()
  
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizeSlider, setShowSizeSlider] = useState(false)

  const handleToolChange = (newTool) => {
    dispatch({ type: 'SET_TOOL', payload: newTool })
  }

  const handleColorChange = (newColor) => {
    dispatch({ type: 'SET_COLOR', payload: newColor })
  }

  const handleSizeChange = (e) => {
    dispatch({ type: 'SET_SIZE', payload: parseInt(e.target.value) })
  }

  const handleFillToggle = () => {
    dispatch({ type: 'SET_FILL', payload: !fill })
  }

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      dispatch({ type: 'SET_ELEMENTS', payload: [] })
    }
  }

  const handleDelete = () => {
    if (selectedElement) {
      dispatch({ type: 'DELETE_ELEMENT', payload: selectedElement.id })
    }
  }

  const handleSave = async () => {
    if (!canvasRef.current) return
    
    try {
      const dataUrl = await toPng(canvasRef.current, { 
        backgroundColor: '#242424',
        pixelRatio: 2
      })
      
      saveAs(dataUrl, `whiteboard-${new Date().toISOString().slice(0, 10)}.png`)
    } catch (error) {
      console.error('Error saving whiteboard:', error)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      dispatch({ 
        type: 'SET_TOOL', 
        payload: 'image' 
      })
      
      // Store the image data in localStorage for use when drawing
      localStorage.setItem('uploadedImage', event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSmartShape = () => {
    dispatch({ type: 'SET_TOOL', payload: 'smartShape' })
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-2">
      {/* Drawing Tools */}
      <div className="flex space-x-1">
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'pen' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('pen')}
          title="Pen"
        >
          <FaPen />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'line' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('line')}
          title="Line"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'rectangle' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('rectangle')}
          title="Rectangle"
        >
          <FaSquare />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'circle' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('circle')}
          title="Circle"
        >
          <FaCircle />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'text' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('text')}
          title="Text"
        >
          <FaFont />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'smartShape' ? 'tool-active' : ''}`}
          onClick={handleSmartShape}
          title="Smart Shape Recognition"
        >
          <FaMagic />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      {/* Selection Tools */}
      <div className="flex space-x-1">
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'select' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('select')}
          title="Select"
        >
          <FaMouse />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'pan' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('pan')}
          title="Pan"
        >
          <FaHandPaper />
        </button>
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${tool === 'eraser' ? 'tool-active' : ''}`}
          onClick={() => handleToolChange('eraser')}
          title="Eraser"
        >
          <FaEraser />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      {/* Style Controls */}
      <div className="flex space-x-1 items-center">
        <div className="relative">
          <button 
            className="w-6 h-6 rounded border border-gray-600"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
          />
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 z-20">
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative z-20">
                <HexColorPicker color={color} onChange={handleColorChange} />
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="p-2 rounded hover:bg-gray-700"
            onClick={() => setShowSizeSlider(!showSizeSlider)}
            title="Brush Size"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r={size} fill="currentColor" />
            </svg>
          </button>
          {showSizeSlider && (
            <div className="absolute top-full left-0 mt-2 bg-gray-800 p-2 rounded shadow-lg z-20">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={size} 
                onChange={handleSizeChange}
                className="w-32"
              />
              <div className="text-center mt-1">{size}px</div>
            </div>
          )}
        </div>
        
        <button 
          className={`p-2 rounded hover:bg-gray-700 ${fill ? 'tool-active' : ''}`}
          onClick={handleFillToggle}
          title={fill ? "Filled" : "Outline"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" 
              stroke="currentColor" 
              fill={fill ? "currentColor" : "none"} 
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      {/* History Controls */}
      <div className="flex space-x-1">
        <button 
          className="p-2 rounded hover:bg-gray-700"
          onClick={handleUndo}
          title="Undo"
        >
          <FaUndo />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-700"
          onClick={handleRedo}
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      {/* File Operations */}
      <div className="flex space-x-1">
        <label className="p-2 rounded hover:bg-gray-700 cursor-pointer" title="Upload Image">
          <FaImage />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
        </label>
        <button 
          className="p-2 rounded hover:bg-gray-700"
          onClick={handleSave}
          title="Save as PNG"
        >
          <FaDownload />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-700"
          onClick={handleDelete}
          title="Delete Selected"
          disabled={!selectedElement}
        >
          <FaTrash className={selectedElement ? '' : 'opacity-50'} />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-700"
          onClick={handleClear}
          title="Clear All"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
