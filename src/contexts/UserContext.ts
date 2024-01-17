// UserContext.tsx
import React, { createContext, useContext } from 'react';
import { User } from '@/types';

interface UserContextState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextState | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
