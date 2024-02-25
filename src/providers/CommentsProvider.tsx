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
  const [comments, setComments] = useState<Comment[]>([]);

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

      const comments = await response.json();
      // console.log("Parsed comments:", comments); // Debugging: Log the parsed comments

      if (!Array.isArray(comments)) {
        console.error("Expected an array of comments, received:", typeof comments);
        return;
      }

      // Process each comment to include userName directly and handle marker data
      // Note: You already have userName from the API, but this step is to demonstrate processing if needed
      const processedComments = comments.map(comment => ({
        ...comment,
        userName: comment.user?.name,
        // No need to adjust marker data here as it's already handled by your API
        // This step is kept for demonstration if further processing is needed
        marker: comment.marker
      }));

      // console.log("Fetched comments and markers:", processedComments);
      setComments(processedComments);
      // console.log(`fetchCommentsAndMarkers for trackId: ${trackId} completed`);
    } catch (error) {
      console.error("Error fetching comments and markers:", error);
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

  const addMarkerAndComment = async (trackId: number, userId: number, content: string, startTime: number, token: string) => {
    try {
      const response = await fetch(`${backendUrl}/comments`, { // Adjust if you have a specific endpoint for comments with markers
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          trackId, 
          userId, 
          content, 
          marker: {
            time: startTime, // Include the start time as it must be defined
            // No need for 'end' or 'time' property if they are not used by your backend
          }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse error details only if the response wasn't OK
        console.error("Error adding comment and marker:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
  
      const newCommentAndMarker = await response.json(); // Safely parse the successful response
      console.log("New comment and marker added:", newCommentAndMarker);
  
      // Update the state to reflect the newly added comment and marker
      // Ensure this logic aligns with how you manage state in your application
      setComments(prevComments => [...prevComments, { ...newCommentAndMarker, createdAt: new Date(newCommentAndMarker.createdAt).toISOString() }]);
    } catch (error) {
      console.error("Error adding comment and marker:", error);
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
    <CommentsContext.Provider value={{ comments, fetchCommentsAndMarkers, addComment, addMarkerAndComment, editComment: async () => { }, deleteComment: async () => { } }}>
      {children}
    </CommentsContext.Provider>
  );
};
