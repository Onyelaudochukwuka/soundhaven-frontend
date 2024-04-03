import React, { useState, useContext, useRef } from 'react';
import FileUpload from '../FileUpload';
import TracksTable from '../TracksTable';
import ErrorMessage from '../ErrorMessage';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import CommentsPanel from '../comments/CommentsPanel';
import { useTracks } from '@/hooks/UseTracks';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import { Track, Comment } from '../../../types/types';
import { useComments } from '@/hooks/UseComments';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

interface MainContentProps {
  error: string;
}

const MainContent: React.FC<MainContentProps> = ({ error }) => {
  const { isPlaying, currentTrack, currentTrackIndex, togglePlayback, selectTrack } = useContext(PlaybackContext)!;
  const [showComments, setShowComments] = useState(false);
  const selectedTrackId = currentTrack?.id ?? 0;
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { 
    comments, 
    fetchCommentsAndMarkers, 
    fetchComments, 
    addMarkerAndComment, 
    addComment, 
    handleSelectComment 
  } = useComments();
  
  const [isLoading, setIsLoading] = useState(false);
  const { tracks, fetchTracks, deleteTrack, updateTrack } = useTracks();

  const regionsRef = useRef<RegionsPlugin | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  

  // Update the handleUploadSuccess function to use fetchTracks directly
  const handleUploadSuccess = async () => {
    console.log('MainContent: Handling upload success.');
    await fetchTracks();
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

  // console.log('Rendering AudioPlayer with track:', currentTrack);

  // Delete??
  const handleCommentClick = (commentId: number) => {
    setSelectedCommentId(commentId);
  };

  const handleCommentSelected = (commentId: number) => {
    setSelectedCommentId(commentId);
  };

  return (
    <main className="flex flex-col p-4 mx-auto w-full">
      {/* Button to manually fetch tracks */}
      {/* <button onClick={handleManualFetch} className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Fetch Tracks Manually
      </button> */}
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
              comments={comments}
              addMarkerAndComment={addMarkerAndComment}
              setSelectedCommentId={setSelectedCommentId}
              handleCommentClick={handleCommentClick} 
              onSelectComment={handleCommentSelected}
              showComments={showComments}
              toggleComments={toggleComments}
              />
          </div>
        )}

      </div>
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      <TracksTable
        tracks={tracks}
        onDelete={deleteTrack}
        onSelectTrack={handleSelectTrack}
        onUpdate={updateTrack}
      />
      {/* <div className="flex flex-col"> */}
      {currentTrack?.id && showComments && (
        <CommentsPanel 
          trackId={currentTrack.id} 
          show={showComments} 
          onClose={toggleComments} 
          comments={comments}
          addComment={addComment}
          regionsRef={regionsRef}
          waveSurferRef={waveSurferRef}
          handleCommentClick={handleCommentClick}
          selectedCommentId={selectedCommentId}
          />
      )}

    </main>
    // </div>
  );
}

export default MainContent;