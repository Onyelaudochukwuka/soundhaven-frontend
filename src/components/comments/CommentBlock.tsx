import React from 'react';

interface CommentProps {
  comment: {
    id: number;
    content: string;
    userName: string;
    createdAt: string; // Assuming ISO string format, adjust as necessary
  };
}

const CommentBlock: React.FC<CommentProps> = ({ comment }) => {
  // A simple date formatting function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="font-bold">{comment.userName || 'Anonymous'}</div>
      <p className="mt-1">{comment.content}</p>
      <div className="text-sm text-gray-500 mt-2">{formatDate(comment.createdAt)}</div>
    </div>
  );
};

export default CommentBlock;
