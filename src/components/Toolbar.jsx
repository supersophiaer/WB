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

  const toolGroups = [
    {
      title: "Drawing Tools",
      tools: [
        { id: 'pen', icon: <FaPen />, tooltip: "Pen" },
        { id: 'line', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>, tooltip: "Line" },
        { id: 'rectangle', icon: <FaSquare />, tooltip: "Rectangle" },
        { id: 'circle', icon: <FaCircle />, tooltip: "Circle" },
        { id: 'text', icon: <FaFont />, tooltip: "Text" },
        { id: 'smartShape', icon: <FaMagic />, tooltip: "Smart Shape Recognition" }
      ]
    },
    {
      title: "Selection Tools",
      tools: [
        { id: 'select', icon: <FaMouse />, tooltip: "Select" },
        { id: 'pan', icon: <FaHandPaper />, tooltip: "Pan" },
        { id: 'eraser', icon: <FaEraser />, tooltip: "Eraser" }
      ]
    },
    {
      title: "History Controls",
      tools: [
        { id: 'undo', icon: <FaUndo />, tooltip: "Undo", action: handleUndo },
        { id: 'redo', icon: <FaRedo />, tooltip: "Redo", action: handleRedo }
      ]
    },
    {
      title: "File Operations",
      tools: [
        { id: 'image', icon: <FaImage />, tooltip: "Upload Image", isFileUpload: true },
        { id: 'save', icon: <FaDownload />, tooltip: "Save as PNG", action: handleSave },
        { id: 'delete', icon: <FaTrash />, tooltip: "Delete Selected", action: handleDelete, disabled: !selectedElement },
        { id: 'clear', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>, tooltip: "Clear All", action: handleClear }
      ]
    }
  ]

  return (
    <div className="absolute top-0 left-4 bottom-0 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col items-center space-y-4 my-4 border border-slate-200">
      {toolGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="w-full">
          {groupIndex > 0 && <div className="w-full h-px bg-slate-200 my-2"></div>}
          <div className="flex flex-col space-y-1">
            {group.tools.map((toolItem) => {
              if (toolItem.isFileUpload) {
                return (
                  <label 
                    key={toolItem.id}
                    className="p-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors duration-200 flex items-center justify-center text-slate-700 hover:text-primary-600" 
                    title={toolItem.tooltip}
                  >
                    {toolItem.icon}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                )
              }
              
              return (
                <button 
                  key={toolItem.id}
                  className={`p-2 rounded-md hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center ${
                    tool === toolItem.id 
                      ? 'bg-primary-50 text-primary-600 shadow-sm' 
                      : 'text-slate-700 hover:text-primary-600'
                  } ${toolItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={toolItem.action || (() => handleToolChange(toolItem.id))}
                  title={toolItem.tooltip}
                  disabled={toolItem.disabled}
                >
                  {toolItem.icon}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="w-full h-px bg-slate-200"></div>

      {/* Style Controls */}
      <div className="flex flex-col space-y-2 items-center">
        <div className="relative">
          <button 
            className="w-8 h-8 rounded-md border border-slate-300 shadow-sm"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
          />
          {showColorPicker && (
            <div className="absolute left-full ml-2 z-20">
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative z-20 shadow-xl rounded-lg overflow-hidden">
                <HexColorPicker color={color} onChange={handleColorChange} />
                <div className="bg-white p-2 text-center text-sm font-mono">
                  {color}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200 text-slate-700"
            onClick={() => setShowSizeSlider(!showSizeSlider)}
            title="Brush Size"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r={size} fill="currentColor" />
            </svg>
          </button>
          {showSizeSlider && (
            <div className="absolute left-full ml-2 bg-white p-3 rounded-lg shadow-xl z-20 border border-slate-200">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={size} 
                onChange={handleSizeChange}
                className="w-32 accent-primary-500"
              />
              <div className="text-center mt-1 text-sm font-medium">{size}px</div>
            </div>
          )}
        </div>
        
        <button 
          className={`p-2 rounded-md hover:bg-slate-100 transition-colors duration-200 ${fill ? 'bg-primary-50 text-primary-600' : 'text-slate-700'}`}
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
    </div>
  )
}

export default Toolbar
