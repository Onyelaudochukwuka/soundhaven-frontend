import { useContext } from 'react';
import { TracksContext } from '@/contexts/TracksContext';
import { Track } from '../../types/types';

// Custom hook to use tracks context
export function useTracks() {
  const context = useContext(TracksContext);

  if (context === undefined) {
    throw new Error('useTracks must be used within a TracksProvider');
  }

  const fetchTrack = async (id: number) => {
    return await context.fetchTrack(id);
  };

  const fetchTracks = async () => {
    try {
      await context.fetchTracks();
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  const uploadTrack = async (formData: FormData) => {
    try {
      return await context.uploadTrack(formData);
    } catch (error) {
      console.error("Error uploading track:", error);
    }
  };

  const deleteTrack = async (id: number) => {
    try {
      await context.deleteTrack(id);
    } catch (error) {
      console.error(`Error deleting track with ID ${id}:`, error);
    }
  };

  const updateTrackMetadata = async (trackId: number, updatedData: Partial<Track>) => {
    try {
      return await context.updateTrackMetadata(trackId, updatedData);
    } catch (error) {
      console.error("Error updating track metadata:", error);
    }
  };

  const updateTrack = (trackId: number, field: keyof Track, value: any) => {
    context.updateTrack(trackId, field, value);
  };

  return {
    tracks: context.tracks,
    setTracks: context.setTracks,
    fetchTrack,
    fetchTracks,
    uploadTrack,
    deleteTrack,
    updateTrackMetadata,
    updateTrack,
  };
}
