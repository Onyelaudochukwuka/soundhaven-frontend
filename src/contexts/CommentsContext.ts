// CommentsContext.ts
import { createContext } from 'react';
import { CommentsContextType } from '../../types/types';

const CommentsContext = createContext<CommentsContextType | null>(null);

export default CommentsContext;