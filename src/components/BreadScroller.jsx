import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Sparkles, ChevronDown } from 'lucide-react'

const TOTAL_FRAMES = 51

const getFrameSrc = (frameNum) => {
  // Empieza en 51 al inicio (scroll 0%) y desciende a 1 al final (scroll 100%)
  const reversedNum = TOTAL_FRAMES - frameNum + 1
  const pad = String(reversedNum).padStart(3, '0')
  return `/frames/frame_${pad}.png`
}

export default function BreadScroller() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(-1)
  const [scrollPercent, setScrollPercent] = useState(0)

  // Función para dibujar en canvas sin parpadeo (sin clearRect)
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imagesRef.current[frameIdx]
    if (!img || !img.complete || img.naturalWidth === 0) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight

    const ratio = Math.max(cw / iw, ch / ih)
    const dw = iw * ratio
    const dh = ih * ratio
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    // Al dibujar directamente encima se elimina por completo la sombra o parpadeo negro
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)
    currentFrameRef.current = frameIdx
  }, [])

  // 1. Precargar todas las 51 imágenes en memoria y pintar el fotograma 1
  useEffect(() => {
    const loadedImages = []
    let isMounted = true

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i)
      if (i === 1) {
        img.onload = () => {
          if (isMounted) drawFrame(0)
        }
      }
      loadedImages.push(img)
    }

    imagesRef.current = loadedImages

    return () => {
      isMounted = false
    }
  }, [drawFrame])

  // 2. Ajuste de resolución nítida del Canvas (Retina / 4K)
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr

      const activeIdx = currentFrameRef.current >= 0 ? currentFrameRef.current : 0
      drawFrame(activeIdx)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [drawFrame])

  // 3. Listener de scroll nativo y fluido
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const totalScrollable = rect.height - window.innerHeight
    if (totalScrollable <= 0) return

    const rawProgress = -rect.top / totalScrollable
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)

    // Índice proporcional
    const calculatedIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(clampedProgress * TOTAL_FRAMES)
    )

    if (calculatedIndex !== currentFrameRef.current) {
      drawFrame(calculatedIndex)
      setScrollPercent(Math.round(clampedProgress * 100))
    }
  }, [drawFrame])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // 4. Animaciones de textos con Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.5,
  })

  // Portada (Scroll 0%)
  const heroOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0])
  const heroY = useTransform(smoothProgress, [0, 0.12], [0, -35])
  const heroPointerEvents = useTransform(smoothProgress, (v) => (v > 0.1 ? 'none' : 'auto'))

  // Fase 1: Incisión (20% - 40%)
  const step1Opacity = useTransform(smoothProgress, [0.18, 0.26, 0.38, 0.46], [0, 1, 1, 0])
  const step1Y = useTransform(smoothProgress, [0.18, 0.26, 0.38, 0.46], [30, 0, 0, -20])

  // Fase 2: Alveolado (50% - 72%)
  const step2Opacity = useTransform(smoothProgress, [0.50, 0.58, 0.70, 0.78], [0, 1, 1, 0])
  const step2Y = useTransform(smoothProgress, [0.50, 0.58, 0.70, 0.78], [30, 0, 0, -20])

  // Fase 3: Desprendimiento (80% - 98%)
  const step3Opacity = useTransform(smoothProgress, [0.82, 0.88, 0.96, 1], [0, 1, 1, 0])
  const step3Y = useTransform(smoothProgress, [0.82, 0.88, 0.96, 1], [30, 0, 0, -20])

  return (
    <section ref={containerRef} className="canvas-scroll-container">
      <div className="canvas-sticky-viewport">
        {/* Canvas de fotogramas con búfer persistente (cero parpadeos, cero sombras) */}
        <canvas ref={canvasRef} className="canvas-display" />

        {/* Viñeta sutil y cinematográfica */}
        <div className="canvas-vignette" />

        {/* Portada Hero Inicial */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointerEvents }}
          className="canvas-hero-overlay"
        >
          <header className="hero-nav">
            <div className="brand-container">
              <span className="brand-badge">
                <Sparkles size={12} className="brand-badge-icon" />
                Cosecha & Masa Madre
              </span>
              <h2 className="brand-logo">LEVADURA & PIEDRA</h2>
            </div>
            <div className="brand-meta">
              <span>EDICIÓN DIARIA LIMITADA</span>
              <span className="meta-separator">•</span>
              <span>HORNO A LEÑA</span>
            </div>
          </header>

          <div className="hero-content">
            <p className="hero-kicker">EL ARTE DE LA PACIENCIA</p>
            <h1 className="hero-title">
              El Ritual <br />
              <span className="hero-title-italic">del Pan Vivo</span>
            </h1>
            <p className="hero-description">
              Cada hogaza respira durante 48 horas en frío. Desliza hacia abajo 
              para cortar la corteza y descubrir el alveolado interior.
            </p>

            <div className="hero-specs">
              <div className="spec-item">
                <span className="spec-number">48H</span>
                <span className="spec-label">Fermentación natural</span>
              </div>
              <div className="spec-divider" />
              <div className="spec-item">
                <span className="spec-number">82%</span>
                <span className="spec-label">Hidratación</span>
              </div>
              <div className="spec-divider" />
              <div className="spec-item">
                <span className="spec-number">100%</span>
                <span className="spec-label">Molido en piedra</span>
              </div>
            </div>
          </div>

          <div className="scroll-cue">
            <span className="scroll-cue-text">DESLIZA HACIA ABAJO PARA CORTAR</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="scroll-cue-icon"
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </motion.div>

        {/* Tarjetas Narrativas durante el corte */}
        <div className="narrative-layer">
          <motion.div
            style={{ opacity: step1Opacity, y: step1Y }}
            className="narrative-card narrative-left"
          >
            <span className="narrative-tag">Fase 01 — La Incisión</span>
            <h3 className="narrative-title">La Corteza Firme</h3>
            <p className="narrative-body">
              El cuchillo de sierra hace contacto con la corteza tostada a 240°C. 
              El primer crujido que anuncia una miga viva.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: step2Opacity, y: step2Y }}
            className="narrative-card narrative-right"
          >
            <span className="narrative-tag">Fase 02 — El Alveolado</span>
            <h3 className="narrative-title">La Miga Salvaje</h3>
            <p className="narrative-body">
              El filo desciende por el corazón del pan. Se aprecian los alvéolos 
              creados pacientemente por las bacterias vivas de nuestra masa madre.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: step3Opacity, y: step3Y }}
            className="narrative-card narrative-left"
          >
            <span className="narrative-tag">Fase 03 — La Rebanada</span>
            <h3 className="narrative-title">El Desprendimiento</h3>
            <p className="narrative-body">
              La rebanada cae limpia sobre la mesa de madera. Elasticidad perfecta 
              y el aroma láctico que inunda el espacio.
            </p>
          </motion.div>
        </div>

        {/* HUD de progreso en tiempo real */}
        <div className="scroll-hud">
          <div className="hud-line">
            <span className="hud-label">FOTOGRAMA</span>
            <span className="hud-value">
              {(currentFrameRef.current >= 0 ? currentFrameRef.current : 0) + 1} / {TOTAL_FRAMES}
            </span>
          </div>
          <div className="hud-bar-bg">
            <div
              className="hud-bar-progress"
              style={{ width: `${scrollPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
