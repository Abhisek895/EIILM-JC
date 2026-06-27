import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { store } from '@store/index';
import { hydrateAuth, setHydrated } from '@store/slices/authSlice';
import '@styles/globals.css';

const AuthHydrator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const token = window.localStorage.getItem('token');
      const refreshToken = window.localStorage.getItem('refreshToken');
      const userRaw = window.localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      dispatch(
        hydrateAuth({
          user,
          token,
          refreshToken,
        })
      );
    } catch (error) {
      dispatch(setHydrated());
    }
  }, [dispatch]);

  return null;
};

declare global {
  interface Window {
    applyDynamicTheme?: (primary: string, secondary: string, accent: string) => void;
  }
}

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  let r = parseInt(hex.slice(0, 2), 16),
      g = parseInt(hex.slice(2, 4), 16),
      b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
};

const tint = (r: number, g: number, b: number, factor: number) => 
  `${Math.round(r + (255 - r) * factor)} ${Math.round(g + (255 - g) * factor)} ${Math.round(b + (255 - b) * factor)}`;

const shade = (r: number, g: number, b: number, factor: number) => 
  `${Math.round(r * (1 - factor))} ${Math.round(g * (1 - factor))} ${Math.round(b * (1 - factor))}`;

const generateColorVars = (hex: string, prefix: string) => {
  if (!hex || !hex.startsWith('#')) return '';
  const { r, g, b } = hexToRgb(hex);
  return `
    --color-${prefix}-50: ${tint(r, g, b, 0.95)};
    --color-${prefix}-100: ${tint(r, g, b, 0.8)};
    --color-${prefix}-200: ${tint(r, g, b, 0.6)};
    --color-${prefix}-300: ${tint(r, g, b, 0.4)};
    --color-${prefix}-400: ${tint(r, g, b, 0.2)};
    --color-${prefix}-500: ${r} ${g} ${b};
    --color-${prefix}-600: ${shade(r, g, b, 0.08)};
    --color-${prefix}-700: ${shade(r, g, b, 0.16)};
    --color-${prefix}-800: ${shade(r, g, b, 0.24)};
    --color-${prefix}-900: ${shade(r, g, b, 0.32)};
    --color-${prefix}-950: ${shade(r, g, b, 0.40)};
  `;
};

const applyTheme = (primary: string, secondary: string, accent: string) => {
  if (typeof document === 'undefined') return;

  try {
    const css = `
      html:root {
        ${generateColorVars(primary, 'primary')}
        ${generateColorVars(secondary, 'secondary')}
        ${generateColorVars(accent, 'accent')}
      }
    `;
    let styleEl = document.getElementById('dynamic-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;
    document.documentElement.removeAttribute('data-theme');
  } catch (e) {
    console.error('Invalid hex color', e);
  }
};

if (typeof window !== 'undefined') {
  window.applyDynamicTheme = applyTheme;
}

const ThemeHydrator = () => {
  useEffect(() => {
    // Quick load from localstorage to prevent flash if possible
    const p = window.localStorage.getItem('theme_color_primary') || '#3b82f6';
    const s = window.localStorage.getItem('theme_color_secondary') || '#a855f7';
    const a = window.localStorage.getItem('theme_color_accent') || '#f43f5e';
    applyTheme(p, s, a);

    // Fetch latest from API
    import('@api/endpoints').then(({ siteSettingsApi }) => {
      siteSettingsApi.getMap().then((res: any) => {
        const themeP = res?.data?.theme_color_primary || res?.data?.theme_color || '#3b82f6';
        const themeS = res?.data?.theme_color_secondary || '#a855f7';
        const themeA = res?.data?.theme_color_accent || '#f43f5e';
        applyTheme(themeP, themeS, themeA);
        window.localStorage.setItem('theme_color_primary', themeP);
        window.localStorage.setItem('theme_color_secondary', themeS);
        window.localStorage.setItem('theme_color_accent', themeA);
      }).catch(console.error);
    });
  }, []);

  return null;
};

const PageTracker = () => {
  const router = useRouter();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Don't track visits to the admin dashboard
      if (url.startsWith('/dashboard') || url.startsWith('/admin')) {
        return;
      }
      
      // Prevent double tracking in React StrictMode
      if (lastTrackedUrl.current === url) return;
      lastTrackedUrl.current = url;
      
      import('@api/endpoints').then(({ dashboardApi }) => {
        dashboardApi.trackPageView(url).catch(() => {});
      });
    };

    // Track initial page load
    handleRouteChange(router.asPath);

    // Track subsequent navigation
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthHydrator />
      <ThemeHydrator />
      <PageTracker />
      <AnimatePresence mode="wait">
        <motion.div
          key={router.asPath}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </Provider>
  );
}

