// components/MainContent.jsx
import React, { useState, useEffect } from 'react';
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import { Track } from '@/types';
import { backendUrl } from '../../services/apiService';
import { TracksContext } from '@/contexts/TracksContext';

interface MainContentProps {
  tracks: Track[];
  error: string;
  loadTracks: () => Promise<void>;
  updateTracksState?: (updatedTracks: Track[]) => void;
}

const MainContent: React.FC<MainContentProps> = ({ tracks, error, loadTracks, updateTracksState }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [localTracks, setLocalTracks] = useState<Track[]>(tracks);
  const [isEditing, setIsEditing] = useState(false);

  const handleUploadSuccess = async () => {
    await loadTracks();
  };

  const handleUpdateTrack = async (trackId: number, field: string, value: string) => {
    console.log(`Attempting to send PATCH request: ${trackId}, ${field}, ${value}`);
    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update the track');
      }
  
      const updatedTrack = await response.json();
      setLocalTracks(prevTracks => prevTracks.map(track => 
        track.id === trackId ? { ...track, [field]: updatedTrack[field] } : track
      ));
      if (updateTracksState) {
        updateTracksState(localTracks);
      }
  
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating track:', error.message);
      }
    }  
  };
  

  useEffect(() => {
    const handleSpacebar = (event: KeyboardEvent) => {
      console.log(`Spacebar pressed, isEditing: ${isEditing}`);
      if (event.code === 'Space' && !isEditing) {
        // Implement play/pause functionality
        console.log('Playing/Pausing track');
      } else {
        console.log('Spacebar disabled due to editing');
      }
    };
  
    window.addEventListener('keydown', handleSpacebar);
  
    return () => {
      window.removeEventListener('keydown', handleSpacebar);
    };
  }, [isEditing]);

  const handleDelete = async (deletedTrackId: number) => {
    // Existing delete logic
  };

  // Update localTracks when tracks prop changes
  useEffect(() => {
    setLocalTracks(tracks);
  }, [tracks]);

  const handleSelectTrack = (trackFilePath: string, trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
  };

  const onSelectNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  const onSelectPrevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
  };

  const currentTrackUrl = tracks[currentTrackIndex]?.filePath
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${tracks[currentTrackIndex]?.filePath}`
    : '';

  return (
    <main className="flex-col items-center flex-1 p-4 mx-auto">
      {error && <ErrorMessage message={error} />}
      <h1 className="text-2xl font-bold mb-4">Welcome to SoundHaven</h1>
      <div className='w-full px-8 items-center'>
        <div className="waveform-container" style={{ height: '128px', width: '100%' }}>
          {currentTrackUrl && (
            <AudioPlayer
              url={currentTrackUrl}
              currentTrackIndex={currentTrackIndex}
              tracks={tracks}
              onSelectNextTrack={onSelectNextTrack}
              onSelectPrevTrack={onSelectPrevTrack}
            />
          )}
        </div>
      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      <TracksTable
        tracks={localTracks}
        onDelete={handleDelete}
        onSelectTrack={handleSelectTrack}
        onUpdate={handleUpdateTrack}
      />
    </main>
  );
};

export default MainContent;
