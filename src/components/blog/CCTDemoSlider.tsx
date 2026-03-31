/**
 * CCTDemoSlider.tsx — React island: interactive CCT temperature explorer
 * Hydrated with `client:visible`
 * Respects prefers-reduced-motion
 */
import { useState, useEffect, useRef } from 'react';

interface Light {
  kelvin: number;
  label: string;
  ambiance: string;
  rooms: string;
  color: string;
  bgGradient: string;
  emoji: string;
}

const LIGHTS: Light[] = [
  {
    kelvin: 2700,
    label: 'Luz Cálida',
    ambiance: 'Relajante y romántica',
    rooms: 'Sala · Habitación · Comedor',
    color: '#FF9A3E',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(255,154,62,0.20) 0%, rgba(200,80,0,0.05) 60%, transparent 100%)',
    emoji: '🛋️',
  },
  {
    kelvin: 3000,
    label: 'Cálida+',
    ambiance: 'Acogedora y cálida',
    rooms: 'Sala · Pasillo · Restaurante',
    color: '#FFB347',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(255,179,71,0.18) 0%, transparent 100%)',
    emoji: '🏠',
  },
  {
    kelvin: 3500,
    label: 'Blanca Cálida',
    ambiance: 'Suave y familiar',
    rooms: 'Sala · Cocina · Oficina home',
    color: '#FFD27F',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(255,210,127,0.15) 0%, transparent 100%)',
    emoji: '🍳',
  },
  {
    kelvin: 4000,
    label: 'Luz Neutra',
    ambiance: 'Natural y equilibrada',
    rooms: 'Cocina · Baño · Oficina',
    color: '#E8EFFF',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(200,220,255,0.12) 0%, transparent 100%)',
    emoji: '⚖️',
  },
  {
    kelvin: 4500,
    label: 'Neutra+',
    ambiance: 'Brillante y nítida',
    rooms: 'Cocina · Consultorio · Tienda',
    color: '#C8DCFF',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(173,204,255,0.12) 0%, transparent 100%)',
    emoji: '🏪',
  },
  {
    kelvin: 5000,
    label: 'Luz Fría',
    ambiance: 'Energizante y alerta',
    rooms: 'Taller · Bodega · Exterior',
    color: '#9EC9FF',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(126,200,255,0.12) 0%, transparent 100%)',
    emoji: '💻',
  },
  {
    kelvin: 6500,
    label: 'Blanca Día',
    ambiance: 'Máxima concentración',
    rooms: 'Quirófano · Industrial · Seguridad',
    color: '#7EC8FF',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(100,180,255,0.14) 0%, transparent 100%)',
    emoji: '🏭',
  },
];

export default function CCTDemoSlider() {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const current = LIGHTS[index];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndex(Number(e.target.value));
  };

  return (
    <div
      className="cct-demo"
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBlock: 'var(--space-8)',
        position: 'relative',
        overflow: 'hidden',
        transition: prefersReduced.current ? 'none' : 'background 300ms ease',
      }}
      role="region"
      aria-label="Explorador interactivo de temperatura de color CCT"
    >
      {/* Dynamic glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: current.bgGradient,
          transition: prefersReduced.current ? 'none' : 'background 400ms ease',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Explorador CCT Interactivo
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Mueve el slider para descubrir qué hace cada temperatura de color
          </p>
        </div>

        {/* Big display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontSize: '3.5rem',
              lineHeight: 1,
              filter: `drop-shadow(0 0 20px ${current.color}60)`,
              transition: prefersReduced.current ? 'none' : 'filter 300ms ease',
            }}
            aria-hidden="true"
          >
            {current.emoji}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 800,
                color: current.color,
                lineHeight: 1,
                transition: prefersReduced.current ? 'none' : 'color 300ms ease',
                fontVariantNumeric: 'tabular-nums',
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              {current.kelvin}K
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginTop: '0.25rem',
              }}
            >
              {current.label}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              {current.ambiance}
            </p>
          </div>
        </div>

        {/* Rooms tag */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          <span
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: `${current.color}18`,
              border: `1px solid ${current.color}40`,
              color: current.color,
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              transition: prefersReduced.current ? 'none' : 'all 300ms ease',
            }}
          >
            📍 {current.rooms}
          </span>
        </div>

        {/* Slider */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Gradient bar */}
          <div
            style={{
              height: '10px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, #FF9A3E 0%, #FFD27F 25%, #E8EFFF 50%, #C8DCFF 75%, #7EC8FF 100%)',
              marginBottom: '0.75rem',
              boxShadow: '0 0 16px rgba(245,166,35,0.2), 0 0 32px rgba(126,200,255,0.1)',
            }}
            aria-hidden="true"
          />

          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={LIGHTS.length - 1}
            step={1}
            value={index}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: `linear-gradient(90deg, ${current.color} 0%, ${current.color}40 100%)`,
              outline: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: prefersReduced.current ? 'none' : 'background 300ms ease',
            } as React.CSSProperties}
            aria-label={`Temperatura de color: ${current.kelvin} Kelvin — ${current.label}`}
            aria-valuemin={2700}
            aria-valuemax={6500}
            aria-valuenow={current.kelvin}
            aria-valuetext={`${current.kelvin}K — ${current.label}`}
          />

          {/* Scale labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warm)', fontWeight: 600 }}>Cálida ☀️</span>
            <span style={{ fontSize: 'var(--text-xs)', color: '#E8EFFF', fontWeight: 600 }}>Neutra ⚡</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-cool)', fontWeight: 600 }}>❄️ Fría</span>
          </div>
        </div>

        {/* CCT dot navigator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }} role="list" aria-label="Valores CCT disponibles">
          {LIGHTS.map((l, i) => (
            <button
              key={l.kelvin}
              role="listitem"
              onClick={() => setIndex(i)}
              aria-label={`Seleccionar ${l.label} — ${l.kelvin}K`}
              aria-pressed={i === index}
              style={{
                width: i === index ? '28px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: i === index ? current.color : 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: prefersReduced.current ? 'none' : 'all 250ms ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${current.color};
          box-shadow: 0 0 12px ${current.color}60;
          cursor: grab;
          transition: box-shadow 200ms ease, border-color 200ms ease;
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          box-shadow: 0 0 20px ${current.color}80;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${current.color};
          cursor: grab;
        }
        @media (prefers-reduced-motion: reduce) {
          input[type="range"] { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
