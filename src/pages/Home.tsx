import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { SEED_POSTS } from '../data/seedData';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, Tag, ArrowRight, Sparkles, BookOpen, ArrowUpRight, Cpu, FolderOpen, RefreshCw } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch posts from Firestore
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
          // Fallback for older posts that don't have categories/tags fields
          categories: data.categories || ['General'],
          tags: data.tags || ['General']
        };
      }) as BlogPost[];

      // If no posts are returned, automatically seed database
      if (list.length === 0) {
        console.log("No posts found. Seeding initial posts...");
        for (const post of SEED_POSTS) {
          await addDoc(postsCol, post);
        }
        // Refetch after seeding
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

      // Sort by createdAt descending
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

  // Filter posts based on search query, tag, and category
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

  // Unique tags and categories across all posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));
  const allCategories = Array.from(new Set(posts.flatMap(post => post.categories || [])));

  // Calculate dynamic stats
  const totalPosts = posts.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Dynamic Bento Grid Hub */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Grid Item 1: Hero Section */}
          <section className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-300">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3 w-3" />
                <span>Developer Blog</span>
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight font-display tracking-tight">
                Crafting clean, high-performance web architectures.
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                A space for deep dives into modern frontend architectures, Google Gemini integrations, and serverless engineering using Firebase Firestore.
              </p>
            </div>
          </section>

          {/* Grid Item 2: Command Center Quick Access */}
          <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-400 rounded-3xl p-8 flex flex-col justify-between text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 font-display tracking-tight text-white">IOI Command Center</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">Real-time infrastructure monitoring and system deployment hub.</p>
            </div>
            <div className="relative z-10 flex flex-col gap-4 mt-8 md:mt-0">
              <div className="flex justify-between items-center text-xs border-b border-indigo-400/50 pb-2.5">
                <span className="text-indigo-200 font-medium">System Status</span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                  </span>
                  <span>ONLINE</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-indigo-400/50 pb-2.5">
                <span className="text-indigo-200 font-medium">Active Nodes</span>
                <span className="font-bold font-mono text-indigo-50">12</span>
              </div>
              <a 
                href="https://ioi.razwon.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold tracking-wide transition-all group-hover:bg-white/20"
              >
                <span>Access Command Hub</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Grid Item 3: Latest Posts Mini-Feed */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-xl transition-colors duration-300">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent Publications</h2>
                <Link to="/posts" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-6">No publications found.</p>
              ) : (
                <div className="space-y-5">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="group cursor-pointer border-b border-slate-100 dark:border-slate-800/40 pb-4 last:border-0 last:pb-0">
                      <Link to={`/posts/${post.id}`}>
                        <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </p>
                        <h4 className="text-slate-900 dark:text-white font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{post.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">{post.summary}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid Item 4: Stats Card */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-center shadow-sm dark:shadow-xl transition-colors duration-300">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-2">Dynamic Reach</p>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              {loading ? '...' : totalPosts * 120 + 342}
            </p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-[78%] h-full rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5 font-mono">+14% activity index this week</p>
          </div>

          {/* Grid Item 5: Combined Search & Filters */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors duration-300">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-4">Search &amp; Filter</p>
              <div className="relative mb-4">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles &amp; body..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-colors focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Categories */}
              {allCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                          selectedCategory === cat 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Tags */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                          selectedTag === tag 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(selectedTag || selectedCategory || searchQuery) && (
              <button 
                onClick={() => { setSelectedTag(null); setSelectedCategory(null); setSearchQuery(''); }}
                className="mt-4 text-xs text-left text-indigo-600 dark:text-indigo-400 hover:underline transition-colors flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Main Publications Archive Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-900 pb-8 mb-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span>All Publications</span>
              {selectedCategory && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <FolderOpen className="h-3 w-3" />
                  {selectedCategory}
                </span>
              )}
              {selectedTag && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Tag className="h-3 w-3" />
                  #{selectedTag}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? `Search results for "${searchQuery}"` : "Discover recent writings, guides, and developer tutorials."}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Loading publications...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/20 shadow-sm transition-colors duration-300">
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">No publications match your criteria.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try clearing your filters or writing a new post in the admin pane.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTag(null); setSelectedCategory(null); }}
              className="mt-6 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-white transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Grid list of posts */
          <div id="posts-grid" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <motion.article 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key={post.id} 
                id={`article-${post.id}`}
                className="group relative flex flex-col items-start justify-between rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/30 p-6 shadow-sm hover:shadow dark:shadow-none hover:border-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-full">
                  {/* Category & Tag badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {post.categories && post.categories.map(c => (
                      <span key={c} className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/10">
                        {c}
                      </span>
                    ))}
                    {post.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border border-indigo-500/10">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <Link to={`/posts/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Summary */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-900/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {/* Date & Time */}
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

                  {/* Read More button */}
                  <Link 
                    to={`/posts/${post.id}`} 
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-sans font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors group/btn"
                  >
                    <span>Read</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
