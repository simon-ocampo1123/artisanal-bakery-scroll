import BreadScroller from './components/BreadScroller'
import Outro from './components/Outro'
import './App.css'

function App() {
  return (
    <div className="app-container">
      {/* Experiencia Interactiva Scroll-Driven Canvas (Inicia en Scroll 0% con Frame 001) */}
      <BreadScroller />

      {/* Cierre Editorial: Hogaza rebanada, Menú de panes y Footer */}
      <Outro />
    </div>
  )
}

export default App
