/**
 * RoomSimulator.tsx — React island
 * An SVG room illustration that dynamically changes color temperature.
 * The user clicks preset scenes or uses a slider.
 * client:visible — only hydrates when scrolled into view.
 */
import { useState, useEffect, useRef } from 'react';

interface Scene {
  id: string;
  label: string;
  icon: string;
  kelvin: number;
  description: string;
  accentColor: string;
  lightColor: string;
  ambientColor: string;
  wallColor: string;
  floorColor: string;
}

const SCENES: Scene[] = [
  {
    id: 'relax',
    label: 'Sala · Noche',
    icon: 'weekend',
    kelvin: 2700,
    description: 'Luz cálida para relajarse después del trabajo',
    accentColor: '#FF9A3E',
    lightColor: 'rgba(255,154,62,0.55)',
    ambientColor: 'rgba(255,120,30,0.12)',
    wallColor: '#2a1a0d',
    floorColor: '#1a0f07',
  },
  {
    id: 'dinner',
    label: 'Comedor',
    icon: 'restaurant',
    kelvin: 3000,
    description: 'Cena perfecta bajo luz cálida dorada',
    accentColor: '#FFB347',
    lightColor: 'rgba(255,179,71,0.50)',
    ambientColor: 'rgba(255,160,50,0.10)',
    wallColor: '#281808',
    floorColor: '#180e05',
  },
  {
    id: 'kitchen',
    label: 'Cocina',
    icon: 'skillet',
    kelvin: 4000,
    description: 'Luz neutra para ver los colores con fidelidad',
    accentColor: '#C8DCFF',
    lightColor: 'rgba(200,220,255,0.45)',
    ambientColor: 'rgba(180,210,255,0.08)',
    wallColor: '#0e1520',
    floorColor: '#090e14',
  },
  {
    id: 'office',
    label: 'Oficina',
    icon: 'computer',
    kelvin: 5000,
    description: 'Luz fría para máxima concentración',
    accentColor: '#9EC9FF',
    lightColor: 'rgba(126,200,255,0.45)',
    ambientColor: 'rgba(100,190,255,0.08)',
    wallColor: '#071220',
    floorColor: '#040b14',
  },
  {
    id: 'workshop',
    label: 'Taller',
    icon: 'precision_manufacturing',
    kelvin: 6500,
    description: 'Luz fría máxima para precisión técnica',
    accentColor: '#7EC8FF',
    lightColor: 'rgba(100,200,255,0.55)',
    ambientColor: 'rgba(80,180,255,0.10)',
    wallColor: '#05101a',
    floorColor: '#020810',
  },
];

const kelvinToTemp = (k: number) => {
  if (k <= 3000) return 'Cálida';
  if (k <= 4500) return 'Neutra';
  return 'Fría';
};

export default function RoomSimulator() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flickerOn, setFlickerOn] = useState(true);
  const prefersReduced = useRef(false);
  const scene = SCENES[activeIdx];

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const switchScene = (idx: number) => {
    if (idx === activeIdx) return;
    setIsAnimating(true);
    // Light flicker when switching
    if (!prefersReduced.current) {
      setFlickerOn(false);
      setTimeout(() => setFlickerOn(true), 80);
      setTimeout(() => setFlickerOn(false), 150);
      setTimeout(() => setFlickerOn(true), 220);
    }
    setTimeout(() => {
      setActiveIdx(idx);
      setIsAnimating(false);
    }, prefersReduced.current ? 0 : 150);
  };

  const transitionStyle: React.CSSProperties = {
    transition: prefersReduced.current ? 'none' : 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBlock: 'var(--space-8)',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Simulador de habitación — visualiza cada temperatura de color"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: '0.25rem' }}>
          Simulador de Habitación
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Selecciona un espacio y mira cómo cambia con cada luz
        </p>
      </div>

      {/* Scene selector */}
      <div
        style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}
        role="tablist"
        aria-label="Seleccionar escena de habitación"
      >
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`${s.label} — ${s.kelvin}K`}
            onClick={() => switchScene(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${i === activeIdx ? s.accentColor : 'rgba(255,255,255,0.08)'}`,
              background: i === activeIdx ? `${s.accentColor}18` : 'transparent',
              color: i === activeIdx ? s.accentColor : 'var(--color-text-tertiary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: prefersReduced.current ? 'none' : 'all 250ms ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.2em' }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Room SVG */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: scene.wallColor,
          aspectRatio: '16 / 9',
          maxHeight: '420px',
          marginInline: 'auto',
          ...transitionStyle,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Ambient room fill glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: scene.ambientColor,
            ...transitionStyle,
          }}
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 800 450"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block' }}
          aria-hidden="true"
        >
          <defs>
            {/* Main ceiling light cone */}
            <radialGradient id="lightCone" cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
              <stop offset="0%" stopColor={scene.lightColor} stopOpacity={flickerOn ? '1' : '0.2'} />
              <stop offset="60%" stopColor={scene.lightColor} stopOpacity={flickerOn ? '0.25' : '0.05'} />
              <stop offset="100%" stopColor={scene.lightColor} stopOpacity="0" />
            </radialGradient>

            {/* Side wall bounce light */}
            <radialGradient id="wallBounce" cx="0%" cy="50%" r="80%">
              <stop offset="0%" stopColor={scene.accentColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={scene.accentColor} stopOpacity="0" />
            </radialGradient>

            {/* Lamp glow */}
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={scene.accentColor} stopOpacity={flickerOn ? '1' : '0.3'} />
              <stop offset="40%" stopColor={scene.accentColor} stopOpacity={flickerOn ? '0.6' : '0.1'} />
              <stop offset="100%" stopColor={scene.accentColor} stopOpacity="0" />
            </radialGradient>

            {/* Floor reflection */}
            <linearGradient id="floorGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={scene.lightColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={scene.lightColor} stopOpacity="0" />
            </linearGradient>

            <filter id="blur-soft">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="blur-glow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Back wall */}
          <rect x="80" y="40" width="640" height="280" fill={scene.wallColor} rx="2" />

          {/* Left side wall */}
          <polygon points="0,0 80,40 80,320 0,450" fill={scene.wallColor} style={{ filter: 'brightness(0.7)' }} />

          {/* Right side wall */}
          <polygon points="800,0 720,40 720,320 800,450" fill={scene.wallColor} style={{ filter: 'brightness(0.7)' }} />

          {/* Floor */}
          <polygon points="0,450 80,320 720,320 800,450" fill={scene.floorColor} />

          {/* Ceiling */}
          <polygon points="0,0 80,40 720,40 800,0" fill={scene.wallColor} style={{ filter: 'brightness(1.2)' }} />

          {/* Wall bounce light */}
          <rect x="80" y="40" width="640" height="280" fill="url(#wallBounce)" />

          {/* Ceiling light fixture */}
          <rect x="375" y="38" width="50" height="4" fill="rgba(255,255,255,0.15)" rx="2" />
          <rect x="385" y="42" width="30" height="12" fill="rgba(255,255,255,0.10)" rx="3" />

          {/* Light bulb glow source */}
          <ellipse cx="400" cy="50" rx="18" ry="8" fill={scene.accentColor} opacity={flickerOn ? '0.9' : '0.2'} />
          <ellipse cx="400" cy="50" rx="30" ry="20" fill="url(#lampGlow)" filter="url(#blur-glow)" />

          {/* Main light cone */}
          <ellipse cx="400" cy="240" rx="320" ry="220" fill="url(#lightCone)" filter="url(#blur-soft)" />

          {/* Floor reflection pool */}
          <polygon points="80,320 720,320 680,440 120,440" fill="url(#floorGrad)" opacity="0.6" />

          {/* === Furniture === */}

          {/* Back wall picture/artwork */}
          <rect x="300" y="90" width="200" height="120" fill="rgba(255,255,255,0.04)" rx="4" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="310" y="100" width="180" height="100" fill={`${scene.accentColor}12`} rx="2" />
          {/* Picture frame inner design */}
          <ellipse cx="400" cy="150" rx="40" ry="28" fill={`${scene.accentColor}20`} />
          <ellipse cx="400" cy="150" rx="20" ry="14" fill={`${scene.accentColor}30`} />

          {/* Sofa */}
          <rect x="200" y="250" width="280" height="60" fill="rgba(255,255,255,0.08)" rx="8" />
          <rect x="200" y="240" width="280" height="18" fill="rgba(255,255,255,0.12)" rx="6" />
          {/* Sofa cushions */}
          <rect x="215" y="248" width="80" height="55" fill="rgba(255,255,255,0.06)" rx="6" />
          <rect x="315" y="248" width="80" height="55" fill="rgba(255,255,255,0.06)" rx="6" />
          <rect x="415" y="248" width="50" height="55" fill="rgba(255,255,255,0.06)" rx="6" />
          {/* Sofa arms */}
          <rect x="195" y="245" width="15" height="65" fill="rgba(255,255,255,0.10)" rx="4" />
          <rect x="475" y="245" width="15" height="65" fill="rgba(255,255,255,0.10)" rx="4" />

          {/* Coffee table */}
          <rect x="270" y="305" width="160" height="10" fill="rgba(255,255,255,0.10)" rx="3" />
          <rect x="280" y="315" width="4" height="12" fill="rgba(255,255,255,0.07)" rx="2" />
          <rect x="420" y="315" width="4" height="12" fill="rgba(255,255,255,0.07)" rx="2" />
          {/* Table lamp on coffee table */}
          <ellipse cx="360" cy="308" rx="12" ry="3" fill="rgba(255,255,255,0.06)" />

          {/* Floor lamp right */}
          <rect x="590" y="180" width="4" height="130" fill="rgba(255,255,255,0.08)" />
          <ellipse cx="592" cy="180" rx="22" ry="10" fill="rgba(255,255,255,0.10)" />
          {/* Floor lamp glow */}
          <ellipse cx="592" cy="175" rx="20" ry="16" fill={scene.accentColor} opacity="0.15" filter="url(#blur-soft)" />
          <ellipse cx="592" cy="312" rx="20" ry="5" fill="rgba(255,255,255,0.05)" />

          {/* Bookshelf left */}
          <rect x="100" y="120" width="80" height="180" fill="rgba(255,255,255,0.05)" rx="4" />
          {/* Shelf lines */}
          <line x1="100" y1="170" x2="180" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="100" y1="220" x2="180" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="100" y1="270" x2="180" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          {/* Book spines */}
          {[108, 118, 128, 140, 150].map((x, i) => (
            <rect key={i} x={x} y="125" width="8" height="43" fill={`${scene.accentColor}${['25', '18', '30', '20', '15'][i]}`} rx="1" />
          ))}
          {[108, 120, 132, 145, 155].map((x, i) => (
            <rect key={i} x={x} y="175" width="9" height="43" fill={`${scene.accentColor}${['20', '28', '15', '25', '18'][i]}`} rx="1" />
          ))}

          {/* Light beams through "window" right wall */}
          <polygon points="680,80 760,120 760,220 680,200" fill={scene.lightColor} opacity="0.06" />
          <line x1="680" y1="80" x2="760" y2="120" stroke={scene.accentColor} strokeWidth="0.5" opacity="0.15" />
          <line x1="680" y1="130" x2="760" y2="165" stroke={scene.accentColor} strokeWidth="0.5" opacity="0.10" />
          <line x1="680" y1="170" x2="760" y2="195" stroke={scene.accentColor} strokeWidth="0.5" opacity="0.08" />

          {/* Dust/light particles */}
          {[
            {cx:350, cy:120, r:1.5, op:0.5},
            {cx:420, cy:100, r:1, op:0.4},
            {cx:380, cy:150, r:2, op:0.3},
            {cx:440, cy:130, r:1.5, op:0.35},
            {cx:300, cy:110, r:1, op:0.3},
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={scene.accentColor} opacity={p.op} />
          ))}
        </svg>

        {/* Kelvin overlay badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.25rem',
        }} aria-hidden="true">
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: scene.accentColor,
            lineHeight: 1,
            textShadow: `0 0 20px ${scene.accentColor}80`,
            transition: prefersReduced.current ? 'none' : 'all 600ms ease',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {scene.kelvin}K
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: scene.accentColor,
            opacity: 0.8,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {kelvinToTemp(scene.kelvin)}
          </span>
        </div>

        {/* Scene info bottom overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '2.5rem 1.5rem 1rem',
          background: `linear-gradient(to top, ${scene.wallColor}E0 0%, transparent 100%)`,
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '0.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.2em' }}>{scene.icon}</span> {scene.label}
          </p>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'rgba(255,255,255,0.50)',
          }}>
            {scene.description}
          </p>
        </div>
      </div>

      {/* Bottom stat strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginTop: '1rem',
      }} role="list">
        {[
          { label: 'Temperatura', value: `${scene.kelvin}K` },
          { label: 'Tipo', value: kelvinToTemp(scene.kelvin) },
          { label: 'Ambiente', value: scene.label },
        ].map((stat) => (
          <div key={stat.label} role="listitem" style={{
            textAlign: 'center',
            padding: '0.625rem',
            background: `${scene.accentColor}10`,
            border: `1px solid ${scene.accentColor}25`,
            borderRadius: 'var(--radius-lg)',
            transition: prefersReduced.current ? 'none' : 'all 600ms ease',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: '0.125rem' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: scene.accentColor, fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
