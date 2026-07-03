import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import PostDetails from './pages/PostDetails';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Terminal, Cpu } from 'lucide-react';
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
        <footer id="app-footer" className="border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-slate-950/40 py-8 text-center text-xs text-slate-500 dark:text-slate-600 font-mono transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-indigo-500" />
              <span>Razwon Blog &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
              <span>Engineered with React 19, Vite, &amp; Cloud Firestore</span>
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
