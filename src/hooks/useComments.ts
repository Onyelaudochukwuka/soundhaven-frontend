// useComments.ts
import { useContext } from 'react';
import CommentsContext from '@/contexts/CommentsContext';
import { CommentsContextType } from '../../types/types';

export const useComments = (): CommentsContextType => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
