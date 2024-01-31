import { createContext, useContext } from 'react';
import { Track } from '@/types';

interface PlaybackContextValue {
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

export const usePlayback = (): PlaybackContextValue => {
    const context = useContext(PlaybackContext);
    if (!context) {
        throw new Error('usePlayback must be used within a PlaybackProvider');
    }
    return context;
};
