import React, { useState, FC } from 'react';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import { Track } from '@/types';

interface PlaybackProviderProps {
    children: React.ReactNode;
}

export const PlaybackProvider: FC<PlaybackProviderProps> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

    const togglePlayback = () => {
        setIsPlaying(!isPlaying);
    };

    const selectTrack = (track: Track, index: number) => {
        console.log(`Selecting track: ${track.name}, Index: ${index}, IsPlaying: ${!isPlaying}`);
        if (currentTrack?.id === track.id && isPlaying) {
            setIsPlaying(false);
        } else {
            setCurrentTrack(track);
            setCurrentTrackIndex(index);
            setIsPlaying(true);
        }
    };

    const nextTrack = (tracks: Track[]) => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        selectTrack(tracks[nextIndex], nextIndex);
    };

    const previousTrack = (tracks: Track[]) => {
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        selectTrack(tracks[prevIndex], prevIndex);
    };

    return (
        <PlaybackContext.Provider value={{ isPlaying, currentTrack, currentTrackIndex, togglePlayback, selectTrack, nextTrack, previousTrack }}>
            {children}
        </PlaybackContext.Provider>
    );
};
