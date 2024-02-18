import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import CommentsPanel from '../comments/CommentsPanel';
import { useTracks } from '@/hooks/useTracks';
import { useContext } from 'react';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import { deleteTrack } from '@/services/apiService';

const MainContent: React.FC = () => {
  const { isPlaying, currentTrack, togglePlayback, selectTrack } = useContext(PlaybackContext)!;
  const [showComments, setShowComments] = useState(false);
  const { tracks, fetchTracks, updateTrack, error } = useTracks(); // Now using useTracks hook

  const handleUploadSuccess = async () => {
    try {
      await fetchTracks();
    } catch (error) {
      console.error("Error fetching tracks after upload:", error);
      // Optionally, set an error state here to display an error message to the user
    }
  };

  const handleSelectTrack = (trackId: number, trackFilePath: string, trackIndex: number) => {
    selectTrack(trackId, trackFilePath, trackIndex);
  };

  const handleUpdateTrack = async (trackId: number, field: keyof Track, value: string) => {
    updateTrack(trackId, field, value); // Simplified to use updateTrack from useTracks
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  console.log('Rendering AudioPlayer with track:', currentTrack);

  return (
    <main className="flex flex-col p-4 mx-auto">
      <button onClick={toggleComments} className="toggle-comments-btn absolute">
        {showComments ? 'Close Comments' : 'Open Comments'}
      </button>

      {error && <ErrorMessage message={error} />}

      <div className='w-full px-8 items-center'>
        {currentTrack && (
          <div className="audio-player-container w-full max-w-3xl mx-auto">
            <AudioPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={togglePlayback}
            />
          </div>
        )}
      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      {tracks.length > 0 ? (
        <TracksTable
          onDelete={deleteTrack}
          onSelectTrack={handleSelectTrack}
          onUpdate={handleUpdateTrack}
        />
      ) : (
        <p>No tracks available</p>
      )}
      {currentTrack?.id && showComments && (
        <CommentsPanel trackId={currentTrack.id} show={showComments} onClose={toggleComments} />
      )}
    </main>
  );
};

export default MainContent;
