/**
 * LightCursor.tsx — React island
 * Creates a dynamic radial glow that follows the mouse cursor.
 * Respects prefers-reduced-motion.
 * Usage: <LightCursor client:only="react" />
 */
import { useEffect, useRef } from 'react';

interface LightCursorProps {
  color?: string;
  size?: number;
  opacity?: number;
}

export default function LightCursor({
  color = '245,166,35',
  size = 350,
  opacity = 0.10,
}: LightCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const el = cursorRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const render = () => {
      if (el) {
        el.style.left = `${posRef.current.x}px`;
        el.style.top  = `${posRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${color}, ${opacity}) 0%, rgba(${color}, 0.04) 40%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'screen',
        left: '-1000px',
        top: '-1000px',
        willChange: 'left, top',
      }}
    />
  );
}
