import React, { useRef, useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Marker } from '../../../types/types';
import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Modal from '../Modal';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useTracks } from '@/hooks/useTracks';
import { usePlayback } from '@/hooks/UsePlayback';
import { ApiError } from '@/utils/apiError';

interface AudioPlayerProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  volume: number;
  onVolumeChange: (speed: number) => void;
  onTogglePlay: () => void;
}

type RegionParamsType = {
  id: string;
  start: number;
  color: string;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isFavorite, onToggleFavorite, playbackSpeed, onPlaybackSpeedChange, volume, onVolumeChange, onTogglePlay }) => {
  const { user, token } = useAuth();
  const { isPlaying, currentTrack, togglePlayback } = usePlayback();
  const { tracks } = useTracks();
  const { fetchCommentsAndMarkers, fetchComments, addCommentWithMarker, comments } = useComments();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [regionParams, setRegionParams] = useState<RegionParamsType | null>(null);

  const regionsRef = useRef<RegionsPlugin | null>(null);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  


  const handleWaveformDoubleClick = (e: MouseEvent) => {
    if (!regionsRef.current || !waveformRef.current || !waveSurferRef.current) return;
  
    const bounds = waveformRef.current.getBoundingClientRect();
    const clickPositionX = e.clientX - bounds.left;
    const clickTime = waveSurferRef.current.getDuration() * (clickPositionX / bounds.width);
  
    try {
      const region = regionsRef.current.addRegion({
        start: clickTime,
        end: clickTime + 0.5, // Assuming a default duration for visual representation
        color: 'rgba(0, 123, 255, 0.5)',
        drag: false,
        resize: false,
      });
  
      // Update regionParams with the details of the newly added region
      setRegionParams({ id: region.id, start: clickTime, color: region.color });
      setModalOpen(true); // Open the modal to submit a comment
    } catch (error) {
      console.error("Failed to add region:", error);
    }
  };

  const handleCommentSubmit = async (submittedComment: string) => {
    // Check each prerequisite individually and log if any is missing
    if (!regionParams) {
      console.error("Region parameters are missing.");
    }
    if (!waveSurferRef.current) {
      console.error("WaveSurfer instance is missing.");
    }
    if (!user) {
      console.error("User information is missing.");
    }
    if (!token) {
      console.error("Authentication token is missing.");
    }
    if (!currentTrack) {
      console.error("Current track information is missing.");
    }

    // Only proceed if all conditions are met
    if (!regionParams || !waveSurferRef.current || !user || !token || !currentTrack) {
      console.error("Missing required information for submitting comment with marker.");
      return;
    }

    try {
      // Extract necessary data from regionParams if it contains more than start time
      const { start } = regionParams;

      // Call addCommentWithMarker with the necessary parameters
      // Note: Assuming addCommentWithMarker is adjusted to return a Promise of CommentWithMarkerResponse
      const newComment = await addCommentWithMarker(
        currentTrack.id,
        user.id,
        submittedComment,
        token,
        start,
        // Optionally pass end time if available in regionParams
      );

      console.log("Comment with marker added:", newComment);

      // Refresh comments and markers to reflect the new addition
      await fetchCommentsAndMarkers(currentTrack.id);
      console.log("Comments and markers updated.");

      // Close the modal and potentially reset state as needed
      setModalOpen(false);
      // Reset other state variables if necessary
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle ApiError specifically
        console.error("API Error when adding comment with marker:", error.message);
        // Optionally, handle based on status code or detailed response
      } else {
        // Handle unexpected errors
        console.error("Unexpected error adding comment with marker:", error);
      }
    }
  };

  useEffect(() => {
    // Add or update markers only when WaveSurfer is ready and comments are available
    const handleWaveSurferReady = () => {
      if (!regionsRef.current || !comments.length) return;
  
      // Ensure existing regions are cleared to prevent duplicates
      regionsRef.current.clearRegions();
  
      // Add each marker as a region
      comments.forEach(comment => {
        const marker = comment.marker;
        if (marker) {
          regionsRef.current.addRegion({
            start: marker.start,
            end: marker.end || marker.start + 0.5, // Default end time if not provided
            color: 'rgba(0, 123, 255, 0.5)',
            drag: false,
            resize: false,
          });
        }
      });
    };
  
    // Listen for the 'ready' event to add markers
    const waveSurfer = waveSurferRef.current;
    if (waveSurfer) {
      waveSurfer.on('ready', handleWaveSurferReady);
    }
  
    // Cleanup to remove the 'ready' event listener
    return () => {
      if (waveSurfer) {
        waveSurfer.un('ready', handleWaveSurferReady);
      }
    };
  }, [comments]);
  
  useEffect(() => {
    // This useEffect triggers fetching comments when the track changes
    if (currentTrack?.id) {
      fetchCommentsAndMarkers(currentTrack.id);
    }
  }, [currentTrack?.id, fetchCommentsAndMarkers]);
  
  // Initialization of WaveSurfer instance
  useEffect(() => {
    if (!waveformRef.current) return;
  
    const waveSurferInstance = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'violet',
      progressColor: 'purple',
      backend: 'WebAudio',
      plugins: [RegionsPlugin.create()],
    });
  
    waveSurferRef.current = waveSurferInstance;
  
    waveSurferInstance.load(currentTrack.filePath);
  
    return () => {
      waveSurferInstance.destroy();
    };
  }, [currentTrack.filePath]);

  useEffect(() => {
    const addMarkersToWaveform = () => {
      // Guard clause to ensure all conditions are met: WaveSurfer instance exists, is ready, and comments are available
      if (!regionsRef.current || !waveSurferRef.current || !comments.length) return;
  
      // Ensure existing regions are cleared to prevent duplicates
      regionsRef.current.clearRegions();
  
      // Add each marker as a region
      comments.forEach(comment => {
        const marker = comment.marker;
        if (marker) {
          regionsRef.current.addRegion({
            start: marker.start,
            end: marker.end || marker.start + 0.5, // Default end time if not provided
            color: 'rgba(0, 123, 255, 0.5)',
            drag: false,
            resize: false,
          });
        }
      });
    };
  
    // Register event listener for WaveSurfer's 'ready' event to handle initial marker rendering
    const waveSurfer = waveSurferRef.current;
    if (waveSurfer) {
      waveSurfer.on('ready', addMarkersToWaveform);
    }
  
    // Immediate attempt to add markers in case the WaveSurfer instance is already ready and comments are loaded
    addMarkersToWaveform();
  
    // Cleanup to remove the 'ready' event listener and prevent memory leaks
    return () => {
      if (waveSurfer) {
        waveSurfer.un('ready', addMarkersToWaveform);
      }
    };
  }, [comments, waveSurferRef, regionsRef]);

  // // Disables spacebar playing/pausing audio when comment modal is open.
  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     // Check if modal is open and the pressed key is the spacebar
  //     if (modalOpen && event.code === 'Space') {
  //       event.preventDefault(); // Prevent the default spacebar action (play/pause)
  //     }
  //   };

  //   // Add event listener when component mounts
  //   document.addEventListener('keydown', handleKeyDown);

  //   // Remove event listener on cleanup
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [modalOpen]);
  

  const handlePlayPause = () => {
    onTogglePlay();
  };

  const handleSkipForward = () => {
    // Implement skipping forward
  };

  const handleSkipBackward = () => {
    // Implement skipping backward
  };

  const handlePlayNext = () => {
    // Implement playing next track
  };

  const handlePlayPrevious = () => {
    // Implement playing previous track
  };

  const handlePlaybackSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    wavesurferRef.current?.setPlaybackRate(newSpeed);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    wavesurferRef.current?.setVolume(newVolume);
  };

  return (
    <div>
      {currentTrack && (
        <div>
          <TrackInfo track={currentTrack} />

          <div ref={waveformRef} style={{ height: '128px', width: '100%' }} />
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={togglePlayback}
            onSkipForward={handleSkipForward}
            onSkipBackward={handleSkipBackward}
            onPlayNext={handlePlayNext}
            onPlayPrevious={handlePlayPrevious}
            onPlaybackSpeedChange={handlePlaybackSpeedChange}
            onToggleFavorite={handleToggleFavorite}
            onVolumeChange={handleVolumeChange}
            isFavorite={isFavorite}
            playbackSpeed={playbackSpeed}
            volume={volume}
          />
        </div>

      )}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit(comment); // Directly use the comment state
            setComment(''); // Clear the comment input after submission
          }}>
            <input
              name="comment"
              type="text"
              placeholder="Enter comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)} // Update comment state on change
            />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AudioPlayer;
