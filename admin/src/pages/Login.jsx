// src/pages/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const res = await fetch('/api/v1/users/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        });

        const payload = await res.json();

        if (res.ok && payload.success) {
        // Extract the secure access_token from the backend response structure
        const token = payload.data?.session?.access_token;
        
        if (token) {
            // Store the raw string token securely into your browser context
            localStorage.setItem(
              'sb-access-token',
              payload.data.session.access_token
            );

            localStorage.setItem(
              'sb-refresh-token',
              payload.data.session.refresh_token
            );

            localStorage.setItem(
              'admin-profile',
              JSON.stringify(payload.data.user)
            );

            onLoginSuccess(payload.data.user);
        } else {
            setError('Authentication succeeded, but no access token was returned.');
        }
        } else {
        setError(payload.message || 'Invalid administrative credentials.');
        }
    } catch (err) {
        console.error('Login routing failure:', err);
        setError('Cannot connect to authorization server.');
    } finally {
        setLoading(false);
    }
    };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '320px' }}>
        <h2 style={{ marginBottom: '20px', fontWeight: '800', color: '#1a1a1a' }}>🐝 dialectGo Admin</h2>
        
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="admin@dialectgo.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#94a3b8' : '#1a1a1a', 
            color: '#FFD230', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '700', 
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;