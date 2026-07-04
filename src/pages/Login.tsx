import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { motion } from 'motion/react';
import { ShieldAlert, Terminal, KeyRound } from 'lucide-react';

const WHITELIST_EMAILS = [
  'termremo@gmail.com',
  'razwon2009@gmail.com',
  'sew123ty@gmail.com',
  'apnosmedia2022@gmail.com'
];

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in as authorized admin, auto-redirect to /write
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && WHITELIST_EMAILS.includes(user.email)) {
        navigate('/write');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user && user.email && WHITELIST_EMAILS.includes(user.email)) {
        navigate('/write');
      } else {
        // Sign out immediately if not in the whitelist
        await signOut(auth);
        setError("Unauthorized Admin Account: This Google account does not have developer credentials on this platform.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "An error occurred during Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-4 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
            <KeyRound className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Admin Authenticator
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-mono text-center">
            Skyline 2026 Blog Secure Admin Engine Login
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-xl dark:shadow-2xl transition-colors duration-300 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/60 font-mono">
              <Terminal className="h-3 w-3 text-indigo-500" />
              <span>STATUS: AUTHORISED_ONLY!</span>
            </span>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500 flex items-start gap-3"
            >
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold text-red-650 dark:text-red-400">Access Restricted</p>
                <p className="mt-0.5 text-red-500 dark:text-red-300/90 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans text-justify">
            This platform uses strict Google Whitelist authentication. Access is strictly limited to authorized administrative developers.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            id="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3.5 px-4 font-semibold text-sm shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-slate-300/20"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-display">Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
