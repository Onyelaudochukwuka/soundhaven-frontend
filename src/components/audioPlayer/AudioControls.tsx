import React, { useEffect } from 'react';
import { AudioControlsProps } from '../../../types/types'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward, faStepForward, faStepBackward, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useMusic } from '@/hooks/UseMusic';

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onPlayNext,
  onPlayPrevious,
  onPlaybackSpeedChange,
  onToggleFavorite,
  onVolumeChange,
  isFavorite,
  playbackSpeed,
  volume,
  modalOpen, 
}) => {

const { spacebarPlaybackEnabled, toggleSpacebarPlayback, isCommentInputFocused } = useMusic();

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        if (!modalOpen && !isCommentInputFocused && spacebarPlaybackEnabled) { 
          event.preventDefault();
              onPlayPause();
          } 
          // Otherwise, allow the spacebar to work normally with the modal input
      }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
      window.removeEventListener('keydown', handleKeyDown);
  };
}, [onPlayPause, modalOpen, isCommentInputFocused, spacebarPlaybackEnabled]); 

  return (
    <div className="audio-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
      <button onClick={onPlayPrevious}><FontAwesomeIcon icon={faStepBackward} /></button>
      <button onClick={onSkipBackward}><FontAwesomeIcon icon={faBackward} /></button>
      <button onClick={onPlayPause}>
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
      <button onClick={onSkipForward}><FontAwesomeIcon icon={faForward} /></button>
      <button onClick={onPlayNext}><FontAwesomeIcon icon={faStepForward} /></button>
      <button onClick={onToggleFavorite}>
        <FontAwesomeIcon icon={faHeart} className={isFavorite ? 'favorite' : ''} />
      </button>
      {/* You can add the Range inputs for playback speed and volume here */}
    </div>
  );
};

export default AudioControls;
