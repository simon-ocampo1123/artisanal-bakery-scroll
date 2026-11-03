import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import BreadScroller from './components/BreadScroller'
import './App.css'

/**
 * COMPONENTE PRINCIPAL (App.jsx)
 * -------------------------------------------------------------
 * Aquí se inicializa el motor de scroll físico global (Lenis)
 * y se monta la experiencia inmersiva continua (BreadScroller).
 */
function App() {
  useEffect(() => {
    // =========================================================
    // 1. INICIALIZACIÓN DE LENIS (Inercia física estilo Apple/macOS)
    // =========================================================
    // En Windows, girar la rueda del ratón da saltos mecánicos bruscos de ~100px.
    // Lenis intercepta esos eventos y calcula una curva de desaceleración
    // continua (momentum), idéntica a deslizar la pantalla de un iPhone o
    // usar el trackpad de cristal de una MacBook.
    const lenis = new Lenis({
      duration: 1.2,                                    // Duración de la inercia al soltar la rueda
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva exponencial suave (frena progresivamente)
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,                               // Suavizar la rueda del ratón
      wheelMultiplier: 0.9,                             // Sensibilidad moderada para no cansar el dedo
      touchMultiplier: 1.5,                             // Sensibilidad en pantallas táctiles y trackpads
    })

    // Sincronizar Lenis con la tasa de refresco del monitor (60Hz / 120Hz / 144Hz)
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const animId = requestAnimationFrame(raf)

    // Limpieza de memoria al desmontar el componente
    return () => {
      cancelAnimationFrame(animId)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="app-container">
      {/* 
        BreadScroller contiene toda la narrativa visual:
        La portada (Hero), el corte de la hogaza en Canvas y el catálogo/footer final.
      */}
      <BreadScroller />
    </div>
  )
}

export default App
