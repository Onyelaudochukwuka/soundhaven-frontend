import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

// Define a type for Comment
type Comment = {
  id: number; // or any other unique identifier
  text: string;
  // Include other fields as needed
};

interface CommentsPanelProps {
  trackId: number; // Assuming trackId is a number
  show: boolean; // Prop to control visibility
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ trackId, show }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async () => {
    // Placeholder for fetching data
    const newComments: Comment[] = []; // Replace with actual data fetching logic
    setComments(prevComments => [...prevComments, ...newComments]);
    setHasMore(newComments.length > 0);
  };

  useEffect(() => {
    fetchComments();
  }, [trackId, fetchComments]); // Include fetchComments in the dependency array

  const panelClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
    show ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div className={panelClasses}>
      <InfiniteScroll
        dataLength={comments.length}
        next={fetchComments}
        hasMore={hasMore}
        loader={<h4 className="text-center">Loading...</h4>}
      >
        {comments.map((comment, index) => (
          <div key={index} className="p-4 border-b border-gray-200">
            {comment.text} {/* Replace with actual comment structure */}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CommentsPanel;
