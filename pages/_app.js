import "@/styles/reset.css";
import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-toward-extreme.css';
import "@/styles/tippy.css";
import '@/styles/nProgress.css'

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import PopupProvider from "@/context/PopupContext";
import { ThemeProvider } from 'next-themes';

import { Router } from "next/router"
import nProgress from 'nprogress'

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeComplete", nProgress.done);
Router.events.on("routeChangeError", nProgress.done);

export default function App({ Component, pageProps }) {
  return <>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider defaultTheme='DARK' themes={['DARK', 'TRUEDARK', 'LIGHT', 'BLACKOUT']}>
          <PopupProvider>
            <Component {...pageProps} />
          </PopupProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </>;
}
