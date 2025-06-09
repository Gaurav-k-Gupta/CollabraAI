import React, { createContext, useContext, useState } from 'react';

// Create the context
export const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Example functions
  // const login = (userData) => {
  //   setUser(userData);
  //   // Optionally save to localStorage or cookie
  // };

  // const logout = () => {
  //   setUser(null);
  //   // Optionally clear localStorage or cookie
  // };

  return (
    <UserContext.Provider value={{ user , setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context

