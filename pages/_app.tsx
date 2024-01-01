import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import store from '../stores/store';
import { useEffect } from 'react';
import downloadSpellsData from '../utils/downloadSpellsData'; // Adjust the path as necessary

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    downloadSpellsData();
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}
