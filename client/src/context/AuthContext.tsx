import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

export interface RetailerProfile {
  _id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  address: {
    street: string;
    locality: string;
    city: string;
    pincode: string;
    state: string;
  };
  gstin?: string;
  creditLimit: number;
  outstandingBalance: number;
  creditStatus: 'GOOD' | 'WATCH' | 'BLOCKED';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'RETAILER' | 'ORDER_DESK' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  retailer?: RetailerProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<User>;
  loginWithGoogleDemo: () => Promise<User>;
  requestOtp: (phone: string) => Promise<{ mockOtp?: string; isDemoMode?: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('stockora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('stockora_token')));
  const skipNextMeFetchRef = useRef<boolean>(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skipNextMeFetchRef.current) {
      skipNextMeFetchRef.current = false;
      setIsLoading(false);
      return;
    }

    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const setAuthSession = (newToken: string, newUser: User): User => {
    skipNextMeFetchRef.current = true;
    localStorage.setItem('stockora_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  const login = async (phone: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { phone, password });
    if (res.data.success && res.data.user) {
      return setAuthSession(res.data.token, res.data.user);
    }
    throw new Error('Unable to sign in with the provided credentials.');
  };

  const loginWithGoogleDemo = async (): Promise<User> => {
    const res = await api.post('/auth/google', { demoAccount: true });
    if (res.data.success && res.data.user) {
      return setAuthSession(res.data.token, res.data.user);
    }
    throw new Error('Unable to complete Google sign-in.');
  };

  const requestOtp = async (phone: string) => {
    const res = await api.post('/auth/otp/request', { phone });
    return {
      mockOtp: res.data.mockOtp,
      isDemoMode: res.data.isDemoMode,
      message: res.data.message,
    };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<User> => {
    const res = await api.post('/auth/otp/verify', { phone, otp });
    if (res.data.success && res.data.user) {
      return setAuthSession(res.data.token, res.data.user);
    }
    throw new Error('Verification code check failed.');
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post('/auth/register', data);
    if (res.data.success && res.data.user) {
      return setAuthSession(res.data.token, res.data.user);
    }
    throw new Error('Account registration could not be completed.');
  };

  const logout = () => {
    localStorage.removeItem('stockora_token');
    setToken(null);
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogleDemo,
        requestOtp,
        verifyOtp,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
