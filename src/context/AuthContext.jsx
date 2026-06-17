import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth as authApi, getToken, setToken, users as usersApi } from '../api/client';

const USER_KEY = 'meepled.user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(name, email, password) {
    const res = await authApi.register({ name, email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  async function updateUser(data) {
    const res = await usersApi.updateMe(data);
    if (res.token) setToken(res.token);
    const updated = res.user ?? { ...user, ...data };
    setUser(updated);
    return updated;
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!getToken(),
      isOwner: user?.role === 'CafeOwner' || user?.role === 'Admin',
      isAdmin: user?.role === 'Admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
