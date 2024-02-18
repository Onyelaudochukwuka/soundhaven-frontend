import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/hooks/useComments';
import CommentBlock from './CommentBlock';

interface CommentsPanelProps {
  trackId: number;
  show: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ show, onClose, trackId }) => {
  const { user, token, loading: authLoading } = useAuth();
  const { comments, addComment, fetchComments } = useComments();

  const [newComment, setNewComment] = useState<string>('');
  // const [hasMore, setHasMore] = useState<boolean>(true);
  // const [page, setPage] = useState<number>(1);
  // const [limit] = useState<number>(10);

  const commentsArray = comments || [];
  // const commentsArray = [{id: 1, userName: "Test User", content: "This is a test comment."}];


  useEffect(() => {
    if (trackId > 0) {
      fetchComments(trackId, 1, 10);
    }
  }, [trackId]);

  // useEffect(() => {
  //   console.log("CommentsPanel comments: ", comments);
  // }, [comments]);

  // Submitting new comments
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() && token && user) {
      await addComment(trackId, user.id, newComment, token);
      setNewComment('');
      fetchComments(trackId, 1, 10); // Refetch comments after adding a new one
    }
  };

  // Load more comments (for infinite scroll)
  const loadMoreComments = () => {
    setPage(prevPage => prevPage + 1);
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
  };

  if (authLoading) {
    return <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-4">Loading comments...</div>;
  }

  if (!show) return null;

  // console.log(commentsArray);

  return (
    <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-10 ${show ? 'translate-x-0 overflow-y-auto' : 'translate-x-full'}`}>
      <button onClick={onClose} className="p-2">Close</button>
      <div className="p-4">
            <form onSubmit={handleSubmit} className={!user || !token ? 'opacity-50 pointer-events-none' : ''}>
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
            {comments.length > 0 ? (
          comments.map((comment) => <CommentBlock key={comment.id} comment={comment} />)
        ) : (
          <p>No comments fetched or state not updating correctly.</p>
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;