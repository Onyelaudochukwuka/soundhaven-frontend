import { Comment } from "../../../types/types";
import { backendUrl } from "@/services/apiService";
import { handleResponse } from "@/services/apiService";

// Fetch comments with pagination
export const fetchComments = async (trackId, page = 1, limit = 10) => {
  console.log(`Fetching comments for trackId: ${trackId}, page: ${page}, limit: ${limit}`); // Log input parameters

  if (trackId == null || trackId === 0) {
    console.error('fetchComments called with invalid trackId:', trackId);
    throw new Error('Invalid or no track selected');
  }

  const response = await fetch(`/api/comments?trackId=${trackId}&page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  const data = await response.json(); // This should now include both comments and hasMore flag
  console.log('Fetched comments data:', data); // Log comments data including hasMore flag
  return data;
};


// Comment functionality
export const addComment = async (trackId: number, userId: number, text: string, token: string) => {
  const url = '/api/comments';  // Pointing to Next.js API route
  console.log(`Sending POST request to ${url}`);
  console.log(`Request payload:`, { trackId, userId, text, token });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Make sure to send the token
      },
      body: JSON.stringify({ trackId, userId, text }),
    });

    console.log('Response:', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const postedComment = await response.json();  // Parse and return the new comment
    console.log('Posted comment:', postedComment); // Log posted comment
    return postedComment;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding comment:', error.message);
    }
    throw error;
  }
};

export const editComment = async (commentId: number, text: string) => {
  try {
    const response = await fetch(`${backendUrl}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error editing comment:', error.message);
    }
    throw error;
  }
};

export const deleteComment = async (commentId: number) => {
  try {
    const response = await fetch(`${backendUrl}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error: unknown) {
    if
      (error instanceof Error) {
      console.error('Error deleting comment:', error.message);
    }
    throw error;
  }
};