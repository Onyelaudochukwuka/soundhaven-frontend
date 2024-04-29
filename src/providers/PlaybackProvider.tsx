import React, { useState, FC, useCallback } from 'react';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import { Track } from '../../types/types';

interface PlaybackProviderProps {
    children: React.ReactNode;
}

export const PlaybackProvider: FC<PlaybackProviderProps> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [spacebarPlaybackEnabled, setSpacebarPlaybackEnabled] = useState(true);
    const [isCommentInputFocused, setIsCommentInputFocused] = useState(false); 

    const toggleSpacebarPlayback = useCallback(() => {
        setSpacebarPlaybackEnabled(prevEnabled => !prevEnabled);
    }, []);

    const togglePlayback = useCallback(() => {
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    }, []);

    const selectTrack = useCallback((track: Track, index: number) => {
        if (currentTrack?.id === track.id && isPlaying) {
            setIsPlaying(false);
        } else {
            setCurrentTrack(track);
            setCurrentTrackIndex(index);
            setIsPlaying(true);
        }
    }, [currentTrack?.id, isPlaying]);

    const nextTrack = useCallback((tracks: Track[]) => {
        // Ensure 'tracks' is passed as an argument when calling this function
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        selectTrack(tracks[nextIndex], nextIndex);
    }, [currentTrackIndex, selectTrack]); // Removed tracks.length from dependencies

    const previousTrack = useCallback((tracks: Track[]) => {
        // Ensure 'tracks' is passed as an argument when calling this function
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        selectTrack(tracks[prevIndex], prevIndex);
    }, [currentTrackIndex, selectTrack]); // Removed tracks.length from dependencies

    return (
        <PlaybackContext.Provider value={
            { 
              isPlaying, 
              currentTrack, 
              currentTrackIndex, 
              togglePlayback, 
              selectTrack, 
              nextTrack, 
              previousTrack, 
              spacebarPlaybackEnabled, 
              toggleSpacebarPlayback,
              isCommentInputFocused, 
              setIsCommentInputFocused 
              }
            }
        >
            {children}
        </PlaybackContext.Provider>
    );
};
