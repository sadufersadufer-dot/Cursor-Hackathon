export type Lang = 'en' | 'ru';

export interface Category {
  tint: string;
  soft: string;
  label: { en: string; ru: string };
}

export interface Place {
  id: string;
  type: 'place';
  cat: string;
  rating: number;
  reviews: number;
  dist: number;
  price: number;
  photo: string;
  lat: number;
  lng: number;
  openUntil: { en: string; ru: string };
  open: boolean;
  name: { en: string; ru: string };
  desc: { en: string; ru: string };
}

export interface BWEvent {
  id: string;
  type: 'event';
  cat: string;
  rating: number;
  reviews: number;
  dist: number;
  price: number;
  photo: string;
  lat: number;
  lng: number;
  when: { en: string; ru: string };
  venue: { en: string; ru: string };
  name: { en: string; ru: string };
  desc: { en: string; ru: string };
}

export type Item = Place | BWEvent;

export interface User {
  name: string;
  email: string;
  guest: boolean;
}

export interface FocusEvent {
  place: Item;
  nonce: number;
}
