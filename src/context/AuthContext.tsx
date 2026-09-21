import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CandidateProfile, Company } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isCandidate: boolean;
  isEmployer: boolean;
  isAdmin: boolean;
  token: string | null;
  login: (email: string, role?: UserRole) => Promise<void>;
  register: (fullName: string, email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchDemoUser: (role: UserRole) => void;
  candidateProfile: CandidateProfile | null;
  companyProfile: Company | null;
  refreshProfiles: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return {
      id: 'cand_1',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      role: 'Candidate',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T10:00:00Z',
    };
  });
  const [token, setToken] = useState<string | null>('jwt_mock_token_cand_1');
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<Company | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('jobportal_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const role = user?.role || 'Candidate';
  const isCandidate = role === 'Candidate';
  const isEmployer = role === 'Employer';
  const isAdmin = role === 'Admin';

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem('jobportal_user_id', user.id);
    } else {
      localStorage.removeItem('jobportal_user_id');
    }
    if (token) {
      localStorage.setItem('jobportal_token', token);
    } else {
      localStorage.removeItem('jobportal_token');
    }
  }, [user?.id, token]);

  useEffect(() => {
    localStorage.setItem('jobportal_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const refreshProfiles = async () => {
    if (!user) return;
    try {
      if (user.role === 'Candidate') {
        const res = await fetch('/api/candidate/profile', {
          headers: { 
            'Authorization': `Bearer ${token || 'jwt_mock_token_cand_1'}`,
            'x-user-id': user.id 
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidateProfile(data);
        }
      } else if (user.role === 'Employer') {
        const res = await fetch('/api/employer/profile', {
          headers: { 
            'Authorization': `Bearer ${token || 'jwt_mock_token_emp_1'}`,
            'x-user-id': user.id 
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCompanyProfile(data);
        }
      }
    } catch (e) {
      console.error('Error refreshing profiles:', e);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, [user?.id, user?.role]);

  const login = async (email: string, targetRole?: UserRole) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.user) {
        if (targetRole && data.user.role !== targetRole) {
          data.user.role = targetRole;
          if (targetRole === 'Admin') {
            data.user.id = 'admin_1';
            data.user.fullName = 'System Administrator (Ops)';
          } else if (targetRole === 'Employer') {
            data.user.id = 'emp_1';
            data.user.fullName = 'Sarah Jenkins';
          } else {
            data.user.id = 'cand_1';
            data.user.fullName = 'Alex Morgan';
          }
        }
        setUser(data.user);
        setToken(data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const register = async (fullName: string, email: string, userRole: UserRole) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, role: userRole })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'Admin') {
      setUser({
        id: 'admin_1',
        email: 'admin.ops@talentnexus.io',
        fullName: 'System Administrator (Ops)',
        role: 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T00:00:00Z',
      });
    } else if (newRole === 'Employer') {
      setUser({
        id: 'emp_1',
        email: 'sarah.jenkins@nexustech.io',
        fullName: 'Sarah Jenkins',
        role: 'Employer',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-05T08:30:00Z',
      });
    } else {
      setUser({
        id: 'cand_1',
        email: 'alex.morgan@example.com',
        fullName: 'Alex Morgan',
        role: 'Candidate',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-10T10:00:00Z',
      });
    }
  };

  const switchDemoUser = (targetRole: UserRole) => {
    switchRole(targetRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCandidateProfile(null);
    setCompanyProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isCandidate,
      isEmployer,
      isAdmin,
      token,
      login,
      register,
      logout,
      switchRole,
      switchDemoUser,
      candidateProfile,
      companyProfile,
      refreshProfiles,
      theme,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
