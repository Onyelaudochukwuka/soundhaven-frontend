import 'tailwindcss/tailwind.css';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { TracksProvider } from '@/providers/TracksProvider';
import { UserProvider } from '@/providers/UserProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <TracksProvider>
        <Component {...pageProps} />
      </TracksProvider>
    </UserProvider>
  );
}
