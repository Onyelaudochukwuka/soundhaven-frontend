import React, { createContext, useState, useContext } from 'react';
import { Track } from '../../types/types'; 

// Add more types as needed for tracks, playlists, etc.
interface MusicContextType {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  fetchTrack: (id: number) => Promise<Track | undefined>;
  fetchTracks: () => Promise<void>;
  uploadTrack: (formData: FormData) => Promise<Track>;
  updateTrack: (trackId: number, field: keyof Track, value: string) => void;
  updateTrackMetadata: (trackId: number, updatedData: Partial<Track>) => Promise<Track>;
  deleteTrack: (id: number) => Promise<void>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTrack: Track | null;
  setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
  currentTrackIndex: number | null;
  setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number | null>>;
  currentPlaylistId: string | null;
  setCurrentPlaylistId: React.Dispatch<React.SetStateAction<string | null>>;
  spacebarPlaybackEnabled: boolean;
  toggleSpacebarPlayback: () => void;
  togglePlayback: () => void; 
  selectTrack: (track: Track, index: number) => void; 
  nextTrack: () => void;  // We'll change the implementation slightly
  previousTrack: () => void; // We'll change the implementation slightly
  handleAudioEnded: () => void; // Not sure if this is right type here
  audioState: 'loading' | 'playing' | 'paused' | 'ended'; 
  audioError: Error | null; 
  setAudioError: (error: Error | null) => void;
  play: () => void;
  pause: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const MusicContext = createContext<MusicContextType | null>(null); 
