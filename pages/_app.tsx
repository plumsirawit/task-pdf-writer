import "../styles/globals.css";
import "../styles/markdown.css";
import "../styles/code.css";

import "easymde/dist/easymde.min.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";

import initAuth from "../initAuth";
import Head from "next/head";

initAuth();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxygen&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
