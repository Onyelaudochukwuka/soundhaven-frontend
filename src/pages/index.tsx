// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import MainContent from '../components/layout/MainContent';
import Footer from '../components/layout/Footer';
import { fetchTracks } from '../services/apiService';
import { Track } from '@/types';

const HomePage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState('');

  const loadTracks = async () => {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-dyslexic">
      <Head>
        <title>SoundHaven</title>
        <meta name="description" content="Discover and manage music with SoundHaven" />
      </Head>

      <Header />
      <div className="bg-red-500 p-4 text-white">Test Tailwind</div>
      <MainContent tracks={tracks} error={error} loadTracks={loadTracks} />
      <Footer tracks={tracks} />
    </div>
  );
};

export default HomePage;
