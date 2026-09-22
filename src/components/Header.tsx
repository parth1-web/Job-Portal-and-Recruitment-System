import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Building2, 
  UserCheck, 
  Menu, 
  X,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Notification } from '../types';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: 'home' | 'jobs' | 'dashboard' | 'notifications') => void;
  unreadNotificationsCount?: number;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onJobSelect?: (jobId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  unreadNotificationsCount,
  onOpenAuthModal,
}) => {
  const { user, role, logout, switchRole, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.items || []);
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notifList.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'x-user-id': user.id }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c101d]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:border-blue-400 transition-all">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                    TALENT<span className="text-blue-600 dark:text-blue-400">.</span>NEXUS
                  </span>
                </div>
                <p className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-widest -mt-0.5">
                  Recruitment System
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectTab('home')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              
              <button
                onClick={() => onSelectTab('jobs')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'jobs'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Find Jobs
              </button>

              {user && (
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {user.role === 'Admin' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      Admin Control Center
                    </>
                  ) : user.role === 'Employer' ? (
                    <>
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Employer Hub
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Candidate Portal
                    </>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold hidden sm:inline text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-bold hidden sm:inline text-blue-600">Dark</span>
                </>
              )}
            </button>

            {/* Notifications Menu */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {(unreadNotificationsCount || unreadCount) > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount || unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 6).map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markSingleAsRead(notif.id);
                              onSelectTab('dashboard');
                              setShowNotifMenu(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors ${
                              !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 text-center">
                      <button
                        onClick={() => {
                          onSelectTab('notifications');
                          setShowNotifMenu(false);
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons or User Avatar */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff`}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      Dashboard & Pipeline
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('notifications');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-slate-400" />
                      Notifications
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Active Mode
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            switchRole('Candidate');
                            setShowUserMenu(false);
                            onSelectTab('dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded text-center cursor-pointer ${
                            role === 'Candidate'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Candidate
                        </button>
                        <button
                          onClick={() => {
                            switchRole('Employer');
                            setShowUserMenu(false);
                            onSelectTab('dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded text-center cursor-pointer ${
                            role === 'Employer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Employer
                        </button>
                        <button
                          onClick={() => {
                            switchRole('Admin');
                            setShowUserMenu(false);
                            onSelectTab('dashboard');
                          }}
                          className={`px-1.5 py-1 text-[10px] font-bold rounded text-center cursor-pointer ${
                            role === 'Admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        onSelectTab('home');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'home' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { onSelectTab('jobs'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'jobs' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Find Jobs
            </button>
            {user && (
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.role === 'Admin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Admin Control Center
                  </>
                ) : user.role === 'Employer' ? (
                  <>
                    <Layers className="w-4 h-4 text-blue-500" />
                    Employer Hub
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-blue-500" />
                    Candidate Portal
                  </>
                )}
              </button>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Theme</span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-500" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            {user && (
              <div className="pt-2 px-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { switchRole('Candidate'); setMobileMenuOpen(false); }}
                    className={`py-1.5 text-xs font-bold rounded-lg text-center ${role === 'Candidate' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    Candidate
                  </button>
                  <button
                    onClick={() => { switchRole('Employer'); setMobileMenuOpen(false); }}
                    className={`py-1.5 text-xs font-bold rounded-lg text-center ${role === 'Employer' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    Employer
                  </button>
                  <button
                    onClick={() => { switchRole('Admin'); setMobileMenuOpen(false); }}
                    className={`py-1.5 text-xs font-bold rounded-lg text-center ${role === 'Admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
