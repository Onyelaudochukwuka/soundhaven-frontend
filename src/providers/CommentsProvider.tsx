// CommentsProvider.tsx
import React, { FunctionComponent, useState, useCallback, ReactNode } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { Comment, Marker } from '../../types/types'; // Adjust the import path as needed
import { backendUrl } from '@/services/apiService';
import { CommentsContextType } from '../../types/types';
import { ApiError } from '@/utils/apiError';

interface CommentsProviderProps {
    children: ReactNode;
}

interface CommentWithMarkerResponse {
    id: number; // ID of the newly added comment
    userName: string; // User's name who added the comment
    content: string; // Content of the comment
    trackId: number; // ID of the track associated with the comment
    userId: number; // ID of the user who added the comment
    createdAt: string; // Creation date of the comment
    marker: Marker; // Assuming Marker type is defined elsewhere
  }

  interface ErrorResponse {
    message: string; // General error message
    errors?: { [key: string]: string[] }; // Detailed validation errors, if any
    statusCode?: number; // Optional status code for further granularity
  }

export const CommentsProvider: FunctionComponent<CommentsProviderProps> = ({ children }) => {
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchCommentsAndMarkers = useCallback(async (trackId: number, page: number = 1, limit: number = 10): Promise<void> => {
        if (!trackId || trackId <= 0) {
            console.error("Invalid trackId, skipping fetchCommentsAndMarkers");
            return;
        }
      
        try {
            const commentsUrl = `${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`;
            const markersUrl = `${backendUrl}/markers?trackId=${trackId}`;
      
            const commentsResponse = await fetch(commentsUrl);
            if (!commentsResponse.ok) {
                throw new ApiError(`Failed to fetch comments: ${commentsResponse.statusText}`, {
                    status: commentsResponse.status,
                    statusText: commentsResponse.statusText,
                    json: () => commentsResponse.json(),
                });
            }
            const commentsData: Comment[] = await commentsResponse.json();
      
            const markersResponse = await fetch(markersUrl);
            if (!markersResponse.ok) {
                throw new ApiError(`Failed to fetch markers: ${markersResponse.statusText}`, {
                    status: markersResponse.status,
                    statusText: markersResponse.statusText,
                    json: () => markersResponse.json(),
                });
            }
            const markersData: Marker[] = await markersResponse.json();
      
            const integratedComments = commentsData.map(comment => ({
                ...comment,
                marker: markersData.find(marker => marker.commentId === comment.id),
            }));
      
            setComments(integratedComments);
        } catch (error) {
            if (error instanceof ApiError) {
                console.error("API Error:", error.message, 'Status:', error.response?.status);
                if (error.response?.json) {
                    error.response.json().then((errorDetails) => console.error("Error details:", errorDetails));
                }
            } else {
                console.error("Unexpected error fetching comments and markers:", error);
            }
        }
    }, []); 
      

    // Adjust the fetchComments function to call fetchCommentsAndMarkers
    const fetchComments = async (trackId: number, page?: number, limit?: number) => {
        fetchCommentsAndMarkers(trackId, page, limit);
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
                const errorData = await response.json(); // Assuming the server returns JSON with error details
                console.error("Error adding comment:", errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const newComment = await response.json();
            console.log("New comment added:", newComment);

    // Trigger state update or re-fetch to reflect the new comment
    fetchCommentsAndMarkers(trackId);
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

const addCommentWithMarker = async (
    trackId: number,
    userId: number,
    content: string,
    token: string,
    start: number,
    end?: number // Making `end` optional if it's not always defined
  ): Promise<CommentWithMarkerResponse> => {
    try {
      const body = JSON.stringify({
        trackId,
        userId,
        content,
        start,
        ...(end !== undefined && { end }), // Conditionally include `end` if it's provided
      });
  
      const response = await fetch(`${backendUrl}/comments/with-marker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body,
      });
  
      if (!response.ok) {
        // Parsing JSON only if the response is not ok to avoid unnecessary parsing on successful requests
        const errorData: ErrorResponse = await response.json();
        console.error("Error adding comment with marker:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
  
      const newComment: CommentWithMarkerResponse = await response.json();
      console.log("New comment with marker added:", newComment);
  
      await fetchCommentsAndMarkers(trackId); // Ensuring to wait for the comments to be refreshed
      return newComment;
    } catch (error) {
      console.error("Error adding comment with marker:", error);
      throw error; // Rethrowing the error to be handled or logged by the caller
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
        <CommentsContext.Provider value={{
            comments,
            fetchComments,
            fetchCommentsAndMarkers,
            addComment,
            addCommentWithMarker, // Include the new method in the context
            editComment,
            deleteComment
        }}>
            {children}
        </CommentsContext.Provider>
    );
};
