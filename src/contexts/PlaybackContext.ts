import { createContext, useContext } from 'react';
import { Track } from '../../types/types';

export interface PlaybackContextValue {
    isPlaying: boolean;
    currentTrack: Track | null;
    currentTrackIndex: number;
    togglePlayback: () => void;
    selectTrack: (track: Track, index: number) => void;
    nextTrack: (tracks: Track[]) => void;
    previousTrack: (tracks: Track[]) => void;
}

const initialPlaybackContextValue: PlaybackContextValue = {
    isPlaying: false,
    currentTrack: null,
    currentTrackIndex: -1,
    togglePlayback: () => {},
    selectTrack: () => {},
    nextTrack: () => {},
    previousTrack: () => {}
};

export const PlaybackContext = createContext<PlaybackContextValue>(initialPlaybackContextValue);


