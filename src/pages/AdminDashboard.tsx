import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  PenTool, 
  Eye, 
  Send, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Image as ImageIcon,
  FolderOpen,
  Tag as TagIcon,
  Clock,
  User,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  
  // Form State
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('Development');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [content, setContent] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Set default author name based on logged-in user
  useEffect(() => {
    if (auth.currentUser) {
      setAuthor(auth.currentUser.displayName || auth.currentUser.email || 'Admin');
    }
  }, []);

  // Responsiveness tab adjustment
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && activeTab === 'split') {
        setActiveTab('write');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // call initially
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Article Title is required.");
      return;
    }
    if (!summary.trim()) {
      setError("Brief Catchphrase Summary is required.");
      return;
    }
    if (!content.trim()) {
      setError("Publication Markdown Content is required.");
      return;
    }

    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const categories = categoriesInput
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);

    const newPost: BlogPost = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ["General"],
      categories: categories.length > 0 ? categories : ["General"],
      author: author.trim() || "Admin",
      createdAt: Date.now(),
      readTime: readTime.trim() || "5 min read",
      coverImage: coverImage.trim() || undefined
    };

    try {
      const postsCol = collection(db, 'posts');
      await addDoc(postsCol, newPost);
      setSuccess(true);
      
      // Reset Form fields
      setTitle('');
      setCoverImage('');
      setSummary('');
      setTagsInput('');
      setCategoriesInput('Development');
      setContent('');
      
      // Delay navigation to let them see success
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error("Firebase write error caught in CMS dashboard:", err);
      // Gracefully show to the user rather than throwing/crashing the console
      setError(err?.message || "Failed to submit post. Please verify your Firestore security rules & network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">Interactive CMS Engine</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Publish Workspace</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compose with real-time synchronized Markdown previewing.</p>
          </div>

          {/* Layout control tabs */}
          <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-900/60 p-1 border border-slate-300/40 dark:border-slate-800/80 self-start shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'write' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </header>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-400 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">CMS Error Intercepted</p>
              <p className="mt-0.5 text-red-750 dark:text-red-300/90 leading-relaxed font-mono text-xs">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
            <Sparkles className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Document Published Successfully</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-300/90 leading-relaxed">The publication has been successfully persisted to Cloud Firestore. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Content Workspace Splitter */}
        <div className={`grid gap-8 ${activeTab === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* LEFT: FORM INPUTS */}
          {(activeTab === 'write' || activeTab === 'split') && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="title-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Article Title</label>
                  <input
                    type="text"
                    id="title-field"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Architecting Distributed Hydration in React 19 Servers"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="cover-image-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Cover Image URL</span>
                  </label>
                  <input
                    type="url"
                    id="cover-image-field"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Metadata Column (Author, Categories, Tags, ReadTime) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="author-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>Author Name</span>
                    </label>
                    <input
                      type="text"
                      id="author-field"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Razwon"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="readtime-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Estimated Read Time</span>
                    </label>
                    <input
                      type="text"
                      id="readtime-field"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="categories-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Category / Categories</span>
                    </label>
                    <input
                      type="text"
                      id="categories-field"
                      required
                      value={categoriesInput}
                      onChange={(e) => setCategoriesInput(e.target.value)}
                      placeholder="e.g. Development, Architecture, UI"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tags-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <TagIcon className="h-3.5 w-3.5" />
                      <span>Tags (comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      id="tags-field"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. React, NextJS, ServerComponents"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Brief Catchphrase Summary */}
                <div className="space-y-1.5">
                  <label htmlFor="summary-field" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Brief Catchphrase Summary</label>
                  <textarea
                    id="summary-field"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    placeholder="Provide a concise one-line summary displayed on homepage cards."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Markdown Editor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="content-editor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Markdown Content Body</label>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/40 dark:border-slate-900">
                      {content.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    id="content-editor"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder="Write using valid GitHub Flavored Markdown..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-mono"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    id="publish-cms-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <span>Publishing to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Publish Document</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* RIGHT: REAL-TIME MARKDOWN PREVIEW ENGINE */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm dark:shadow-2xl overflow-y-auto max-h-[85vh] sticky top-24"
            >
              {title.trim() ? (
                <div className="space-y-6">
                  {/* Article header metadata inside preview */}
                  <div className="pb-5 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-500/10 mb-4 font-mono">
                      Live Preview Mode
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h1>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 italic border-l-2 border-indigo-500/50 pl-4 bg-slate-50/50 dark:bg-slate-950/20 py-2 rounded-r-lg">{summary || "Write a brief summary to see it formatted."}</p>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{author || 'Admin'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{readTime || '5 min read'}</span>
                      </span>
                    </div>

                    {/* Preview Categories and Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {categoriesInput.split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                        <span key={cat} className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/5">
                          <FolderOpen className="h-2.5 w-2.5" />
                          <span>{cat}</span>
                        </span>
                      ))}
                      {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-indigo-500/5">
                          <TagIcon className="h-2.5 w-2.5" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Render Cover Image in Preview if exists */}
                  {coverImage.trim() && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm max-h-[250px]">
                      <img 
                        src={coverImage.trim()} 
                        alt="Article Cover" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Render Markdown Content inside preview */}
                  <div className="markdown-body prose max-w-none pt-2">
                    {content.trim() ? (
                      <Markdown>{content}</Markdown>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 italic font-mono text-xs">Write some Markdown content in the editor to inspect live typesetting...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 flex flex-col items-center justify-center gap-4">
                  <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 p-4 border border-indigo-100/50 dark:border-indigo-900/20">
                    <Eye className="h-8 w-8 text-indigo-500/60" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">Live Preview Hub</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                    Once you provide a title and begin writing, your rendered article will synchronize here in real time.
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
