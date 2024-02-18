import { createContext } from 'react';
import { Track } from '../../types/types';

interface TracksContextType {
  tracks: Track[];
  fetchTracks: () => Promise<void>;
  updateTrack: (trackId: number, field: keyof Track, value: any) => void;
  error: string | null;
}

const defaultContextValue: TracksContextType = {
  tracks: [],
  fetchTracks: async () => {},
  updateTrack: () => {},
  error: null,
};

export const TracksContext = createContext<TracksContextType>(defaultContextValue);
