import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, UpdateUserRequest } from '../types';
import { auth as authApi, getToken, setToken, users as usersApi } from '../api/client';

const USER_KEY = 'meepled.user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: UpdateUserRequest) => Promise<User>;
  loginModalOpen: boolean;
  loginReturnTo: string | null;
  openLoginModal: (returnTo?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState<string | null>(null);

  function openLoginModal(returnTo?: string) {
    setLoginReturnTo(returnTo ?? null);
    setLoginModalOpen(true);
  }
  function closeLoginModal() {
    setLoginModalOpen(false);
    setLoginReturnTo(null);
  }

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(email: string, password: string): Promise<User> {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(name: string, email: string, password: string): Promise<User> {
    const res = await authApi.register({ name, email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  function logout(): void {
    setToken(null);
    setUser(null);
  }

  async function updateUser(data: UpdateUserRequest): Promise<User> {
    const res = await usersApi.updateMe(data);
    if (res.token) setToken(res.token);
    const updated: User = res.user ?? { ...user!, ...data };
    setUser(updated);
    return updated;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!getToken(),
      isOwner: user?.role === 'CafeOwner' || user?.role === 'Admin',
      isAdmin: user?.role === 'Admin',
      login,
      register,
      logout,
      updateUser,
      loginModalOpen,
      loginReturnTo,
      openLoginModal,
      closeLoginModal,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loginModalOpen, loginReturnTo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
