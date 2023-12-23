import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import TracksTable from '../components/TracksTable';
import TransportControls from '../components/TransportControls';
import FileUpload from '../components/FileUpload';
import { fetchTracks, uploadTrack } from '../services/apiService';
import ErrorMessage from '../components/ErrorMessage';

const HomePage: React.FC = () => {
  const [tracks, setTracks] = useState([]); // State to store tracks
  const [error, setError] = useState('');

  const loadTracks = async () => {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (error) {
      setError(error.message);
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
        <TransportControls />
      </footer>
    </div>
  );
};

export default HomePage;
