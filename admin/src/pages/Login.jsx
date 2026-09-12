import React from 'react';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { authService } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError]       = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
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
        {/* Logo */}
        <div className="login-logo">DG</div>

        <h1 className="login-title">DialectGo Admin</h1>
        <p className="login-subtitle">Sign in to manage the platform</p>

        {/* Error message */}
        {error && (
          <div className="info-box danger" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            id="admin-email"
            type="email"
            className="input"
            placeholder="admin@dialectgo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            id="admin-password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Submit */}
        <button
          id="admin-login-btn"
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={isLoading}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8, fontSize: '0.9rem', opacity: isLoading ? 0.75 : 1 }}
        >
          {isLoading
            ? <><Loader size={16} className="animate-spin" /> Signing in…</>
            : <><LogIn size={16} /> Sign In</>
          }
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          DialectGo Admin Panel — Administrator access only
        </p>
      </div>
    </div>
  );
};

export default Login;