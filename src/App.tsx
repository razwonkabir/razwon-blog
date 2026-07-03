import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import PostDetails from './pages/PostDetails';
import About from './pages/About';
import Admin from './pages/Admin';
import { Terminal, Github, Mail, Cpu } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div id="app-root-container" className="flex min-h-screen flex-col bg-slate-950 font-sans antialiased text-slate-100">
        {/* Navigation bar */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>

        {/* Clean Developer Footer */}
        <footer id="app-footer" className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600 font-mono">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-indigo-500" />
              <span>Razwon Blog &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-slate-700" />
              <span>Engineered with React 19, Vite, &amp; Cloud Firestore</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
