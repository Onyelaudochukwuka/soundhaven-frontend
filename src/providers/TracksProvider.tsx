import React, { useState, useEffect } from 'react';
import { Track } from '../../types/types';
import { TracksContext } from '@/contexts/TracksContext';
import { fetchTracks as apiFetchTracks } from '@/services/apiService';

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3122';

  const fetchTracks = async () => {
    try {
      const fetchedTracks = await apiFetchTracks();
      const updatedTracks = fetchedTracks.map(track => ({
        ...track,
        filePath: track.filePath ? `${baseUrl}/${track.filePath}` : null,
      }));
      setTracks(updatedTracks);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tracks:", err);
      setError("Failed to load tracks. Please try again later.");
    }
  };

  const updateTrack = (trackId: number, field: keyof Track, value: any) => {
    setTracks(prev => prev.map(track => track.id === trackId ? { ...track, [field]: value } : track));
  };

  useEffect(() => {
    fetchTracks(); // Initial fetch of tracks on component mount
  }, []);

  return (
    <TracksContext.Provider value={{ tracks, fetchTracks, updateTrack, error }}>
      {children}
    </TracksContext.Provider>
  );
};
