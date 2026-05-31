'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types';
import { BWIcon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSignIn: (u: User) => void;
}

export default function SignInModal({ open, onClose, onSignIn }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => { if (open) { setName(''); setEmail(''); } }, [open]);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn({ name: name.trim() || t('guestName'), email: email.trim(), guest: false });
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px 10px 38px', fontSize: 14, fontFamily: 'var(--font-sans)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
    color: 'var(--fg-body)', background: '#fff', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(11,30,46,0.42)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onMouseDown={e => e.stopPropagation()} style={{
        width: 392, maxWidth: '100%', background: '#fff', borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
      }}>
        <div style={{ background: 'var(--brand-600)', color: '#fff', padding: '22px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <BWIcon.Pin size={20} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>WhereIn<span style={{ color: 'var(--brand-100)' }}>Bishkek</span></span>
          </div>
          <h2 style={{ margin: '14px 0 0', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{t('signInTitle')}</h2>
        </div>
        <form onSubmit={submit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{t('signInSub')}</p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-subtle)' }}>{t('nameLabel')}</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--fg-subtle)', display: 'inline-flex', pointerEvents: 'none' }}><BWIcon.User size={16} /></span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t('namePh')} style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-400)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />
            </div>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-subtle)' }}>{t('emailLabel')}</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--fg-subtle)', display: 'inline-flex', pointerEvents: 'none' }}><BWIcon.Mail size={16} /></span>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('emailPh')} type="email" style={fieldStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-400)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />
            </div>
          </label>
          <button type="submit" style={{
            width: '100%', marginTop: 4, background: 'var(--brand-600)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 18px',
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}>{t('continue')}</button>
          <button type="button" onClick={() => onSignIn({ name: t('guestName'), email: '', guest: true })}
            style={{ border: 'none', background: 'transparent', color: 'var(--fg-muted)', fontSize: 13,
              fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer', padding: '4px 0' }}>
            {t('asGuest')}
          </button>
        </form>
      </div>
    </div>
  );
}
