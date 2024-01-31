import React, { useState, useEffect, useContext } from 'react';
// import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Comment } from '@/types';
import { fetchComments, addComment } from './commentsAPI';
import { PlaybackContext } from '@/contexts/PlaybackContext';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsPanelProps {
  trackId: number;
  show: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ show, onClose, trackId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { user, token } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (trackId) {
      fetchInitialComments(trackId, page, limit);
    }
  }, [trackId, page, limit]);

  const fetchInitialComments = async (trackId, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetchComments(trackId, page, limit);
      console.log("Fetched response:", response); // Check the structure of the response
  
      // If the response is an array, then it's just comments
      if (Array.isArray(response)) {
        setComments(response);
        // Determine how to set 'hasMore' here
      } else {
        // If the response is an object with comments and hasMore
        const { comments, hasMore } = response;
        if (Array.isArray(comments)) {
          setComments(comments);
          setHasMore(hasMore);
        } else {
          console.error("Invalid comments format:", comments);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };  

  const loadMoreComments = async () => {
    if (loading || !hasMore) return;
    setPage(currentPage => currentPage + 1);
    setLoading(true);
    try {
      const { comments: newComments, hasMore: newHasMore } = await fetchComments(trackId, page + 1, limit);
      console.log('New comments:', newComments);
  
      if (Array.isArray(newComments)) {
        setComments(prevComments => [...prevComments, ...newComments]);
        setHasMore(newHasMore);
      } else {
        console.error("Expected newComments to be an array, received:", newComments);
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
      setError('Error loading more comments');
    } finally {
      setLoading(false);
    }
  };  
  
  useEffect(() => {
    console.log('Comments state updated:', comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      setError('');
      if (!token) throw new Error('No token found'); // Check for token
  
      const postedComment = await addComment(trackId, userId, newComment, token);
      console.log('Posted comment:', postedComment);  // Log to verify the structure
      if (postedComment) {
        setComments(prev => prev ? [postedComment, ...prev] : [postedComment]);  // Make sure prev is always an array
      }
      setNewComment(''); // Reset the comment input field
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while posting the comment');
      }
    }
  };

  const panelClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-10 ${show ? 'translate-x-0 overflow-y-auto' : 'translate-x-full'}`;


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
  };

  return (
    // <div className='fixed right-0 top-0 w-64 h-full bg-white'>
    <div className={panelClasses}>
      <button onClick={onClose} className="p-2">Close</button>
      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border"
          placeholder="Write a comment..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Post
        </button>
      </form>
      {error && <p className="text-red-500 p-4">{error}</p>}
      {comments?.length > 0 ? (
        <InfiniteScroll
          dataLength={comments.length}
          next={loadMoreComments}
          hasMore={hasMore}
          loader={loading && <h4>Loading...</h4>}
        >
          {comments.map(comment => {
            console.log('Rendering comment:', comment.id, comment.createdAt); // Log to check each comment's key
            return (
              <div key={`${comment.id}-${comment.createdAt}`} className="comment p-4 border-b border-gray-200">
                <p><strong>{comment.userName || 'Anonymous'}</strong> <em>{new Date(comment.createdAt).toLocaleString()}</em></p>
                <p className="mt-2">{comment.content}</p>
              </div>
            );
          })}
        </InfiniteScroll>
      ) : (
        !loading && <p className="text-center p-4">No comments...yet :)</p>
      )}
    </div>
    /* </div> */
  );
      } 

export default CommentsPanel;
