import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/hooks/useComments';

interface CommentsPanelProps {
  trackId: number;
  show: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ show, onClose, trackId }) => {
  const { user, token, loading: authLoading } = useAuth(); // Renamed loading to authLoading for clarity
  console.log("Auth State in CommentsPanel:", { user, token });
  const { comments, addComment, fetchComments, loading: commentsLoading, error } = useComments();

  const [newComment, setNewComment] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Fetch comments when the component mounts or trackId changes
  useEffect(() => {
    if (trackId) {
      fetchComments(trackId, page, limit);
    }
  }, [trackId, page, limit, fetchComments]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() && token) {
      await addComment(trackId, user?.id, newComment, token);
      setNewComment('');
      fetchComments(trackId, 1, limit); // Refetch comments to include the new one
    }
  };

  const loadMoreComments = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const panelClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-10 ${show ? 'translate-x-0 overflow-y-auto' : 'translate-x-full'}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
  };

    if (authLoading) {
    return <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-4">Loading comments...</div>;
  }

  return (
    <div className={panelClasses}>
      <button onClick={onClose} className="p-2">Close</button>
      <div className="p-4">
        <form onSubmit={handleSubmit} className={`${!user || !token ? 'opacity-50 pointer-events-none' : ''}`}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border"
            placeholder="Write a comment..."
            disabled={!user || !token}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={!user || !token}>
            Post
          </button>
        </form>
        {(!user || !token) && <p className="text-red-500">You must log in to post a comment.</p>}
        {commentsLoading ? (
          <div>Loading comments...</div>
        ) : (
          comments?.length > 0 ? (
            <InfiniteScroll
              dataLength={comments.length}
              next={loadMoreComments}
              hasMore={hasMore}
              loader={<h4>Loading...</h4>}
            >
              {comments.map(comment => (
                <div key={`${comment.id}-${comment.createdAt}`} className="comment p-4 border-b border-gray-200">
                  <p><strong>{comment.userName}</strong> <em>{new Date(comment.createdAt).toLocaleString()}</em></p>
                  <p className="mt-2">{comment.content}</p>
                </div>
              ))}
            </InfiniteScroll>
          ) : <p className="text-center p-4">No comments...yet</p>
        )}
      </div>
      {error && <p className="text-red-500 p-4">{error}</p>}
    </div>
  );
};

export default CommentsPanel;