import React, {useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';

type Comment = {
  id: number;
  text: string;
  username: string; // User's name
  timestamp: string; // Timestamp of the comment
  avatarUrl: string; // URL of the user's avatar
};

interface CommentsPanelProps {
  trackId: number;
  show: boolean;
  onClose: () => void; // Function to close the panel
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ trackId, show, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Replace with your API call logic
      const response = await fetch(`/api/comments?trackId=${trackId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const newComments: Comment[] = await response.json();
      setComments(prevComments => [...prevComments, ...newComments]);
      setHasMore(newComments.length > 0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while fetching comments');
      }
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setError('');
      // Replace with your API call for posting a comment
      const response = await fetch('/api/post-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, text: newComment }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      const postedComment: Comment = await response.json();
      setComments(prev => [postedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while posting the comment');
      }
    }
  };

  const panelClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
    show ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div className={panelClasses}>
      <button onClick={onClose} className="p-2">Close</button>
      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border"
          placeholder="Write a comment..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Post
        </button>
      </form>
      {error && <p className="text-red-500 p-4">{error}</p>}
      <InfiniteScroll
        dataLength={comments.length}
        next={fetchComments}
        hasMore={hasMore}
        loader={loading && <h4 className="text-center">Loading...</h4>}
      >
        {comments.map(comment => (
          <div key={comment.id} className="p-4 border-b border-gray-200">
            <div className="flex items-center">
            <Image src={comment.avatarUrl} alt={`${comment.username}'s avatar`} className="w-10 h-10 rounded-full mr-3" layout='fill' />
              <div>
                <div className="font-bold">{comment.username}</div>
                <div className="text-sm text-gray-600">{new Date(comment.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <p className="mt-2">{comment.text}</p>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CommentsPanel;
