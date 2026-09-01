import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { label: 'Employee (Aarav Sharma)', email: 'aarav.sharma@enterprise.com', role: 'EMPLOYEE' },
  { label: 'Reporting Manager (Vikram Singh)', email: 'vikram.singh@enterprise.com', role: 'REPORTING_MANAGER' },
  { label: 'IT Administrator (Karan Patel)', email: 'it.admin@enterprise.com', role: 'DEPARTMENT_STAFF' },
  { label: 'Finance Officer (Sunita Joshi)', email: 'finance.officer@enterprise.com', role: 'DEPARTMENT_STAFF' },
  { label: 'Department Director (Meera Nair)', email: 'director.ops@enterprise.com', role: 'DEPARTMENT_HEAD' },
  { label: 'Operations Manager (Siddharth Malhotra)', email: 'ops.manager@enterprise.com', role: 'OPERATIONS_MANAGER' },
  { label: 'System Administrator (Admin User)', email: 'sys.admin@enterprise.com', role: 'SYSTEM_ADMIN' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vesa_token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      setupSocket(token);
    } else {
      setLoading(false);
      if (socket) socket.disconnect();
    }
  }, [token]);

  const setupSocket = (authToken) => {
    try {
      const newSocket = io('/', {
        auth: { token: authToken },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('[WebSocket] Authenticated WebSocket connected');
      });

      newSocket.on('notification', (data) => {
        fetchNotifications();
      });

      setSocket(newSocket);
    } catch (e) {
      console.error('Socket connection error:', e);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentUser();
      setUser(res.data.user);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to load user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      // Silent error for notifications
    }
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const newToken = res.data.token;
    localStorage.setItem('vesa_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    fetchNotifications();
    setupSocket(newToken);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    const newToken = res.data.token;
    localStorage.setItem('vesa_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    fetchNotifications();
    setupSocket(newToken);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('vesa_token');
    if (socket) socket.disconnect();
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const switchDemoUser = async (email) => {
    await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        notifications,
        unreadCount,
        refreshNotifications: fetchNotifications,
        socket
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
