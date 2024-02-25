import { createContext, Dispatch, SetStateAction } from 'react';
import { Track } from '../../types/types';

// Updated TracksContextType with new function types
interface TracksContextType {
  tracks: Track[];
  setTracks: Dispatch<SetStateAction<Track[]>>;
  fetchTrack: (id: number) => Promise<Track | undefined>;
  updateTrack: (trackId: number, field: keyof Track, value: any) => void;
  fetchTracks: () => Promise<void>; // Assuming this will update the context state internally
  uploadTrack: (formData: FormData) => Promise<any>; // Specify a more precise type for the response if known
  deleteTrack: (id: number) => Promise<void>;
  updateTrackMetadata: (trackId: number, updatedData: Partial<Track>) => Promise<any>; // Specify a more precise type for the response if known
}

// Providing initial values for the context
const defaultContextValue: TracksContextType = {
  tracks: [],
  setTracks: () => {},
  updateTrack: () => {},
  fetchTracks: async () => {},
  uploadTrack: async () => {},
  deleteTrack: async () => {},
  updateTrackMetadata: async () => {},
};

// Creating the context with the default value
export const TracksContext = createContext<TracksContextType>(defaultContextValue);
