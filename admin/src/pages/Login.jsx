// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const payload = await res.json();

        if (res.ok && payload.success) {
          // 1. Extract tokens cleanly matching your data pattern
          const { access_token, refresh_token } = payload.data?.session || {};
          
          if (access_token && refresh_token) {
            
            // 2. Set the web session explicitly
            // This instantiates Supabase's internal token manager loop in the browser background
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: access_token,
              refresh_token: refresh_token,
            });

            if (sessionError) {
              console.error('Session persistence error:', sessionError);
              setError('Failed to establish authenticated session.');
              return;
            }

            console.log("Admin Supabase session synced and auto-refresh active.");

            // 3. Store local profile information
            localStorage.setItem('admin-profile', JSON.stringify(payload.data.user));

            // 4. Trigger UI parent update
            onLoginSuccess(payload.data.user);
          } else {
            setError('Authentication succeeded, but session tokens were missing.');
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
      <form onSubmit={handleLogin} style={{ background: '#fffbeb', padding: '60px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '420px' }}>
        <h2 style={{ marginBottom: '30px', fontWeight: '800', color: '#1a1a1a', fontSize: '32px' }}>DialectGo Admin Login</h2>
        
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '14px', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '20px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px', color: '#64748b' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="admin@dialectgo.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px' }} 
            required 
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px', color: '#64748b' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px' }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '16px', 
            backgroundColor: loading ? '#94a3b8' : '#1a1a1a', 
            color: '#FFD230', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '700', 
            fontSize: '16px',
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