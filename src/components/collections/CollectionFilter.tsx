/**
 * CollectionFilter.tsx — React island  (client:load)
 * Live search + category filtering for the collections grid.
 * No external deps, just React state.
 */
import { useState, useMemo, useEffect, useRef } from 'react';

export interface Collection {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
  tags: string[];
  icon: string;
  featured?: boolean;
}

interface Props {
  collections: Collection[];
}

const CATEGORIES = [
  { id: 'all',           label: 'Todo el catálogo', icon: 'apps' },
  { id: 'iluminacion',   label: 'Iluminación LED',  icon: 'light_mode' },
  { id: 'electrico',     label: 'Eléctrico',         icon: 'electrical_services' },
  { id: 'exterior',      label: 'Exterior & Jardín', icon: 'eco' },
  { id: 'especial',      label: 'Especiales',        icon: 'stars' },
  { id: 'hogar',         label: 'Hogar & Baño',      icon: 'home' },
];

export default function CollectionFilter({ collections }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Stagger cards in on mount
    const ids = collections.map(c => c.id);
    ids.forEach((id, i) => {
      setTimeout(() => setVisible(prev => new Set([...prev, id])), prefersReduced.current ? 0 : i * 30);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections.filter(c => {
      const matchesCat = activeCategory === 'all' || c.category === activeCategory;
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.tags.some(t => t.includes(q));
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, query, collections]);

  const handleCat = (id: string) => {
    setActiveCategory(id);
    // Re-animate cards when switching category
    setVisible(new Set());
    setTimeout(() => {
      filtered.forEach((c, i) => {
        setTimeout(() => setVisible(prev => new Set([...prev, c.id])), prefersReduced.current ? 0 : i * 25);
      });
    }, 10);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Search bar ── */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <label htmlFor="col-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Buscar colección
        </label>
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', flexShrink: 0 }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            id="col-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar colección… (ej: paneles, cintas, exterior)"
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              background: 'var(--color-surface-raised)',
              border: '1.5px solid var(--color-surface-border)',
              borderRadius: 'var(--radius-xl)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-base)',
              outline: 'none',
              transition: 'border-color 200ms ease',
              minHeight: '52px',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-brand-primary)'; }}
            onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-surface-border)'; }}
            aria-label="Buscar colecciones"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--color-text-tertiary)',
                cursor: 'pointer', padding: '0.25rem', borderRadius: '50%',
              }}
              aria-label="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <div
        style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}
        role="tablist"
        aria-label="Filtrar por categoría"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => handleCat(cat.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${activeCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-surface-border)'}`,
              background: activeCategory === cat.id ? 'rgba(245,166,35,0.12)' : 'var(--color-surface-raised)',
              color: activeCategory === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: activeCategory === cat.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              minHeight: '40px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2em', verticalAlign: '-4px' }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <p
        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: '1.5rem', fontWeight: 500 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length === 0
          ? 'Sin resultados — intenta otra búsqueda'
          : `${filtered.length} colección${filtered.length !== 1 ? 'es' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--color-surface-raised)',
          border: '1px dashed var(--color-surface-border)',
          borderRadius: 'var(--radius-2xl)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>search</span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
            No encontramos esa colección. Prueba con otro término.
          </p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('all'); }}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.5rem',
              background: 'rgba(245,166,35,0.12)',
              border: '1px solid rgba(245,166,35,0.30)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px), 1fr))',
            gap: '1.25rem',
            listStyle: 'none',
          }}
          role="list"
        >
          {filtered.map((col) => (
            <li key={col.id} role="listitem" style={{
              opacity: visible.has(col.id) ? 1 : 0,
              transform: visible.has(col.id) ? 'none' : 'translateY(16px)',
              transition: prefersReduced.current ? 'none' : 'opacity 350ms ease, transform 350ms ease',
            }}>
              <a
                href={col.href}
                target={col.href.startsWith('http') ? "_blank" : undefined}
                rel={col.href.startsWith('http') ? "noopener noreferrer" : undefined}
                aria-label={`Ver colección: ${col.name}`}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
                className="col-card"
              >
                <article style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  background: col.featured ? 'rgba(245,166,35,0.06)' : 'var(--color-surface-raised)',
                  border: `1px solid ${col.featured ? 'rgba(245,166,35,0.30)' : 'var(--color-surface-border)'}`,
                  borderRadius: 'var(--radius-xl)',
                  gap: '0.875rem',
                  transition: 'border-color 250ms ease, transform 250ms ease, box-shadow 250ms ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {col.featured && (
                    <span style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(245,166,35,0.20)',
                      border: '1px solid rgba(245,166,35,0.40)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--color-brand-primary)',
                    }}>
                      ✦ Destacado
                    </span>
                  )}

                  {/* Icon */}
                  <div style={{
                    fontSize: '2rem',
                    lineHeight: 1,
                    width: '52px', height: '52px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-surface-overlay)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-surface-border)',
                    flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined">{col.icon}</span>
                  </div>

                  {/* Name */}
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}>
                    {col.name}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.55,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: 0,
                  }}>
                    {col.description}
                  </p>

                  {/* CTA row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-surface-divider)', marginTop: 'auto' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                      Ver productos
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </article>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Hover styles via stylesheet injection */}
      <style>{`
        .col-card article:hover {
          border-color: rgba(245,166,35,0.45) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 24px rgba(245,166,35,0.08);
        }
      `}</style>
    </div>
  );
}
