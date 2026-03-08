import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [sliderStyle, setSliderStyle] = useState(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const sliderW = useRef(0);

  function switchTab(newTab) {
    if (newTab === tab) return;
    setTab(newTab);
    setError('');
    // Scale up, slide, then scale back down
    const from = tab === 'register' ? 'translateX(100%)' : 'translateX(0)';
    const to = newTab === 'register' ? 'translateX(100%)' : 'translateX(0)';
    // Step 1: scale up at current position
    setSliderStyle({
      transform: `${from} scale(1.08)`,
      transition: 'transform 0.15s ease-out',
    });
    // Step 2: move while big
    setTimeout(() => {
      setSliderStyle({
        transform: `${to} scale(1.08)`,
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      });
    }, 150);
    // Step 3: shrink back
    setTimeout(() => {
      setSliderStyle({
        transform: `${to} scale(1)`,
        transition: 'transform 0.2s ease-out',
      });
    }, 400);
    setTimeout(() => setSliderStyle(null), 600);
  }

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    velocity.current = 0;
    const tabsEl = e.currentTarget.parentElement;
    sliderW.current = (tabsEl.offsetWidth - 8) / 2;
    const startOffset = tab === 'register' ? sliderW.current : 0;
    e.currentTarget.setPointerCapture(e.pointerId);

    // Immediately scale up on grab
    setSliderStyle({
      transform: `translateX(${startOffset}px) scale(1.08)`,
      transition: 'transform 0.15s ease-out',
    });

    const onMove = (ev) => {
      if (!dragging.current) return;
      const dx = ev.clientX - startX.current;
      lastX.current = ev.clientX;
      const raw = startOffset + dx;
      const x = Math.max(0, Math.min(raw, sliderW.current));
      setSliderStyle({
        transform: `translateX(${x}px) scale(1.08)`,
        transition: 'none',
      });
    };

    const onUp = (ev) => {
      if (!dragging.current) return;
      dragging.current = false;
      const dx = ev.clientX - startX.current;
      const final = startOffset + dx;
      const half = sliderW.current / 2;
      const newTab = final > half ? 'register' : 'login';
      setTab(newTab);
      // Bounce to position while still big
      const target = newTab === 'register' ? 'translateX(100%)' : 'translateX(0)';
      setSliderStyle({
        transform: `${target} scale(1.08)`,
        transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      });
      // Then shrink back
      setTimeout(() => {
        setSliderStyle({
          transform: `${target} scale(1)`,
          transition: 'transform 0.2s ease-out',
        });
      }, 250);
      setTimeout(() => setSliderStyle(null), 450);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [tab]);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { userId, user } = res.data;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', userId || user?._id || user?.id || '');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/register', { firstName: regName, email: regEmail, password: regPassword });
      navigate('/verify', { state: { email: regEmail } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function oauthLogin(provider) {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5500/v1');
    window.location.href = `${apiBase}/auth/${provider}`;
  }

  return (
    <div className="center-container">
      <div className="panel panel-sm">
        <div className="panel-title">🎓 Uni-chance</div>

        <div className="tabs">
          <div
            className="tab-slider"
            onPointerDown={onPointerDown}
            style={sliderStyle || {
              transform: tab === 'register' ? 'translateX(100%)' : 'translateX(0)',
            }}
          />
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
            Login
          </button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>
            Register
          </button>
        </div>

        {error && <div className="msg msg-error">{error}</div>}
        {success && <div className="msg msg-success">{success}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <Link to="/forgot" style={{ color: 'rgba(232,228,223,0.55)', fontSize: '0.85rem', fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic' }}>Forgot password?</Link>
            </div>
            <button className="btn btn-blue btn-full" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
            </div>
            <button className="btn btn-purple btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="divider">or continue with</div>

        <div className="ts-stack">
          <button className="btn btn-full ts-nudge" style={{ background: '#d4d0ca', color: '#3a3a38', fontSize: '1.05rem', padding: '12px 18px' }} onClick={() => oauthLogin('google')}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.08 24.08 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
