import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const PASSWORD = process.env.PASSWORD || 'changeme';

// File to store the synced content
const CONTENT_FILE = join(__dirname, 'content.txt');

// Initialize content file if it doesn't exist
if (!existsSync(CONTENT_FILE)) {
  writeFileSync(CONTENT_FILE, '', 'utf8');
}

app.use(cors());
app.use(express.json());

// Middleware to check password
const authenticate = (req, res, next) => {
  const { password } = req.headers;

  if (password !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Get current content
app.get('/api/content', authenticate, (req, res) => {
  try {
    const content = readFileSync(CONTENT_FILE, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read content' });
  }
});

// Update content
app.post('/api/content', authenticate, (req, res) => {
  try {
    const { content } = req.body;
    writeFileSync(CONTENT_FILE, content, 'utf8');
    res.json({ success: true, message: 'Content saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// Verify password endpoint
app.post('/api/verify', (req, res) => {
  const { password } = req.body;

  if (password === PASSWORD) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Content file: ${CONTENT_FILE}`);
  console.log(`Password: ${PASSWORD}`);
});
