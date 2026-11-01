import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as authService from '../services/auth';
import type { LoginInput, RegisterInput, User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (data: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  updateName: (name: string) => void;
  updateEmail: (email: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSessionUser());

    const requireUser = (): User => {
        if (!user) throw new authService.AuthError('Bạn chưa đăng nhập', 'form');
        return user;
    };

    const value: AuthContextValue = {
        user,
        login: async (input) => {
            setUser(await authService.login(input));
        },
        register: (input) => authService.register(input),
        logout: () => {
            authService.logout();
            setUser(null);
        },
        updateName: (name) => {
            setUser(authService.updateName(requireUser().id, name));
        },
        updateEmail: async (email, currentPassword) => {
            setUser(await authService.updateEmail(requireUser().id, email, currentPassword));
        },
        changePassword: (currentPassword, newPassword) =>
            authService.changePassword(requireUser().id, currentPassword, newPassword),
    };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
