import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { validateToken, login as loginService } from '@/services/apiService';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      console.log("Token from localStorage:", token); // Debugging
  
      if (token) {
        try {
          const userData = await validateToken(token);
          console.log("User data from token validation:", userData);
          setUser(userData);
        } catch (error) {
          console.error('Error validating token:', error);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found in localStorage');
      }
    };
  
    fetchUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      console.log("Login response data:", data); // Log the entire response data
  
      // Check for missing data or access token
      if (!data) {
        console.error('No data received from login service');
        throw new Error('No data received from login service');
      }
      
      if (!data.access_token) {
        console.error('No access token in response:', data);
        throw new Error('No access token in response');
      }
  
      // If data and token are present, proceed to set them
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { ...context, user, login, logout };
};
