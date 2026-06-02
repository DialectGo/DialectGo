import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Save the JWT token
      authService.setToken(data.token);

      // Tell App.jsx we're authenticated — no page reload needed
      onLoginSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 360, padding: 32, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <h2 style={{ marginBottom: 24 }}>Admin Login</h2>

        {error && (
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%', padding: 12, backgroundColor: '#1a1a1a',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;