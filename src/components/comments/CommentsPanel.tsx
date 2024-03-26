import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/hooks/UseComments';
import CommentBlock from './CommentBlock';
import { useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface CommentsPanelProps {
  trackId: number;
  show: boolean;
  onClose: () => void;
  comments: Comment[];
  addComment: (trackId: number, userId: number, content: string, token: string) => Promise<void>;
  regionsRef: React.MutableRefObject<RegionsPlugin | null>;
  waveSurferRef: React.MutableRefObject<WaveSurfer | null>;
  handleCommentClick: (commentId: number) => void;
  onSelectComment: (commentId: number) => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  trackId,
  show,
  onClose,
  regionsRef,
  waveSurferRef,
  onSelectComment,
}) => {
  const { user, token, loading: authLoading } = useAuth();
  // TODO: Refactor so CommentsProvider handles newComment and setNewComment.
  const { 
    comments, 
    setComments, 
    addComment, 
    fetchCommentsAndMarkers, 
    selectedCommentId, 
    setSelectedCommentId,
    selectedRegionId,
    setSelectedRegionId, 
    regionCommentMap,
    handleSelectComment,
  } = useComments(waveSurferRef, regionsRef);

  const [newComment, setNewComment] = useState<string>('');
  const commentBlockRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Function to assign a ref to the ref object
    const setCommentBlockRef = (element, id) => {
      if (element) {
        commentBlockRefs.current[id] = element;
      }
    };

  // const [hasMore, setHasMore] = useState<boolean>(true);
  // const [page, setPage] = useState<number>(1);
  // const [limit] = useState<number>(10);

  const commentsArray = comments || [];
  // const commentsArray = [{id: 1, userName: "Test User", content: "This is a test comment."}];


  useEffect(() => {
    if (trackId > 0) {
      fetchCommentsAndMarkers(trackId, 1, 10);
    }
  }, [trackId]);

  useEffect(() => {
    if (selectedCommentId && commentBlockRefs.current[selectedCommentId]) {
      // Scroll the selected comment into view
      const selectedElement = commentBlockRefs.current[selectedCommentId];
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // Adjust to 'nearest' if 'center' causes issues
      });
    }
  }, [selectedCommentId]);
  

  // useEffect(() => {
  //   console.log("CommentsPanel comments: ", comments);
  // }, [comments]);

  // Submitting new comments
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() && token && user) {
      await addComment(trackId, user.id, newComment, token);
      setNewComment('');
      fetchCommentsAndMarkers(trackId, 1, 10); // Refetch comments after adding a new one
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

  const handleCommentClick = useCallback((commentId: number) => {
    if (!waveSurferRef.current || !regionsRef.current) return;

    const regions = regionsRef.current.getRegions();
    const selectedRegion = regions.find((region) =>
      Object.entries(regionCommentMap).some(([regionId, cId]) => cId === commentId && region.id === regionId)
    );

    if (selectedRegion) {
      selectedRegion.update({ color: 'rgba(0, 255, 0, 0.7)' });
      waveSurferRef.current.seekTo(selectedRegion.start / waveSurferRef.current.getDuration());
    }

    // Call the parent component's onSelectComment handler
    onSelectComment(commentId); 
  }, [regionCommentMap, onSelectComment]); 

  useEffect(() => {
    console.log('Selected Comment ID in CommentsPanel:', selectedCommentId);
  }, [selectedCommentId]);

  useEffect(() => {
    console.log('Comments:', comments);
  }, [comments]);

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
          comments.map((comment, index) => (
            <CommentBlock
            key={comment.id}
            comment={comment}
            onSelectComment={handleSelectComment}
            isSelected={comment.id === selectedCommentId}
            handleCommentClick={handleCommentClick}
            ref={(el) => setCommentBlockRef(el, comment.id)}
            index={index}
            />)
          )
        ) : (
          <p>No comments fetched or state not updating correctly.</p>
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;