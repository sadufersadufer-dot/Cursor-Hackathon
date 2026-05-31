'use client';
import { useTranslation } from 'react-i18next';
import type { User, Lang } from '@/types';
import { BWIcon } from './icons';
import AccountControl from './AccountControl';

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: 2, gap: 2 }}>
      {(['en', 'ru'] as Lang[]).map(l => {
        const active = lang === l;
        return (
          <button key={l} onClick={() => setLang(l)} style={{
            border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)', letterSpacing: '0.04em',
            background: active ? '#fff' : 'transparent',
            color: active ? 'var(--brand-700)' : 'rgba(255,255,255,0.85)',
            transition: 'background 150ms, color 150ms',
          }}>{l.toUpperCase()}</button>
        );
      })}
    </div>
  );
}

interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  savedCount: number;
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  compact?: boolean;
}

export default function Header({ lang, setLang, savedCount, user, onSignInClick, onSignOut, compact }: HeaderProps) {
  return (
    <header style={{ background: 'var(--brand-600)', color: '#fff', boxShadow: 'var(--shadow-md)', flexShrink: 0, zIndex: 30 }}>
      <div style={{ height: 60, padding: compact ? '0 14px' : '0 22px', display: 'flex', alignItems: 'center', gap: compact ? 10 : 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ display: 'inline-flex', color: '#fff' }}><BWIcon.Pin size={22} /></span>
          <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
            WhereIn<span style={{ color: 'var(--brand-100)' }}>Bishkek</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: compact ? 9 : 14 }}>
          {!compact && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(255,255,255,0.14)', padding: '5px 11px', borderRadius: 'var(--radius-pill)' }}>
              <BWIcon.Heart size={14} fill="#fff" />
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{savedCount}</span>
            </span>
          )}
          <LangToggle lang={lang} setLang={setLang} />
          {!compact && <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.22)' }} />}
          <AccountControl user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} savedCount={savedCount} compact={compact} />
        </div>
      </div>
    </header>
  );
}
