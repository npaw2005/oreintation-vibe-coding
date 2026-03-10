const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();
const db = new Database('ideas.sqlite');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Create a default admin user if it doesn't exist
const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const hash = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hash);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'idea-board-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Auth Middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- Routes ---

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true, username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Get all ideas
app.get('/api/ideas', (req, res) => {
  const ideas = db.prepare('SELECT * FROM ideas ORDER BY created_at DESC').all();
  res.json(ideas);
});

// Submit idea
app.post('/api/ideas', requireAuth, (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: 'Idea must be at least 5 characters long.' });
  }
  
  if (content.length > 5000) {
    return res.status(400).json({ error: 'Idea is too long (max 5000 chars).' });
  }

  // Sanitize HTML input
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'ol', 'ul', 'li', 'p', 'br', 'strong', 'em', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: []
  });

  try {
    const stmt = db.prepare('INSERT INTO ideas (user_id, username, content) VALUES (?, ?, ?)');
    stmt.run(req.session.userId, req.session.username, cleanContent);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Idea Board running on http://localhost:${PORT}`);
});
