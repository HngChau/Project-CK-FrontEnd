import { createContext, useContext, useState } from 'react';
import * as auth from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getSessionUser());

  const value = {
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

export const useAuth = () => useContext(AuthContext);
