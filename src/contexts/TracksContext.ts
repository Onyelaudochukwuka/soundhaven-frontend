import { createContext } from 'react';
import { Track } from '@/types';

interface TracksContextType {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  updateTrack: (trackId: number, field: keyof Track, value: string) => void;
}

export const TracksContext = createContext<TracksContextType | undefined>(undefined);
