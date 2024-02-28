// CommentsProvider.tsx
import React, { FunctionComponent, useState, ReactNode } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { Comment, Marker } from '../../types/types'; // Adjust the import path as needed
import { backendUrl } from '@/services/apiService';
import { CommentsContextType } from '../../types/types';

interface CommentsProviderProps {
  children: ReactNode;
}

export const CommentsProvider: FunctionComponent<CommentsProviderProps> = ({ children }) => {
  const [newCommentInput, setNewCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);


  const fetchCommentsAndMarkers = async (trackId: number, page: number = 1, limit: number = 10) => {
    // console.log(`fetchCommentsAndMarkers called with trackId: ${trackId}, page: ${page}, limit: ${limit}`);

    if (!trackId || trackId <= 0) {
      console.error("Invalid trackId, skipping fetchCommentsAndMarkers");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`);
      // console.log("Raw response:", response); // Debugging: Log the raw response

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const fetchedComments = await response.json();
      if (!Array.isArray(fetchedComments)) {
        console.error("Expected an array of comments, received:", typeof fetchedComments);
        return;
      }

      setComments(fetchedComments); // Update comments state

      // Extract markers from fetched comments
      const extractedMarkers = fetchedComments
        .filter(comment => comment.marker) // Ensure the comment has a marker
        .map(comment => comment.marker); // Extract the marker

      setMarkers(extractedMarkers); // Update markers state
    } catch (error) {
      console.error("Error fetching comments and markers:", error);
    }
  };


  const addMarkerAndComment = async (trackId: number, userId: number, content: string, start: number, token: string) => {
    try {
      const response = await fetch(`${backendUrl}/comments/with-marker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackId,
          userId,
          content,
          start,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse error details if the response wasn't OK
        console.error("Error adding comment and marker:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
  
      const newComment = await response.json() as Comment; // Casting the response to match the Comment type
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
        comment: newComment,
      }]);
    } else {
      console.warn('Marker data is missing for the new comment:', newComment.id);
    }

    await fetchCommentsAndMarkers(trackId);

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


  // const fetchCommentsAndMarkers = async (trackId: number, page: number = 1, limit: number = 10) => {
  //   if (!trackId || trackId <= 0) {
  //     console.error("Invalid trackId, skipping fetchCommentsAndMarkers");
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(`${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`);
  
  //     if (!response.ok) {
  //       const errorMessage = `Failed to fetch comments: ${response.statusText}`;
  //       console.error(errorMessage);
  //       throw new Error(errorMessage);
  //     }
  
  //     const fetchedComments = await response.json();
  //     if (!Array.isArray(fetchedComments)) {
  //       console.error("Expected an array of comments, received:", typeof fetchedComments);
  //       return;
  //     }
  
  //     setComments(fetchedComments); // Update comments state
  
  //     // Extract markers from fetched comments
  //     const extractedMarkers = fetchedComments
  //       .filter(comment => comment.marker) // Ensure the comment has a marker
  //       .map(comment => comment.marker); // Extract the marker
  
  //     setMarkers(extractedMarkers); // Update markers state
  //   } catch (error) {
  //     console.error("Error fetching comments and markers:", error.message, error.stack);
  //   }
  // };

  return (
    <CommentsContext.Provider value={{ newCommentInput, setNewCommentInput, comments, setComments, fetchCommentsAndMarkers, addComment, addMarkerAndComment, editComment: async () => { }, deleteComment: async () => { } }}>
      {children}
    </CommentsContext.Provider>
  );
};
