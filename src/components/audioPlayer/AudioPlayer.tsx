import React, { useRef, useState, useEffect, useContext } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Region, RegionParams, } from 'wavesurfer.js/dist/plugins/regions.js';
import { Track } from '../../../types/types';
import debounce from 'lodash/debounce';
import AudioControls from './AudioControls';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import TrackInfo from './TrackInfo';
import Modal from '../Modal';

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
  const { isPlaying, togglePlayback } = useContext(PlaybackContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [regionParams, setRegionParams] = useState(null);

  const regionsRef = useRef(null); // Added to store the registered Regions instance
  const waveformRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio'
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

    const handleDoubleClick = (e) => {
      if (regionsRef.current) {
        const clickPositionX = e.clientX - waveformRef.current.getBoundingClientRect().left;
        const clickTime = waveSurferRef.current.getDuration() * clickPositionX / waveformRef.current.offsetWidth;
        regionsRef.current.addRegion({
          start: clickTime, // Add a marker at the clicked time
          end: clickTime, // Zero-length region for a marker
          color: 'rgba(255, 165, 0, 0.5)' // Optional: customize marker color
        });
      }
    };

    waveformRef.current.addEventListener('dblclick', handleDoubleClick);

    return () => {
      waveSurferRef.current.destroy();
      if (regionsRef.current) {
        regionsRef.current.destroy(); // Destroy the Regions plugin instance too
      }
    };

  }
}, [track.filePath]);



  // When the comment is submitted, add the region with the comment
  // handleCommentSubmit now correctly recognizes addRegion
  const handleCommentSubmit = (submittedComment: string) => {
    if (regionParams && waveSurferRef.current) {
      waveSurferRef.current.addRegion({
        ...regionParams,
        data: { comment: submittedComment },
      });
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
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit(e.target.comment.value); // Assuming your modal form has an input with name="comment"
          }}>
            <input name="comment" type="text" placeholder="Enter comment" />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AudioPlayer;
