import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import TracksTable from '../components/TracksTable';
import FileUpload from '../components/FileUpload';
import { fetchTracks, uploadTrack } from '../services/apiService';
import ErrorMessage from '../components/ErrorMessage';
import AudioPlayer from '@/components/AudioPlayer';
import { Track } from '@/types';

const HomePage: React.FC = () => {
  console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState('');

  const loadTracks = async () => {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (error: unknown) { // Add type annotation
      if (error instanceof Error) {
        // If error is an instance of Error, safely access its message property
        setError(error.message);
      } else {
        // Handle cases where error is not an instance of Error
        setError("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleUploadSuccess = async () => {
    await loadTracks(); // Re-fetch tracks after successful upload
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>SoundHaven</title>
        <meta name="description" content="Discover and manage music with SoundHaven" />
      </Head>

      <header className="text-center p-4">
        {/* Navigation, Search Bar, User Profile */}
      </header>

      <main className="flex flex-col items-center flex-1 p-4">
        {error && <ErrorMessage message={error} />}

        <h1 className="text-2xl font-bold mb-4">Welcome to SoundHaven</h1>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <TracksTable tracks={tracks} />
        {/* Other main page content */}
      </main>

      <footer className="p-4">
        <div>
          {tracks.map(track => {
            return (
              <div key={track.id}>
                <h3>{track.title}</h3>
                <AudioPlayer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`} />
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
