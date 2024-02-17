import React, { useState, useContext, useEffect } from 'react';
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import CommentsPanel from '../comments/CommentsPanel';
import { deleteTrack, fetchTracks } from '@/services/apiService';
import { TracksContext } from '@/contexts/TracksContext';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import CommentsContext from '@/contexts/CommentsContext';
import { Track } from '../../../types/types';

interface MainContentProps {
  error: string;
  loadTracks: () => Promise<void>;
}

const MainContent: React.FC<MainContentProps> = ({ error, loadTracks }) => {
  const { isPlaying, currentTrack, currentTrackIndex, togglePlayback, selectTrack } = useContext(PlaybackContext)!;
  const [showComments, setShowComments] = useState(false);
  const { tracks, setTracks } = useContext(TracksContext);
  const selectedTrackId = currentTrack?.id ?? 0;
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (!tracks) {
    console.error('TracksContext not found');
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        const fetchedTracks = await fetchTracks();
        setTracks(fetchedTracks);
        setFetchError(null); // Reset error state on successful fetch
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
        setFetchError('Failed to load tracks. Please try again later.');
      }
    })();
  }, []);

  const handleUploadSuccess = async () => {
    await loadTracks();
  };

  const handleSelectTrack = (trackId: number, trackFilePath: string, trackIndex: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      selectTrack(track, trackIndex);
    }
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
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId ? { ...track, ...updatedTrack } : track
        )
      );
    } catch (error: unknown) { // Ensure this catch block is aligned correctly
      if (error instanceof Error) {
        console.error('Error updating track:', error.message);
      }
    }
  };

  // const onSelectNextTrack = () => {
  //   setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  // };

  // const onSelectPrevTrack = () => {
  //   setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
  // };

  // const currentTrack = tracks?.[currentTrackIndex];


  // if (!currentTrack?.filePath) {
  //   console.error('Invalid track data');
  //   return;
  // }

  // const currentTrackUrl = currentTrack?.filePath
  //   ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${currentTrack.filePath}`
  //   : '';

  const toggleComments = () => {
    setShowComments(!showComments);
  };


  console.log('Rendering AudioPlayer with track:', currentTrack);

  return (
    <main className="flex flex-col p-4 mx-auto">
      <button onClick={toggleComments} className="toggle-comments-btn absolute">
        {showComments ? 'Close Comments' : 'Open Comments'}
      </button>

      {/* Display error passed as props */}
      {error && <ErrorMessage message={error} />}
      {/* Display fetch error */}
      {fetchError && <ErrorMessage message={fetchError} />}

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
    // </div>
  );
}

export default MainContent;