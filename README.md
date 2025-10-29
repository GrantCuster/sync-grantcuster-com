# Sync App

A simple text synchronization application with password-protected React frontend and Express backend. Edit text in the browser and sync it to a file on your server.

## Features

- Password-protected web interface
- Simple textarea editor
- Auto-save functionality
- Content synced to server file
- Persistent authentication via localStorage
- Clean, responsive UI

## Project Structure

```
sync/
├── server/
│   ├── index.js          # Express server
│   ├── content.txt       # Synced content (created on first run)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── App.css       # Styles
│   │   └── ...
│   └── package.json
├── .env                  # Environment variables (create from .env.example)
└── package.json
```

## Setup

### 1. Install dependencies

```bash
# Install all dependencies (root + workspaces)
npm install
```

### 2. Configure environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your password:

```
PASSWORD=your-secure-password
PORT=3001
```

### 3. Run locally

```bash
# Start both server and client concurrently
npm run dev
```

The server will run on `http://localhost:3001` and the client on `http://localhost:5173`.

Alternatively, you can run them separately:
```bash
npm run server  # Server only
npm run client  # Client only
```

### 4. Access the app

Open `http://localhost:5173` in your browser and log in with the password you set in `.env`

## Syncing with Local File (Neovim)

The server stores content in `server/content.txt`. You can edit this file directly with neovim:

```bash
nvim server/content.txt
```

To automatically sync changes from neovim to the browser, you could:

1. Use a file watcher (e.g., `entr`, `fswatch`)
2. Set up inotify-tools to detect changes
3. Use neovim autocmd to trigger a webhook

Example with `entr`:
```bash
# Watch for changes and trigger browser reload
echo server/content.txt | entr -p echo "File changed"
```

## Deployment to VPS

### Using PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Build the client:
```bash
cd client
npm run build
```

3. Serve static files from Express (add to `server/index.js`):
```javascript
import path from 'path';
app.use(express.static(path.join(__dirname, '../client/dist')));
```

4. Start with PM2:
```bash
cd server
pm2 start index.js --name sync-app
pm2 save
pm2 startup
```

### Using Nginx

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/sync/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API Endpoints

- `POST /api/verify` - Verify password
- `GET /api/content` - Get current content (requires auth)
- `POST /api/content` - Update content (requires auth)

## Security Notes

- Change the default password immediately
- Use HTTPS in production
- Consider adding rate limiting
- Store passwords using proper hashing in production
- Add CORS restrictions for production

## License

ISC
