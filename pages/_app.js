import "@/styles/reset.css";
import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-toward-extreme.css';
import "@/styles/tippy.css";

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import PopupProvider from "@/context/PopupContext";
import SoundEngine from "@/src/SoundEngine";

export default function App({ Component, pageProps }) {
  SoundEngine.load(["ColorPick.mp3", "CooldownOverAlert.mp3", "Fail.mp3", "PixelPlace.mp3"]);

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
