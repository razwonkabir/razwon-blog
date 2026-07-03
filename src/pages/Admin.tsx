import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { PenTool, Eye, Send, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  
  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [author, setAuthor] = useState('Razwon');
  const [readTime, setReadTime] = useState('5 min read');
  const [content, setContent] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) {
      setError("Title, Summary, and Markdown Content are required fields.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newPost: BlogPost = {
      title,
      summary,
      content,
      tags: tags.length > 0 ? tags : ["General"],
      author,
      createdAt: Date.now(),
      readTime
    };

    try {
      const postsCol = collection(db, 'posts');
      await addDoc(postsCol, newPost);
      // Navigate to homepage on success
      navigate('/');
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to submit post to Firestore database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Admin Control Center</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight mt-1">Publish New Article</h1>
            <p className="mt-1 text-sm text-slate-400">Compose, preview, and persist modern markdown publications to Firestore.</p>
          </div>

          {/* Tab buttons */}
          <div className="flex rounded-lg bg-slate-900/60 p-1 border border-slate-900 self-start">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1.5 rounded-md px-4.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Write Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-md px-4.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview Live</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Error saving document</p>
              <p className="mt-0.5 text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Form or Preview container */}
          <div className={`${activeTab === 'write' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            {activeTab === 'write' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title-field" className="text-sm font-semibold text-slate-300">Article Title</label>
                  <input
                    type="text"
                    id="title-field"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Building microfrontends in React 19"
                    className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:bg-slate-900/60"
                  />
                </div>

                {/* Grid info parameters */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="author-field" className="text-sm font-semibold text-slate-300">Author Name</label>
                    <input
                      type="text"
                      id="author-field"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Razwon"
                      className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="readtime-field" className="text-sm font-semibold text-slate-300">Estimate Read Time</label>
                    <input
                      type="text"
                      id="readtime-field"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <label htmlFor="summary-field" className="text-sm font-semibold text-slate-300">Brief Summary</label>
                  <textarea
                    id="summary-field"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    placeholder="Provide a catchphrase summary description for the homepage card grid."
                    className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:bg-slate-900/60"
                  />
                </div>

                {/* Tags (comma separated) */}
                <div className="space-y-2">
                  <label htmlFor="tags-field" className="text-sm font-semibold text-slate-300">Topics / Tags <span className="text-xs text-slate-500">(comma-separated)</span></label>
                  <input
                    type="text"
                    id="tags-field"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. React, WebDev, Design"
                    className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:bg-slate-900/60"
                  />
                </div>

                {/* Markdown Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="content-editor" className="text-sm font-semibold text-slate-300">Publication Markdown Content</label>
                    <span className="text-xs font-mono text-slate-500">{content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    id="content-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder="# Markdown headings are supported&#10;&#10;Write clean markdown directly in this field. Custom styling parses headers, code snippets, quote blocks, and list items dynamically."
                    className="w-full rounded-xl border border-slate-900 bg-slate-900/30 px-4 py-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:bg-slate-900/60"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  id="submit-article-btn"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 transition-all hover:from-indigo-500 hover:to-purple-500 active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Persisting to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publish to Blog</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Big Live Preview */
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 sm:p-8 shadow-2xl">
                {title ? (
                  <>
                    <header className="mb-8 pb-4 border-b border-slate-800/60">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/10">
                        Preview Mode
                      </span>
                      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-4">{title}</h1>
                      <p className="mt-3 text-sm text-slate-400 italic border-l-2 border-slate-800 pl-4">{summary || "No summary provided."}</p>
                      <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
                        <span>By {author}</span>
                        <span>•</span>
                        <span>{readTime}</span>
                      </div>
                    </header>
                    <div className="markdown-body">
                      {content ? <Markdown>{content}</Markdown> : <p className="text-slate-500 italic">No markdown body content has been written yet.</p>}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-slate-500 italic">Write some details first to inspect live rendering preview.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Tips Panel (only when write editor is active) */}
          {activeTab === 'write' && (
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 shadow-xl">
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Markdown Guide</span>
                </h3>
                <ul className="mt-4 text-xs text-slate-400 space-y-2 font-mono">
                  <li><strong className="text-indigo-400"># Header 1</strong></li>
                  <li><strong className="text-indigo-400">## Header 2</strong></li>
                  <li><strong className="text-indigo-400">**bold text**</strong></li>
                  <li><strong className="text-indigo-400">*italic text*</strong></li>
                  <li><strong className="text-indigo-400">- Bullet Item</strong></li>
                  <li><strong className="text-indigo-400">1. Ordered Item</strong></li>
                  <li><strong className="text-indigo-400">&gt; Quote blocks</strong></li>
                  <li><strong className="text-indigo-400">`inline code`</strong></li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500">
                  Compose posts inside standard formatted Markdown blocks. Code snippets render in premium dark panels.
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-6 shadow-xl">
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  <span>Firestore Connection</span>
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Publications are written in real-time to the <code className="text-indigo-400 text-[10px] font-mono">posts</code> collection of the <strong className="text-slate-300">famim-blog</strong> project database instance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
