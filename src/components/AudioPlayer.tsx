import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
    url: string;
  }  

  const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: 'violet',
      progressColor: 'purple'
    });
    wavesurfer.current.load(url);

    return () => wavesurfer.current?.destroy();
  }, [url]);

  const handlePlayPause = () => {
    wavesurfer.current?.playPause();
};

  return (
    <div>
      <div ref={waveformRef} />
      <button onClick={handlePlayPause}>Play/Pause</button>
      {/* Add more controls as needed */}
    </div>
  );
};

export default AudioPlayer;
