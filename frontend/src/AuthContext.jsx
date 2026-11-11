import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hs_user'));
    } catch {
      return null;
    }
  });

  const login = (data) => {
    localStorage.setItem('hs_token', data.token);
    const u = { id: data.id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem('hs_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) =>
  role === 'STUDENT' ? '/student' : role === 'WARDEN' ? '/warden' : role === 'TECHNICIAN' ? '/technician' : '/login';
