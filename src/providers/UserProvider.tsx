import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

// Define a type for the user context state
interface UserContextState {
  user: User | null; // Allowing user to be null
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Initialize the context with a default value
const UserContext = createContext<UserContextState>({
  user: null, // This is now valid as user can be User | null
  login: async () => {},
  logout: () => {}
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Corrected type for useState

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://your-backend-url.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        setUser(data.user); // Set user data here
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
