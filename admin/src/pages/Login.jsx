import React from 'react';
import { authService } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleLogin() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      authService.setToken(data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
          <h2 className="login-title">DialectGo Admin</h2>
          <p className="login-subtitle">Sign in to manage your platform</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="admin@dialectgo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px',
            marginTop: 8,
            fontSize: '0.92rem',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default Login;