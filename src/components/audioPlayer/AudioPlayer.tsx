import React, { useRef, useState, useEffect, useCallback } from 'react';

import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';

import { Track, _Comment, Marker } from '../../../types/types';

import debounce from 'lodash/debounce';

import AudioControls from './AudioControls';
import TrackInfo from './TrackInfo';
import Modal from '../Modal';

import { useComments } from '@/hooks/UseComments';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/hooks/UseMusic';

import useWaveSurfer from '@/hooks/UseWaveSurfer';

import { CustomRegionWrapper } from './CustomRegion';

interface AudioPlayerProps {
  track: Track;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  volume: number;
  onVolumeChange: (speed: number) => void;
  onTogglePlay: () => void;
  onSelectComment: (commentId: number) => void;
  showComments: boolean;
  toggleComments: () => void;
}


const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onTogglePlay,
  isFavorite,
  onToggleFavorite,
  playbackSpeed,
  volume,
  onSelectComment,
  toggleComments,
  showComments,
}) => {
  const { user, token } = useAuth();
  const { currentTrack, fetchTrack, isPlaying, togglePlayback, play, pause, audioRef, nextTrack, previousTrack, currentTrackIndex } = useMusic();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  // const [regionParams, setRegionParams] = useState<RegionParams>({
  //   id: '',
  //   start: 0,
  //   end: 0
  // });

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const { waveSurfer, isReady: waveSurferReady, error: waveSurferError, load, onRegionClick, addRegion } = useWaveSurfer(waveformRef);

  const selectedRegionIdRef = useRef(null);

  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const {
    comments,
    setComments,
    markers,
    setMarkers,
    addMarkerAndComment,
    fetchCommentsAndMarkers,
    selectedCommentId,
    setSelectedCommentId,
    selectedRegionId,
    setSelectedRegionId,
    regionCommentMap,
    setRegionCommentMap,
    isLoadingComments,
    commentsError,
    isCommentAdding,
  } = useComments(waveSurfer, regionsRef);

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const customRegionsRef = useRef<Map<string, CustomRegionWrapper>>(new Map());

  const onSelectRegion = useCallback((marker: Marker) => {
    // Logic to select the associated comment and update the UI accordingly
    setSelectedCommentId(marker.commentId);
  }, []);

  // console.log("Region-Comment Map in AudioPlayer:", regionCommentMap);

  const handleDoubleClick = useCallback((e) => {
    if (waveSurferReady && waveformRef.current) {
        const clickPositionX = e.clientX - waveformRef.current.getBoundingClientRect().left;
        const clickTime = waveSurfer.getDuration() * (clickPositionX / waveformRef.current.offsetWidth);

        // Use the addRegion function from useWaveSurfer
        addRegion({ start: clickTime, color: 'rgba(255, 165, 0, 0.5)', drag: false, resize: false });
        setModalOpen(true); 
     }   
}, [addRegion]); 

// Attach the event listener to waveformRef
useEffect(() => {
    if (waveformRef.current) {  
        waveformRef.current.addEventListener('dblclick', handleDoubleClick); 

        return () => {
            waveformRef.current.removeEventListener('dblclick', handleDoubleClick);
        }
    }
}, [handleDoubleClick]); 

  const handleRegionClick = useCallback((regionId) => {
    const commentId = regionCommentMap[regionId];
    if (commentId) {
      onSelectComment(commentId); // Assume onSelectComment updates the selectedCommentId in shared state/context
      if (!showComments) {
        toggleComments(); // This function should change the state to make CommentsPanel visible
      }
    }
  }, [regionCommentMap, onSelectComment, showComments, toggleComments]);

  // Function to set the current track in WaveSurfer
  const setCurrentTrackInWaveSurfer = useCallback(() => {
    if (waveSurferRef.current && track && !isLoadingTrack) {
      console.log('Calling WaveSurfer.load() from setCurrentTrackInWaveSurfer:', track.name); // ADD THIS LOG
      setIsLoadingTrack(true); // Set the flag
      const trackUrl = encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
      console.log('Loading track into WaveSurfer:', trackUrl);
      waveSurferRef.current.load(trackUrl);
    } else {
      console.log('WaveSurfer or track not ready for loading, or track is already loading');
    }
  }, [track]);

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

      // Register the Regions plugin and keep a reference in a ref or state
      const regionsPlugin = ws.registerPlugin(RegionsPlugin.create())
      regionsRef.current = regionsPlugin;

      // const trackUrl = encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
      // waveSurferRef.current.load(trackUrl);

      ws.on('decode', () => {
        console.log('Track loaded');
      });

      ws.on('ready', () => {
        setIsLoading(false);
        setWaveSurferReady(true);
        console.log('WaveSurfer is ready! Calling setCurrentTrackInWaveSurfer');
        console.log('Waveform container dimensions:', waveformRef.current.offsetWidth, waveformRef.current.offsetHeight); // Check dimensions
        setCurrentTrackInWaveSurfer();
        setIsLoadingTrack(false);

        // Listener for region clicks
        regionsPlugin.on('region-clicked', (region, event) => {
          const markerData = region.data as Marker;
          const waveSurferRegionID = region.id;
          const commentId = regionCommentMap[waveSurferRegionID];

          setSelectedCommentId(commentId || null);
          setSelectedRegionId(region.id);

          if (!showComments) {
            toggleComments();
          }

          // If there is a previously selected region
          if (selectedRegionIdRef.current) {

            const prevRegionIndex = regionsRef.current?.regions.findIndex((region) => region.id === selectedRegionIdRef.current);
            const prevRegion = regionsRef.current?.regions[prevRegionIndex];

            // console.log('Previous region:', prevRegion);

            if (prevRegion) {
              prevRegion.setOptions({ color: 'rgba(255, 0, 0, 0.5)' }); // Reset previous region color
              // console.log('Previous region color changed:', region.id, region.color);
            }
          }

          // Highlight the clicked region and update the selected region only if it's different from the current one
          if (selectedRegionIdRef.current !== region.id) {
            region.setOptions({ color: 'rgba(0, 255, 0, 0.7)' }); // Change color
            // console.log('Current region color changed:', region.id, region.color);

            selectedRegionIdRef.current = region.id; // Update state to reflect the newly selected region

          } else {
            // If the same region is clicked again, reset its color to deselect it and update the selected region to null
            region.setOptions({ color: 'rgba(255, 0, 0, 0.5)' }); // Reset region color
            // console.log('Current region color changed:', region.id, region.color);

            selectedRegionIdRef.current = null; // Update state to reflect that no region is selected
          }
          // console.log('New selectedRegionId:', selectedRegionIdRef.current);

          // Optional: Perform actions based on the selected region, such as displaying a comment related to this marker
        });
      });

      ws.on('error', (error) => {
        console.error('WaveSurfer error:', error);
        setError(error.message);
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
  }, [track.filePath, debouncedHandleDoubleClick]);

  useEffect(() => {
    console.log('Selected Comment ID:', selectedCommentId);
  }, [selectedCommentId]);

  useEffect(() => {
    if (track?.id) {
      fetchTrack(track.id).then(fetchedTrack => {
        // Use fetchedTrack as needed
      }).catch(error => {
        console.error('Failed to fetch track:', error);
      });
    }
  }, [track?.id, fetchTrack]);

  const updateMarkerFromRegion = (marker: Marker, region: any): Marker => {
    return {
      ...marker,
      waveSurferRegionID: region.id,
      time: region.start,

      // Potential Updates:
      end: region.end, // Update the marker's end time if meaningful in your application

      data: {
        ...marker.data, // Spread existing data to preserve
        customColor: region.color,  // Sync color changes  
        isDraggable: region.drag,   // Update draggable property
        isResizable: region.resize  // Update resizable property
      }
    };
  };

  // useEffect for loading regions once WaveSurfer is ready and comments/markers have been fetched
  useEffect(() => {
    loadRegions(); 
    return () => {
      if (regionsRef.current) {
        regionsRef.current.clearRegions();
      }
    };
  }, [loadRegions, regionCommentMap]);

  useEffect(() => {
    loadRegions(); // Call the memoized function to load regions

    // console.log('regionCommentMap in useEffect loadRegions:', regionCommentMap);

    return () => {
      if (regionsRef.current) {
        regionsRef.current.clearRegions();
      }
    };
  }, [loadRegions, regionCommentMap]);

  useEffect(() => {
    if (track.id && !isLoading && !isCommentAdding) {
      console.log("Before calling fetchCommentsAndMarkers", track.id);

      const fetchAndSetData = async () => {
        try {
          await fetchCommentsAndMarkers(track.id);
          console.log('Comments array inside AudioPlayer from track.id useEffect:', comments);
        } catch (error) {
          console.error('Error fetching comments and markers:', error);
        }
      };

      fetchAndSetData(); // Call the inner function
    }
  }, [track.id, isLoading, isCommentAdding, fetchCommentsAndMarkers]);

  // Submit comment on enter press
  const handleCommentSubmit = async (submittedComment: string) => {

    if (!user || !token) {
      console.error("User or token not available");
      return;
    }

    if (!submittedComment.trim()) {
      console.error('Comment is empty');
      return;
    }

    const startTime = regionParams.start ?? 0;
    if (isNaN(startTime) || !regionParams.id) {
      console.error('Invalid input data', submittedComment, startTime, regionParams.id);
      return;
    }

    const tempId = Date.now(); // Use a timestamp as a temporary ID
    const newComment = {
      trackId: track.id,
      content: submittedComment,
      time: startTime,
      waveSurferRegionID: regionParams.id,
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name },
    };

    setComments(prev => [newComment, ...prev]);
    setModalOpen(false);
    setComment('');
    setIsSubmittingComment(true);

    try {
      const result = await addMarkerAndComment(track.id, submittedComment, startTime, regionParams.id, token);
      setComments(prev => prev.map(comment => comment.id === tempId ? { ...result, id: result.comment.id } : comment));
      console.log("Comment (and potentially marker) added successfully");
    } catch (error) {
      console.error("Error submitting comment (and marker):", error);
      // Rollback optimistic update if necessary
      // setComment(prev => prev.filter(c => c !== newComment));
      setComments(prev => prev.filter(comment => comment.id !== tempId));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (waveSurferRef.current && !isLoading) {
      if (isPlaying) {
        waveSurferRef.current.play();
      } else {
        waveSurferRef.current.pause();
      }
    }
  }, [isPlaying, isLoading]);

  // Connect Audio Element with audioRef from MusicProvider
  useEffect(() => {
    if (audioRef.current && waveSurfer) {
      audioRef.current.src = encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${track.filePath}`);
      audioRef.current.onended = handleAudioEnded;

      if (isPlaying) {
        waveSurfer.play();
      } else {
        waveSurfer.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null; 
      }
    };
  }, [audioRef, currentTrack, isPlaying, waveSurfer]); 

  const handleAudioEnded = useCallback(() => {
    if (currentTrackIndex !== null) {
      console.log('Audio ended. Calling nextTrack()');
      nextTrack();
    } else {
      console.log('Audio ended, but currentTrackIndex is null');
    }
  }, [currentTrackIndex, nextTrack]);

  const handleSkipForward = () => {
    // Implement skipping forward
  };

  const handleSkipBackward = () => {
    // Implement skipping backward
  };

  const handlePlayPause = () => {
    onTogglePlay();
  };

  const handlePlayNext = () => {
    // Assume your MusicProvider has a method to fetch and play the next track
    nextTrack();
  };

  const handlePlayPrevious = () => {
    // Assume your MusicProvider has a method to fetch and play the previous track
    previousTrack();
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

  useEffect(() => {
    // This hook is intended to log and potentially act on inconsistencies found in comment data
    if (selectedCommentId === null && comments.length > 0) {
      console.log('Checking state integrity after update:', comments);
      // Here, you could also invoke any corrective actions if inconsistencies are found
    }
  }, [comments, selectedCommentId]);

  return (
    <div>
      {track && (
        <div>
          <audio src="" ref={audioRef} onEnded={handleAudioEnded}></audio>
          <TrackInfo track={track} />
          <div ref={waveformRef} style={{ height: '128px', width: '100%' }} />
          <AudioControls
            modalOpen={modalOpen}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
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
          />
        </div>

      )}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit(comment); // Directly use the comment state
            // setComment(''); // Clear the comment input after submission
          }}>
            <input
              name="comment"
              type="text"
              placeholder="Enter comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AudioPlayer;
