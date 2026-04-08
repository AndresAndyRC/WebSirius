/**
 * LightParticles.tsx — React island
 * Animated floating light dust particles using Canvas API.
 * High performance: only one RAF loop for all particles.
 * client:only="react" — skip SSR.
 */
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  angle: number;
  color: string;
  drift: number;
}

interface LightParticlesProps {
  count?: number;
  colors?: string[];
}

export default function LightParticles({
  count = 40,
  colors = ['#F5A623', '#00C2FF', '#FFD27F', '#7EC8FF'],
}: LightParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Init particles
    particles.current = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      radius:  Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      speed:   Math.random() * 0.4 + 0.1,
      angle:   Math.random() * Math.PI * 2,
      color:   colors[Math.floor(Math.random() * colors.length)],
      drift:   (Math.random() - 0.5) * 0.01,
    }));

    const draw = (t: number) => {
      timeRef.current = t;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(p => {
        // Drift angle slowly
        p.angle += p.drift;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed - 0.15; // slow float upward

        // Wrap
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Shimmer opacity over time
        const shimmer = Math.sin(t * 0.001 + p.drift * 1000) * 0.15;
        const drawOpacity = Math.max(0.02, Math.min(0.65, p.opacity + shimmer));

        // Draw particle with glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        grad.addColorStop(0, `${p.color}${Math.round(drawOpacity * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${p.color}00`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.round(drawOpacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count, colors]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
