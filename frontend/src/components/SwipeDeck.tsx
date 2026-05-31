'use client';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { useTranslation } from 'react-i18next';
import type { Item, Lang } from '@/types';
import PlaceCard from './PlaceCard';

const THRESH = 110;
const BIG_DECK_SIZE = 200;

function DecisionPanel({ dir, progress }: { dir: 'like' | 'skip'; progress: number }) {
  const { t } = useTranslation();
  const isLike = dir === 'like';
  const bg = isLike ? 'var(--success-600)' : 'var(--danger-500)';
  const shellOpacity = progress > 0 ? Math.min(1, 0.28 + progress) : 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1, borderRadius: 'var(--radius-lg)',
      background: bg, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: shellOpacity, transition: 'opacity 120ms ease, background-color 120ms ease',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: '#fff',
        transform: `scale(${0.74 + 0.26 * progress})`, opacity: progress,
        transition: 'transform 120ms ease, opacity 120ms ease',
      }}>
        <span style={{
          width: 74, height: 74, borderRadius: '50%', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.18)', border: '2.5px solid rgba(255,255,255,0.92)',
        }}>
          {isLike ? (
            <svg width={36} height={36} viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          ) : (
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          )}
        </span>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isLike ? t('like') : t('skip')}
        </span>
      </div>
    </div>
  );
}

interface SwipeDeckProps {
  deck: Item[];
  deckIndex: number;
  onDecision: (item: Item, liked: boolean) => void;
  lang: Lang;
  height?: number;
}

export default function SwipeDeck({ deck, deckIndex, onDecision, lang, height = 452 }: SwipeDeckProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [swiperActiveIndex, setSwiperActiveIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<{ dir: 'like' | 'skip' } | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const artHeight = Math.max(168, Math.min(212, Math.round(height * 0.46)));

  // Generate a large virtual deck by cycling through items
  const bigDeck = useMemo(() => {
    if (deck.length === 0) return [];
    const result: Item[] = [];
    while (result.length < BIG_DECK_SIZE) {
      result.push(...deck);
    }
    return result.slice(0, BIG_DECK_SIZE);
  }, [deck]);

  const currentItem = bigDeck[swiperActiveIndex] ?? null;

  // Reset when deck changes (mode/category change)
  useEffect(() => {
    setSwiperActiveIndex(0);
    swiperRef.current?.slideTo(0, 0);
    setLeaving(null);
    setDrag({ x: 0, y: 0, active: false });
    startRef.current = null;
  }, [deckIndex]);

  // Reset drag state when swiper advances
  useEffect(() => {
    setLeaving(null);
    setDrag({ x: 0, y: 0, active: false });
    startRef.current = null;
  }, [swiperActiveIndex]);

  const decide = useCallback((dir: 'like' | 'skip') => {
    if (leaving || !currentItem) return;
    setLeaving({ dir });
    setTimeout(() => {
      onDecision(currentItem, dir === 'like');
      swiperRef.current?.slideNext(0);
    }, 320);
  }, [leaving, currentItem, onDecision]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') decide('like');
      else if (e.key === 'ArrowLeft') decide('skip');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide]);

  function onDown(e: React.PointerEvent) {
    if (leaving) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag(d => ({ ...d, active: true }));
  }
  function onMove(e: React.PointerEvent) {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y, active: true });
  }
  function onUp() {
    if (!startRef.current) return;
    startRef.current = null;
    setDrag(d => {
      if (d.x > THRESH) { decide('like'); return d; }
      if (d.x < -THRESH) { decide('skip'); return d; }
      return { x: 0, y: 0, active: false };
    });
  }

  let tf: string, transition: string;
  if (leaving) {
    const dir = leaving.dir === 'like' ? 1 : -1;
    tf = `translate3d(${dir * 640}px, ${(drag.y || 0) - 24}px, 0) rotate(${dir * 20}deg)`;
    transition = 'transform 320ms cubic-bezier(0.32, 0, 0.22, 1)';
  } else {
    tf = `translate3d(${drag.x}px, ${drag.y * 0.22}px, 0) rotate(${drag.x / 24}deg)`;
    transition = drag.active ? 'none' : 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)';
  }

  const panelDir = leaving ? leaving.dir : (drag.x >= 0 ? 'like' : 'skip');
  const panelProgress = leaving ? 1 : (Math.abs(drag.x) < 4 ? 0 : Math.min(1, Math.abs(drag.x) / THRESH));

  return (
    <div style={{ position: 'relative', height, flexShrink: 0 }}>
      <DecisionPanel dir={panelDir} progress={panelProgress} />

      {/* Swiper manages the infinite virtual deck */}
      <div style={{ position: 'absolute', height: 1, overflow: 'hidden', visibility: 'hidden', width: '100%' }}>
        <Swiper
          modules={[Virtual]}
          virtual={{ enabled: true }}
          allowTouchMove={false}
          speed={0}
          onSwiper={s => { swiperRef.current = s; }}
          onSlideChange={s => setSwiperActiveIndex(s.activeIndex)}
        >
          {bigDeck.map((item, i) => (
            <SwiperSlide key={`${item.id}-${i}`} virtualIndex={i}>
              <div />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Visible animated card */}
      {currentItem && (
        <div
          key={`card-${swiperActiveIndex}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            position: 'absolute', inset: 0, zIndex: 3,
            cursor: drag.active ? 'grabbing' : 'grab',
            transform: tf, transition, touchAction: 'none', userSelect: 'none', willChange: 'transform',
          }}
        >
          <PlaceCard item={currentItem} lang={lang} artHeight={artHeight} />
        </div>
      )}
    </div>
  );
}
