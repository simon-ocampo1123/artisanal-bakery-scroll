import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Sparkles, ChevronDown, ArrowUpRight, MapPin, Clock, Send } from 'lucide-react'

// ============================================================================
// CONFIGURACIÓN GLOBAL DEL SCROLLYTELLING
// ============================================================================

// Cantidad total de imágenes extraídas del corte de la hogaza (frame_001 a frame_051)
const TOTAL_FRAMES = 51

// Catálogo de creaciones artesanales presentado en la etapa final del scroll
const loaves = [
  {
    title: 'Hogaza de Campo Clásica',
    description: 'Harina de trigo orgánico molida a la piedra, masa madre centenaria, 82% hidratación.',
    price: '$18.000',
    tag: 'La insignia',
  },
  {
    title: 'Centeno & Semillas Tostadas',
    description: 'Sésamo negro, lino dorado y pipas de girasol tostadas al fuego con toque de miel cruda.',
    price: '$21.000',
    tag: 'Alta fibra',
  },
  {
    title: 'Brioche de Masa Madre',
    description: 'Mantequilla de pastura al 84%, yemas frescas de campo y fermentación lenta de 36 horas.',
    price: '$24.000',
    tag: 'Edición fin de semana',
  },
]

/**
 * Función generadora de rutas para cada fotograma.
 * NOTA DE SECUENCIA INVERTIDA:
 * Se invierte la numeración matemática (TOTAL_FRAMES - frameNum + 1) para que:
 * - Al inicio (Scroll 0%): Comience en frame_051 (la mesa servida con la hogaza rebanada).
 * - Al final (Scroll 100%): Termine en frame_001 (el primer plano del cuchillo penetrando la corteza).
 */
const getFrameSrc = (frameNum) => {
  const reversedNum = TOTAL_FRAMES - frameNum + 1
  const pad = String(reversedNum).padStart(3, '0') // Convierte 1 en "001", 2 en "002", etc.
  return `/frames/frame_${pad}.png`
}

export default function BreadScroller() {
  // ==========================================================================
  // REFERENCIAS DOM Y ESTADOS
  // ==========================================================================
  const containerRef = useRef(null)    // Referencia al contenedor de 380vh (la pista de scroll)
  const canvasRef = useRef(null)       // Referencia al elemento <canvas> donde pintamos los fotogramas
  const imagesRef = useRef([])         // Arreglo en memoria RAM que almacena los 51 objetos Image() ya cargados

  // Estados informativos para la interfaz
  const [scrollPercent, setScrollPercent] = useState(0)
  const [activeFrameDisplay, setActiveFrameDisplay] = useState(1)

  // ==========================================================================
  // MOTOR DE FÍSICA LERP (Linear Interpolation) ESTILO APPLE
  // ==========================================================================
  // ¿Por qué usamos useRef en vez de useState?
  // Porque este cálculo corre a 60-120 cuadros por segundo dentro de requestAnimationFrame.
  // Si usáramos useState, React intentaría re-renderizar todo el componente 120 veces
  // por segundo, saturando la CPU. Con useRef actualizamos valores en memoria instantáneamente.
  const targetProgressRef = useRef(0)     // Hacia dónde quiere ir el usuario según su scroll (0.0 a 1.0)
  const currentProgressRef = useRef(0)    // Dónde está actualmente la animación con inercia amortiguada
  const lastRenderedIndexRef = useRef(-1) // Último fotograma dibujado (evita repintar la misma imagen si no cambió)

  // MotionValue de Framer Motion: conecta directamente con el motor LERP del Canvas
  // para que los textos de React se muevan al compás idéntico del dibujo.
  const motionProgress = useMotionValue(0)

  // ==========================================================================
  // FUNCIÓN DE DIBUJO EN CANVAS (Alta Definición & Cero Borrosidad)
  // ==========================================================================
  // Dibuja una fotografía en el canvas escalándola proporcionalmente
  // para que siempre cubra toda la pantalla (equivalente a CSS "object-fit: cover").
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Obtenemos el contexto 2D. "alpha: false" le avisa a la tarjeta de video
    // que el canvas es completamente opaco, maximizando el rendimiento por GPU.
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const img = imagesRef.current[frameIdx]
    // Si la imagen aún no terminó de cargar en memoria, no intentamos dibujarla
    if (!img || !img.complete || img.naturalWidth === 0) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight

    // Matemática de "object-fit: cover":
    // Calcula la proporción exacta para que la imagen llene el canvas sin deformarse
    const ratio = Math.max(cw / iw, ch / ih)
    const dw = iw * ratio
    const dh = ih * ratio
    const dx = (cw - dw) / 2 // Centrado horizontal
    const dy = (ch - dh) / 2 // Centrado vertical

    // Dibujamos la fotografía con 100% de nitidez óptica (sin transparencias ni dobles filos)
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)
  }, [])

  // ==========================================================================
  // 1. PRECARGA DE IMÁGENES EN MEMORIA RAM
  // ==========================================================================
  // Este bloque se ejecuta una sola vez cuando la página abre.
  // Descarga las 51 imágenes en segundo plano y las mantiene listas en la memoria.
  // Gracias a esto, cuando el usuario hace scroll, el navegador NO hace peticiones
  // de red: las imágenes ya están esperando en la memoria para pintarse al instante.
  useEffect(() => {
    const loadedImages = []
    let isMounted = true

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i)

      // Cuando el primer fotograma esté listo, dibujarlo inmediatamente en pantalla
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

  // ==========================================================================
  // 2. AJUSTE DE RESOLUCIÓN NÍTIDA DEL CANVAS (Soporte Retina / Pantallas 4K)
  // ==========================================================================
  // En pantallas modernas (como MacBooks Retina o teléfonos), cada píxel CSS
  // equivale físicamente a 2 píxeles reales (devicePixelRatio).
  // Si no multiplicamos el ancho/alto del canvas por el DPR, la imagen se vería borrosa.
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Limitamos el DPR a máximo 2 para no exigirle de más a pantallas 4K/8K
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr

      // Volver a dibujar el fotograma actual con las nuevas dimensiones nítidas
      const activeIdx = lastRenderedIndexRef.current >= 0 ? lastRenderedIndexRef.current : 0
      drawFrame(activeIdx)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [drawFrame])

  // ==========================================================================
  // 3. CAPTURA DE SCROLL ULTRALIVIANA
  // ==========================================================================
  // Solo calcula un número decimal entre 0.0 (inicio) y 1.0 (final).
  // No ejecuta cálculos pesados ni dibuja nada aquí; solo actualiza la meta (target).
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Espacio total que se puede recorrer dentro de la pista sticky
    const totalScrollable = rect.height - window.innerHeight
    if (totalScrollable <= 0) return

    // -rect.top nos indica cuántos píxeles ha subido el contenedor
    const rawProgress = -rect.top / totalScrollable
    // Aseguramos que el valor nunca sea menor a 0 ni mayor a 1
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)

    targetProgressRef.current = clampedProgress
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // ==========================================================================
  // 4. CICLO DE ANIMACIÓN CONTINUO (requestAnimationFrame + LERP)
  // ==========================================================================
  // Este es el corazón de la suavidad estilo Apple:
  // En lugar de que el fotograma salte bruscamente a la posición del ratón,
  // el sistema se acerca suavemente a la meta un 9.5% cada milisegundo:
  //
  //   posiciónActual += (posiciónObjetivo - posiciónActual) * 0.095
  //
  // Eso crea la inercia fluida ("mantequilla") y frena de manera orgánica.
  useEffect(() => {
    let animId
    const LERP_FACTOR = 0.095 // Factor de fricción: ideal entre respuesta rápida y deslizamiento sedoso

    const renderLoop = () => {
      const delta = targetProgressRef.current - currentProgressRef.current

      // Si aún hay distancia por recorrer, aplicar la interpolación
      if (Math.abs(delta) > 0.00004) {
        currentProgressRef.current += delta * LERP_FACTOR
      } else {
        currentProgressRef.current = targetProgressRef.current
      }

      // Sincronizar el MotionValue de Framer Motion con la inercia exacta del Canvas
      motionProgress.set(currentProgressRef.current)

      // TIMELINE DEL CORTE:
      // El paso de los 51 fotogramas ocurre entre el 0% y el 78% del scroll total.
      // A partir del 78%, la imagen se congela en el último fotograma (la hogaza cortada)
      // mientras emerge el menú de creaciones y el footer.
      const frameProgress = Math.min(1, Math.max(0, currentProgressRef.current / 0.78))
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(frameProgress * (TOTAL_FRAMES - 1)))
      )

      // Solo si el fotograma cambió, ordenamos redibujar en el Canvas (ahorro de batería y GPU)
      if (frameIndex !== lastRenderedIndexRef.current) {
        drawFrame(frameIndex)
        lastRenderedIndexRef.current = frameIndex
        setActiveFrameDisplay(frameIndex + 1)
        setScrollPercent(Math.round(currentProgressRef.current * 100))
      }

      // Solicitar el siguiente cuadro a la tarjeta de video (60fps / 120fps según el monitor)
      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(animId)
  }, [drawFrame, motionProgress])

  // ==========================================================================
  // 5. ANIMACIONES DE TEXTOS Y TARJETAS (Framer Motion useTransform)
  // ==========================================================================
  // useTransform vincula el progreso del scroll con opacidad [0, 1] y posición Y [25px, 0px, -20px].
  // Cada fase entra suavemente, se mantiene legible y luego se desvanece al continuar el scroll.

  // Portada Inicial (Visible de 0% a 12% del scroll)
  const heroOpacity = useTransform(motionProgress, [0, 0.12], [1, 0])
  const heroY = useTransform(motionProgress, [0, 0.12], [0, -35])
  const heroPointerEvents = useTransform(motionProgress, (v) => (v > 0.12 ? 'none' : 'auto'))

  // Fase 01: La Mesa & La Rebanada (Visible de 15% a 35% del scroll)
  const step1Opacity = useTransform(motionProgress, [0.15, 0.21, 0.29, 0.35], [0, 1, 1, 0])
  const step1Y = useTransform(motionProgress, [0.15, 0.21, 0.29, 0.35], [25, 0, 0, -20])

  // Fase 02: El Alveolado & Fermentación (Visible de 38% a 57% del scroll)
  const step2Opacity = useTransform(motionProgress, [0.38, 0.44, 0.51, 0.57], [0, 1, 1, 0])
  const step2Y = useTransform(motionProgress, [0.38, 0.44, 0.51, 0.57], [25, 0, 0, -20])

  // Fase 03: La Incisión & Crujido en Corteza (Visible de 60% a 77% del scroll)
  const step3Opacity = useTransform(motionProgress, [0.60, 0.65, 0.72, 0.77], [0, 1, 1, 0])
  const step3Y = useTransform(motionProgress, [0.60, 0.65, 0.72, 0.77], [25, 0, 0, -20])

  // Fase 04: Catálogo "Del Horno a Tu Mesa" + Footer Integral (Emerge de 79% a 100%)
  const showcaseOpacity = useTransform(motionProgress, [0.79, 0.87, 1], [0, 1, 1])
  const showcaseY = useTransform(motionProgress, [0.79, 0.87, 1], [40, 0, 0])
  const showcasePointerEvents = useTransform(motionProgress, (v) => (v > 0.79 ? 'auto' : 'none'))

  // ==========================================================================
  // ESTRUCTURA VISUAL (JSX)
  // ==========================================================================
  return (
    // "canvas-scroll-container": Mide 380vh en CSS. Crea el recorrido físico para el scroll.
    <section ref={containerRef} className="canvas-scroll-container">
      
      {/* 
        "canvas-sticky-viewport": Tiene "position: sticky; top: 0; height: 100vh;".
        Fija la pantalla frente al usuario durante todo el recorrido de los 380vh,
        actuando como el visor cinematográfico donde ocurren las transiciones.
      */}
      <div className="canvas-sticky-viewport">
        
        {/* Lienzo Canvas: Dibuja las imágenes a pantalla completa sin parpadeos */}
        <canvas ref={canvasRef} className="canvas-display" />

        {/* Viñeta radial oscura: Da profundidad cinematográfica y asegura la lectura del texto */}
        <div className="canvas-vignette" />

        {/* ==================================================================
            PORTADA HERO INICIAL (Scroll 0% — 15%)
            ================================================================== */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointerEvents }}
          className="canvas-hero-overlay"
        >
          {/* Navegación y distintivo de la marca */}
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

          {/* Título editorial principal y especificaciones de entrada */}
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

            {/* Píldora de especificaciones técnicas */}
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

          {/* Indicador animado que invita al usuario a deslizar */}
          <div className="scroll-cue">
            <span className="scroll-cue-text">DESLIZA HACIA EL CORAZÓN DEL CORTE</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="scroll-cue-icon"
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </motion.div>

        {/* ==================================================================
            TARJETAS NARRATIVAS (Aparecen secuencialmente durante el scroll)
            ================================================================== */}
        <div className="narrative-layer">
          
          {/* Fase 01: La Mesa y la Miga en Reposo */}
          <motion.div
            style={{ opacity: step1Opacity, y: step1Y }}
            className="narrative-card narrative-left"
          >
            <span className="narrative-tag">Fase 01 — La Mesa & La Rebanada</span>
            <h3 className="narrative-title">La Miga en Reposo</h3>
            <p className="narrative-body">
              La rebanada descansa sobre la madera de roble tras 48 horas de fermentación en frío.
              Miga húmeda y elástica que retiene todos los aromas del grano puro.
            </p>
            {/* Especificaciones técnicas de la Fase 01 */}
            <div className="card-specs-row">
              <div className="card-spec-item">
                <span className="card-spec-val">100%</span>
                <span className="card-spec-lbl">Memoria</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">7 Días</span>
                <span className="card-spec-lbl">Frescura</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">AOVE</span>
                <span className="card-spec-lbl">Maridaje</span>
              </div>
            </div>
          </motion.div>

          {/* Fase 02: El Alveolado y Fermentación */}
          <motion.div
            style={{ opacity: step2Opacity, y: step2Y }}
            className="narrative-card narrative-right"
          >
            <span className="narrative-tag">Fase 02 — El Alveolado</span>
            <h3 className="narrative-title">La Miga Salvaje</h3>
            <p className="narrative-body">
              El corazón del pan al descubierto. Estructura celular abierta generada pacientemente
              por las bacterias vivas de nuestra masa madre centenaria sin químicos.
            </p>
            {/* Especificaciones técnicas de la Fase 02 */}
            <div className="card-specs-row">
              <div className="card-spec-item">
                <span className="card-spec-val">82%</span>
                <span className="card-spec-lbl">Hidratación</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">pH 4.2</span>
                <span className="card-spec-lbl">Acidez viva</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">0%</span>
                <span className="card-spec-lbl">Química</span>
              </div>
            </div>
          </motion.div>

          {/* Fase 03: La Incisión del Cuchillo en la Corteza */}
          <motion.div
            style={{ opacity: step3Opacity, y: step3Y }}
            className="narrative-card narrative-left"
          >
            <span className="narrative-tag">Fase 03 — La Incisión</span>
            <h3 className="narrative-title">El Acero en la Corteza</h3>
            <p className="narrative-body">
              El filo del cuchillo penetra la corteza tostada a 240°C en solera de piedra.
              El crujido eterno que anuncia una caramelización natural perfecta.
            </p>
            {/* Especificaciones técnicas de la Fase 03 */}
            <div className="card-specs-row">
              <div className="card-spec-item">
                <span className="card-spec-val">3.5 mm</span>
                <span className="card-spec-lbl">Corteza</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">240°C</span>
                <span className="card-spec-lbl">Solera</span>
              </div>
              <div className="card-spec-sep" />
              <div className="card-spec-item">
                <span className="card-spec-val">42 dB</span>
                <span className="card-spec-lbl">Crujido</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ==================================================================
            SHOWCASE DE CREACIONES & FOOTER INTEGRAL (Scroll 80% — 100%)
            ================================================================== */}
        {/* Flota sobre la última fotografía (el cuchillo dentro del pan) */}
        <motion.div
          style={{
            opacity: showcaseOpacity,
            y: showcaseY,
            pointerEvents: showcasePointerEvents,
          }}
          className="canvas-showcase-overlay"
        >
          <div className="showcase-content-wrapper">
            
            {/* Encabezado del catálogo */}
            <header className="showcase-header">
              <span className="showcase-sub">MESA, ACEITE & SAL • HORNEADO DIARIO</span>
              <h2 className="showcase-title">Del Horno a Tu Mesa</h2>
              <p className="showcase-caption">
                Producción artesanal limitada a 60 piezas por hornada. Hecho con paciencia y fuego.
              </p>
            </header>

            {/* Cuadrícula de 3 tarjetas de panes artesanales */}
            <div className="showcase-grid">
              {loaves.map((loaf, idx) => (
                <div key={idx} className="showcase-card">
                  <div>
                    <div className="showcase-card-top">
                      <span className="showcase-card-tag">{loaf.tag}</span>
                      <span className="showcase-card-price">{loaf.price}</span>
                    </div>
                    <h3 className="showcase-card-title">{loaf.title}</h3>
                    <p className="showcase-card-desc">{loaf.description}</p>
                  </div>
                  <div className="showcase-card-action">
                    <span>Reservar para mañana</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Integral integrado directamente sobre la escena final */}
            <footer className="canvas-footer-grid">
              
              {/* Columna 1: Marca y filosofía artesanal */}
              <div className="canvas-footer-col brand-col">
                <h4 className="canvas-footer-logo">LEVADURA & PIEDRA</h4>
                <p className="canvas-footer-desc">
                  Taller de panadería de fermentación lenta de 48 horas. Sin aditivos, sin aceleradores.
                </p>
                <span className="canvas-footer-copy">© 2026 Levadura & Piedra. Artesanía viva.</span>
              </div>

              {/* Columna 2: Ubicación física y horarios del obrador */}
              <div className="canvas-footer-col">
                <span className="canvas-footer-title">OBRADOR & HORARIO</span>
                <div className="canvas-footer-row">
                  <MapPin size={14} className="canvas-footer-icon" />
                  <span>Calle de los Molinos #14-28, Obrador Central</span>
                </div>
                <div className="canvas-footer-row">
                  <Clock size={14} className="canvas-footer-icon" />
                  <span>Mar a Dom: 07:00 — 14:00 (o agotar hornada)</span>
                </div>
              </div>

              {/* Columna 3: Formulario matutino de aviso cuando el horno sale caliente */}
              <div className="canvas-footer-col">
                <span className="canvas-footer-title">AVISO HORNADA CALIENTE</span>
                <p className="canvas-footer-desc">
                  Aviso cada mañana cuando el pan salga del horno a leña.
                </p>
                <form className="canvas-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    className="canvas-newsletter-input"
                  />
                  <button type="submit" className="canvas-newsletter-btn">
                    <span>Avisarme</span>
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </footer>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
