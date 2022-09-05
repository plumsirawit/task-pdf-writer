import "../styles/globals.css";
import "../styles/markdown.css";
import "../styles/code.css";

import "easymde/dist/easymde.min.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";

import initAuth from "../initAuth";

initAuth();

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
