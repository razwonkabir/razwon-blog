import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  ChevronRight,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Link2Off,
  Table,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Edit,
  Plus,
  Search,
  X,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  
  // Existing publications state
  const [existingPosts, setExistingPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
  const [success, setSuccess] = useState<string | null>(null);

  // Set default author name based on logged-in user
  useEffect(() => {
    if (auth.currentUser) {
      setAuthor(auth.currentUser.displayName || auth.currentUser.email || 'Admin');
    }
  }, []);

  // Fetch posts from Firestore for managing
  const fetchExistingPosts = async () => {
    setPostsLoading(true);
    try {
      const postsCol = collection(db, 'posts');
      const snapshot = await getDocs(postsCol);
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          categories: data.categories || ['General'],
          tags: data.tags || ['General']
        };
      }) as BlogPost[];
      
      // Sort by createdAt descending
      list.sort((a, b) => b.createdAt - a.createdAt);
      setExistingPosts(list);
    } catch (err) {
      console.error("Error fetching existing posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingPosts();
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

  // Markdown Selection Insertion Logic
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    // Default placeholder if nothing selected
    const placeholder = selectedText || (before.includes('#') ? 'Heading' : 'text');
    const replacement = before + placeholder + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newContent);
    
    // Refocus and select the newly inserted syntax/text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + placeholder.length
      );
    }, 50);
  };

  // Click on existing post to edit
  const handleEditClick = (post: BlogPost) => {
    if (!post.id) return;
    setEditingPostId(post.id);
    setTitle(post.title);
    setCoverImage(post.coverImage || '');
    setSummary(post.summary);
    setTagsInput(post.tags.join(', '));
    setCategoriesInput(post.categories.join(', '));
    setAuthor(post.author);
    setReadTime(post.readTime);
    setContent(post.content);
    
    setError(null);
    setSuccess(null);

    // Switch to active composing tab
    if (window.innerWidth < 1024) {
      setActiveTab('write');
    } else {
      setActiveTab('split');
    }

    // Scroll to the main composer form
    const element = document.getElementById('title-field');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setCoverImage('');
    setSummary('');
    setTagsInput('');
    setCategoriesInput('Development');
    setContent('');
    if (auth.currentUser) {
      setAuthor(auth.currentUser.displayName || auth.currentUser.email || 'Admin');
    }
  };

  // Delete document from Firestore
  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmation = window.confirm(`Are you absolutely sure you want to permanently delete "${postTitle}"?\n\nThis action cannot be undone.`);
    if (!confirmation) return;

    setError(null);
    setSuccess(null);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setSuccess(`"${postTitle}" has been successfully deleted.`);
      
      // If we were editing this exact post, reset the form
      if (editingPostId === postId) {
        handleCancelEdit();
      }

      // Update local state list
      setExistingPosts(prev => prev.filter(p => p.id !== postId));

      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err: any) {
      console.error("Error deleting post:", err);
      setError(err?.message || "Failed to delete post. Please verify security permissions.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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

    const newPostData = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ["General"],
      categories: categories.length > 0 ? categories : ["General"],
      author: author.trim() || "Admin",
      readTime: readTime.trim() || "5 min read",
      coverImage: coverImage.trim() || undefined
    };

    try {
      if (editingPostId) {
        // UPDATE EXISTING POST
        const postDocRef = doc(db, 'posts', editingPostId);
        await updateDoc(postDocRef, newPostData);
        setSuccess(`"${title.trim()}" updated successfully.`);
        setEditingPostId(null);
      } else {
        // CREATE NEW POST
        const postsCol = collection(db, 'posts');
        await addDoc(postsCol, {
          ...newPostData,
          createdAt: Date.now()
        });
        setSuccess(`"${title.trim()}" published successfully.`);
      }
      
      // Reset Form fields
      setTitle('');
      setCoverImage('');
      setSummary('');
      setTagsInput('');
      setCategoriesInput('Development');
      setContent('');
      
      // Refresh posts list
      await fetchExistingPosts();
    } catch (err: any) {
      console.error("Firebase write error caught in CMS dashboard:", err);
      setError(err?.message || "Failed to save post. Please verify your Firestore security rules.");
    } finally {
      setSubmitting(false);
    }
  };

  // Local filtered posts search for manage section
  const filteredManagePosts = existingPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {editingPostId ? 'Edit Article Workspace' : 'Publish Workspace'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {editingPostId ? `Modifying post ID: ${editingPostId}` : 'Compose and manage competitive programming, algorithms, and SBIR publications.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Cancel edit mode indicator */}
            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-100 transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel Editing</span>
              </button>
            )}

            {/* Layout control tabs */}
            <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-900/60 p-1 border border-slate-300/40 dark:border-slate-800/80 shadow-inner">
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
          </div>
        </header>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-400 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">CMS Error Intercepted</p>
              <p className="mt-0.5 text-red-700 dark:text-red-305 leading-relaxed font-mono text-xs">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
            <Sparkles className="h-5 w-5 shrink-0 animate-bounce" />
            <div>
              <p className="font-semibold">Action Performed Successfully</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-300/90 leading-relaxed">{success}</p>
            </div>
          </div>
        )}

        {/* Content Workspace Splitter */}
        <div className={`grid gap-8 mb-12 ${activeTab === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* LEFT: FORM INPUTS */}
          {(activeTab === 'write' || activeTab === 'split') && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl"
            >
              {editingPostId && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/40 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                  <span>Currently editing: <strong>{title || 'Untitled Post'}</strong></span>
                  <button onClick={handleCancelEdit} className="text-[10px] uppercase tracking-wider bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-850 px-2 py-1 rounded">Cancel</button>
                </div>
              )}

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
                    placeholder="e.g. Master C++ Templates and Compile-Time Logic"
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
                      placeholder="e.g. Development, SBIR, CP"
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
                      placeholder="e.g. C++, Algorithms, ICPC"
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

                {/* Markdown Editor & Formatting Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="content-editor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Markdown Content Body</label>
                    
                    <div className="flex gap-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      <span>{content.length} characters</span>
                      <span>•</span>
                      <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  {/* RICH FORMATTING TOOLBAR (Markdown Assistant) */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 border border-slate-200 dark:border-slate-850 bg-slate-100/85 dark:bg-slate-950/80 rounded-t-xl">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => insertMarkdown('**', '**')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => insertMarkdown('*', '*')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button
                      type="button"
                      title="Heading 1"
                      onClick={() => insertMarkdown('# ', '\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 font-bold text-xs cursor-pointer"
                    >
                      <Heading1 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => insertMarkdown('## ', '\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 font-bold text-xs cursor-pointer"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button
                      type="button"
                      title="Unordered List"
                      onClick={() => insertMarkdown('- ', '\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Ordered List"
                      onClick={() => insertMarkdown('1. ', '\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Blockquote"
                      onClick={() => insertMarkdown('> ', '\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button
                      type="button"
                      title="Insert Link"
                      onClick={() => insertMarkdown('[', '](https://)')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Image"
                      onClick={() => insertMarkdown('![alt description](', ')')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Code Block"
                      onClick={() => insertMarkdown('```cpp\n', '\n```')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 font-mono text-xs cursor-pointer font-bold"
                    >
                      code
                    </button>
                    <button
                      type="button"
                      title="Horizontal Divider"
                      onClick={() => insertMarkdown('\n---\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Table Grid"
                      onClick={() => insertMarkdown('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Table className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button
                      type="button"
                      title="Align Center"
                      onClick={() => insertMarkdown('<div align="center">\n', '\n</div>')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => insertMarkdown('<div align="right">\n', '\n</div>')}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    id="content-editor"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder="Write using valid GitHub Flavored Markdown..."
                    className="w-full rounded-b-xl border-x border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-mono"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-between items-center">
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {editingPostId ? '🔒 Locked to update query' : '✨ Instant Cloud Sync'}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    id="publish-cms-btn"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{editingPostId ? 'Save Article Changes' : 'Publish Document'}</span>
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

        {/* SECTION: MANAGE PUBLICATIONS AND ARCHIVE LIST */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <span>Manage Existing Publications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Edit, delete, or browse all articles hosted on Firestore.</p>
            </div>

            {/* Quick search inside dashboard */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles to edit..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {postsLoading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              <p className="text-xs text-slate-500 font-mono">Synchronizing publications...</p>
            </div>
          ) : filteredManagePosts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-mono text-xs">
              No matching publications found on Firestore.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 font-mono">Article Title</th>
                    <th className="py-3 px-4 font-mono">Category</th>
                    <th className="py-3 px-4 font-mono">Author</th>
                    <th className="py-3 px-4 font-mono">Published Date</th>
                    <th className="py-3 px-4 font-mono text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredManagePosts.map((post) => (
                    <tr 
                      key={post.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors ${
                        editingPostId === post.id ? 'bg-indigo-500/5 dark:bg-indigo-500/5 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="max-w-md truncate">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-md">
                          {post.summary}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-450 border border-slate-200/50 dark:border-slate-800/40">
                          {post.categories[0] || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{post.author}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(post)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-indigo-500 hover:text-white dark:bg-slate-800/60 dark:hover:bg-indigo-600 dark:hover:text-white py-1.5 px-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id!, post.title)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-600 dark:hover:text-white py-1.5 px-2.5 text-[11px] font-bold text-red-600 dark:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </motion.div>
  );
}
