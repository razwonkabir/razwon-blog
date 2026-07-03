import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { SEED_POSTS } from '../data/seedData';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, Tag, ArrowRight, BookOpen } from 'lucide-react';

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsCol = collection(db, 'posts');
      const snapshot = await getDocs(postsCol);
      let list: BlogPost[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];

      if (list.length === 0) {
        for (const post of SEED_POSTS) {
          await addDoc(postsCol, post);
        }
        const newSnapshot = await getDocs(postsCol);
        list = newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
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
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 border-b border-slate-900 pb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Publications Archive
          </h1>
          <p className="mt-2 text-sm text-slate-400">Explore technical guides, walkthroughs, and developer thoughts.</p>
          
          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-xl border border-slate-900 bg-slate-900/30 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500"
              />
            </div>

            {/* Tags quick overview */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedTag === null ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All Topics
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedTag === tag ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
            <p className="text-slate-400 text-sm">Querying database...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <p className="text-slate-400 font-medium">No results found for your query.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <motion.article 
                layout
                key={post.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900 p-6 shadow-xl hover:border-slate-700/80 hover:-translate-y-1 transition duration-300"
              >
                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map(t => (
                      <span key={t} className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider border border-indigo-500/5">
                        {t}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-display text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed">{post.summary}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-600" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                  <Link to={`/posts/${post.id}`} className="text-indigo-400 font-sans font-semibold inline-flex items-center gap-0.5 hover:text-indigo-300">
                    <span>Read</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
