import { useEffect, useState, useRef, RefObject } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Region from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import type { WaveSurferOptions } from 'wavesurfer.js';

interface UseWaveSurferResult {
  waveSurfer: React.MutableRefObject<WaveSurfer | null>;
  isReady: boolean;
  error: string | null;
  load: (url: string) => void;
  play: () => void;
  pause: () => void;
  onRegionClick: (region: Region) => void;
  createRegion: (region: Region) => void;
  removeRegion: (region: Region) => void; 
}

const useWaveSurfer = (
    containerRef: RefObject<HTMLDivElement>,
    options?: Partial<WaveSurferOptions>
): UseWaveSurferResult => {
    const waveSurferRef = useRef<WaveSurfer | null>(null); // Change here
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const regionsRef = useRef<RegionsPlugin | null>(null);

    const onRegionClick = (region: Region) => {
        console.log(region, typeof region); 
        console.log(Object.keys(region));  // List all properties
        // Example: Open a comments panel
        openCommentsPanel(region.id); 
    
        // Example: Highlight the region
        region.element.style.backgroundColor = 'yellow';
    };

    useEffect(() => {
        if (containerRef.current) {
            const ws = WaveSurfer.create({
                container: containerRef.current, 
                waveColor: 'violet',
                progressColor: 'purple',
                backend: 'WebAudio',                
                ...options,
            });

            const regionsPlugin = ws.registerPlugin(RegionsPlugin.create()); 
            regionsRef.current = regionsPlugin;

            ws.on('ready', () => {
                console.log('WaveSurfer is ready!');
                setIsReady(true);
            });

            ws.on('error', (error) => {
                console.error('WaveSurfer error:', error); 
                setError(typeof error === 'string' ? error : 'An unknown error occurred');  
            });

            // Region Click Setup
            regionsPlugin.on('region-clicked', onRegionClick); // Assuming "region-clicked" is correct

            waveSurferRef.current = ws; // Store instance in the ref

            return () => {
                ws.destroy();
                regionsPlugin.remove('region-clicked', onRegionClick); // Cleanup event listener
            };
        } else {
            console.error('WaveSurfer initialization failed');
        }
    }, [containerRef, options]); 

    const load = (url: string) => {
        if (waveSurferRef.current) { // Always use waveSurfer.current
            waveSurferRef.current.load(url);
        }
    };
    
    const play = () => {
        if (waveSurferRef.current) {
            waveSurferRef.current.play(); 
        }
    };
    
    const pause = () => {
        if (waveSurferRef.current) { 
            waveSurferRef.current.pause();
        }
    };

    const createRegion = () => {
        if (regionsRef.current) {
            regionsRef.current.addRegion(options);
        } else {
            console.error('Regions plugin not yet initialized');
        }
    };

    const removeRegion = (region: Region) => {
        // ... (Potentially find the corresponding region in your regionsRef)
    
        // Assuming you have a way to ensure the region is managed by the plugin
        region.remove(); // Call remove() on the Region instance
    };

    return { waveSurfer: waveSurferRef, isReady, error, load, play, pause, onRegionClick, createRegion, removeRegion };
};

export default useWaveSurfer;
