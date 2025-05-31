import { useTheme } from '../context/ThemeContext'
import { FaSun, FaMoon } from 'react-icons/fa'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <FaSun className="text-yellow-300" />
      ) : (
        <FaMoon className="text-blue-300" />
      )}
    </button>
  )
}

export default ThemeToggle
