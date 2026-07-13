import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const WHITELIST_EMAILS = [
  'inbox@razwon.xyz',
  'razwon2009@gmail.com',
  'sew123ty@gmail.com',
  'apnosmedia2022@gmail.com'
];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-mono text-slate-500 dark:text-slate-400">Verifying authorization credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.email || !WHITELIST_EMAILS.includes(user.email)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
