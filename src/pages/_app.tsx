import 'tailwindcss/tailwind.css';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { TracksProvider } from '@/providers/TracksProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TracksProvider>
      <Component {...pageProps} />
    </TracksProvider>
  );
}
