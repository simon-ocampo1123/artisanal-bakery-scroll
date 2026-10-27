import { motion } from 'framer-motion'
import { MapPin, Clock, Heart, Award, ArrowUpRight } from 'lucide-react'

export default function Outro() {
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

  return (
    <section className="outro-section">
      {/* Featured Outro Visual with Image 2 */}
      <div className="outro-hero-card">
        <div className="outro-img-wrapper">
          <img
            src="/images/outro-bread.png"
            alt="Hogaza rebanada con aceite de oliva y especias en mesa rústica"
            className="outro-image"
          />
          <div className="outro-img-overlay" />
        </div>

        <div className="outro-hero-text">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="outro-kicker"
          >
            MESA, ACEITE & SAL
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="outro-title"
          >
            Del Horno <br />
            <span className="outro-title-italic">a Tu Mesa</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="outro-body"
          >
            Una hogaza bien horneada no necesita adornos: unas gotas de aceite de oliva virgen extra, 
            una pizca de sal marina en escamas y la compañía de quienes valoran el tiempo bien invertido.
          </motion.p>
        </div>
      </div>

      {/* Menu / Selection of Breads */}
      <div className="outro-menu-section">
        <div className="section-header">
          <span className="section-sub">HORNEADO DIARIO</span>
          <h3 className="section-headline">Nuestras Creaciones</h3>
          <p className="section-caption">Producción artesanal limitada a 60 piezas por hornada.</p>
        </div>

        <div className="loaves-grid">
          {loaves.map((loaf, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="loaf-card"
            >
              <div className="loaf-card-top">
                <span className="loaf-tag">{loaf.tag}</span>
                <span className="loaf-price">{loaf.price}</span>
              </div>
              <h4 className="loaf-title">{loaf.title}</h4>
              <p className="loaf-desc">{loaf.description}</p>
              <div className="loaf-footer">
                <span>Reservar para mañana</span>
                <ArrowUpRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bakery Details & Values */}
      <div className="values-banner">
        <div className="value-item">
          <Award className="value-icon" />
          <h4>Cero Químicos</h4>
          <p>Solo tres ingredientes: harina orgánica, agua de manantial y sal de roca.</p>
        </div>
        <div className="value-item">
          <Clock className="value-icon" />
          <h4>Tiempo y Reposo</h4>
          <p>48 horas para descomponer azúcares y gluten, haciéndolo 100% digestivo.</p>
        </div>
        <div className="value-item">
          <Heart className="value-icon" />
          <h4>Hecho a Mano</h4>
          <p>Cada hogaza es boleada, marcada y horneada individualmente.</p>
        </div>
      </div>

      {/* Visit Us / Footer */}
      <footer className="editorial-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <h3 className="footer-logo">LEVADURA & PIEDRA</h3>
            <p className="footer-tagline">Taller de Panadería de Masa Madre Natural.</p>
            <p className="footer-copy">© 2026 Levadura & Piedra. Todos los derechos reservados.</p>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">UBICACIÓN</span>
            <div className="footer-info-row">
              <MapPin size={16} className="footer-info-icon" />
              <span>Calle de los Molinos #14-28, Barrio Antiguo</span>
            </div>
            <div className="footer-info-row">
              <Clock size={16} className="footer-info-icon" />
              <span>Martes a Domingo: 07:00 — 14:00 (o agotar hornada)</span>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">HORNO CALIENTE</span>
            <p className="footer-info-text">
              Recibe un aviso a tu correo cada mañana cuando las hogazas salgan del horno de leña.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">Avisarme</button>
            </form>
          </div>
        </div>
      </footer>
    </section>
  )
}
