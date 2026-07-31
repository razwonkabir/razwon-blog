import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { renderMathInMarkdown } from '../lib/math';
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
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table,
  Minus,
  AlignCenter,
  AlignRight,
  AlignLeft,
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  Search,
  X,
  FileText,
  Save,
  RotateCcw,
  RotateCw,
  Copy,
  History,
  Eraser,
  Grid,
  Calendar,
  Columns,
  Info,
  Type,
  FileCode,
  Shield,
  Activity,
  Maximize2,
  MessageSquare,
  Play,
  Hash,
  Smile,
  Calculator
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

  // MS Word Custom States
  const [wordTab, setWordTab] = useState<'home' | 'insert'>('home');
  const [autoSave, setAutoSave] = useState(true);
  const [selectedFont, setSelectedFont] = useState('font-sans');
  const [selectedFontSize, setSelectedFontSize] = useState('14px');
  const [textColor, setTextColor] = useState('#334155');
  const [highlightColor, setHighlightColor] = useState('');

  // Undo / Redo stacks
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Set default author name based on logged-in user
  useEffect(() => {
    if (auth.currentUser) {
      setAuthor(auth.currentUser.displayName || auth.currentUser.email || 'Admin');
    }
  }, []);

  // Fetch posts from Cloudflare D1 for managing
  const fetchExistingPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await fetch('/api/posts?includeDrafts=true');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const list: BlogPost[] = await res.json();
      
      // Sort by createdAt descending
      list.sort((a, b) => b.createdAt - a.createdAt);
      setExistingPosts(list);
    } catch (err) {
      console.error("Error fetching existing posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    fetchExistingPosts();
    // Check for unfinished local draft on mount
    const draftContent = localStorage.getItem('skyline_cms_draft_content');
    if (draftContent && draftContent.trim()) {
      setHasDraft(true);
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

  // AutoSave Draft Logic
  useEffect(() => {
    if (autoSave && content) {
      localStorage.setItem('skyline_cms_draft_content', content);
      localStorage.setItem('skyline_cms_draft_title', title);
      localStorage.setItem('skyline_cms_draft_summary', summary);
      localStorage.setItem('skyline_cms_draft_tags', tagsInput);
      localStorage.setItem('skyline_cms_draft_categories', categoriesInput);
    }
  }, [content, title, summary, tagsInput, categoriesInput, autoSave]);

  // Load saved draft
  const handleLoadDraft = () => {
    const draftContent = localStorage.getItem('skyline_cms_draft_content');
    const draftTitle = localStorage.getItem('skyline_cms_draft_title');
    const draftSummary = localStorage.getItem('skyline_cms_draft_summary');
    const draftTags = localStorage.getItem('skyline_cms_draft_tags');
    const draftCategories = localStorage.getItem('skyline_cms_draft_categories');

    if (draftContent) {
      setContent(draftContent);
      if (draftTitle) setTitle(draftTitle);
      if (draftSummary) setSummary(draftSummary);
      if (draftTags) setTagsInput(draftTags);
      if (draftCategories) setCategoriesInput(draftCategories);
      
      setSuccess("Autosaved document draft restored successfully!");
      setHasDraft(false);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("No auto-saved draft detected on this browser session.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('skyline_cms_draft_content');
    localStorage.removeItem('skyline_cms_draft_title');
    localStorage.removeItem('skyline_cms_draft_summary');
    localStorage.removeItem('skyline_cms_draft_tags');
    localStorage.removeItem('skyline_cms_draft_categories');
    setHasDraft(false);
    setSuccess("Autosaved draft has been discarded.");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Record history for undo/redo
  const recordHistory = (newVal: string) => {
    setHistoryStack(prev => [...prev.slice(-30), content]); // limit stack to 30 elements
    setRedoStack([]); // clear redo stack on new action
  };

  const handleUndo = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setRedoStack(prevStack => [...prevStack, content]);
      setContent(prev);
      setHistoryStack(prevStack => prevStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setHistoryStack(prevStack => [...prevStack, content]);
      setContent(next);
      setRedoStack(prevStack => prevStack.slice(0, -1));
    }
  };

  // Markdown Selection Insertion Logic
  const insertMarkdown = (before: string, after: string = '', defaultPlaceholder?: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    recordHistory(content);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    // Default placeholder if nothing selected
    const placeholder = selectedText || defaultPlaceholder || (before.includes('#') ? 'Heading' : 'text');
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData) {
      e.preventDefault();
      const markdown = htmlToMarkdown(htmlData);
      if (markdown && markdown.trim()) {
        recordHistory(content);
        
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const beforeStr = text.substring(0, start);
        const afterStr = text.substring(end);
        
        const newContent = beforeStr + markdown + afterStr;
        setContent(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + markdown.length, start + markdown.length);
        }, 50);
      }
    }
  };

  // Document templates inserters
  const insertTemplate = (type: 'cp' | 'sbir' | 'hacking' | 'tutorial') => {
    let templateStr = '';
    switch(type) {
      case 'cp':
        templateStr = `\n# [CP-001] Optimal Path Finding Optimization\n**Time Complexity:** O(N log N)  \n**Space Complexity:** O(N)  \n\n### Problem Statement\nDetail the competitive programming task guidelines and input boundaries here.\n\n### Mathematical Model\nWrite state relations or mathematical analysis here.\n\n### Optimization Algorithm (C++ Source)\n\`\`\`cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (int i = 0; i < n; ++i) cin >> a[i];\n    \n    // Optimize algorithm\n    sort(a.begin(), a.end());\n    \n    cout << "Optimal Delta: " << a[n-1] - a[0] << "\\n";\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int t;\n    cin >> t;\n    while(t--) solve();\n    return 0;\n}\n\`\`\`\n`;
        break;
      case 'sbir':
        templateStr = `\n# [SBIR] Socio-Bio-Informatics Research Blueprint\n**Track:** Assistive Cobotics & Remediology  \n\n### Abstract\nOutline the bio-informatics problem and high-performance remediation algorithms planned to mitigate biological anomalies.\n\n### Assistive Cybernetics Framework\nExplain the neural modeling or physical cobotics coordination interfaces designed to restore balanced biological state indicators.\n\n### Metrics Matrix\n| Cohort Category | Baseline Error Rate | Assisted Success Rate | Efficiency Delta |\n| :--- | :--- | :--- | :--- |\n| Neural Interface A | 65% | 94% | +29% |\n| Robotic Grip B | 48% | 89% | +41% |\n\n### Future Trajectory\nResearch goals slated for testing at MIT CSAIL sandbox labs.\n`;
        break;
      case 'hacking':
        templateStr = `\n# [SEC-ASSESS] Jailbreak Hardening & System Remediation\n**Target Host:** sandbox-alpha-node.net  \n**Hardening Classification:** Defensive Cybernetics  \n\n### Security Assessment Scope\nDefine target services scanned, network layers isolated, and ethical validation procedures performed.\n\n### Scanning Logs\n\`\`\`bash\n$ nmap -sC -sV -p 80,443,3000 sandbox-alpha-node.net\nPORT     STATE SERVICE VERSION\n80/tcp   open  http    nginx 1.25.0\n443/tcp  open  ssl/http nginx 1.25.0\n3000/tcp open  http    ExpressJS Service Engine\n\`\`\`\n\n### Vulnerability & Hardening Resolution\nExplain the potential vulnerabilities isolated and exact remediation policies (e.g. secure environment headers, rate-limiting rules, Firestore backend permissions structure).\n`;
        break;
      case 'tutorial':
        templateStr = `\n# Comprehensive Step-by-Step System Tutorial\n**Level:** Advanced  \n**Core Stack:** React, Tailwind, Cloud Firestore  \n\n### Introduction\nExplain what you are going to learn and build in this module.\n\n### Requirements Checklist\n- [ ] Local runtime installed\n- [ ] Active Cloud Database initialized\n\n### Step 1: Initial Hook Config\nDescribe configuring your standard state hook parameters.\n\n### Step 2: Render Component Pipeline\nConfigure standard Tailwind structures on main wrappers.\n\n### Troubleshooting & Mitigations\n- **Issue A:** Restart your standard bundler.\n- **Issue B:** Clean build cache parameters.\n`;
        break;
    }
    
    recordHistory(content);
    setContent(prev => prev + templateStr);
    
    setSuccess(`Inserted Word Document Style Template!`);
    setTimeout(() => setSuccess(null), 3000);
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

  // Delete document from Cloudflare D1
  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmation = window.confirm(`Are you absolutely sure you want to permanently delete "${postTitle}"?\n\nThis action cannot be undone.`);
    if (!confirmation) return;

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');

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
      setError(err?.message || "Failed to delete post.");
    }
  };

  const handleSubmit = async (e?: React.FormEvent, statusOverride?: 'draft' | 'published') => {
    if (e) e.preventDefault();
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

    // Default to 'published' unless explicitly 'draft'
    const targetStatus = statusOverride || 'published';

    const newPostData = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ["General"],
      categories: categories.length > 0 ? categories : ["General"],
      author: author.trim() || "Admin",
      readTime: readTime.trim() || "5 min read",
      coverImage: coverImage.trim() || "",
      status: targetStatus
    };

    try {
      if (editingPostId) {
        // UPDATE EXISTING POST
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPostData)
        });
        if (!res.ok) throw new Error('Failed to update post');

        setSuccess(`"${title.trim()}" updated successfully as ${targetStatus}.`);
        setEditingPostId(null);
      } else {
        // CREATE NEW POST
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newPostData,
            createdAt: Date.now()
          })
        });
        if (!res.ok) throw new Error('Failed to create post');

        setSuccess(`"${title.trim()}" saved successfully as ${targetStatus}.`);
      }
      
      // Clear autosave cache on success submit
      localStorage.removeItem('skyline_cms_draft_content');
      localStorage.removeItem('skyline_cms_draft_title');
      localStorage.removeItem('skyline_cms_draft_summary');
      localStorage.removeItem('skyline_cms_draft_tags');
      localStorage.removeItem('skyline_cms_draft_categories');

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
      console.error("D1 API write error caught in CMS dashboard:", err);
      setError(err?.message || "Failed to save post to Cloudflare D1.");
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
      className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1600px]">
        
        {/* Top Header Panel */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                Skyline Cloud CMS &amp; Document Engine
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {editingPostId ? 'Edit Workspace' : 'Document Creation Workspace'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-100 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel Editing</span>
              </button>
            )}

            {/* Layout Mode Control */}
            <div className="flex rounded-xl bg-slate-200/85 dark:bg-slate-900/80 p-1 border border-slate-300/40 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'write' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Split Screen</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Notifications */}
        {hasDraft && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 p-4 text-xs text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all">
            <div className="flex items-start gap-3">
              <History className="h-5 w-5 shrink-0 text-amber-500 animate-pulse mt-0.5" />
              <div>
                <p className="font-bold text-sm">Unfinished Draft Found</p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 font-medium">
                  We recovered an autosaved draft ("{localStorage.getItem('skyline_cms_draft_title') || 'Untitled Publication'}") on this browser. Restore it to continue editing?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleLoadDraft}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-xs"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500 flex items-start gap-3 shadow-sm font-mono">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <div>
              <p className="font-bold">CMS Exception Warning</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
            <Sparkles className="h-4.5 w-4.5 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold font-sans">Document Action Executed</p>
              <p className="mt-0.5 font-mono">{success}</p>
            </div>
          </div>
        )}

        {/* Two Column Workspace (Metadata on Left, Ribbon + Doc Frame on bottom or center) */}
        <div className="grid gap-6 lg:grid-cols-12 mb-10">
          
          {/* COLUMN 1: Article Metadata Cards (Left 3 columns) */}
          {(activeTab === 'write' || activeTab === 'split') && (
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Document Settings</span>
                </div>

                {/* Article Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master C++ Templates"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category / Directory</label>
                  <input
                    type="text"
                    value={categoriesInput}
                    onChange={(e) => setCategoriesInput(e.target.value)}
                    placeholder="Development, SBIR, CP"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="C++, Algorithms, ICPC"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Author */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Read Time</label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Save to Firestore actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={(e) => handleSubmit(e, 'draft')}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 px-3 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <PenTool className="h-3 w-3 shrink-0" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    onClick={(e) => handleSubmit(e, 'published')}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                      <Send className="h-3 w-3 shrink-0" />
                    )}
                    <span>{editingPostId ? 'Save & Publish' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>

              {/* Statistics & Quick Guide Card */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <Activity className="h-3.5 w-3.5 text-teal-500" />
                  <span>Document Analytics</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400 uppercase">Words</p>
                    <p className="text-sm font-black text-indigo-500 mt-0.5">{content.split(/\s+/).filter(Boolean).length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400 uppercase">Characters</p>
                    <p className="text-sm font-black text-indigo-500 mt-0.5">{content.length}</p>
                  </div>
                </div>
                <p className="leading-relaxed text-[10px] italic">
                  * Note: Content body supports standard Markdown paired with inline styles parsed live. Use the MS Word controls to dynamically template.
                </p>
              </div>
            </div>
          )}

          {/* COLUMN 2: MS Word Document Editor Suite & Realtime Preview */}
          <div className={`${(activeTab === 'write' || activeTab === 'split') ? 'lg:col-span-9' : 'lg:col-span-12'} ${activeTab === 'split' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 space-y-0' : 'space-y-6'}`}>
            
            {(activeTab === 'write' || activeTab === 'split') && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-md">
                
                {/* 2. Word Ribbon Header (No tabs, clean and unified) */}
                <div className="bg-[#f3f2f1] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Unified Publishing Toolbar
                    </span>
                  </div>
                  {/* Integrated Status indicator */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Connected to Cloud</span>
                    </span>
                    <span>•</span>
                    <span>A4 Document Editor</span>
                  </div>
                </div>

                {/* 3. Word Ribbon Body (Unified Toolbar - all tools combined) */}
                <div className="bg-[#fdfdfd] dark:bg-slate-950 p-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-y-3.5 gap-x-4 shadow-inner">
                  
                  {/* Clipboard & History Group */}
                  <div className="flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3.5 shrink-0">
                    <div className="flex items-center gap-1">
                      {/* Undo Button */}
                      <button 
                        type="button"
                        disabled={historyStack.length === 0}
                        onClick={handleUndo} 
                        title="Undo Action (Ctrl+Z)" 
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      
                      {/* Redo Button */}
                      <button 
                        type="button"
                        disabled={redoStack.length === 0}
                        onClick={handleRedo} 
                        title="Redo Action (Ctrl+Y)" 
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>

                      {/* Copy All Button (with robust iframe-safe fallback) */}
                      <button 
                        type="button"
                        onClick={() => {
                          try {
                            if (navigator.clipboard && window.isSecureContext) {
                              navigator.clipboard.writeText(content);
                            } else {
                              const textArea = document.createElement("textarea");
                              textArea.value = content;
                              textArea.style.position = "fixed";
                              document.body.appendChild(textArea);
                              textArea.focus();
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                            }
                            setSuccess("Entire document copied to clipboard!");
                            setTimeout(() => setSuccess(null), 2500);
                          } catch (err) {
                            console.error("Clipboard write failed", err);
                            setSuccess("Could not copy automatically. Please copy text manually.");
                            setTimeout(() => setSuccess(null), 2500);
                          }
                        }}
                        title="Copy entire document to clipboard"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      {/* Clear Doc Button (without blocking confirm dialog) */}
                      <button 
                        type="button"
                        onClick={() => {
                          recordHistory(content);
                          setContent('');
                          setSuccess("Workspace cleared! (Click Undo to restore)");
                          setTimeout(() => setSuccess(null), 3000);
                        }}
                        title="Clear entire document canvas"
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer"
                      >
                        <Eraser className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Clipboard</span>
                  </div>

                  {/* Font group */}
                  <div className="flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3.5 shrink-0">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Font Family selector */}
                      <select
                        value={selectedFont}
                        onChange={(e) => {
                          setSelectedFont(e.target.value);
                          insertMarkdown(`<span style="font-family: ${e.target.value}">`, '</span>', 'styled font');
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-[11px] font-sans font-medium text-slate-700 dark:text-slate-300 outline-none w-28 cursor-pointer"
                      >
                        <option value="font-sans">Calibri (Body)</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="font-mono">JetBrains Mono</option>
                        <option value="Georgia">Georgia</option>
                      </select>

                      {/* Font Size Selector */}
                      <select
                        value={selectedFontSize}
                        onChange={(e) => {
                          setSelectedFontSize(e.target.value);
                          insertMarkdown(`<span style="font-size: ${e.target.value}">`, '</span>', `${e.target.value} text`);
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 outline-none w-14 cursor-pointer"
                      >
                        {['10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '48px'].map(sz => (
                          <option key={sz} value={sz}>{sz.replace('px', '')}</option>
                        ))}
                      </select>

                      {/* Clear styling button */}
                      <button
                        type="button"
                        onClick={() => {
                          setContent(prev => prev.replace(/<span[^>]*>|<\/span>/g, ''));
                          setSuccess("Cleared inline font/color tags!");
                          setTimeout(() => setSuccess(null), 2500);
                        }}
                        title="Clear Inline Styling HTML tags"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                      >
                        <Eraser className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Inline Font Style Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        title="Bold Text (Ctrl+B)"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        title="Italic Text (Ctrl+I)"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 italic cursor-pointer"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<u>', '</u>', 'underlined')}
                        title="Underline Text"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 underline cursor-pointer"
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('~~', '~~')}
                        title="Strikethrough"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 line-through cursor-pointer text-[11px] font-bold"
                      >
                        ab
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<sub>', '</sub>', 'subscript')}
                        title="Subscript"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs font-semibold font-mono"
                      >
                        x₂
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<sup>', '</sup>', 'superscript')}
                        title="Superscript"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs font-semibold font-mono"
                      >
                        x²
                      </button>

                      {/* Font Color preset picker */}
                      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                      
                      <div className="flex items-center gap-1">
                        <label className="flex items-center gap-1.5 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800" title="Choose Font Color">
                          <span className="w-3.5 h-3.5 rounded border border-slate-350 dark:border-slate-700 block" style={{ backgroundColor: textColor }}></span>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => {
                              setTextColor(e.target.value);
                              insertMarkdown(`<span style="color: ${e.target.value}">`, '</span>', 'colored');
                            }}
                            className="sr-only"
                          />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Color</span>
                        </label>
                      </div>

                      {/* Font Highlight picker */}
                      <div className="flex items-center gap-1">
                        <label className="flex items-center gap-1.5 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800" title="Choose Highlight Color">
                          <span className="w-3.5 h-3.5 rounded border border-slate-350 dark:border-slate-700 block" style={{ backgroundColor: highlightColor || '#fef08a' }}></span>
                          <input
                            type="color"
                            value={highlightColor || '#fef08a'}
                            onChange={(e) => {
                              setHighlightColor(e.target.value);
                              insertMarkdown(`<span style="background-color: ${e.target.value}">`, '</span>', 'highlighted');
                            }}
                            className="sr-only"
                          />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Highlight</span>
                        </label>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Font &amp; Color</span>
                  </div>

                  {/* Paragraph Alignment & Lists */}
                  <div className="flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('- ', '\n')}
                        title="Bulleted List"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('1. ', '\n')}
                        title="Numbered List"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('> ', '\n')}
                        title="Blockquote Quote"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<div align="left">\n', '\n</div>')}
                        title="Align Left"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<div align="center">\n', '\n</div>')}
                        title="Align Center"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('<div align="right">\n', '\n</div>')}
                        title="Align Right"
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Paragraph</span>
                  </div>

                  {/* Styles Group (Home tab presets) */}
                  <div className="flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('# ', '\n', 'Heading 1')}
                        className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-800 dark:text-slate-200 shadow-sm cursor-pointer"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ', '\n', 'Heading 2')}
                        className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('### ', '\n', 'Heading 3')}
                        className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400 shadow-sm cursor-pointer"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('`', '`', 'code')}
                        className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-500 shadow-sm cursor-pointer"
                      >
                        Code
                      </button>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Styles</span>
                  </div>

                  {/* Insert Elements (Table, Link, Image, Online Video, Code Block) */}
                  <div className="flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {/* Table Insert Button (No "text" append bug anymore) */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Row 1 Cell 1 | Row 1 Cell 2 | Row 1 Cell 3 |\n| Row 2 Cell 1 | Row 2 Cell 2 | Row 2 Cell 3 |\n', '', '')}
                        title="Add Table (3x3)"
                        className="inline-flex items-center gap-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/45 border border-indigo-200/40 px-2 py-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer"
                      >
                        <Grid className="h-3 w-3" />
                        <span>Table</span>
                      </button>

                      {/* Link Insert Button */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('[', '](https://)', 'link text')}
                        title="Insert hyperlink"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer"
                      >
                        <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
                      </button>

                      {/* Image Insert Button */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('![Skyline Image](https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=600)', '', '')}
                        title="Insert placeholder image"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-sky-500" />
                      </button>

                      {/* Online Video Insert Button */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border-radius: 0.5rem;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" border="0" allowfullscreen></iframe></div>\n', '', '')}
                        title="Insert YouTube Video Embed Block"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 text-red-500" />
                      </button>

                      {/* Code Block Insert Button */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('```cpp\n', '\n```', 'code here')}
                        title="Insert C++ code block"
                        className="px-1.5 py-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-bold cursor-pointer"
                      >
                        C++
                      </button>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Insert</span>
                  </div>

                  {/* Layout & Stamps Group */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {/* Page Break */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n---\n', '', '')}
                        title="Insert Page Break line"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      {/* Timestamp */}
                      <button
                        type="button"
                        onClick={() => {
                          const stamp = `\n*Document published: ${new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}*\n`;
                          insertMarkdown(stamp, '');
                        }}
                        title="Insert date/time stamp"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5 text-teal-500" />
                      </button>

                      {/* Equation */}
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n$$\nE = mc^2\n$$\n', '')}
                        title="Insert Equation Formula block"
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <Calculator className="h-3.5 w-3.5 text-purple-500" />
                      </button>

                      {/* Symbols Dropdown */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            insertMarkdown(e.target.value, '');
                            e.target.value = ''; // reset
                          }
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-[10px] text-slate-600 dark:text-slate-300 w-16 cursor-pointer outline-none"
                        title="Insert Special Symbol"
                      >
                        <option value="">Sym</option>
                        <option value="π">π</option>
                        <option value="Ω">Ω</option>
                        <option value="Σ">Σ</option>
                        <option value="∞">∞</option>
                        <option value="√">√</option>
                        <option value="±">±</option>
                        <option value="≠">≠</option>
                        <option value="≈">≈</option>
                        <option value="©">©</option>
                        <option value="®">®</option>
                        <option value="™">™</option>
                      </select>

                      {/* Emojis Dropdown */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            insertMarkdown(e.target.value, '');
                            e.target.value = ''; // reset
                          }
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-[10px] text-slate-600 dark:text-slate-300 w-16 cursor-pointer outline-none"
                        title="Insert Emoji"
                      >
                        <option value="">Emo</option>
                        <option value="😊">😊</option>
                        <option value="👍">👍</option>
                        <option value="🚀">🚀</option>
                        <option value="🔥">🔥</option>
                        <option value="💡">💡</option>
                        <option value="💻">💻</option>
                        <option value="🎉">🎉</option>
                        <option value="⚠️">⚠️</option>
                      </select>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase text-center select-none">Stamps &amp; Syms</span>
                  </div>

                </div>

                {/* 4. Mock A4 Styled Editor Canvas Paper Page */}
                <div className={`bg-[#e1dfdd] dark:bg-slate-950 flex justify-center shadow-inner min-h-[450px] ${activeTab === 'split' ? 'p-3' : 'p-6 sm:p-10'}`}>
                  <div className={`w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-xl relative min-h-[400px] flex flex-col ${activeTab === 'split' ? 'p-4 sm:p-6' : 'p-6 sm:p-12'}`}>
                    {/* Decorative header page indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-lg"></div>
                    <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-300 dark:text-slate-600 uppercase select-none tracking-widest font-bold">
                      A4 Document Sheet Layer
                    </div>

                    {/* Styled Textarea carrying selected font and font sizes dynamically! */}
                    <textarea
                      id="content-editor"
                      required
                      value={content}
                      onChange={(e) => {
                        recordHistory(content);
                        setContent(e.target.value);
                      }}
                      onPaste={handlePaste}
                      placeholder="Begin composing your competitive solution or bio-informatics research log using MS Word styling controls..."
                      className={`w-full flex-1 resize-none bg-transparent outline-none border-none text-slate-800 dark:text-slate-100 leading-relaxed placeholder-slate-400/80 font-medium ${
                        selectedFont === 'font-sans' ? 'font-sans' : 
                        selectedFont === 'font-mono' ? 'font-mono' : ''
                      }`}
                      style={{
                        fontFamily: selectedFont !== 'font-sans' && selectedFont !== 'font-mono' ? selectedFont : undefined,
                        fontSize: selectedFontSize
                      }}
                    />
                  </div>
                </div>

                {/* MS Word App Footer Status Bar */}
                <div className="bg-[#2b579a] text-white/90 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono select-none">
                  <div className="flex items-center gap-4">
                    <span>Page 1 of 1</span>
                    <span>•</span>
                    <span>{content.split(/\s+/).filter(Boolean).length} Words</span>
                    <span>•</span>
                    <span>{content.length} Characters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>English (United States)</span>
                    <span>•</span>
                    <span className="font-bold text-teal-300">Skyline Realtime Sync</span>
                  </div>
                </div>

              </div>
            )}

            {/* RIGHT COLUMN: REAL-TIME MARKDOWN PREVIEW ENGINE (A4 Styled sheet representation or Live Blog Mockup) */}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-[#e1dfdd] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-center shadow-inner overflow-y-auto max-h-[110vh] sticky top-20 ${activeTab === 'split' ? 'p-3' : 'p-6 sm:p-10'}`}
              >
                <div className={`w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-xl relative min-h-[500px] flex flex-col ${activeTab === 'split' ? 'p-4 sm:p-6' : 'p-6 sm:p-12'}`}>
                  
                  {/* Decorative Header */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2b579a] via-teal-500 to-[#2b579a] rounded-t-lg"></div>
                  
                  {/* Live Blog Preview Header */}
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-100 dark:border-slate-800 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Web Public Blog Live Preview
                      </span>
                    </div>
                  </div>

                  {title.trim() ? (
                    <div className="space-y-6">
                      {/* Mock Browser Frame URL Bar */}
                      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 sm:p-3 flex items-center gap-3">
                        <div className="flex gap-1.5 shrink-0 select-none">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        </div>
                        <div className="flex-1 rounded bg-slate-150 dark:bg-slate-900 text-[10px] font-mono text-slate-400 px-3 py-1.5 truncate flex items-center gap-1.5 select-none border border-slate-200/40 dark:border-slate-850">
                          <span className="text-slate-300 dark:text-slate-750">https://ioi.razwon.xyz/posts/</span>
                          <span className="text-indigo-500 dark:text-indigo-400 font-bold font-sans">
                            {title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                          </span>
                        </div>
                      </div>

                      {/* Navigation action header mockup */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 select-none">
                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Back to articles</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 transition shadow-sm">
                          <span>Share URL</span>
                        </div>
                      </div>

                      {/* Categories & tags mockup */}
                      <div className="flex flex-wrap gap-1.5">
                        {categoriesInput.split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                          <span key={cat} className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/10">
                            <FolderOpen className="h-2.5 w-2.5" />
                            <span>{cat}</span>
                          </span>
                        ))}
                        {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-indigo-500/10">
                            <TagIcon className="h-2.5 w-2.5" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>

                      {/* Article Header Details */}
                      <div className="space-y-3">
                        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight text-left">
                          {title}
                        </h1>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 border-l-2 border-indigo-500 pl-4 italic text-left">
                          {summary || "No catchphrase summary provided."}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>Written by <strong className="text-slate-700 dark:text-slate-300">{author || 'Admin'}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{readTime || '5 min read'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Article Cover Image Mockup */}
                      {coverImage.trim() && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm max-h-[250px]">
                          <img 
                            src={coverImage.trim()} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Markdown rendered body */}
                      <article className="prose max-w-none pt-4 text-left">
                        <div className="markdown-body">
                          {content.trim() ? (
                            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{renderMathInMarkdown(content)}</Markdown>
                          ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic font-mono text-xs">Write some Markdown content to view real-time typography...</p>
                          )}
                        </div>
                      </article>

                      {/* Mock Blog Details Page Footer */}
                      <footer className="border-t border-slate-150 dark:border-slate-850 pt-6 text-center select-none">
                        <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 shadow-sm">
                          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white">Thanks for reading!</h3>
                          <p className="mt-1 text-[10px] text-slate-500">This publication is dynamic and backed by a live Google Cloud Firestore document.</p>
                        </div>
                      </footer>
                    </div>
                  ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center gap-4 select-none">
                      <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 p-4 border border-indigo-100/50 dark:border-indigo-900/20 animate-pulse">
                        <Eye className="h-7 w-7 text-indigo-500/60" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Live Preview Viewport</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                        Once you begin naming your publication, the live mockup of your public blog post will display here in real time.
                      </p>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* SECTION: MANAGE PUBLICATIONS AND ARCHIVE LIST */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-500" />
                <span>Manage Firestore Publications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Edit, delete, or search existing blog documents in real time.</p>
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
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              <p className="text-xs text-slate-500 font-mono">Loading document catalog...</p>
            </div>
          ) : filteredManagePosts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-mono text-xs">
              No matching documents located on Firestore.
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
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-colors ${
                        editingPostId === post.id ? 'bg-indigo-500/5 dark:bg-indigo-500/10 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="max-w-md truncate flex items-center gap-2">
                          <span className="truncate">{post.title}</span>
                          {post.status === 'draft' && (
                            <span className="shrink-0 inline-flex items-center rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-md">
                          {post.summary}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-405 border border-slate-200/50 dark:border-slate-800/40">
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

function htmlToMarkdown(htmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const cleanBody = doc.body;
  
  function serializeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    let childrenText = '';
    element.childNodes.forEach(child => {
      childrenText += serializeNode(child);
    });
    
    const styleAttr = element.getAttribute('style') || '';
    const colorMatch = styleAttr.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bgMatch = styleAttr.match(/(?:^|;)\s*background-color\s*:\s*([^;]+)/i);
    
    let wrapped = childrenText;
    if (colorMatch && wrapped.trim()) {
      const colorVal = colorMatch[1].trim();
      wrapped = `<span style="color: ${colorVal}">${wrapped}</span>`;
    }
    if (bgMatch && wrapped.trim()) {
      const bgVal = bgMatch[1].trim();
      wrapped = `<span style="background-color: ${bgVal}">${wrapped}</span>`;
    }
    
    switch (tagName) {
      case 'strong':
      case 'b':
        return `**${wrapped}**`;
      case 'em':
      case 'i':
        return `*${wrapped}*`;
      case 'del':
      case 's':
      case 'strike':
        return `~~${wrapped}~~`;
      case 'sub':
        return `<sub>${wrapped}</sub>`;
      case 'sup':
        return `<sup>${wrapped}</sup>`;
      case 'code':
        if (element.parentElement && element.parentElement.tagName.toLowerCase() === 'pre') {
          return wrapped;
        }
        return `\`${wrapped}\``;
      case 'pre':
        return `\n\`\`\`\n${wrapped.trim()}\n\`\`\`\n`;
      case 'p':
        return `\n\n${wrapped.trim()}\n\n`;
      case 'br':
        return '\n';
      case 'h1':
        return `\n\n# ${wrapped.trim()}\n\n`;
      case 'h2':
        return `\n\n## ${wrapped.trim()}\n\n`;
      case 'h3':
        return `\n\n### ${wrapped.trim()}\n\n`;
      case 'h4':
        return `\n\n#### ${wrapped.trim()}\n\n`;
      case 'h5':
        return `\n\n##### ${wrapped.trim()}\n\n`;
      case 'h6':
        return `\n\n###### ${wrapped.trim()}\n\n`;
      case 'a':
        const href = element.getAttribute('href') || '#';
        return `[${wrapped}](${href})`;
      case 'img':
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || 'image';
        return `![${alt}](${src})`;
      case 'blockquote':
        return `\n> ${wrapped.trim().replace(/\n/g, '\n> ')}\n\n`;
      case 'li':
        return `${wrapped.trim()}\n`;
      case 'ul': {
        const items = Array.from(element.children)
          .filter(c => c.tagName.toLowerCase() === 'li')
          .map(c => `* ${serializeNode(c).trim()}`);
        return `\n\n${items.join('\n')}\n\n`;
      }
      case 'ol': {
        const items = Array.from(element.children)
          .filter(c => c.tagName.toLowerCase() === 'li')
          .map((c, i) => `${i + 1}. ${serializeNode(c).trim()}`);
        return `\n\n${items.join('\n')}\n\n`;
      }
      case 'table': {
        let tableMd = '\n\n';
        const rows = Array.from(element.querySelectorAll('tr'));
        let hasHeaders = false;
        
        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll('th, td'));
          if (cells.length > 0) {
            const cellTexts = cells.map(cell => serializeNode(cell).trim().replace(/\|/g, '\\|'));
            
            const isHeader = row.querySelector('th') !== null || rowIndex === 0;
            if (isHeader && !hasHeaders) {
              hasHeaders = true;
            }
            
            tableMd += `| ${cellTexts.join(' | ')} |\n`;
            
            if (rowIndex === 0) {
              const separator = Array(cells.length).fill('---');
              tableMd += `| ${separator.join(' | ')} |\n`;
            }
          }
        });
        tableMd += '\n';
        return tableMd;
      }
      default:
        return wrapped;
    }
  }

  let result = '';
  cleanBody.childNodes.forEach(child => {
    result += serializeNode(child);
  });
  
  return result
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
