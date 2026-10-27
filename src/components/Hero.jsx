import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-section">
      {/* Background Image Container */}
      <div className="hero-bg-container">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          src="/images/hero-bread.png"
          alt="Hogaza de masa madre artesanal siendo cortada"
          className="hero-bg-image"
        />
        {/* Gradient overlays for editorial text readability */}
        <div className="hero-overlay-radial" />
        <div className="hero-overlay-bottom" />
      </div>

      {/* Top Navbar Brand */}
      <header className="hero-nav">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="brand-container"
        >
          <span className="brand-badge">
            <Sparkles size={12} className="brand-badge-icon" />
            Cosecha & Masa Madre
          </span>
          <h2 className="brand-logo">LEVADURA & PIEDRA</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="brand-meta"
        >
          <span>EDICIÓN DIARIA LIMITADA</span>
          <span className="meta-separator">•</span>
          <span>HORNO A LEÑA</span>
        </motion.div>
      </header>

      {/* Main Hero Content */}
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hero-headline-group"
        >
          <p className="hero-kicker">EL ARTE DE LA PACIENCIA</p>
          <h1 className="hero-title">
            El Ritual <br />
            <span className="hero-title-italic">del Pan Vivo</span>
          </h1>
          <p className="hero-description">
            Cada hogaza respira durante 48 horas en frío. Harinas limpias de grano entero, 
            agua pura y el crujido que anuncia la corteza perfecta.
          </p>
        </motion.div>

        {/* Feature Specs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="hero-specs"
        >
          <div className="spec-item">
            <span className="spec-number">48H</span>
            <span className="spec-label">Fermentación natural</span>
          </div>
          <div className="spec-divider" />
          <div className="spec-item">
            <span className="spec-number">82%</span>
            <span className="spec-label">Hidratación de masa</span>
          </div>
          <div className="spec-divider" />
          <div className="spec-item">
            <span className="spec-number">100%</span>
            <span className="spec-label">Grano molido en piedra</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="scroll-cue"
        onClick={onExploreClick}
      >
        <span className="scroll-cue-text">DESLIZA PARA CORTAR LA HOGAZA</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="scroll-cue-icon"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}
