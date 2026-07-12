import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, name: 'John Fleet Manager', email: 'admin@transitops.com', role: 'fleet_manager' },
  { id: 2, name: 'Alex Driver', email: 'driver@transitops.com', role: 'driver' },
  { id: 3, name: 'Sarah Safety', email: 'safety@transitops.com', role: 'safety_officer' },
  { id: 4, name: 'Frank Finance', email: 'finance@transitops.com', role: 'financial_analyst' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Basic email authentication mock
    const foundUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('transitops_user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, mockUsers: MOCK_USERS }}>
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
