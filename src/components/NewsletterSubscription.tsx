import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Send, Mail, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_subscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const emailLower = email.trim().toLowerCase();
      
      // Check if email already exists in subscriptions
      const q = query(collection(db, 'subscriptions'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setStatus('already_subscribed');
        setSubmitting(false);
        return;
      }

      // Add subscription document to Firestore
      await addDoc(collection(db, 'subscriptions'), {
        email: emailLower,
        subscribedAt: Date.now(),
        source: 'skyline_blog'
      });

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Unable to register subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 shadow-lg dark:shadow-2xl transition-colors duration-300">
      {/* Animated gradient accent border at the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-indigo-500"></div>

      {/* Background radial soft glows */}
      <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-rose-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>STAY INFORMED</span>
            </span>
          </div>
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Subscribe to SBIR &amp; Competitive Programming Updates
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Get notified on advanced algorithmic insights, C++ optimizations, systems architecture deep-dives, and research developments regarding Socio-Bio-Informatics and Remediology (SBIR).
          </p>
        </div>

        <div className="w-full md:max-w-md shrink-0">
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-indigo-500/15 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Notification Messages */}
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl"
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Subscription successful! Welcome to the loop.</span>
              </motion.div>
            )}

            {status === 'already_subscribed' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-3 rounded-xl"
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>You are already subscribed to this newsletter!</span>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-start gap-2 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 p-3 rounded-xl"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
