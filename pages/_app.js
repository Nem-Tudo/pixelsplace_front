import "@/styles/reset.css";
import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-toward-extreme.css';
import "@/styles/tippy.css";
import '@/styles/nProgress.css';

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import PopupProvider from "@/context/PopupContext";
import { ThemeProvider } from 'next-themes';

import { Router } from "next/router";
import nProgress from 'nprogress';
import { useEffect } from "react";

// Configuração do nProgress
nProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
});

import { initSounds } from '@/src/playSound';

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeComplete", nProgress.done);
Router.events.on("routeChangeError", nProgress.done);

export default function App({ Component, pageProps }) {
  useEffect(() => {
    initSounds();
  }, []);
  
  useEffect(() => {
    // Registra o Service Worker apenas no cliente e em produção
    if (typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production') {

      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Sempre busca atualizações
      })
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);

          // Verifica atualizações periodicamente
          registration.addEventListener('updatefound', () => {
            console.log('Nova versão do Service Worker disponível');
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  return (
    <ThemeProvider defaultTheme='DARK' themes={['DARK', 'TRUE_DARK', 'LIGHT', 'BLACKOUT', 'OLD', 'ARCADE']}>
      <AuthProvider>
        <LanguageProvider>
          <PopupProvider>
            <Component {...pageProps} />
          </PopupProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}