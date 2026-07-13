import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import PostDetails from './pages/PostDetails';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Terminal, Cpu, Github, Youtube, Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <Router>
      <div 
        id="app-root-container" 
        className={`flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300 ${theme}`}
      >
        {/* Navigation bar */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/write" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </div>

        {/* Clean Developer Footer */}
        <footer id="app-footer" className="border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-slate-950/40 py-8 text-center text-xs text-slate-600 dark:text-slate-450 font-mono transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
            
            {/* Social Logo Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://github.com/razwonkabir" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-md hover:scale-110 duration-250"
                title="Github"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://www.youtube.com/@apnosmedia2022" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-full bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-md hover:scale-110 duration-250"
                title="Youtube"
              >
                <Youtube className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://www.instagram.com/infosec_famim" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-full bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-450 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-red-500 hover:to-purple-600 hover:text-white transition-all shadow-md hover:scale-110 duration-250"
                title="Instagram"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://wa.me/8801794538510" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-full bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-md hover:scale-110 duration-250"
                title="Whatsapp"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </a>
              <a 
                href="mailto:inbox@razwon.xyz" 
                className="p-2.5 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-md hover:scale-110 duration-250"
                title="Email"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
              <a 
                href="tel:+8801794538510" 
                className="p-2.5 rounded-full bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 hover:bg-teal-500 hover:text-white transition-all shadow-md hover:scale-110 duration-250"
                title="Phone"
              >
                <Phone className="h-4.5 w-4.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60 dark:border-slate-900/60 pt-6">
              <div className="flex items-center gap-1.5 font-sans">
                <Terminal className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <span className="font-vibes text-xl text-indigo-600 dark:text-indigo-400 select-none">Razwon Kabir Famim</span>
                  <span>&copy; 2026, All rights reserved.</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>
                  Developed and Designed by{' '}
                  <a 
                    href="https://github.com/razwonkabir" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-extrabold hover:opacity-80 transition-all"
                  >
                    RK GRAPHICS
                  </a>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
