import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/context';

const SITE = 'https://abdesigner.co.il';

/** Sets document title, description, and hreflang/canonical alternates per page. */
export default function Seo({ title, description }: { title: string; description?: string }) {
  const { lang } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:title"]', 'property', 'og:title', title);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    }

    // hreflang + canonical
    const rest = pathname.replace(/^\/(he|en)/, '');
    const links: { rel: string; hreflang?: string; href: string }[] = [
      { rel: 'canonical', href: `${SITE}/${lang}${rest}` },
      { rel: 'alternate', hreflang: 'he', href: `${SITE}/he${rest}` },
      { rel: 'alternate', hreflang: 'en', href: `${SITE}/en${rest}` },
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE}/he${rest}` },
    ];
    const created: HTMLLinkElement[] = [];
    for (const l of links) {
      const el = document.createElement('link');
      el.rel = l.rel;
      if (l.hreflang) el.hreflang = l.hreflang;
      el.href = l.href;
      el.dataset.seo = 'true';
      document.head.appendChild(el);
      created.push(el);
    }
    return () => created.forEach((el) => el.remove());
  }, [title, description, lang, pathname]);

  return null;
}
