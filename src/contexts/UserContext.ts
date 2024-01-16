import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UserContextState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextState>({} as UserContextState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    try {
      // Simulate API call and response
      const userData: User = { /* API response data */ };
      setUser(userData);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    // Implement logout logic
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
  </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);