import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { SEED_POSTS } from '../data/seedData';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, Tag, ArrowRight, BookOpen, FolderOpen, RefreshCw } from 'lucide-react';

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state initialized or synced with URL parameters
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState<string | null>(() => searchParams.get('tag') || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => searchParams.get('category') || null);

  // Sync state with URL parameter updates
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlTag = searchParams.get('tag') || null;
    const urlCategory = searchParams.get('category') || null;
    
    setSearchQuery(urlSearch);
    setSelectedTag(urlTag);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  // Sync local changes back to URL parameters
  const updateParams = (search: string, tag: string | null, category: string | null) => {
    const params: { [key: string]: string } = {};
    if (search.trim()) params.search = search.trim();
    if (tag) params.tag = tag;
    if (category) params.category = category;
    setSearchParams(params);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsCol = collection(db, 'posts');
      const snapshot = await getDocs(postsCol);
      let list: BlogPost[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          categories: data.categories || ['General'],
          tags: data.tags || ['General']
        };
      }) as BlogPost[];

      if (list.length === 0) {
        for (const post of SEED_POSTS) {
          await addDoc(postsCol, post);
        }
        const newSnapshot = await getDocs(postsCol);
        list = newSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            categories: data.categories || ['General'],
            tags: data.tags || ['General']
          };
        }) as BlogPost[];
      }

      list.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(list);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery ? (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    const matchesCategory = selectedCategory ? post.categories.includes(selectedCategory) : true;
    return matchesSearch && matchesTag && matchesCategory;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));
  const allCategories = Array.from(new Set(posts.flatMap(post => post.categories || [])));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 border-b border-slate-200 dark:border-slate-900 pb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Publications Archive
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Explore technical guides, walkthroughs, and developer thoughts.</p>
          
          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateParams(e.target.value, selectedTag, selectedCategory);
                }}
                placeholder="Search titles, summaries &amp; body content..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-colors focus:border-indigo-500"
              />
            </div>

            {/* Quick Reset Button if active */}
            {(selectedTag || selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setSelectedCategory(null);
                  setSearchParams({});
                }}
                className="flex items-center gap-1.5 rounded-full bg-slate-200/60 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/40 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </header>

        {/* Layout with Side Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar tag/category clouds */}
          <aside className="lg:col-span-3 space-y-6 lg:border-r border-slate-200 dark:border-slate-900 lg:pr-8">
            {/* Category Filter Cloud */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Filter Categories</span>
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    updateParams(searchQuery, selectedTag, null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs text-left font-semibold transition-all ${
                    selectedCategory === null 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      const value = cat === selectedCategory ? null : cat;
                      setSelectedCategory(value);
                      updateParams(searchQuery, selectedTag, value);
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-left font-semibold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500'
                    }`}>
                      {posts.filter(p => p.categories.includes(cat)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter Cloud */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
                <Tag className="h-3.5 w-3.5" />
                <span>Filter Topics</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    updateParams(searchQuery, null, selectedCategory);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedTag === null 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All Topics
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const value = tag === selectedTag ? null : tag;
                      setSelectedTag(value);
                      updateParams(searchQuery, value, selectedCategory);
                    }}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      selectedTag === tag 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Tag className="h-3 w-3 opacity-70" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main publication list column */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
                <p className="text-slate-400 text-sm">Querying database...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/10 shadow-sm transition-colors duration-300">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">No results found for your query.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try resetting the sidebar filters to show all publications.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setSelectedCategory(null);
                    setSearchParams({});
                  }}
                  className="mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-semibold transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPosts.map((post) => (
                  <motion.article 
                    layout
                    key={post.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      {/* Badge header */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {post.categories && post.categories.map(c => (
                          <span key={c} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/10">
                            {c}
                          </span>
                        ))}
                        {post.tags.map(t => (
                          <span key={t} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-indigo-500/10">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Link to={`/posts/${post.id}`}>{post.title}</Link>
                      </h2>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{post.summary}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                          <span>{post.readTime}</span>
                        </span>
                      </div>
                      <Link to={`/posts/${post.id}`} className="text-indigo-600 dark:text-indigo-400 font-sans font-semibold inline-flex items-center gap-0.5 hover:text-indigo-500 dark:hover:text-indigo-300">
                        <span>Read</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
}
