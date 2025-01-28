import { createContext, useState, useContext, useEffect } from 'react';
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

  const checkToken = async (tokenToCheck: string | null) => {
    if (tokenToCheck) {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${tokenToCheck}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          await logout();
        }
      } catch (error) {
        console.error(error);
        await logout();
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  // Check token on initial load and when token changes
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      setToken(storedToken);
      await checkToken(storedToken);
    };

    initializeAuth();
  }, []);

  // Check token whenever it changes
  useEffect(() => {
    checkToken(token);
  }, [token]);

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
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);