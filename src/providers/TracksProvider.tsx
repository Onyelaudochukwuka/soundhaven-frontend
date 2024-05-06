import React, { useState, ReactElement, useCallback } from 'react';
import { handleResponse } from '@/services/apiService';
import { Track } from '../../types/types';
import { TracksContext } from '@/contexts/TracksContext';
import { backendUrl } from '@/services/apiService';

export const TracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }): ReactElement | null => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);

  const startPlayback = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
    // ... logic to initiate audio playback
  };

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
    setTracks(prevTracks => prevTracks.map(track => 
      track.id === trackId ? { ...track, [field]: value } : track
    ));
  };

  return (
    <TracksContext.Provider value={{ tracks, setTracks, fetchTrack, updateTrack, updateTrackMetadata, deleteTrack, fetchTracks, uploadTrack }}>
      {children}
    </TracksContext.Provider>
  );
};
