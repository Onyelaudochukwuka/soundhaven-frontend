import React, { useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

const WaveSurferWithRegions = () => {
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);
  const regionsRef = useRef(null); // Added to store the registered Regions instance


  useEffect(() => {
    if (waveformRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio'
      });

      waveSurferRef.current.load('test.mp3');

      waveSurferRef.current.on('ready', () => {
        console.log('WaveSurfer is ready');

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
  }, []);

  return (
    <div>
      <div id="waveform" ref={waveformRef} style={{ width: '100%', height: '150px' }}></div>
    </div>
  );
};

export default WaveSurferWithRegions;