import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleVerify(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      const { userId, user } = res.data;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', userId || user?._id || user?.id || '');
      setSuccess('Email verified!');
      setTimeout(() => navigate('/universities'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-container">
      <div className="panel panel-sm">
        <div className="panel-title">Verify Email ✉️</div>
        <p style={{ color: 'rgba(232,228,223,0.65)', fontFamily: "'Libre Baskerville', serif", textAlign: 'center', marginBottom: 20, fontSize: '0.9rem' }}>
          Enter the 6-digit code we sent to your email.
        </p>

        {error && <div className="msg msg-error">{error}</div>}
        {success && <div className="msg msg-success">{success}</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              className="form-input"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
              style={{ fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center' }}
            />
          </div>
          <button className="btn btn-blue btn-full" type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
