import type { Lang } from '../i18n/context';

/** Build a language-prefixed path: localePath('he','/portfolio') -> '/he/portfolio' */
export const localePath = (lang: Lang, path = '') => {
  const p = path.replace(/^\/+/, '');
  return p ? `/${lang}/${p}` : `/${lang}`;
};

export const PHONE = '+972502936373';
export const PHONE_DISPLAY = '+972 50-293-6373';
export const EMAIL = 'Amit@abdesigner.co.il';
export const INSTAGRAM = 'https://instagram.com/ab_designer._';
export const INSTAGRAM_HANDLE = '@ab_designer._';
export const waLink = (msg: string) => `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(msg)}`;
