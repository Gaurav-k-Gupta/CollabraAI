import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

// Create the context
export const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('userData');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Function to update user and sync with localStorage
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  };

  // Function to clear user data (for logout)
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken'); // Also clear auth token
  };

  // Initialize user on app load
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token && !user) {
        try {
          // Verify token is still valid and fetch fresh user data
          const response = await axios.get('/users/profile')
          
          if (response.ok) {
            const userData = await response.json();
            updateUser(userData);
          } else {
            // Token is invalid, clear everything
            clearUser();
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // On error, clear stored data to avoid issues
          clearUser();
        }
      }
      
      setLoading(false);
    };

    initializeUser();
  }, []);

  // Sync localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
    }
  }, [user]);

  const contextValue = {
    user,
    setUser: updateUser, // Use the enhanced setter
    clearUser,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('authToken')
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};