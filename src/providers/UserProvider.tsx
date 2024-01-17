// UserProvider.tsx
import React, { useState, ReactNode } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { User } from '@/types';

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      // Assuming the response contains a user object and a token
      sessionStorage.setItem('token', data.token); // Save the token for future requests
      setUser(data.user); // Update the user state
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error (e.g., show a notification to the user)
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally handle logout error
    }
    sessionStorage.removeItem('token'); // Clear the stored token
    setUser(null); // Clear the user state
  };
  

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
