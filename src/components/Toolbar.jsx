import { useState } from 'react'
import { useWhiteboard } from '../context/WhiteboardContext'
import { FaPen, FaSquare, FaCircle, FaFont, FaImage, FaEraser, FaHandPaper, FaMouse, FaUndo, FaRedo, FaTrash, FaDownload, FaMagic } from 'react-icons/fa'
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
        backgroundColor: '#ffffff',
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
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 rounded-lg shadow-xl p-3 flex flex-col items-center gap-3">
      {/* Drawing Tools */}
      <div className="flex flex-col gap-2">
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'pen' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('pen')}
          title="Pen"
        >
          <FaPen size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'line' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('line')}
          title="Line"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'rectangle' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('rectangle')}
          title="Rectangle"
        >
          <FaSquare size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'circle' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('circle')}
          title="Circle"
        >
          <FaCircle size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'text' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('text')}
          title="Text"
        >
          <FaFont size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'smartShape' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={handleSmartShape}
          title="Smart Shape Recognition"
        >
          <FaMagic size={16} />
        </button>
      </div>

      <div className="w-full h-px bg-gray-600"></div>

      {/* Selection Tools */}
      <div className="flex flex-col gap-2">
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'select' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('select')}
          title="Select"
        >
          <FaMouse size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'pan' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('pan')}
          title="Pan"
        >
          <FaHandPaper size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${tool === 'eraser' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          onClick={() => handleToolChange('eraser')}
          title="Eraser"
        >
          <FaEraser size={16} />
        </button>
      </div>

      <div className="w-full h-px bg-gray-600"></div>

      {/* Style Controls */}
      <div className="flex flex-col gap-2 items-center">
        <div className="relative">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-md overflow-hidden border-2 border-gray-600"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
            aria-label="Select color"
          />
          {showColorPicker && (
            <div className="absolute left-12 top-0 z-20">
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative z-20 bg-gray-800 p-2 rounded-lg shadow-xl">
                <HexColorPicker color={color} onChange={handleColorChange} />
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={() => setShowSizeSlider(!showSizeSlider)}
            title="Brush Size"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r={size / 2 + 2} fill="currentColor" />
            </svg>
          </button>
          {showSizeSlider && (
            <div className="absolute left-12 top-0 bg-gray-800 p-3 rounded-lg shadow-xl z-20">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={size} 
                onChange={handleSizeChange}
                className="w-32"
              />
              <div className="text-center mt-1 text-sm text-gray-300">{size}px</div>
            </div>
          )}
        </div>
        
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${fill ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
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

      <div className="w-full h-px bg-gray-600"></div>

      {/* History Controls */}
      <div className="flex flex-col gap-2">
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={handleUndo}
          title="Undo"
        >
          <FaUndo size={16} />
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={handleRedo}
          title="Redo"
        >
          <FaRedo size={16} />
        </button>
      </div>

      <div className="w-full h-px bg-gray-600"></div>

      {/* File Operations */}
      <div className="flex flex-col gap-2">
        <label className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer" title="Upload Image">
          <FaImage size={16} />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
        </label>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={handleSave}
          title="Save as PNG"
        >
          <FaDownload size={16} />
        </button>
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${selectedElement ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
          onClick={handleDelete}
          title="Delete Selected"
          disabled={!selectedElement}
        >
          <FaTrash size={16} />
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={handleClear}
          title="Clear All"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
