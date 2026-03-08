import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api.js';
import crownImg from '../assets/pngtree-golden-crown-vector-design-png-image_5415535.jpg';

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
          {isPremium && <img src={crownImg} alt="Premium" title="Premium Member" style={{ width: 20, height: 20, position: 'absolute', top: -12, right: -16, transform: 'rotate(20deg)', mixBlendMode: 'multiply' }} />}
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
