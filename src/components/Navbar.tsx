import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Terminal, Globe, PenTool, Home, BookOpen, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Blog', path: '/posts', icon: BookOpen },
    { name: 'About', path: '/about', icon: User },
    { name: 'Write', path: '/admin', icon: PenTool },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" id="brand-logo" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-white hover:opacity-90">
            <Terminal className="h-6 w-6 text-indigo-500" />
            <span>Razwon</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav id="main-navigation" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`nav-link-${item.name.toLowerCase()}`}
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  active ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-indigo-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* External Link Section (IOI Command Center) */}
        <div className="flex items-center gap-4">
          <a
            href="https://ioi.razwon.xyz"
            target="_blank"
            rel="noopener noreferrer"
            id="ioi-command-center-link"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/20 active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-300"></span>
            </span>
            <span className="font-mono">IOI Command Center</span>
            <Globe className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
          </a>
        </div>
      </div>

      {/* Mobile Nav Header (just standard items styled for mobile if screen is small) */}
      <div className="md:hidden flex justify-around border-t border-slate-800/60 bg-slate-950 py-2.5 px-4">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`mobile-nav-link-${item.name.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                active ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
