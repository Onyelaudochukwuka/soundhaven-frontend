import React, { useRef, useState, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

import { Region, RegionParams, } from 'wavesurfer.js/dist/plugins/regions.js';
import { Track, Comment, Marker } from '../../../types/types';

import debounce from 'lodash/debounce';

import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Modal from '../Modal';

import { useComments } from '@/hooks/UseComments';
import { useAuth } from '@/contexts/AuthContext';
import { useTracks } from '@/hooks/UseTracks';
import { usePlayback } from '@/hooks/UsePlayback';


interface AudioPlayerProps {
  track: Track;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  volume: number;
  onVolumeChange: (speed: number) => void;
  onTogglePlay: () => void;
}


const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    track, 
    onTogglePlay,
    isFavorite,
    onToggleFavorite,
    playbackSpeed,
    volume,

  
  }) => {
  const { user, token } = useAuth();
  const { currentTrack, isPlaying, togglePlayback } = usePlayback();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [regionParams, setRegionParams] = useState(null);
  const { fetchTrack } = useTracks();
  const { comments, addMarkerAndComment, fetchCommentsAndMarkers } = useComments();

  const regionsRef = useRef(null); 
  const waveformRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [waveSurferReady, setWaveSurferReady] = useState(false);

  useEffect(() => {

    console.log(`useEffect called with trackId: ${track.id}, isLoading: ${isLoading}, fetchCommentsAndMarkers: ${fetchCommentsAndMarkers}`);

    // Ensure we have a valid track ID and the waveform is ready or any other conditions you deem necessary
    if (track?.id && !isLoading) {
      console.log(`Fetching comments and markers for trackId: ${track.id}`);
      fetchCommentsAndMarkers(track.id);
    }
  }, [track?.id, isLoading]);

  // Debounced double click handler defined with useCallback at the top level
  const debouncedHandleDoubleClick = useCallback(debounce((e) => {
    if (regionsRef.current && waveformRef.current) {
      const clickPositionX = e.clientX - waveformRef.current.getBoundingClientRect().left;
      const clickTime = waveSurferRef.current.getDuration() * (clickPositionX / waveformRef.current.offsetWidth);
      
      const region = regionsRef.current.addRegion({
        start: clickTime,
        color: 'rgba(255, 165, 0, 0.5)',
      });

      setRegionParams({
        id: region.id,
        time: clickTime,
        color: 'rgba(255, 165, 0, 0.5)'
      });

      setModalOpen(true);
    }
  }, 300), [setRegionParams, setModalOpen]); // Dependencies for useCallback

  // Disables spacebar playing/pausing audio when comment modal is open.
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if modal is open and the pressed key is the spacebar
      if (modalOpen && event.code === 'Space') {
        event.preventDefault(); // Prevent the default spacebar action (play/pause)
      }
    };
  
    // Add event listener when component mounts
    document.addEventListener('keydown', handleKeyDown);
  
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  // Main hook for waveform initialization
  useEffect(() => {
    if (waveformRef.current) {
      setIsLoading(true);
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio',
        // plugins: [
        //   RegionsPlugin.create(),
        // ]
      });

    console.log("Wavesurfer instance created:", waveSurferRef.current);

    // This worked before trying URI encoder
    // waveSurferRef.current.load(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
   
    const trackUrl = encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${currentTrack.filePath}`);
    waveSurferRef.current.load(trackUrl);
    
    waveSurferRef.current.on('ready', () => {
      setIsLoading(false); // Set loading state to false when WaveSurfer is ready
      setWaveSurferReady(true);
      console.log('WaveSurfer is ready. Duration:', waveSurferRef.current.getDuration());

      if (isPlaying) {
        waveSurferRef.current.play();
      }

      // Register and store the Regions plugin instance
      regionsRef.current = waveSurferRef.current.registerPlugin(
          RegionsPlugin.create()
          );
  });

    waveSurferRef.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
    });

      // Add the debounced event listener
      const waveformElement = waveformRef.current;
      waveformElement.addEventListener('dblclick', debouncedHandleDoubleClick);

      // Cleanup
      return () => {
        waveSurferRef.current.destroy();
        waveformElement.removeEventListener('dblclick', debouncedHandleDoubleClick);
      };
    }
  }, [track.filePath, isPlaying]);

    // Implement this to use fetchTrack from the useTracks hook
  useEffect(() => {
    if (track?.id) {
      fetchTrack(track.id).then(fetchedTrack => {
        // Use fetchedTrack as needed
      }).catch(error => {
        console.error('Failed to fetch track:', error);
      });
    }
  }, [track?.id, fetchTrack]);

  // Fetch comments and markers conditionally
  useEffect(() => {
    if (track?.id && waveSurferReady) { 
      fetchCommentsAndMarkers(track.id);
    }
  }, [track?.id, waveSurferReady]); 
  
  // Add markers from comments
  useEffect(() => {
    if (!waveSurferRef.current || !regionsRef.current) return;

    regionsRef.current.clearRegions();

    comments.forEach((comment) => {
      if (comment.marker) {
        regionsRef.current.addRegion({
          start: comment.marker.time,
          end: comment.marker.time + 1, // Adjust if needed
          color: 'rgba(255, 0, 0, 0.5)',
          drag: false,
          resize: false,
          data: { commentId: comment.id },
        });
      }
    });
  }, [comments]);

  const handleCommentSubmit = async (submittedComment) => {
    if (!user || !token) {
      console.error("User or token not available");
      return;
    }
  
    try {
      if (regionParams) {
        const startTime = regionParams.time;
        await addMarkerAndComment(track.id, user.id, submittedComment, startTime, token);
      } else {
        // Avoid calling addMarkerAndComment if there's no marker
        console.log("No marker associated with this comment (skipping marker creation).");
      }
      console.log("Comment (and potentially marker) added successfully");
      // Reset modal, comment input, and potentially fetch new comments/markers
      setModalOpen(false);
      setComment('');
      // fetchCommentsAndMarkers(track.id); // Refresh comments and markers to reflect the new addition
    } catch (error) {
      console.error("Error submitting comment (and marker):", error);
    }
  };

  // Handle play/pause when isPlaying changes or component mounts
  useEffect(() => {
    // Log the current state to debug
    console.log(`Is playing: ${isPlaying}, Is loading: ${isLoading}`);
    
    const wavesurfer = waveSurferRef.current;
    if (wavesurfer && !isLoading) {
      try {
        if (isPlaying) {
          console.log('Playing audio');
          wavesurfer.play();
        } else {
          console.log('Pausing audio');
          wavesurfer.pause();
        }
      } catch (error) {
        console.error('Error with play/pause:', error);
        setError(`Playback error: ${error}`);
      }
    }
  }, [isPlaying, isLoading]);

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
      {track && (
        <div>
          <TrackInfo track={track} />

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
            onTogglePlay={togglePlayback}
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
