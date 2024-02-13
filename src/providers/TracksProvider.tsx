import React, { useState, ReactElement } from 'react';
import { Track } from '../../types/types';
import { TracksContext } from '@/contexts/TracksContext';

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }): ReactElement | null => {
  const [tracks, setTracks] = useState<Track[]>([]);

  const updateTrack = (trackId: number, field: keyof Track, value: string) => {
    setTracks(prevTracks => prevTracks.map(track => 
      track.id === trackId ? { ...track, [field]: value } : track
    ));
  };

  return (
    <TracksContext.Provider value={{ tracks, setTracks, updateTrack }}>
      {children}
    </TracksContext.Provider>
  );
};
