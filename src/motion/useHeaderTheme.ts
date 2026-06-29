import { useEffect, useState } from 'react';

/**
 * Tracks whether the section currently under the fixed header is dark
 * (`data-theme="ink"`), so header elements (brand logo, menu button) can flip
 * colour. The header is persistent (it outlives page transitions), so the
 * observer re-binds on the `amit:pageready` window event that Layout fires once
 * a freshly navigated page has mounted — otherwise it would keep observing the
 * outgoing route's sections after client-side navigation.
 */
export function useHeaderTheme(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const bind = () => {
      io?.disconnect();
      const secs = Array.from(document.querySelectorAll('[data-theme]'));
      if (!secs.length) {
        setDark(false);
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setDark(e.target.getAttribute('data-theme') === 'ink');
        },
        { rootMargin: '0px 0px -100% 0px' }
      );
      secs.forEach((s) => io!.observe(s));
    };
    bind();
    window.addEventListener('amit:pageready', bind);
    return () => {
      io?.disconnect();
      window.removeEventListener('amit:pageready', bind);
    };
  }, []);

  return dark;
}
