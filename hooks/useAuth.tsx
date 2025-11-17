import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<string | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error("Failed to verify user token", error);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);


  const login = async (email: string, pass: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();
      if (!response.ok) {
        return data.message || 'Invalid credentials';
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return null; // No error
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
         return 'Unable to connect to the server. Please ensure the backend is running.';
      }
      return error.message || 'An unexpected error occurred during login.';
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, role: 'patient' }),
      });

      const data = await response.json();
      if (!response.ok) {
        return data.message || 'Registration failed';
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return null; // No error
    } catch (error: any) {
       console.error('Registration failed:', error);
       if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
          return 'Unable to connect to the server. Please ensure the backend is running.';
       }
       return error.message || 'An unexpected error occurred during registration.';
    }
  };

  const logout = async () => {
    try {
        if (token) {
            await fetch(`${API_BASE_URL}/api/auth/logout`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    } catch (error) {
        console.error("Logout failed on server, logging out client-side.", error);
    } finally {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};