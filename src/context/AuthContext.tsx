import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as auth from '../services/auth';
import type { LoginInput, RegisterInput, User } from '../types';

interface AuthContextValue {
  user: User | null;
  register: (data: RegisterInput) => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.getSessionUser());

  const value: AuthContextValue = {
    user,
    register: async (data) => setUser(await auth.register(data)),
    login: async (data) => setUser(await auth.login(data)),
    logout: () => {
      auth.logout();
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
