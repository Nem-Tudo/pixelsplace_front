import "@/styles/reset.css";
import "@/styles/globals.css";
import 'tippy.js/dist/tippy.css';
import "@/styles/tippy.css";

import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  return <>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </>;
}
