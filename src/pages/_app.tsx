import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/providers/AuthProvider';
import { MusicProvider } from '@/providers/MusicProvider';
import { CommentsProvider } from '@/providers/CommentsProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CommentsProvider>
        <MusicProvider>
            <Component {...pageProps} />
        </MusicProvider>
      </CommentsProvider>
    </AuthProvider>
  );
}
