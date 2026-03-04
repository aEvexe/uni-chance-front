import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', res.data.userId || res.data._id || res.data.id || '');
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  return (
    <div className="center-container">
      <div className="spinner" />
    </div>
  );
}
