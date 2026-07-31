import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import initSqlJs, { Database } from 'sql.js';
import { SEED_POSTS } from './src/data/seedData';

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), 'd1_local_database.sqlite');

let sqliteDb: Database | null = null;

// Initialize SQLite database (mimicking Cloudflare D1 local behavior)
async function getDb(): Promise<Database> {
  if (sqliteDb) return sqliteDb;

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE_PATH)) {
    const fileBuffer = fs.readFileSync(DB_FILE_PATH);
    sqliteDb = new SQL.Database(fileBuffer);
  } else {
    sqliteDb = new SQL.Database();
  }
  return sqliteDb;
}

// Persist SQLite changes to disk for local dev persistence
function saveDb() {
  if (sqliteDb) {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  }
}

// Ensure database tables exist automatically (Requirement 3: AUTO-TABLE CREATION)
async function ensureTablesExist() {
  const db = await getDb();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      categories TEXT,
      author TEXT,
      createdAt INTEGER,
      readTime TEXT,
      coverImage TEXT,
      status TEXT DEFAULT 'published',
      views INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribedAt INTEGER,
      source TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      name TEXT,
      createdAt TEXT
    );
  `);

  saveDb();

  // Seed initial posts if table is empty
  const res = db.exec("SELECT COUNT(*) as count FROM posts");
  const count = res[0]?.values[0]?.[0] || 0;

  if (count === 0) {
    console.log("Database empty. Auto-seeding initial posts into Cloudflare D1...");
    for (const post of SEED_POSTS) {
      const id = post.id || ('post_' + Math.random().toString(36).substring(2, 11));
      const tagsJson = JSON.stringify(post.tags || ['General']);
      const categoriesJson = JSON.stringify(post.categories || ['General']);
      
      db.run(
        `INSERT INTO posts (id, title, summary, content, tags, categories, author, createdAt, readTime, coverImage, status, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          post.title,
          post.summary || '',
          post.content,
          tagsJson,
          categoriesJson,
          post.author || 'Admin',
          post.createdAt || Date.now(),
          post.readTime || '5 min read',
          post.coverImage || '',
          post.status || 'published',
          post.views || 0
        ]
      );
    }
    saveDb();
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB and ensure tables exist on startup
  await ensureTablesExist();

  // Helper to query all posts formatted as BlogPost objects
  const getAllPosts = async (includeDrafts = true) => {
    await ensureTablesExist();
    const db = await getDb();
    
    const query = includeDrafts 
      ? "SELECT * FROM posts ORDER BY createdAt DESC" 
      : "SELECT * FROM posts WHERE status != 'draft' ORDER BY createdAt DESC";
    
    const res = db.exec(query);
    if (!res.length || !res[0].values) return [];

    const columns = res[0].columns;
    return res[0].values.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });

      // Parse JSON array strings
      try { obj.tags = JSON.parse(obj.tags || '[]'); } catch { obj.tags = ['General']; }
      try { obj.categories = JSON.parse(obj.categories || '[]'); } catch { obj.categories = ['General']; }
      obj.views = Number(obj.views || 0);
      obj.createdAt = Number(obj.createdAt || Date.now());

      return obj;
    });
  };

  // ---------------- API ENDPOINTS ----------------

  // Health check & D1 info
  app.get('/api/health', async (req, res) => {
    await ensureTablesExist();
    res.json({
      status: 'ok',
      database: 'Cloudflare D1 (razwon-blog-db)',
      database_id: '181f079d-68da-4bef-bae4-b9e836a98c0d',
      binding: 'DB'
    });
  });

  // GET /api/posts
  app.get('/api/posts', async (req, res) => {
    try {
      const includeDrafts = req.query.includeDrafts === 'true';
      const posts = await getAllPosts(includeDrafts);
      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch posts' });
    }
  });

  // GET /api/posts/:id
  app.get('/api/posts/:id', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const stmt = db.prepare("SELECT * FROM posts WHERE id = ?");
      stmt.bind([req.params.id]);

      if (stmt.step()) {
        const row: any = stmt.getAsObject();
        stmt.free();

        try { row.tags = JSON.parse((row.tags as string) || '[]'); } catch { row.tags = ['General']; }
        try { row.categories = JSON.parse((row.categories as string) || '[]'); } catch { row.categories = ['General']; }
        row.views = Number(row.views || 0);
        row.createdAt = Number(row.createdAt || Date.now());

        res.json(row);
      } else {
        stmt.free();
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch post' });
    }
  });

  // POST /api/posts (Create or Update)
  app.post('/api/posts', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const post = req.body;

      if (!post.title || !post.content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const id = post.id || ('post_' + Math.random().toString(36).substring(2, 11));
      const tagsJson = JSON.stringify(post.tags || ['General']);
      const categoriesJson = JSON.stringify(post.categories || ['General']);
      const createdAt = post.createdAt || Date.now();
      const status = post.status || 'published';
      const views = post.views || 0;

      // Check if post exists
      const checkStmt = db.prepare("SELECT id FROM posts WHERE id = ?");
      checkStmt.bind([id]);
      const exists = checkStmt.step();
      checkStmt.free();

      if (exists) {
        db.run(
          `UPDATE posts 
           SET title = ?, summary = ?, content = ?, tags = ?, categories = ?, author = ?, readTime = ?, coverImage = ?, status = ?
           WHERE id = ?`,
          [
            post.title,
            post.summary || '',
            post.content,
            tagsJson,
            categoriesJson,
            post.author || 'Admin',
            post.readTime || '5 min read',
            post.coverImage || '',
            status,
            id
          ]
        );
      } else {
        db.run(
          `INSERT INTO posts (id, title, summary, content, tags, categories, author, createdAt, readTime, coverImage, status, views)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            post.title,
            post.summary || '',
            post.content,
            tagsJson,
            categoriesJson,
            post.author || 'Admin',
            createdAt,
            post.readTime || '5 min read',
            post.coverImage || '',
            status,
            views
          ]
        );
      }

      saveDb();

      res.json({
        id,
        ...post,
        createdAt,
        status,
        tags: post.tags || ['General'],
        categories: post.categories || ['General']
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save post' });
    }
  });

  // PUT /api/posts/:id
  app.put('/api/posts/:id', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const id = req.params.id;
      const post = req.body;

      const tagsJson = JSON.stringify(post.tags || ['General']);
      const categoriesJson = JSON.stringify(post.categories || ['General']);

      db.run(
        `UPDATE posts 
         SET title = ?, summary = ?, content = ?, tags = ?, categories = ?, author = ?, readTime = ?, coverImage = ?, status = ?
         WHERE id = ?`,
        [
          post.title,
          post.summary || '',
          post.content,
          tagsJson,
          categoriesJson,
          post.author || 'Admin',
          post.readTime || '5 min read',
          post.coverImage || '',
          post.status || 'published',
          id
        ]
      );

      saveDb();
      res.json({ id, ...post });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update post' });
    }
  });

  // DELETE /api/posts/:id
  app.delete('/api/posts/:id', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const id = req.params.id;

      db.run("DELETE FROM posts WHERE id = ?", [id]);
      saveDb();

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete post' });
    }
  });

  // POST /api/posts/:id/view (Increment views)
  app.post('/api/posts/:id/view', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const id = req.params.id;

      db.run("UPDATE posts SET views = views + 1 WHERE id = ?", [id]);
      saveDb();

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to increment view count' });
    }
  });

  // GET /api/subscriptions
  app.get('/api/subscriptions', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const resDb = db.exec("SELECT * FROM subscriptions ORDER BY subscribedAt DESC");

      if (!resDb.length || !resDb[0].values) return res.json([]);

      const columns = resDb[0].columns;
      const list = resDb[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch subscriptions' });
    }
  });

  // POST /api/subscriptions
  app.post('/api/subscriptions', async (req, res) => {
    try {
      await ensureTablesExist();
      const db = await getDb();
      const { email, source } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const emailLower = email.trim().toLowerCase();

      // Check if already exists
      const checkStmt = db.prepare("SELECT id FROM subscriptions WHERE email = ?");
      checkStmt.bind([emailLower]);
      const exists = checkStmt.step();
      checkStmt.free();

      if (exists) {
        return res.status(409).json({ status: 'already_subscribed', message: 'Email address is already subscribed.' });
      }

      const id = 'sub_' + Math.random().toString(36).substring(2, 11);
      const subscribedAt = Date.now();

      db.run(
        "INSERT INTO subscriptions (id, email, subscribedAt, source) VALUES (?, ?, ?, ?)",
        [id, emailLower, subscribedAt, source || 'skyline_blog']
      );

      saveDb();

      res.json({ status: 'success', id, email: emailLower, subscribedAt });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Subscription failed' });
    }
  });

  // POST /api/seed
  app.post('/api/seed', async (req, res) => {
    try {
      const db = await getDb();
      db.run("DELETE FROM posts");

      for (const post of SEED_POSTS) {
        const id = post.id || ('post_' + Math.random().toString(36).substring(2, 11));
        const tagsJson = JSON.stringify(post.tags || ['General']);
        const categoriesJson = JSON.stringify(post.categories || ['General']);
        
        db.run(
          `INSERT INTO posts (id, title, summary, content, tags, categories, author, createdAt, readTime, coverImage, status, views)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            post.title,
            post.summary || '',
            post.content,
            tagsJson,
            categoriesJson,
            post.author || 'Admin',
            post.createdAt || Date.now(),
            post.readTime || '5 min read',
            post.coverImage || '',
            post.status || 'published',
            post.views || 0
          ]
        );
      }
      saveDb();

      const posts = await getAllPosts(true);
      res.json({ message: 'Database re-seeded successfully', posts });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Seeding failed' });
    }
  });

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cloudflare D1 Blog Server listening at http://localhost:${PORT}`);
  });
}

startServer();
