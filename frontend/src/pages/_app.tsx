import type { AppProps } from 'next/app';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthHydrator />
      <Component {...pageProps} />
    </Provider>
  );
}

