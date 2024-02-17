import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Region, RegionParams, } from 'wavesurfer.js/dist/plugins/regions.js';
import { Track } from '../../../types/types';
import debounce from 'lodash/debounce';
import AudioControls from './AudioControls';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import TrackInfo from './TrackInfo';
import Modal from '../Modal';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';

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


const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, isFavorite, onToggleFavorite, playbackSpeed, onPlaybackSpeedChange, volume, onVolumeChange, onTogglePlay }) => {
  const { user, token } = useAuth();
  const { isPlaying, togglePlayback } = useContext(PlaybackContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [regionParams, setRegionParams] = useState(null);

  const regionsRef = useRef(null); // Added to store the registered Regions instance
  const waveformRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  // Debounced double click handler defined with useCallback at the top level
  const debouncedHandleDoubleClick = useCallback(debounce((e) => {
    if (regionsRef.current && waveformRef.current) {
      const clickPositionX = e.clientX - waveformRef.current.getBoundingClientRect().left;
      const clickTime = waveSurferRef.current.getDuration() * (clickPositionX / waveformRef.current.offsetWidth);
      
      const region = regionsRef.current.addRegion({
        start: clickTime,
        end: clickTime,
        color: 'rgba(255, 165, 0, 0.5)',
      });

      setRegionParams({
        id: region.id,
        start: clickTime,
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
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio',
        plugins: [
          RegionsPlugin.create(),
        ]
      });

    console.log("Wavesurfer instance created:", waveSurferRef.current);

    waveSurferRef.current.load(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);

    waveSurferRef.current.on('ready', () => {
      console.log('WaveSurfer is ready. Duration:', waveSurferRef.current.getDuration());
      setIsLoading(false);
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
  }, [track.filePath, debouncedHandleDoubleClick, isPlaying]);

  const { addComment } = useComments();

  const handleCommentSubmit = async (submittedComment: string) => {
    if (regionParams && waveSurferRef.current && user && token) {
      try {
        await addComment(track.id, user.id, submittedComment, token); // Assuming addComment requires track ID, user ID, comment text, and token
        console.log("Comment added successfully");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
      setModalOpen(false);
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
