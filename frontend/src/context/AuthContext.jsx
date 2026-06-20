import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      const data = res.data;
      // data: { token, tokenType, userId, name, email, role }
      const userData = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem('cc_token', data.token);
      localStorage.setItem('cc_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      return { success: true, message: res.data?.message || 'Registration successful!' };
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.details
        ? Object.values(data.details).join(', ')
        : 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isOfficer = user?.role === 'OFFICER';
  const canManage = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isOfficer, canManage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
