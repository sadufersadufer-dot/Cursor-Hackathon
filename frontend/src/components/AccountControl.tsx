'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types';
import { BWIcon } from './icons';

function Avatar({ name, size = 32, onBrand }: { name: string; size?: number; onBrand?: boolean }) {
  const initials = (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, fontFamily: 'var(--font-sans)',
      background: onBrand ? 'rgba(255,255,255,0.25)' : 'var(--brand-100)',
      color: onBrand ? '#fff' : 'var(--brand-700)',
    }}>{initials}</span>
  );
}

interface Props {
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  savedCount: number;
  compact?: boolean;
}

export default function AccountControl({ user, onSignInClick, onSignOut, savedCount, compact }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) {
    return (
      <button onClick={onSignInClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
        padding: compact ? '7px 10px' : '6px 13px', borderRadius: 'var(--radius-md)',
        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', transition: 'background 150ms',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}>
        <BWIcon.User size={15} />{!compact && t('signIn')}
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        background: open ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none',
        padding: '4px 8px 4px 4px', borderRadius: 'var(--radius-pill)', transition: 'background 150ms',
      }}>
        <Avatar name={user.name} size={30} onBrand />
        {!compact && (
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.85)', display: 'inline-flex' }}><BWIcon.Chevron size={13} /></span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 244, zIndex: 50,
          background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-2xl)', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid var(--border-soft)' }}>
            <Avatar name={user.name} size={38} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email || (user.guest ? 'Demo guest' : '—')}
              </div>
            </div>
          </div>
          <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: 'var(--brand-600)', display: 'inline-flex' }}><BWIcon.Heart size={15} /></span>
              {t('myList')}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-strong)', fontVariantNumeric: 'tabular-nums' }}>{savedCount}</span>
          </div>
          <button onClick={() => { setOpen(false); onSignOut(); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '11px 15px',
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            fontSize: 13, fontWeight: 600, color: 'var(--danger-800)', textAlign: 'left', transition: 'background 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-50)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <BWIcon.LogOut size={16} />{t('logOut')}
          </button>
        </div>
      )}
    </div>
  );
}
