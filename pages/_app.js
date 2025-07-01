import "@/styles/reset.css";
import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-toward-extreme.css';
import "@/styles/tippy.css";

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import PopupProvider from "@/context/PopupContext";
export default function App({ Component, pageProps }) {

  return <>
    <AuthProvider>
      <LanguageProvider>
        <PopupProvider>
          <Component {...pageProps} />
        </PopupProvider>
      </LanguageProvider>
    </AuthProvider>
  </>;
}
