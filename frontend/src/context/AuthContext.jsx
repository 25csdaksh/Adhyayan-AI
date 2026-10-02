import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => tokenStorage.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on startup
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = tokenStorage.getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getMe();
        if (isMounted && response.data?.user) {
          setUser(response.data.user);
          setTokenState(storedToken);
        }
      } catch (err) {
        console.warn('[Auth] Stored session invalid or expired:', err.message);
        tokenStorage.removeToken();
        if (isMounted) {
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const { user: userData, token: userToken } = response.data;

    tokenStorage.setToken(userToken);
    setTokenState(userToken);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (userDataInput) => {
    const response = await authService.register(userDataInput);
    const { user: userData, token: userToken } = response.data;

    tokenStorage.setToken(userToken);
    setTokenState(userToken);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Non-blocking logout acknowledgment
    } finally {
      tokenStorage.removeToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    const response = await authService.updateProfile(updates);
    const updatedUser = response.data.user;
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.warn('[Auth] Failed to refresh user profile:', err.message);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
