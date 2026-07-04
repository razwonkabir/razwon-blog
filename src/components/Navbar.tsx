import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Globe, 
  Home, 
  BookOpen, 
  User, 
  Sun, 
  Moon, 
  Search, 
  Settings, 
  LogOut,
  ShieldCheck,
  Code
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import siteLogo from '../assets/images/site_logo_1783046576955.png';

const WHITELIST_EMAILS = [
  'termremo@gmail.com',
  'razwon2009@gmail.com',
  'sew123ty@gmail.com',
  'apnosmedia2022@gmail.com'
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchVal, setSearchVal] = useState('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && WHITELIST_EMAILS.includes(user.email)) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, iconColor: 'text-sky-500 dark:text-sky-400', activeClass: 'text-sky-600 dark:text-sky-400', hoverClass: 'hover:text-sky-600 dark:hover:text-sky-400' },
    { name: 'Blog', path: '/posts', icon: BookOpen, iconColor: 'text-emerald-500 dark:text-emerald-400', activeClass: 'text-emerald-600 dark:text-emerald-400', hoverClass: 'hover:text-emerald-600 dark:hover:text-emerald-400' },
    { name: 'About', path: '/about', icon: User, iconColor: 'text-amber-500 dark:text-amber-400', activeClass: 'text-amber-600 dark:text-amber-400', hoverClass: 'hover:text-amber-600 dark:hover:text-amber-400' },
    { name: 'CMD CENTER', path: 'https://ioi.razwon.xyz', icon: Code, isExternal: true, iconColor: 'text-indigo-500 dark:text-indigo-400', hoverClass: 'hover:text-indigo-600 dark:hover:text-indigo-400' },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Site Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" id="brand-logo" className="flex items-center gap-2 font-display text-lg sm:text-2xl font-extrabold tracking-tight hover:opacity-90">
            <img 
              src={siteLogo} 
              alt="Skyline Logo" 
              className="h-8 w-8 rounded-full object-cover border border-indigo-500/50 shadow animate-pulse" 
              referrerPolicy="no-referrer"
            />
            <span className="inline bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Skyline 2026</span>
          </Link>
        </div>

        {/* Navigation Items (Public view: Home, Blog, About, and IOI External) */}
        <nav id="main-navigation" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            if (item.isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 ${item.hoverClass}`}
                >
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                  <span>{item.name}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`nav-link-${item.name.toLowerCase()}`}
                className={`relative flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
                  active ? item.activeClass : `text-slate-500 hover:text-slate-900 dark:text-slate-400 ${item.hoverClass}`
                }`}
              >
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                <span>{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search, Theme Toggle, Admin Controls, & IOI Command Center */}
        <div className="flex items-center gap-3">
          {/* Header Search Box */}
          <form onSubmit={handleSearch} className="relative hidden sm:block w-36 md:w-44 lg:w-48">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/40 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </form>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-mode-toggle-btn"
            aria-label="Toggle Theme"
            className="rounded-full p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Admin Panel Icon (Dedicated Settings icon for lazy auth) */}
          <Link
            to="/write"
            id="admin-panel-link"
            aria-label="Admin Panel"
            className={`rounded-full p-2 border transition-colors cursor-pointer ${
              isActive('/write') || isActive('/admin')
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50'
                : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200/50 dark:border-slate-800/60'
            }`}
          >
            <Settings className="h-4 w-4 animate-hover" />
          </Link>

          {/* Conditional Admin Profile Avatar & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <img
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                alt="Admin Avatar"
                className="h-7 w-7 rounded-full object-cover border border-indigo-500 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={handleLogout}
                id="navbar-logout-btn"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/40 cursor-pointer transition-all active:scale-95"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar bottom */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 py-2.5 px-4 transition-colors duration-300">
        {navItems.map((item) => {
          const active = isActive(item.path);
          if (item.isExternal) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                id={`mobile-nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 transition-colors ${item.hoverClass}`}
              >
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                <span>{item.name}</span>
              </a>
            );
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`mobile-nav-link-${item.name.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                active ? item.activeClass : `text-slate-500 dark:text-slate-400 ${item.hoverClass}`
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
