import { useContext } from 'react';
import { TracksContext } from '@/contexts/TracksContext';

// Custom hook to use tracks context
export function useTracks() {
  const {
    tracks,
    setTracks,
    fetchTrack,
    fetchTracks,
    uploadTrack,
    deleteTrack,
    updateTrackMetadata,
  } = useContext(TracksContext);

  if (!tracks || !setTracks) {
    throw new Error('useTracks must be used within a TracksProvider');
  }

  return {
    tracks,
    setTracks,
    fetchTrack,
    fetchTracks,
    uploadTrack,
    deleteTrack,
    updateTrackMetadata,
  };
}
