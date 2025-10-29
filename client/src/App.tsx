import { useState, useEffect } from 'react';
import './App.css';

interface ContentResponse {
  content: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Check if we have a password stored
  useEffect(() => {
    const storedPassword = localStorage.getItem('syncPassword');
    if (storedPassword) {
      verifyPassword(storedPassword);
    }
  }, []);

  // Load content when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadContent();
    }
  }, [isAuthenticated]);

  const verifyPassword = async (pwd: string): Promise<void> => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pwd }),
      });

      if (response.ok) {
        localStorage.setItem('syncPassword', pwd);
        setPassword(pwd);
        setIsAuthenticated(true);
        setStatus('');
      } else {
        setStatus('Invalid password');
        localStorage.removeItem('syncPassword');
      }
    } catch (error) {
      setStatus('Error connecting to server');
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    verifyPassword(password);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('syncPassword');
    setIsAuthenticated(false);
    setPassword('');
    setContent('');
  };

  const loadContent = async (): Promise<void> => {
    try {
      const response = await fetch('/api/content', {
        headers: {
          password: localStorage.getItem('syncPassword') || '',
        },
      });

      if (response.ok) {
        const data: ContentResponse = await response.json();
        setContent(data.content);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      setStatus('Error loading content');
    }
  };

  const saveContent = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          password: localStorage.getItem('syncPassword') || '',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setStatus('Saved successfully');
        setTimeout(() => setStatus(''), 2000);
      } else if (response.status === 401) {
        handleLogout();
      } else {
        setStatus('Error saving content');
      }
    } catch (error) {
      setStatus('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Sync App</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
            <button type="submit">Login</button>
          </form>
          {status && <div className="status error">{status}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Sync App</h1>
        <div className="header-actions">
          {status && <span className="status">{status}</span>}
          <button onClick={saveContent} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={loadContent}>Refresh</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  );
}

export default App;
