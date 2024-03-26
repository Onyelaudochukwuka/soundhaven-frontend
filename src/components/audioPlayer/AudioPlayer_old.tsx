import React, { useRef, useState, useEffect, useCallback } from 'react';

import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Region as WaveSurferRegion } from 'wavesurfer.js/dist/plugins/regions.js';

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
  const { comments, markers, setMarkers, addMarkerAndComment, fetchCommentsAndMarkers, selectedCommentId, setSelectedCommentId } = useComments();

  const regionsRef = useRef(null);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [waveSurferReady, setWaveSurferReady] = useState(false);

  const [selectedRegionId, setSelectedRegionId] = useState(null);

  // Debounced double click handler defined with useCallback at the top level
  const debouncedHandleDoubleClick = useCallback(debounce((e) => {
    if (regionsRef.current && waveformRef.current) {
      const clickPositionX = e.clientX - waveformRef.current.getBoundingClientRect().left;
      const clickTime = waveSurferRef.current.getDuration() * (clickPositionX / waveformRef.current.offsetWidth);

      console.log('About to add region. Current regions:', regionsRef.current.regions);
      const region = regionsRef.current.addRegion({
        start: clickTime,
        color: 'rgba(255, 165, 0, 0.5)',
        drag: false,
        resize: false,
      });

      setRegionParams({
        id: region.id,
        time: clickTime,
        color: 'rgba(255, 165, 0, 0.5)'
      });

      setModalOpen(true);
    }
  }, 300), [setRegionParams, setModalOpen]);

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

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'purple',
        progressColor: 'grey',
        backend: 'WebAudio',
      });

      waveSurferRef.current = ws;

      console.log("WaveSurfer instance created:", ws);

      // Register the Regions plugin and keep a reference in a ref or state
      const regionsPlugin = ws.registerPlugin(RegionsPlugin.create())
      regionsRef.current = regionsPlugin;

      console.log("Regions plugin registered:", regionsPlugin);

      const trackUrl = encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
      waveSurferRef.current.load(trackUrl);

      ws.on('decode', () => {
        console.log('Track loaded');
      });

      ws.on('ready', () => {
        setIsLoading(false); // Set loading state to false when WaveSurfer is ready
        setWaveSurferReady(true);
        console.log('WaveSurfer is ready. Duration:', ws.getDuration());
  
        // Listener for region clicks
        regionsPlugin.on('region-clicked', (region, event) => {
          event.stopPropagation(); // prevent triggering click on the waveform
          console.log('Region clicked:', region.id);
  
          // Logic for deselecting any previously selected region and highlighting the clicked region
          if (selectedRegionId) {
            const prevRegion = regionsRef.current?.regions[selectedRegionId];
            if (prevRegion) {
              prevRegion.setOptions({ color: 'rgba(255, 0, 0, 0.5)' }); // Reset previous region color
            }
          }
  
          // Highlight the clicked region
          region.setOptions({ color: 'rgba(0, 255, 0, 0.7)' }); // Change color
          setSelectedRegionId(region.id); // Update state to reflect the newly selected region
  
          // Optional: Perform actions based on the selected region, such as displaying a comment related to this marker
        });
      });

      ws.on('error', (error) => {
        console.error('WaveSurfer error:', error);
      });

      // Add the debounced event listener
      const waveformElement = waveformRef.current;
      waveformElement.addEventListener('dblclick', debouncedHandleDoubleClick);

      // Cleanup
      return () => {
        ws.destroy();
        waveformElement.removeEventListener('dblclick', debouncedHandleDoubleClick);
      };
    }
}, [track.filePath, debouncedHandleDoubleClick, selectedRegionId]);

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

  const handleRegionClick = useCallback((commentId, regionId) => {
    // if (!regionsRef.current) {
    //    return; 
    // }

    console.log('Entered handleRegionClick, regionId:', regionId);
    console.log('regionsRef.current:', regionsRef.current);
    console.log('regionsRef.current.regions:', regionsRef.current.regions);

    // Update selected region state
    setSelectedRegionId(regionId);

    // Deselect any previously selected region
    if (selectedRegionId) {
      const previousRegion = regionsRef.current!.regions[selectedRegionId];
      if (previousRegion) {
        previousRegion.setOptions({
          color: 'rgba(255, 0, 0, 0.5)'
        }); // Default color
      }
    }

    // Highlight the clicked region
    const clickedRegion = regionsRef.current!.regions[regionId];
    if (clickedRegion) {
      console.log('Region before color change:', clickedRegion) // Log region object
      clickedRegion.setOptions({ color: 'rgba(0, 0, 0, 0.7)' }); // Highlight color 
      console.log('Region after color change:', clickedRegion) // Log again 
    }

    console.log('Marker clicked:', commentId, regionId);

    setSelectedRegionId(regionId);
    setSelectedCommentId(commentId);
  }, [selectedRegionId, setSelectedRegionId, setSelectedCommentId]);

  // useEffect for loading regions once WaveSurfer is ready and comments/markers have been fetched
  useEffect(() => {
    const loadRegions = () => {
      if (waveSurferReady && regionsRef.current && markers.length > 0) {
        console.log('WaveSurfer is ready. Loading markers...');

        regionsRef.current.clearRegions(); // Clear existing regions before adding new ones

        markers.forEach(marker => {
          console.log(`Adding marker at time: ${marker.time} with id: ${marker.id}`);
          regionsRef.current.addRegion({
            start: marker.time,
            end: marker.time + 0.5, // Adjust based on your needs
            color: 'rgba(255, 0, 0, 0.5)',
            drag: false,
            resize: false,
            data: { id: marker.id }, // Ensure each marker has a unique identifier
          });
        });
      }
    };

    loadRegions(); // Call the function to load regions

    // This cleanup function is called when the component unmounts or when the dependencies change
    return () => {
      if (regionsRef.current) {
        regionsRef.current.clearRegions(); // Clear all regions when the waveform is reloaded or component unmounts
      }
    };
  }, [waveSurferReady, markers]);

  useEffect(() => {
    if (track.id && !isLoading) {
      fetchCommentsAndMarkers(track.id)
        .then(() => console.log('Comments and markers fetched successfully.'))
        .catch(error => console.error('Error fetching comments and markers:', error));
    }
  }, [track.id, isLoading]);

  const handleCommentSubmit = async (submittedComment) => {
    console.log('Submitted comment:', submittedComment);
    if (!user || !token) {
      console.error("User or token not available");
      return;
    }

    console.log('token inside handleCommentSubmit:', token)

    try {
      if (regionParams) {
        const { time: startTime, id: waveSurferRegionID } = regionParams;

        // Log the request payload for debugging
        console.log('Sending request to add comment with marker:', {
          trackId: track.id,
          content: submittedComment,
          time: startTime,
          waveSurferRegionID: waveSurferRegionID,
          token: token
        });

        await addMarkerAndComment(track.id, submittedComment, startTime, waveSurferRegionID, token);
      } else {
        console.log("No marker associated with this comment (skipping marker creation).");
      }
      console.log("Comment (and potentially marker) added successfully");
      setModalOpen(false);
      setComment('');
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

  const handleSelectComment = useCallback((commentId: number) => {
    setSelectedCommentId(commentId);
    if (!waveSurferRef.current || !regionsRef.current?.list) return;

    Object.values(regionsRef.current.list).forEach((region) => {
      if (region.data.commentId === commentId) {
        region.update({ color: 'rgba(0, 255, 0, 0.7)' });
        waveSurferRef.current.seekTo(region.start / waveSurferRef.current.getDuration());
      }
    });
  }, [setSelectedCommentId]);


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
