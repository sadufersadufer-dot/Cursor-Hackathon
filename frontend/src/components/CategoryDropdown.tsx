'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '@/types';
import { getCatMap, getCatOrder } from '@/lib/data';
import { BWIcon } from './icons';

interface Props {
  mode: 'place' | 'event';
  activeCat: string | null;
  setActiveCat: (cat: string | null) => void;
  lang: Lang;
}

export default function CategoryDropdown({ mode, activeCat, setActiveCat, lang }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const catMap = getCatMap(mode);
  const order = getCatOrder(mode);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = activeCat ? catMap[activeCat] : null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px',
        border: `1px solid ${open ? 'var(--brand-400)' : 'var(--border-default)'}`,
        background: '#fff', borderRadius: 'var(--radius-md)', cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-body)',
        transition: 'border-color 150ms', boxShadow: open ? '0 0 0 3px var(--ring-color)' : 'none',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: current ? current.tint : 'var(--gray-300)', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{current ? current.label[lang] : t('allCats')}</span>
        <span style={{ color: 'var(--fg-subtle)', display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
          <BWIcon.Chevron size={14} />
        </span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 40,
          background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: '5px 0', maxHeight: 320, overflowY: 'auto',
        }}>
          {[null, ...order].map(id => {
            const cat = id ? catMap[id] : null;
            const active = activeCat === id;
            const label = id ? cat!.label[lang] : t('allCats');
            const tint = id ? cat!.tint : 'var(--gray-300)';
            return (
              <button key={id ?? '__all'} onClick={() => { setActiveCat(id); setOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px',
                border: 'none', background: active ? 'var(--brand-50)' : 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-700)' : 'var(--fg-body)', textAlign: 'left', transition: 'background 120ms',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-50)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: tint, flexShrink: 0 }} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
