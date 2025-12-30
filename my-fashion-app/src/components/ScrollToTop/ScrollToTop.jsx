import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop component: scrolls to the top of the page on pathname change
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        try {
          window.history.scrollRestoration = 'manual';
        } catch (e) {
          // ignore in some environments
        }
      }
      // Synchronous scroll so the browser paints the new route at top
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // fallback
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
