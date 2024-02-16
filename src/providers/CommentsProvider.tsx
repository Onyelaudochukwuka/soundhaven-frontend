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

    const fetchComments = async (trackId, page = 1, limit = 10) => {
        try {
            const response = await fetch(`${backendUrl}/comments?trackId=${trackId}&page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            const data = await response.json();
            setComments(data.comments); // Assuming the API returns an object with a comments array
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const addComment = async (trackId, userId, content, token) => {
        try {
            const response = await fetch(`${backendUrl}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ trackId, userId, content }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const newComment = await response.json();
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
        <CommentsContext.Provider value={{ comments, fetchComments, addComment, editComment, deleteComment }}>
            {children}
        </CommentsContext.Provider>
    );
};
