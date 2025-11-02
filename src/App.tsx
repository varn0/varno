import Portfolio from './components/Portfolio'
import { useTheme } from './hooks/useTheme'
import { RiLightbulbLine } from '@remixicon/react'

function App() {
  const { toggleTheme } = useTheme()

  return (
    <div className="app">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <RiLightbulbLine size={24} />
      </button>
      <Portfolio />
    </div>
  )
}

export default App

