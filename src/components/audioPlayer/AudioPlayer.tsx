// components/AudioPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import AudioControls from './AudioControls'; 
import { AudioPlayerProps, Track } from '@/types';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentTrackIndex, tracks, onSelectNextTrack, onSelectPrevTrack, url }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(100); // Assuming volume range is 0-100

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple'
      });

      wavesurfer.current.load(url);

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      wavesurfer.current.on('ready', () => {
        wavesurfer.current?.setPlaybackRate(playbackSpeed);
        wavesurfer.current?.setVolume(volume / 100);
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [url, playbackSpeed, volume]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const onSkipForward = () => {
    if (wavesurfer.current) {
      let currentTime = wavesurfer.current.getCurrentTime();
      wavesurfer.current.seekTo((currentTime + 10) / wavesurfer.current.getDuration());
    }
  };

  const onSkipBackward = () => {
    if (wavesurfer.current) {
      let currentTime = wavesurfer.current.getCurrentTime();
      wavesurfer.current.seekTo(Math.max(0, currentTime - 10) / wavesurfer.current.getDuration());
    }
  };

  // Implementation for onPlayNext and onPlayPrevious
  const onPlayNext = () => {
    onSelectNextTrack(); // Call the provided function to select the next track
  };

  const onPlayPrevious = () => {
    onSelectPrevTrack(); // Call the provided function to select the previous track
  };

  const onPlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(speed);
    }
  };

  const onToggleFavorite = () => setIsFavorite(!isFavorite);

  const onVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume / 100);
    }
  };

  return (
    <div>
      <div ref={waveformRef} />
      <AudioControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSkipForward={onSkipForward}
        onSkipBackward={onSkipBackward}
        onPlayNext={onPlayNext}
        onPlayPrevious={onPlayPrevious}
        onPlaybackSpeedChange={onPlaybackSpeedChange}
        onToggleFavorite={onToggleFavorite}
        onVolumeChange={onVolumeChange}
        isFavorite={isFavorite}
        playbackSpeed={playbackSpeed}
        volume={volume}
      />
    </div>
  );
};

export default AudioPlayer;
