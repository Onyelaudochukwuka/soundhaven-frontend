import { createContext } from 'react';
import { Track } from '@/types';

// Define the interface for your context state
interface TracksContextType {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  updateTrack: (trackId: number, field: keyof Track, value: string) => void;
  trackModificationFlag?: boolean;  
  setTrackModificationFlag?: React.Dispatch<React.SetStateAction<boolean>>;  
}

// Create a default context value that adheres to the TracksContextType interface
const defaultContextValue: TracksContextType = {
  tracks: [],
  setTracks: () => {}, 
  updateTrack: () => {}, 
  trackModificationFlag: false,
  setTrackModificationFlag: () => {}
};

// Create the context with the default value
export const TracksContext = createContext<TracksContextType>(defaultContextValue);
