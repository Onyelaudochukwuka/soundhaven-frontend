// useComments.ts
import { useContext } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { CommentsContextType } from '../../types/types';

// Add pagination handling

export const useComments = (): CommentsContextType => {
  const context = useContext(CommentsContext);
  // console.log('useComments hook used');

  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
