import React, { useRef, useState, useEffect, useContext } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Track } from '@/types';
import debounce from 'lodash/debounce';
import AudioControls from './AudioControls';
import ErrorMessage from '../ErrorMessage';
import { PlaybackContext } from '@/contexts/PlaybackContext';

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
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce play/pause actions to prevent rapid state changes
  const debouncedPlayPause = debounce((play: boolean) => {
    console.log(`debouncedPlayPause called, play: ${play}, isLoading: ${isLoading}`);
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer && !isLoading) {
      console.log(`WaveSurfer action: ${isPlaying ? 'play' : 'pause'}`);
      play ? wavesurfer.play() : wavesurfer.pause();
    }
  }, 100, { 'leading': true, 'trailing': false });

  useEffect(() => {
    if (!track || !waveformRef.current || !track.filePath) {
      console.error('Waveform container not found or track file path is missing');
      setError('The track file path is missing.');
      return;
    }

    setIsLoading(true);
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
    });

    ws.load(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
    ws.on('ready', () => {
      setIsLoading(false);
      if (isPlaying) {
        ws.play();
      }
    });

    ws.on('error', (wsError) => {
      console.error('WaveSurfer error:', wsError);
      setError(`WaveSurfer error: ${wsError}`);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [track]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer && !isLoading) {
      isPlaying ? wavesurfer.play() : wavesurfer.pause();
    }
  }, [isPlaying, isLoading]);

  useEffect(() => {
    console.log(`Debounce effect called, isPlaying: ${isPlaying}, isLoading: ${isLoading}`);
    debouncedPlayPause(isPlaying);
    // Adding a cleanup function to cancel the debounce if the component unmounts
    return () => {
      debouncedPlayPause.cancel();
    };
  }, [isPlaying]);

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
    </div>
  );
};

export default AudioPlayer;
