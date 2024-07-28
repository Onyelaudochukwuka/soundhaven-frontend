import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { TracksProvider } from '@/providers/TracksProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { PlaybackProvider } from '@/providers/PlaybackProvider';
import { CommentsProvider } from '@/providers/CommentsProvider';
import { PlaylistsProvider } from '@/providers/PlaylistsProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CommentsProvider>
        <TracksProvider>
          <PlaybackProvider>
            <PlaylistsProvider>
              <Component {...pageProps} />
            </PlaylistsProvider>
          </PlaybackProvider>
        </TracksProvider>
      </CommentsProvider>
    </AuthProvider>
  );
}
