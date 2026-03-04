import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

export default function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRequest(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Reset code sent! Check your email.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword: password });
      setSuccess('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-container">
      <div className="panel panel-sm">
        <div className="panel-title">
          {step === 'request' ? 'Forgot Password 🔑' : 'Reset Password 🔐'}
        </div>

        {error && <div className="msg msg-error">{error}</div>}
        {success && <div className="msg msg-success">{success}</div>}

        {step === 'request' ? (
          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-blue btn-full" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Code'}
            </button>
            <div className="mt-12 text-center">
              <button type="button" className="btn btn-gray btn-sm" onClick={() => navigate('/login')}>
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Reset Code</label>
              <input
                className="form-input"
                type="text"
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                style={{ textAlign: 'center', letterSpacing: '0.2em' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-purple btn-full" type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
            <div className="mt-12 text-center">
              <button type="button" className="btn btn-gray btn-sm" onClick={() => setStep('request')}>
                ← Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
