import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/auth';
import { API_URL } from '@/constants/api';

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    checkToken();
  }, []);

  const checkToken = async () => {
    const storedToken = await SecureStore.getItemAsync('userToken');
    if (storedToken) {
      // Validate token with backend
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: { 
            'Authorization': `Bearer ${storedToken}` 
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        // Token invalid, logout
        await logout();
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);