'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('token');
      if (stored) setToken(stored);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email });  // DEBUG
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',  // ✅ Force POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', response.status);  // DEBUG
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error response:', errorText);  // DEBUG
      throw new Error(errorText);
    }
    
    const data = await response.json();
    console.log('Login success data:', data);  // DEBUG
    
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    await login(email, password);  // Auto-login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used in AuthProvider');
  return context;
};
