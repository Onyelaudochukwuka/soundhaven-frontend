import React, { useState, ReactNode, FC, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { User } from '../../types/types';
import * as apiService from '@/services/apiService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
 
  useEffect(() => {
    const initializeAuthState = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      setLoading(false); // Update loading state after initialization
    };
  
    initializeAuthState();
  }, []);  

  const register = async (name: string, email: string, password: string) => {
    setLoading(true); // Set loading true during registration process
    try {
      const data = await apiService.register({ name, email, password });
      if (data && data.user && data.access_token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);
        setUser(data.user);
        setToken(data.access_token);
      } else {
        throw new Error('Registration failed: No data received from register service');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false); 
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, access_token } = await apiService.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', access_token);
      setUser(user);
      setToken(access_token);
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Allow consuming components (e.g., LoginForm) to handle this error (e.g., to display error messages)
    } finally {
      setLoading(false);
    }
  };  

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Provide loading state alongside user and token
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
