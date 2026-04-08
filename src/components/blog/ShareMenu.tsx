/**
 * ShareMenu.tsx — React island for share functionality
 * Hydrated client-side with `client:visible`
 */
import { useState, useRef, useEffect } from 'react';

interface ShareMenuProps {
  url: string;
  title: string;
}

const shareTargets = [
  {
    name: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M11.997 2.003C6.476 2.003 2 6.479 2 12c0 1.929.542 3.73 1.485 5.27L2.003 22l4.899-1.445A9.965 9.965 0 0012 22c5.522 0 10-4.477 10-10s-4.477-9.997-10-9.997z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X / Twitter',
    color: '#000000',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export default function ShareMenu({ url, title }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggle = () => setIsOpen(prev => !prev);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="share-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="share-menu__trigger btn btn--ghost"
        onClick={handleNativeShare}
        aria-label="Compartir este artículo"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Compartir
      </button>

      {isOpen && (
        <div
          className="share-menu__dropdown"
          role="dialog"
          aria-label="Opciones para compartir"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            zIndex: 200,
            background: 'var(--color-surface-overlay)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px',
            minWidth: '220px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Close on backdrop click */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: -1 }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
            Compartir en
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }} role="list">
            {shareTargets.map((target) => (
              <li key={target.name}>
                <a
                  href={target.getUrl(url, title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    transition: 'background 150ms',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  onClick={() => setIsOpen(false)}
                >
                  <span style={{ color: target.color }}>{target.icon}</span>
                  {target.name}
                </a>
              </li>
            ))}
          </ul>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-divider)', margin: '8px 0' }} />

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 150ms, color 150ms',
            }}
            aria-label="Copiar enlace al portapapeles"
          >
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
            {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
          </button>
        </div>
      )}
    </div>
  );
}
