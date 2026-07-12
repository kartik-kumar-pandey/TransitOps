import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const INITIAL_MOCK_USERS = [
  { id: 1, name: 'John Fleet Manager', email: 'admin@transitops.com', role: 'fleet_manager' },
  { id: 2, name: 'Alex Driver', email: 'driver@transitops.com', role: 'driver' },
  { id: 3, name: 'Sarah Safety', email: 'safety@transitops.com', role: 'safety_officer' },
  { id: 4, name: 'Frank Finance', email: 'finance@transitops.com', role: 'financial_analyst' }
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const custom = localStorage.getItem('transitops_custom_users');
    if (custom) {
      try {
        return [...INITIAL_MOCK_USERS, ...JSON.parse(custom)];
      } catch (e) {
        return INITIAL_MOCK_USERS;
      }
    }
    return INITIAL_MOCK_USERS;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('transitops_user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password, role) => {
    const trimmedEmail = email.toLowerCase().trim();
    const exists = users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: trimmedEmail,
      role: role || 'fleet_manager'
    };

    // Update state
    setUsers(prev => {
      const updated = [...prev, newUser];
      // Save only custom users in custom_users storage to avoid duplicating initial mocks
      const customOnly = updated.filter(u => typeof u.id === 'string' && u.id.startsWith('user_'));
      localStorage.setItem('transitops_custom_users', JSON.stringify(customOnly));
      return updated;
    });

    // Auto-login after registration
    setUser(newUser);
    localStorage.setItem('transitops_user', JSON.stringify(newUser));

    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, mockUsers: INITIAL_MOCK_USERS }}>
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


