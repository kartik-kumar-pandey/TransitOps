import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const INITIAL_MOCK_USERS = [
  { id: 1, name: 'John Fleet Manager', email: 'fleet@transit.com', role: 'fleet_manager' },
  { id: 2, name: 'Alex Driver', email: 'driver@transit.com', role: 'driver' },
  { id: 3, name: 'Sarah Safety', email: 'safety@transit.com', role: 'safety_officer' },
  { id: 4, name: 'Frank Finance', email: 'finance@transit.com', role: 'financial_analyst' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'transit123' })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('transitops_user', JSON.stringify(data.user));
        localStorage.setItem('transitops_token', data.token);
        return { success: true, user: data.user };
      }

      const err = await res.json();
      return { success: false, error: err.error || 'Invalid email or password' };
    } catch (e) {
      return { success: false, error: 'Cannot connect to the backend server. Make sure it is running on port 5000.' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('transitops_user', JSON.stringify(data.user));
        localStorage.setItem('transitops_token', data.token);
        return { success: true, user: data.user };
      }

      const err = await res.json();
      return { success: false, error: err.error || 'Signup failed' };
    } catch (e) {
      return { success: false, error: 'Cannot connect to the backend server. Make sure it is running on port 5000.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
    localStorage.removeItem('transitops_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, mockUsers: INITIAL_MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
