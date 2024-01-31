import { createContext, useContext } from 'react';
import { User } from '@/types';

interface AuthContextState {
  user: User | null;
  token: string | null; // Include token
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const defaultContextValue: AuthContextState = {
  user: null,
  token: null, // Ensure token is included in the context's default state
  login: async () => { throw new Error("login function not implemented"); },
  logout: () => { throw new Error("logout function not implemented"); },
  register: async () => { throw new Error("register function not implemented"); }
};

export const AuthContext = createContext<AuthContextState>(defaultContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
