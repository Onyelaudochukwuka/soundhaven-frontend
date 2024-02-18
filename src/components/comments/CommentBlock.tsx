import React from 'react';
import { Comment } from '../../../types/types';

const CommentBlock: React.FC<{ comment: Comment }> = ({ comment }) => {
  // A simple date formatting function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

    // Helper function to convert seconds to mm:ss format
    const formatTime = (seconds?: number): string => {
      if (typeof seconds !== 'number') {
        return '';
      }
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="border-b border-gray-200 py-4">
        <div className="font-bold">{comment.userName || 'Anonymous'}</div>
        {/* Conditionally render marker time if available */}
        {comment.marker?.start !== undefined && (
        <div className="text-xs text-blue-500">Marker at {formatTime(comment.marker.start)}</div>
      )}
        <p className="mt-1">{comment.content}</p>
        <div className="comment-time">Time: {comment.marker?.time} seconds</div>
      </div>
    );
  };

export default CommentBlock;
