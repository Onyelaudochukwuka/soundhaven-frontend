// src/contexts/AuthProvider.tsx
import React, { useState, ReactNode, FC, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { User } from '../../types/types';
import * as apiService from '@/services/apiService'; // Import the apiService

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Initialize token state

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token'); // Get token from localStorage

    console.log("Retrieved token in AuthProvider:", storedToken); // Log the retrieved token
  
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  
    if (storedToken) {
      setToken(storedToken); // Set token in state
    }
  }, []);  

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await apiService.register({ name, email, password });
      setUser(data.user);
      console.log("User set in AuthProvider:", data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

const login = async (email: string, password: string) => {
  try {
    console.log("Login process started");
    const data = await apiService.login(email, password);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
      localStorage.setItem('token', data.token); // Optionally store token if needed
      setUser(data.user);
      setToken(data.token); 
      console.log("User state updated in AuthProvider with user:", data.user, "Token:", data.token);
    } else {
      console.log("Login response did not include user data");
    }
  } catch (error) {
    console.error('Login error in AuthProvider:', error);
    throw error; // Rethrowing the error for further handling, if necessary
  }
};

const logout = async () => {
  try {
    await apiService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
