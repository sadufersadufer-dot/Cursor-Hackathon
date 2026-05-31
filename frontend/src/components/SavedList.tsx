'use client';
import { useTranslation } from 'react-i18next';
import type { Item, Lang } from '@/types';
import { getCatMap } from '@/lib/data';
import { BWIcon } from './icons';

interface SavedListProps {
  saved: Item[];
  lang: Lang;
  onFocus: (p: Item) => void;
  onRemove: (id: string) => void;
  onShare: () => void;
  copied: boolean;
}

export default function SavedList({ saved, lang, onFocus, onRemove, onShare, copied }: SavedListProps) {
  const { t } = useTranslation();

  if (saved.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12, padding: '24px 28px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-subtle)' }}>
          <BWIcon.Heart size={26} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-muted)', maxWidth: 260, lineHeight: 1.55 }}>{t('savedEmpty')}</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-subtle)' }}>
          {t('savedCount_other', { count: saved.length })}
        </div>
        <button onClick={onShare} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: `1px solid ${copied ? 'var(--success-600)' : 'var(--border-default)'}`,
          background: copied ? 'var(--success-50)' : '#fff',
          color: copied ? 'var(--success-700)' : 'var(--brand-700)',
          padding: '6px 11px', borderRadius: 'var(--radius-md)', fontSize: 12.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 150ms',
        }}>
          <BWIcon.Share size={14} />{copied ? t('copied') : t('share')}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, paddingRight: 2 }}>
        {saved.map((p, i) => {
          const cat = getCatMap(p.type)[p.cat];
          const sub = p.type === 'event' ? p.when[lang] : cat.label[lang];
          return (
            <div key={p.id} onClick={() => onFocus(p)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              background: '#fff', cursor: 'pointer', transition: 'background 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-50)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
              <span style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0, overflow: 'hidden',
                position: 'relative', background: cat.soft,
              }}>
                <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22,
                borderRadius: '50%', background: cat.tint, color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name[lang]}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.tint, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); onRemove(p.id); }} title={t('remove')} style={{
                border: 'none', background: 'transparent', color: 'var(--fg-subtle)', cursor: 'pointer',
                padding: 5, borderRadius: 6, display: 'inline-flex', flexShrink: 0,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger-500)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-subtle)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <BWIcon.Trash size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
