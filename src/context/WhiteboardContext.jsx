import { createContext, useContext, useReducer, useRef } from 'react'

const WhiteboardContext = createContext()

const initialState = {
  elements: [],
  tool: 'pen',
  color: '#eab308', // Yellow color
  size: 3,
  fill: false,
  selectedElement: null,
  history: {
    past: [],
    future: []
  },
  viewTransform: {
    x: 0,
    y: 0,
    scale: 1
  },
  cursors: {} // Initialize empty cursors object
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
        ),
        history: {
          past: [...state.history.past, state.elements],
          future: []
        }
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
    case 'SET_TOOL':
      return {
        ...state,
        tool: action.payload,
        selectedElement: action.payload === 'select' ? state.selectedElement : null
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
    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElement: action.payload
      }
    case 'UNDO':
      if (state.history.past.length === 0) return state
      const previous = state.history.past[state.history.past.length - 1]
      return {
        ...state,
        elements: previous,
        history: {
          past: state.history.past.slice(0, state.history.past.length - 1),
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
    case 'UPDATE_CURSOR':
      return {
        ...state,
        cursors: {
          ...state.cursors,
          [action.payload.id]: action.payload
        }
      }
    case 'REMOVE_CURSOR':
      const newCursors = { ...state.cursors }
      delete newCursors[action.payload]
      return {
        ...state,
        cursors: newCursors
      }
    default:
      return state
  }
}

export function WhiteboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const canvasRef = useRef(null)
  
  const value = {
    ...state,
    dispatch,
    canvasRef
  }
  
  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  )
}

export function useWhiteboard() {
  const context = useContext(WhiteboardContext)
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider')
  }
  return context
}
