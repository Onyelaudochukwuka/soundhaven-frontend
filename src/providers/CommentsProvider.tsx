// CommentsProvider.tsx
import React, { FunctionComponent, useState, ReactNode } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { _Comment, Marker } from '../../types/types'; // Adjust the import path as needed
import { backendUrl } from '@/services/apiService';
import { CommentsContextType } from '../../types/types';

interface CommentsProviderProps {
  children: ReactNode;
}

export const CommentsProvider: FunctionComponent<CommentsProviderProps> = ({ children }) => {
  // const [newCommentInput, setNewCommentInput] = useState('');
  const [comments, setComments] = useState<_Comment[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [regionCommentMap, setRegionCommentMap] = useState<Record<string, number>>({});
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false); 


  // const [commentsCount, setCommentsCount] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (trackId: number, page: number = 1, limit: number = 10) => {
    console.log(`fetchComments called with trackId: ${trackId}, page: ${page}, limit: ${limit}`);

    if (!trackId || trackId <= 0) {
      console.error("Invalid trackId, skipping fetchComments");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`);
      console.log("Raw response:", response); // Debugging: Log the raw response

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const fetchedComments = await response.json();
      if (!Array.isArray(fetchedComments)) {
        console.error("Expected an array of comments, received:", typeof fetchedComments);
        return;
      }

      console.log("Fetched comments:", fetchedComments);
      setComments(fetchedComments); // Update comments state

    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchCommentsAndMarkers = async (trackId: number, page: number = 1, limit: number = 10) => {
    console.log(`fetchCommentsAndMarkers called with trackId: ${trackId}, page: ${page}, limit: ${limit}`);

    if (!trackId || trackId <= 0) {
      console.error("Invalid trackId, skipping fetchCommentsAndMarkers");
      return;
    }

    try {
      setIsLoadingMarkers(true);

      const response = await fetch(`${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`);
      console.log("Raw response:•", response);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const fetchedComments: _Comment[] = await response.json();
      if (!Array.isArray(fetchedComments)) {
        console.error("Expected an array of comments, received:", typeof fetchedComments);
        return;
      }
      console.log("Fetched comments:•", fetchedComments);

      setComments(fetchedComments); // Update comments state

      const extractedMarkers = fetchedComments
      .filter(comment => comment.marker)
      .map(comment => ({
        id: comment.marker.id,
        time: comment.marker.time,
        commentId: comment.marker.commentId,
        trackId: comment.marker.trackId,
        createdAt: comment.marker.createdAt,
        waveSurferRegionID: comment.marker?.waveSurferRegionID ?? '',
      }));
  
      // Log extracted markers
      console.log("Extracted markers:•", extractedMarkers);

      setMarkers(extractedMarkers); // Update markers state
      console.log("Updated markers in CommentsProvider:•", markers);

      const newRegionCommentMap: Record<string, number> = extractedMarkers.reduce((map: Record<string, number>, marker) => {
        if (marker.waveSurferRegionID && marker.commentId) {
          map[marker.waveSurferRegionID] = marker.commentId;
        }
        return map;
      }, {});
  
      // console.log("New regionCommentMap:", newRegionCommentMap);
  
      setRegionCommentMap(newRegionCommentMap);

      // console.log("Extracted markers before creating regionCommentMap:", extractedMarkers);
      console.log("Region-Comment Map in CommentsProvider:", regionCommentMap);

      setRegionCommentMap(regionCommentMap);
      setIsLoadingMarkers(false); // Set loading to false after everything is updated
    } catch (error) {
      console.error("Error fetching comments and markers:", error);
      setError('Failed to fetch comments and markers. Please try again.');
    }
  };

  const addMarkerAndComment = async (trackId: number, content: string, time: number, waveSurferRegionID: string, token: string) => {
    if (!token) {
      console.error("Token is not available or expired.");
      return;
    }

    console.log(`Sending data * - trackId: ${trackId}, time: ${time}, type of time: ${typeof time}, waveSurferRegionID: ${waveSurferRegionID}`);

    try {
      const response = await fetch(`${backendUrl}/comments/with-marker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackId,
          content,
          time,
          waveSurferRegionID,
        }),
      });

      // Parse the JSON from the response body once
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        console.error("Error adding comment and marker:", responseData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseData.message}`);
      }

      const newComment = responseData as Comment; // Casting the response to match the Comment type
      console.log("New comment and potentially a marker added:", newComment);

      // Update comments state to include the new comment
      setComments((prevComments: Comment[]) => [...prevComments, newComment]);

      // Check if the marker data exists and has all required fields before updating the markers state
      if (newComment.marker && typeof newComment.marker.id === 'number' && typeof newComment.marker.time === 'number') {
        console.log("Adding new marker to state:", newComment.marker);
        setMarkers((prevMarkers) => [...prevMarkers, {
          id: newComment.marker!.id,
          time: newComment.marker!.time,
          commentId: newComment.id,
          trackId: newComment.trackId,
          createdAt: newComment.createdAt,
          waveSurferRegionID: newComment.marker?.waveSurferRegionID ?? '',
          comment: newComment,
        }]);
      } else {
        console.warn('Marker data is missing for the new comment:', newComment.id);
      }

      // await fetchCommentsAndMarkers(trackId);

    } catch (error) {
      console.error("Error adding comment and marker:", error);
    }
  };


  const addComment = async (trackId: number, userId: number, content: string, token: string) => {
    try {
      const response = await fetch(`${backendUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ trackId, userId, content }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse error details only if the response wasn't OK
        console.error("Error adding comment:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }

      const newComment = await response.json(); // Safely parse the successful response
      console.log("New comment added:", newComment);

      // Assuming setComments updates the state to reflect the newly added comment
      // and that your state structure aligns with the response structure
      setComments(prevComments => [...prevComments, { ...newComment, createdAt: new Date(newComment.createdAt).toISOString() }]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const editComment = async (commentId, content) => {
    try {
      const response = await fetch(`${backendUrl}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to edit comment');
      const updatedComment = await response.json();
      setComments(prev => prev.map(comment => comment.id === commentId ? { ...comment, content, createdAt: new Date(updatedComment.createdAt) } : comment));
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${backendUrl}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        setComments,
        markers,
        setMarkers,
        fetchComments,
        fetchCommentsAndMarkers,
        addComment,
        addMarkerAndComment,
        editComment: async () => { },
        deleteComment: async () => { },
        selectedCommentId,
        setSelectedCommentId,
        selectedRegionId,
        setSelectedRegionId,
        regionCommentMap,
        setRegionCommentMap,
      }}>
      {children}
    </CommentsContext.Provider>
  );
};
