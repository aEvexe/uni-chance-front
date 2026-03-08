import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api.js';
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const [hidden, setHidden] = useState(false);
  const [isPremium, setIsPremium] = useState(localStorage.getItem('isPremium') === 'true');
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > 80 && y > lastY.current);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userId) return;
    api.get('/subscribtions/my')
      .then(res => {
        const active = res.data && res.data.status === 'Active';
        setIsPremium(active);
        localStorage.setItem('isPremium', active ? 'true' : 'false');
      })
      .catch(() => {});
  }, [userId]);

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('isPremium');
    navigate('/login');
  }

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <nav className={`navbar${hidden ? ' navbar-hidden' : ''}`}>
      <Link to="/" className="navbar-brand">
        <span style={{ position: 'relative', display: 'inline-block' }}>
          Uni-chance
          {isPremium && <svg style={{ width: 18, height: 18, position: 'absolute', top: -12, right: -14 }} viewBox="0 0 24 24" fill="#c4a44a"><path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-2.79-6.15a1.5 1.5 0 0 0-2.73-.02L6.61 10 1.34 8.62c-.81-.22-1.64.26-1.85 1.06-.1.39-.03.8.2 1.13l4.43 6.19h15.76l4.43-6.19c.24-.33.3-.74.2-1.13z"/></svg>}
        </span>
      </Link>
      <div className="navbar-nav">
        <Link to="/" className={`navbar-link${isActive('/') ? ' active' : ''}`}>HOME</Link>
        <Link to="/universities" className={`navbar-link${isActive('/universities') ? ' active' : ''}`}>UNIVERSITIES</Link>
        <Link to="/predictions" className={`navbar-link${isActive('/predictions') ? ' active' : ''}`}>PREDICTIONS</Link>
        <Link to="/pricing" className={`navbar-link navbar-premium${isActive('/pricing') ? ' active' : ''}`}>PREMIUM</Link>
      </div>
      <div className="navbar-actions">
        {userId ? (
          <button className="navbar-link" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Log Out
          </button>
        ) : (
          <Link to="/login" className="navbar-link">Log In</Link>
        )}
      </div>
    </nav>
  );
}
