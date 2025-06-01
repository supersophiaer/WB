import { createContext, useContext, useReducer, useRef, useState } from 'react'
import { useSocket } from './SocketContext'
import { useUser } from './UserContext'
import { v4 as uuidv4 } from 'uuid'
import { getStroke } from 'perfect-freehand'

const WhiteboardContext = createContext()

const initialState = {
  elements: [],
  selectedElement: null,
  action: null,
  tool: 'pen',
  color: '#000000',
  size: 5,
  fill: false,
  text: '',
  history: {
    past: [],
    future: []
  },
  viewTransform: {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ELEMENTS':
      return {
        ...state,
        elements: action.payload,
        history: {
          past: [...state.history.past, state.elements],
          future: []
        }
      }
    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
        history: {
          past: [...state.history.past, state.elements],
          future: []
        }
      }
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el => 
          el.id === action.payload.id ? action.payload : el
        )
      }
    case 'SET_SELECTED_ELEMENT':
      return {
        ...state,
        selectedElement: action.payload
      }
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
        selectedElement: null,
        history: {
          past: [...state.history.past, state.elements],
          future: []
        }
      }
    case 'SET_ACTION':
      return {
        ...state,
        action: action.payload
      }
    case 'SET_TOOL':
      return {
        ...state,
        tool: action.payload
      }
    case 'SET_COLOR':
      return {
        ...state,
        color: action.payload
      }
    case 'SET_SIZE':
      return {
        ...state,
        size: action.payload
      }
    case 'SET_FILL':
      return {
        ...state,
        fill: action.payload
      }
    case 'SET_TEXT':
      return {
        ...state,
        text: action.payload
      }
    case 'UNDO':
      if (state.history.past.length === 0) return state
      const previous = state.history.past[state.history.past.length - 1]
      return {
        ...state,
        elements: previous,
        history: {
          past: state.history.past.slice(0, -1),
          future: [state.elements, ...state.history.future]
        }
      }
    case 'REDO':
      if (state.history.future.length === 0) return state
      const next = state.history.future[0]
      return {
        ...state,
        elements: next,
        history: {
          past: [...state.history.past, state.elements],
          future: state.history.future.slice(1)
        }
      }
    case 'SET_VIEW_TRANSFORM':
      return {
        ...state,
        viewTransform: action.payload
      }
    default:
      return state
  }
}

export function WhiteboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { socket } = useSocket()
  const { user } = useUser()
  const canvasRef = useRef(null)
  const [cursors, setCursors] = useState({})

  const createElement = (id, x1, y1, x2, y2, type, options = {}) => {
    const element = {
      id,
      x1,
      y1,
      x2,
      y2,
      type,
      ...options
    }

    if (type === 'pen') {
      element.points = [{ x: x1, y: y1 }]
    }

    return element
  }

  const updateElement = (id, x1, y1, x2, y2, type, options = {}) => {
    const updatedElement = {
      id,
      x1,
      y1,
      x2,
      y2,
      type,
      ...options
    }

    dispatch({ type: 'UPDATE_ELEMENT', payload: updatedElement })

    if (socket) {
      socket.emit('element-update', updatedElement)
    }
  }

  const drawElement = (context, element) => {
    context.strokeStyle = element.color || state.color
    context.lineWidth = element.size || state.size
    context.fillStyle = element.color || state.color

    switch (element.type) {
      case 'line':
        drawLine(context, element)
        break
      case 'rectangle':
        drawRectangle(context, element)
        break
      case 'circle':
        drawCircle(context, element)
        break
      case 'pen':
        drawPen(context, element)
        break
      case 'text':
        drawText(context, element)
        break
      case 'image':
        drawImage(context, element)
        break
      case 'smartShape':
        drawSmartShape(context, element)
        break
      default:
        break
    }
  }

  const drawLine = (context, element) => {
    context.beginPath()
    context.moveTo(element.x1, element.y1)
    context.lineTo(element.x2, element.y2)
    context.stroke()
  }

  const drawRectangle = (context, element) => {
    const minX = Math.min(element.x1, element.x2)
    const minY = Math.min(element.y1, element.y2)
    const width = Math.abs(element.x2 - element.x1)
    const height = Math.abs(element.y2 - element.y1)

    context.beginPath()
    context.rect(minX, minY, width, height)
    if (element.fill) {
      context.fill()
    }
    context.stroke()
  }

  const drawCircle = (context, element) => {
    const centerX = (element.x1 + element.x2) / 2
    const centerY = (element.y1 + element.y2) / 2
    const radius = Math.sqrt(
      Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)
    ) / 2

    context.beginPath()
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    if (element.fill) {
      context.fill()
    }
    context.stroke()
  }

  const drawPen = (context, element) => {
    if (!element.points || element.points.length < 2) return

    const options = {
      size: element.size * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }

    const stroke = getStroke(element.points, options)

    context.beginPath()
    context.fillStyle = element.color

    if (stroke.length > 0) {
      context.moveTo(stroke[0][0], stroke[0][1])
      
      for (let i = 1; i < stroke.length; i++) {
        context.lineTo(stroke[i][0], stroke[i][1])
      }
    }

    context.fill()
  }

  const drawText = (context, element) => {
    if (!element.text) return
    
    context.font = `${element.size * 2}px sans-serif`
    context.fillStyle = element.color
    context.fillText(element.text, element.x1, element.y1)
  }

  const drawImage = (context, element) => {
    if (!element.image) return
    
    const img = new Image()
    img.src = element.image
    
    if (img.complete) {
      context.drawImage(img, element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1)
    } else {
      img.onload = () => {
        context.drawImage(img, element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1)
      }
    }
  }

  const drawSmartShape = (context, element) => {
    if (!element.points || element.points.length < 2) return

    context.beginPath()
    context.moveTo(element.points[0].x, element.points[0].y)
    
    for (let i = 1; i < element.points.length; i++) {
      context.lineTo(element.points[i].x, element.points[i].y)
    }
    
    if (element.closed) {
      context.closePath()
    }
    
    if (element.fill) {
      context.fill()
    }
    context.stroke()
  }

  const updateCursor = (x, y) => {
    if (!socket || !user) return
    
    const cursor = { x, y }
    socket.emit('cursor-move', cursor)
  }

  return (
    <WhiteboardContext.Provider
      value={{
        ...state,
        dispatch,
        canvasRef,
        createElement,
        updateElement,
        drawElement,
        updateCursor,
        cursors,
        setCursors
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  )
}

export function useWhiteboard() {
  return useContext(WhiteboardContext)
}
