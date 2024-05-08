import React, { useState, FC, useCallback, useRef, ReactElement } from 'react';
import { MusicContext } from '@/contexts/MusicContext';
import { handleResponse } from '@/services/apiService';
import { Track } from '../../types/types';
import { backendUrl } from '@/services/apiService';
import { set } from 'lodash';

export const MusicProvider: FC<{ children: React.ReactNode }> = ({ children }): ReactElement | null => {
    // const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [spacebarPlaybackEnabled, setSpacebarPlaybackEnabled] = useState(true);
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audioState, setAudioState] = useState<'loading' | 'playing' | 'paused' | 'ended'>('loading');
  const [ isLoadingTrack, setIsLoadingTrack ] = useState(false);

  // Tracks functions
  const fetchTrack = async (id: number): Promise<Track | undefined> => {
    try {
      const response = await fetch(`${backendUrl}/tracks/${id}`);
      const track = await handleResponse<Track>(response);
      return track;
    } catch (error) {
      console.error('Error fetching track:', error);
      throw new Error('Failed to fetch track');
    }
  };

  const fetchTracks = useCallback(async () => {
    console.log('Attempting to fetch tracks at URL:', `${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks`);
      const tracks = await handleResponse<Track[]>(response);
      console.log('Tracks fetched: #', tracks);
      setTracks(tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }, []); // The dependency array remains empty as `process.env.NEXT_PUBLIC_BACKEND_URL` is expected to be constant.
  

const uploadTrack = async (formData: FormData) => {
  console.log("Preparing to upload file");

  // Log the contents of formData for debugging
  // Convert formData keys to an array and log them
  const formDataKeys = Array.from(formData.keys());
  for (const key of formDataKeys) {
    console.log(key, formData.get(key));
  }

  try {
    console.log("Sending upload request to server");
    const response = await fetch(`${backendUrl}/tracks/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log("Received response from upload request", response);

    if (!response.ok) {
      console.error('Response status:', response.status);
      const errorData = await response.json();
      console.error('Response error data:', errorData);
      throw new Error(errorData.message || 'Error uploading track');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error uploading track:', error.message);
    throw error;
  }
};

const deleteTrack = async (id: number) => {
  try {
    const response = await fetch(`${backendUrl}/tracks/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error deleting track with ID ${id}:`, error.message);
    } else {
      console.error('Unknown error occurred:', error);
    }
    throw error;
  }
};

const updateTrackMetadata = async (trackId: number, updatedData: Partial<Track>) => {
  console.log('updateTrackMetadata received', updatedData);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

  console.log("Final data being sent to backend:", { name: updatedData.name, artistName: updatedData.artist?.name, albumName: updatedData.album?.name });

    // Preparing the payload
    const payload = JSON.stringify({
      name: updatedData.name,
      artistName: updatedData.artistName,
      albumName: updatedData.albumName,
    });
  
    console.log("Sending payload:", payload);

    const response = await fetch(`${backendUrl}/tracks/${trackId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error updating track ${trackId}:`, errorData.message || 'Unknown error');
    throw new Error(errorData.message || 'Error updating track');
  }

  const responseData = await response.json();
  console.log(`Track ${trackId} updated successfully:`, responseData);
  return responseData;
};

const updateTrack = (trackId: number, field: keyof Track, value: string) => {
  console.log('updateTrack() called - Track ID:', trackId);
  setTracks(prevTracks => prevTracks.map(track => 
      track.id === trackId ? { ...track, [field]: value } : track
  ));
};

// Playback functions
const play = useCallback(() => {
  if (audioRef.current && !isLoadingTrack) {
    console.log('play() called - Audio source BEFORE play:', audioRef.current.src); // Log before playback
      audioRef.current.play().catch(error => {
          console.error('Playback error:', error);  
          console.log('Audio source AFTER play attempt:', audioRef.current.src); // Log after the error
      }); 
       setAudioState('playing');
    }
}, [audioRef, isLoadingTrack]); 

const pause = useCallback(() => {
   if (audioRef.current) {
      audioRef.current.pause();
      setAudioState('paused');  // Update audioState (if using)
   }
}, [audioRef, setAudioState]); // Include setAudioState if you're using it 

const toggleSpacebarPlayback = useCallback(() => {
    setSpacebarPlaybackEnabled(prevEnabled => !prevEnabled);
}, []);

const togglePlayback = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
}, []);

const selectTrack = useCallback((track: Track, index: number) => {
  console.log('selectTrack() called with track ID:', track.id); // Log track ID being selected

    if (currentTrack?.id === track.id && isPlaying) {
        setIsPlaying(false);
    } else {
      if (!isLoadingTrack)  {
        console.log('Loading track in selectTrack:', track.name); // ADD THIS LOG
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        setIsLoadingTrack(true); // Set loading state to true
    } 
}
}, [currentTrack?.id, isPlaying, isLoadingTrack]);

const nextTrack = useCallback((tracks: Track[]) => {
    console.log('nextTrack called with tracks:', tracks); // Check the tracks array
    // Ensure 'tracks' is passed as an argument when calling this function
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    selectTrack(tracks[nextIndex], nextIndex); 
}, [currentTrackIndex, selectTrack]);  

const previousTrack = useCallback((tracks: Track[]) => {
    // Ensure 'tracks' is passed as an argument when calling this function
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(tracks[prevIndex], prevIndex);
}, [tracks, selectTrack]); 

const handleAudioEnded = useCallback(() => {
    if (currentTrackIndex !== null) {
      nextTrack();  
    }
  }, [currentTrackIndex, nextTrack]);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        setTracks,
        fetchTrack,
        fetchTracks,
        uploadTrack,
        updateTrack,
        updateTrackMetadata,
        deleteTrack,
        isPlaying,
        setIsPlaying,
        currentTrack,
        setCurrentTrack,
        currentTrackIndex,
        setCurrentTrackIndex,
        spacebarPlaybackEnabled,
        toggleSpacebarPlayback,
        isCommentInputFocused,
        setIsCommentInputFocused,
        togglePlayback, 
        selectTrack, 
        nextTrack, 
        previousTrack, 
        handleAudioEnded,
        play,
        pause,
        audioRef,
        audioState,
    }}
    >
      {children}
    </MusicContext.Provider>
  );
};

