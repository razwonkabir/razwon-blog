import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Check, FolderOpen } from 'lucide-react';

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost({ 
            id: docSnap.id, 
            ...data,
            categories: data.categories || ['General'],
            tags: data.tags || ['General']
          } as BlogPost);
        } else {
          console.error("No such document exists in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 gap-4 transition-colors duration-300">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Loading publication details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-4 text-center transition-colors duration-300">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Publication Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">The article you are looking for might have been deleted or the URL is incorrect.</p>
        <Link 
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-4xl">
        {/* Navigation Action Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-900">
          <Link 
            to="/" 
            id="back-to-home-btn"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to articles</span>
          </Link>

          <button
            onClick={handleShare}
            id="share-article-btn"
            className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share URL</span>
              </>
            )}
          </button>
        </div>

        {/* Post Metadata Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories && post.categories.map(c => (
              <span key={c} className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/10">
                <FolderOpen className="h-3 w-3" />
                <span>{c}</span>
              </span>
            ))}
            {post.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-indigo-500/10">
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-800 pl-4 italic">
            {post.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400 dark:text-slate-600" />
              <span>Written by <strong className="text-slate-700 dark:text-slate-300">{post.author}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-600" />
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400 dark:text-slate-600" />
              <span>{post.readTime}</span>
            </span>
          </div>
        </header>

        {/* Render Cover Image if exists */}
        {post.coverImage && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-md">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full max-h-[400px] object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Render Markdown Content */}
        <article className="prose max-w-none">
          <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</Markdown>
          </div>
        </article>

        {/* Footer info card */}
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-900 pt-8 text-center">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors duration-300">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Thanks for reading!</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">This publication is dynamic and backed by a live Google Cloud Firestore document.</p>
            <Link 
              to="/" 
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:border dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Explore other publications</span>
            </Link>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
