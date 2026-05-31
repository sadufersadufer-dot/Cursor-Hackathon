'use client';
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import type { Item, User, FocusEvent, Lang } from '@/types';
import { PLACES, EVENTS, getCatMap } from '@/lib/data';
import Header from './Header';
import SwipeDeck from './SwipeDeck';
import SavedList from './SavedList';
import CategoryDropdown from './CategoryDropdown';
import SignInModal from './SignInModal';
import { BWIcon } from './icons';

const BWMap = dynamic(() => import('./BWMap'), { ssr: false, loading: () => <div style={{ position: 'absolute', inset: 0, background: '#e8eef2' }} /> });

const SAVE_KEY = 'bw_saved_v2';
const ACCT_KEY = 'bw_account_v1';

function Segmented({ value, onChange, items }: {
  value: string;
  onChange: (v: string) => void;
  items: [string, string, React.ReactNode?][];
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 3 }}>
      {items.map(([k, label, icon]) => {
        const active = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            flex: 1, border: 'none', cursor: 'pointer', padding: '7px 10px', borderRadius: 6,
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: active ? '#fff' : 'transparent',
            color: active ? 'var(--brand-700)' : 'var(--fg-muted)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none', transition: 'all 150ms',
          }}>{icon}{label}</button>
        );
      })}
    </div>
  );
}

export default function BWApp() {
  const { t, i18n } = useTranslation();

  const [lang, setLang] = useState<Lang>('en');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<'place' | 'event'>('place');
  const [tab, setTab] = useState<'discover' | 'saved'>('discover');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [focus, setFocus] = useState<FocusEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      setSavedIds(Array.isArray(saved) ? saved : []);
    } catch { /* ignore */ }
    try {
      const acct = JSON.parse(localStorage.getItem(ACCT_KEY) || 'null');
      if (acct) setUser(acct);
    } catch { /* ignore */ }
    const storedLang = localStorage.getItem('bw_lang');
    if (storedLang === 'en' || storedLang === 'ru') {
      setLang(storedLang);
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  const handleSetLang = useCallback((l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
    localStorage.setItem('bw_lang', l);
  }, [i18n]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(savedIds));
  }, [savedIds, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (user) localStorage.setItem(ACCT_KEY, JSON.stringify(user));
    else localStorage.removeItem(ACCT_KEY);
  }, [user, mounted]);

  const dataset = mode === 'event' ? EVENTS : PLACES;
  const deck = useMemo(
    () => dataset.filter(p => !activeCat || p.cat === activeCat),
    [dataset, activeCat]
  );

  // Reset deck when mode/category changes
  useEffect(() => { setDeckIndex(d => d + 1); }, [mode, activeCat]);

  // Clamp category when mode changes
  useEffect(() => {
    if (activeCat && !getCatMap(mode)[activeCat]) setActiveCat(null);
  }, [mode]); // eslint-disable-line

  const byId = useMemo(() => {
    const all = [...PLACES, ...EVENTS];
    return Object.fromEntries(all.map(p => [p.id, p]));
  }, []);

  const top = deck.length ? deck[0] : null; // track for map pulse (simplified)
  const savedPlaces = useMemo(() => savedIds.map(id => byId[id]).filter(Boolean) as Item[], [savedIds, byId]);

  // Track seen items
  const [topItem, setTopItem] = useState<Item | null>(null);
  const suggested = useMemo(
    () => dataset.filter(p => seenIds.includes(p.id) && p.id !== topItem?.id),
    [dataset, seenIds, topItem]
  );
  const seenInMode = useMemo(() => dataset.filter(p => seenIds.includes(p.id)).length, [dataset, seenIds]);

  const onDecision = useCallback((item: Item, liked: boolean) => {
    setSeenIds(s => s.includes(item.id) ? s : [...s, item.id]);
    if (liked) {
      setSavedIds(s => s.includes(item.id) ? s : [...s, item.id]);
      setFocus({ place: item, nonce: Date.now() });
    }
  }, []);

  // Update topItem whenever deck changes (simplified: just track first item seen in each render)
  // The SwipeDeck's onDecision fires per card so we track via that callback
  const onDecisionWithTracking = useCallback((item: Item, liked: boolean) => {
    setTopItem(item);
    onDecision(item, liked);
  }, [onDecision]);

  const onRemove = useCallback((id: string) => setSavedIds(s => s.filter(x => x !== id)), []);
  const onFocusPlace = useCallback((p: Item) => setFocus({ place: p, nonce: Date.now() }), []);

  const onShare = useCallback(() => {
    const lines = savedPlaces.map((p, i) => `${i + 1}. ${p.name[lang]} — https://maps.google.com/?q=${p.lat},${p.lng}`);
    const text = `WhereInBishkek — ${t('savedTitle')}\n` + lines.join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [savedPlaces, lang, t]);

  const sidebar = (
    <aside style={{
      width: 412, flexShrink: 0, background: '#fff',
      borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{ padding: '15px 18px 12px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <Segmented value={mode} onChange={v => setMode(v as 'place' | 'event')} items={[
          ['place', t('places'), <BWIcon.Pin key="p" size={15} />],
          ['event', t('events'), <BWIcon.Calendar key="e" size={15} />],
        ]} />
        <Segmented value={tab} onChange={v => setTab(v as 'discover' | 'saved')} items={[
          ['discover', t('discover')],
          ['saved', `${t('saved')}${savedIds.length ? ` · ${savedIds.length}` : ''}`],
        ]} />
        {tab === 'discover' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CategoryDropdown mode={mode} activeCat={activeCat} setActiveCat={setActiveCat} lang={lang} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-subtle)' }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t('swiped', { count: seenInMode })}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t('savedCount_other', { count: savedIds.length })}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 18px 18px', minHeight: 0 }}>
        {tab === 'discover' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
            <SwipeDeck
              deck={deck}
              deckIndex={deckIndex}
              onDecision={onDecisionWithTracking}
              lang={lang}
            />
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
              {t('swipeHint')}
            </div>
          </div>
        ) : (
          <SavedList
            saved={savedPlaces} lang={lang}
            onFocus={item => { onFocusPlace(item); setTab('discover'); }}
            onRemove={onRemove} onShare={onShare} copied={copied}
          />
        )}
      </div>
    </aside>
  );

  if (!mounted) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ color: 'var(--brand-600)', fontSize: 18, fontWeight: 600 }}>WhereInBishkek</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        lang={lang} setLang={handleSetLang} savedCount={savedIds.length}
        user={user} onSignInClick={() => setAuthOpen(true)} onSignOut={() => setUser(null)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
        {sidebar}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <BWMap
            saved={savedPlaces}
            allPlaces={suggested}
            current={tab === 'discover' ? topItem : null}
            showAllPins={true}
            mapTheme="streets"
            focus={focus}
            onPinClick={p => { setTab('saved'); onFocusPlace(p); }}
            lang={lang}
          />
        </div>
      </div>
      <SignInModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={u => { setUser(u); setAuthOpen(false); }}
      />
    </div>
  );
}
