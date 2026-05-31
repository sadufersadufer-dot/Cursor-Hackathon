'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Item, Lang } from '@/types';
import { getCatMap } from '@/lib/data';
import { BWIcon } from './icons';

function CardArt({ item, catTint, catSoft, catLabel, height = 212 }: {
  item: Item; catTint: string; catSoft: string; catLabel: string; height?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{
      height, background: catSoft, position: 'relative', overflow: 'hidden',
      borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: loaded ? 0 : 0.5, transition: 'opacity 300ms ease',
      }}>
        <svg width={58} height={58} viewBox="0 0 64 64" fill="none" stroke={catTint}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="20" />
        </svg>
      </div>
      <img src={item.photo} alt="" draggable={false} onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 360ms ease', userSelect: 'none',
        }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(11,30,46,0.34) 0%, rgba(11,30,46,0) 34%, rgba(11,30,46,0) 64%, rgba(11,30,46,0.28) 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 2,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '4px 10px', borderRadius: 'var(--radius-pill)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.94)', color: catTint, boxShadow: 'var(--shadow-sm)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: catTint }} />
        {catLabel}
      </div>
    </div>
  );
}

function Meta({ icon, text, strong, grow }: { icon: React.ReactNode; text: string; strong?: boolean; grow?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5,
      color: strong ? 'var(--fg-body)' : 'var(--fg-muted)', fontWeight: strong ? 600 : 400,
      minWidth: 0, flex: grow ? 1 : 'none',
    }}>
      <span style={{ display: 'inline-flex', color: 'var(--brand-600)', flexShrink: 0 }}>{icon}</span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
    </span>
  );
}

function PriceLevel({ price, isEvent }: { price: number; isEvent: boolean }) {
  const { t } = useTranslation();
  if (price === 0) {
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, color: 'var(--success-700)', background: 'var(--success-50)',
        padding: '2px 8px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
      }}>{isEvent ? t('freeEntry') : t('free')}</span>
    );
  }
  return (
    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>
      <span style={{ color: 'var(--fg-body)' }}>{'$'.repeat(price)}</span>
      <span style={{ color: 'var(--border-strong)' }}>{'$'.repeat(3 - price)}</span>
    </span>
  );
}

export default function PlaceCard({ item, lang, artHeight = 212 }: {
  item: Item; lang: Lang; artHeight?: number;
}) {
  const { t } = useTranslation();
  const catMap = getCatMap(item.type);
  const cat = catMap[item.cat];
  const catLabel = cat.label[lang];
  const isEvent = item.type === 'event';

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <CardArt item={item} catTint={cat.tint} catSoft={cat.soft} catLabel={catLabel} height={artHeight} />
      <div style={{ padding: '15px 18px 17px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--fg-strong)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            {item.name[lang]}
          </h2>
          <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#e0a300', display: 'inline-flex' }}><BWIcon.Star size={14} /></span>
            <span style={{ fontWeight: 700, color: 'var(--fg-body)', fontSize: 13 }}>{item.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>
              · {t('reviews_other', { count: item.reviews })}
            </span>
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-muted)',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.desc[lang]}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {isEvent && item.type === 'event' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <Meta icon={<BWIcon.Calendar size={14} />} text={item.when[lang]} strong grow />
                <PriceLevel price={item.price} isEvent />
              </div>
              <Meta icon={<BWIcon.Pin size={14} />} text={item.venue[lang]} />
            </>
          ) : item.type === 'place' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <Meta icon={<BWIcon.Pin size={14} />}
                  text={item.dist === 0 ? t('kmAwayCentre') : t('kmAway', { distance: item.dist.toFixed(1) })}
                  grow />
                <PriceLevel price={item.price} isEvent={false} />
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                color: item.open ? 'var(--success-700)' : 'var(--danger-800)' }}>
                <span style={{ display: 'inline-flex' }}><BWIcon.Clock size={13} /></span>
                {item.openUntil[lang]}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
