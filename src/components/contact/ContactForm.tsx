/**
 * ContactForm.tsx — React island (client:load)
 * Accessible contact form with field-level validation and submit animation.
 */
import { useState, useRef } from 'react';

type FieldState = 'idle' | 'error' | 'valid';
interface Fields {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}
type FieldKey = keyof Fields;

const TOPICS = [
  'Consulta antes de comprar',
  'Asesoría de iluminación para proyecto',
  'Seguimiento de pedido',
  'Garantía o devolución',
  'Distribución y mayoristas',
  'Otro',
];

const isEmpty = (v: string) => !v.trim();
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>({
    name: '', email: '', phone: '', topic: '', message: '',
  });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (key: FieldKey, val: string): FieldState => {
    if (!touched[key]) return 'idle';
    if (key === 'email') return isEmail(val) ? 'valid' : 'error';
    if (key === 'message') return val.trim().length >= 10 ? 'valid' : 'error';
    if (key === 'name') return val.trim().length >= 2 ? 'valid' : 'error';
    if (key === 'topic') return !isEmpty(val) ? 'valid' : 'error';
    return 'idle'; // phone is optional
  };

  const fieldState = (key: FieldKey) => validate(key, fields[key]);

  const handleChange = (key: FieldKey, val: string) => {
    setFields(prev => ({ ...prev, [key]: val }));
  };

  const handleBlur = (key: FieldKey) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  };

  const isFormValid = () =>
    !isEmpty(fields.name) && fields.name.trim().length >= 2 &&
    isEmail(fields.email) &&
    !isEmpty(fields.topic) &&
    fields.message.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched to show errors
    setTouched({ name: true, email: true, phone: true, topic: true, message: true });
    if (!isFormValid()) return;

    setStatus('sending');

    // Simulate send (replace with your actual endpoint)
    await new Promise(r => setTimeout(r, 1800));

    // In production: POST to a form handler / Formspree / Netlify Forms
    // const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(fields) });
    setStatus('success');
    setFields({ name: '', email: '', phone: '', topic: '', message: '' });
    setTouched({});
  };

  // ── Shared input style builder ──
  const inputStyle = (key: FieldKey): React.CSSProperties => {
    const state = fieldState(key);
    return {
      width: '100%',
      padding: '0.875rem 1rem',
      background: 'var(--color-surface-overlay)',
      border: `1.5px solid ${state === 'error' ? '#ef4444' : state === 'valid' ? '#22c55e' : 'var(--color-surface-border)'}`,
      borderRadius: 'var(--radius-lg)',
      color: 'var(--color-text-primary)',
      fontSize: 'var(--text-base)',
      outline: 'none',
      transition: 'border-color 200ms ease, box-shadow 200ms ease',
      minHeight: '52px',
      fontFamily: 'inherit',
    };
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  };

  const errStyle: React.CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: '#ef4444',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  if (status === 'success') {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 'var(--radius-2xl)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
          ¡Mensaje enviado!
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '40ch', margin: '0 auto 1.5rem' }}>
          Nuestro equipo te responderá en las próximas&nbsp;<strong>24–48&nbsp;horas hábiles</strong>.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            padding: '0.625rem 1.5rem',
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.30)',
            borderRadius: 'var(--radius-full)',
            color: '#22c55e',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Formulario de contacto">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="cf-name" style={labelStyle}>
            Tu nombre <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="cf-name"
            type="text"
            value={fields.name}
            onChange={e => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Ej: María Fernanda"
            style={inputStyle('name')}
            autoComplete="name"
            required
            aria-describedby="cf-name-err"
            aria-invalid={fieldState('name') === 'error'}
          />
          {fieldState('name') === 'error' && (
            <p id="cf-name-err" role="alert" style={errStyle}>⚠ Ingresa tu nombre (mín. 2 caracteres)</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="cf-email" style={labelStyle}>
            Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="cf-email"
            type="email"
            value={fields.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="tu@correo.com"
            style={inputStyle('email')}
            autoComplete="email"
            required
            aria-describedby="cf-email-err"
            aria-invalid={fieldState('email') === 'error'}
          />
          {fieldState('email') === 'error' && (
            <p id="cf-email-err" role="alert" style={errStyle}>⚠ Correo electrónico inválido</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="cf-phone" style={labelStyle}>
            Teléfono / WhatsApp <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(opcional)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            value={fields.phone}
            onChange={e => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="+57 300 000 0000"
            style={inputStyle('phone')}
            autoComplete="tel"
          />
        </div>

        {/* Topic */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="cf-topic" style={labelStyle}>
            ¿En qué te ayudamos? <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="cf-topic"
            value={fields.topic}
            onChange={e => handleChange('topic', e.target.value)}
            onBlur={() => handleBlur('topic')}
            style={{ ...inputStyle('topic'), cursor: 'pointer' }}
            required
            aria-describedby="cf-topic-err"
            aria-invalid={fieldState('topic') === 'error'}
          >
            <option value="">Selecciona un motivo…</option>
            {TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {fieldState('topic') === 'error' && (
            <p id="cf-topic-err" role="alert" style={errStyle}>⚠ Selecciona una opción</p>
          )}
        </div>

        {/* Message */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="cf-message" style={labelStyle}>
            Mensaje <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="cf-message"
            value={fields.message}
            onChange={e => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            placeholder="Cuéntanos tu proyecto, duda o requerimiento con el mayor detalle posible…"
            rows={5}
            style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '140px', lineHeight: '1.6' }}
            required
            aria-describedby="cf-message-err cf-message-count"
            aria-invalid={fieldState('message') === 'error'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            {fieldState('message') === 'error' ? (
              <p id="cf-message-err" role="alert" style={errStyle}>⚠ El mensaje debe tener al menos 10 caracteres</p>
            ) : <span />}
            <span id="cf-message-count" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              {fields.message.length} caracteres
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          marginTop: '1.5rem',
          width: '100%',
          minHeight: '54px',
          padding: '0 2rem',
          background: status === 'sending' ? 'rgba(245,166,35,0.5)' : 'var(--color-brand-primary)',
          color: '#000',
          fontWeight: 700,
          fontSize: 'var(--text-base)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.625rem',
          transition: 'opacity 200ms ease, transform 150ms ease',
          boxShadow: status === 'sending' ? 'none' : '0 0 28px rgba(245,166,35,0.35)',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (status !== 'sending') (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
      >
        {status === 'sending' ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/>
            </svg>
            Enviando…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Enviar mensaje
          </>
        )}
      </button>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder, select { color: var(--color-text-tertiary); }
        input:focus, textarea:focus, select:focus { border-color: var(--color-brand-primary) !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.15); }
        option { background: #1a1f2e; color: var(--color-text-primary); }
      `}</style>
    </form>
  );
}
