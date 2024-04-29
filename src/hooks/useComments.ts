import { useState, useContext, useCallback, useEffect } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { CommentsContextType } from '../../types/types';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

export const useComments = (
  waveSurferRef: React.MutableRefObject<WaveSurfer | null>,
  regionsRef: React.MutableRefObject<RegionsPlugin | null>
): CommentsContextType => {
  const { 
    comments, 
    setComments, 
    markers,
    setMarkers,
    fetchComments,
    fetchCommentsAndMarkers, 
    addComment, 
    addMarkerAndComment, 
    editComment,
    deleteComment,
    selectedCommentId, 
    setSelectedCommentId,
    selectedRegionId,
    setSelectedRegionId,
    regionCommentMap,
    setRegionCommentMap,
  } = useContext(CommentsContext); // Destructure context values

  const [newCommentInput, setNewCommentInput] = useState('');

  // console.log("Markers in useComments:•", markers);

  // Add other comment-related logic and state variables here, e.g.,
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // console.log("Region-Comment Map in useComments:", regionCommentMap);

  useEffect(() => {
    console.log('Selected comment ID changed:', selectedCommentId);
  }, [selectedCommentId]);

  const handleSelectComment = useCallback((commentId: number) => {
    console.log('handleSelectComment called with commentId:', commentId);

    setSelectedCommentId(commentId);

    if (!waveSurferRef.current || !regionsRef.current) return;

    const regions = regionsRef.current.getRegions();

    console.log('regionCommentMap:', regionCommentMap);
    const selectedRegion = regions.find((region) =>
      Object.entries(regionCommentMap).some(([regionId, cId]) => cId === commentId && region.id === regionId)
    );

    if (selectedRegion) {
      console.log('Selected region:', selectedRegion);
      selectedRegion.setOptions({ color: 'rgba(0, 255, 0, 0.7)' });
      waveSurferRef.current.seekTo(selectedRegion.start / waveSurferRef.current.getDuration());
    }

    // Merged logic from AudioPlayer's handleSelectComment
    Object.values(regionsRef.current.list).forEach((region) => {
      if (region.data.commentId === commentId) {
        region.update({ color: 'rgba(0, 255, 0, 0.7)' });
        waveSurferRef.current.seekTo(region.start / waveSurferRef.current.getDuration());
      }
    });
  }, [regionCommentMap, setSelectedCommentId]);

  return { 
    newCommentInput, 
    setNewCommentInput, 
    comments, 
    setComments, 
    markers,
    setMarkers,
    fetchComments,
    fetchCommentsAndMarkers, 
    addComment, 
    addMarkerAndComment, 
    editComment,
    deleteComment,
    selectedCommentId, 
    setSelectedCommentId,
    selectedRegionId,
    setSelectedRegionId,
    regionCommentMap,
    setRegionCommentMap,
    handleSelectComment
  };
};
