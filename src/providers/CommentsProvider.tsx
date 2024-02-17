// CommentsProvider.tsx
import React, { FunctionComponent, useState, ReactNode } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { Comment } from '../../types/types'; // Adjust the import path as needed
import { backendUrl } from '@/services/apiService';
import { CommentsContextType } from '../../types/types';

interface CommentsProviderProps {
    children: ReactNode;
}

export const CommentsProvider: FunctionComponent<CommentsProviderProps> = ({ children }) => {
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchComments = async (trackId: number, page: number = 1, limit: number = 10) => {
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
    
          const data = await response.json();
          console.log("Parsed data:", data); // Debugging: Log the parsed JSON
          console.log("Is Array:", Array.isArray(data.comments)); // Log whether it's an array
    
          if (!Array.isArray(data)) {
            console.error("Expected an array of comments, received:", typeof data);
            return;
          }
    
          console.log("Fetched comments:", data);
          setComments(data);
        } catch (error) {
          console.error("Error fetching comments:", error);
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
            const errorData = await response.json(); // Assuming the server returns JSON with error details
            console.error("Error adding comment:", errorData);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
          }
    
          const newComment = await response.json();
          console.log("New comment added:", newComment);
    
          // Add the new comment to the current state
          setComments(prev => [...prev, { ...newComment, createdAt: new Date(newComment.createdAt) }]);
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
        <CommentsContext.Provider value={{ comments, fetchComments, addComment, editComment: async () => {}, deleteComment: async () => {} }}>
          {children}
        </CommentsContext.Provider>
      );
    };
