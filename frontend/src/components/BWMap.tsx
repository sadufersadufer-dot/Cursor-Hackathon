'use client';
import { useRef, useEffect } from 'react';
import type { Item, Lang, FocusEvent } from '@/types';
import { getCatMap, CENTER } from '@/lib/data';

const TILES = {
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenStreetMap contributors',
  },
};

function savedPinHtml(tint: string, n: number) {
  return `<div class="bw-pin">
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
      <path d="M17 43C17 43 32 27.5 32 16A15 15 0 1 0 2 16C2 27.5 17 43 17 43Z"
        fill="${tint}" stroke="#fff" stroke-width="2.5"/>
    </svg>
    <span class="bw-pin-num">${n}</span>
  </div>`;
}

function dotHtml(tint: string) {
  return `<div class="bw-dot" style="--dot:${tint}"></div>`;
}

function pulseHtml(tint: string) {
  return `<div class="bw-pulse" style="--pulse:${tint}"><span></span><span></span></div>`;
}

interface BWMapProps {
  saved: Item[];
  allPlaces: Item[];
  current: Item | null;
  showAllPins: boolean;
  mapTheme: keyof typeof TILES;
  focus: FocusEvent | null;
  onPinClick: (p: Item) => void;
  lang: Lang;
}

export default function BWMap({ saved, allPlaces, current, showAllPins, mapTheme, focus, onPinClick, lang }: BWMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof window.L.map> | null>(null);
  const tileRef = useRef<ReturnType<typeof window.L.tileLayer> | null>(null);
  const savedLayer = useRef<ReturnType<typeof window.L.layerGroup> | null>(null);
  const dotLayer = useRef<ReturnType<typeof window.L.layerGroup> | null>(null);
  const pulseRef = useRef<ReturnType<typeof window.L.marker> | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (!L) return;

    const map = L.map(elRef.current, {
      center: CENTER, zoom: 13, zoomControl: false,
      attributionControl: true, scrollWheelZoom: true,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPosition('bottomleft');
    mapRef.current = map;
    savedLayer.current = L.layerGroup().addTo(map);
    dotLayer.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 200);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (!map || !L) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const conf = TILES[mapTheme] || TILES.streets;
    tileRef.current = L.tileLayer(conf.url, { attribution: conf.attr, maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    tileRef.current.bringToBack();
  }, [mapTheme]);

  useEffect(() => {
    const layer = savedLayer.current;
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (!layer || !L) return;
    layer.clearLayers();
    saved.forEach((p, i) => {
      const cat = getCatMap(p.type)[p.cat];
      const icon = L.divIcon({
        className: 'bw-pin-wrap', html: savedPinHtml(cat.tint, i + 1),
        iconSize: [34, 44], iconAnchor: [17, 43],
      });
      const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(layer);
      m.bindTooltip(p.name[lang], { direction: 'top', offset: [0, -40], className: 'bw-tt' });
      m.on('click', () => onPinClick(p));
    });
  }, [saved, lang, onPinClick]);

  useEffect(() => {
    const layer = dotLayer.current;
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (!layer || !L) return;
    layer.clearLayers();
    if (!showAllPins) return;
    const savedIds = new Set(saved.map(p => p.id));
    allPlaces.forEach(p => {
      if (savedIds.has(p.id)) return;
      const cat = getCatMap(p.type)[p.cat];
      const icon = L.divIcon({ className: 'bw-dot-wrap', html: dotHtml(cat.tint), iconSize: [12, 12], iconAnchor: [6, 6] });
      L.marker([p.lat, p.lng], { icon, interactive: false, keyboard: false }).addTo(layer);
    });
  }, [showAllPins, allPlaces, saved]);

  useEffect(() => {
    const map = mapRef.current;
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (!map || !L) return;
    if (pulseRef.current) { map.removeLayer(pulseRef.current); pulseRef.current = null; }
    if (!current) return;
    const cat = getCatMap(current.type)[current.cat];
    const icon = L.divIcon({ className: 'bw-pulse-wrap', html: pulseHtml(cat.tint), iconSize: [22, 22], iconAnchor: [11, 11] });
    pulseRef.current = L.marker([current.lat, current.lng], { icon, interactive: false, keyboard: false, zIndexOffset: -100 }).addTo(map);
    map.panTo([current.lat, current.lng], { animate: true, duration: 0.6 });
  }, [current]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus?.place) return;
    map.flyTo([focus.place.lat, focus.place.lng], 15, { duration: 0.9 });
  }, [focus]);

  return <div ref={elRef} style={{ position: 'absolute', inset: 0, background: '#e8eef2' }} />;
}
