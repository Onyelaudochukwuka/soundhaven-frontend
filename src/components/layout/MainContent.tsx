// components/MainContent.jsx
import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import { Track } from '@/types';

interface MainContentProps {
  tracks: Track[];
  error: string;
  loadTracks: () => Promise<void>;
}

const MainContent: React.FC<MainContentProps> = ({ tracks, error, loadTracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const handleUploadSuccess = async () => {
    await loadTracks();
  };

  const handleDelete = async (deletedTrackId: number) => {
    // Existing delete logic
  };

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
        tracks={tracks} 
        onDelete={handleDelete} 
        onSelectTrack={handleSelectTrack}
      />
    </main>
  );
};

export default MainContent;
