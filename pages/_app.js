import "@/styles/reset.css";
import "@/styles/globals.css";
import Header from "@/components/Header";

export default function App({ Component, pageProps }) {
  return <>
    <Header user={{username: "USERNAME da SILVA"}} />
    <Component {...pageProps} />
  </>;
}
