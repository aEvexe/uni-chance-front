import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api.js';

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    api.get('/plans')
      .then(res => {
        const data = (res.data?.data || res.data || []).filter(p => p.isActive !== false);
        setPlans(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planId) {
    setCheckoutLoading(planId);
    try {
      const res = await api.post('/payment/create-checkout-session', { planId });
      const url = res.data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setCheckoutLoading(null);
    }
  }

  function getIntervalLabel(interval) {
    if (interval === 1) return '/month';
    if (interval === 3) return '/3 months';
    if (interval === 12) return '/year';
    return `/${interval} months`;
  }

  function getBadge(interval) {
    if (interval === 12) return 'Best Value';
    if (interval === 3) return 'Popular';
    return null;
  }

  function getSavings(plan, allPlans) {
    const monthly = allPlans.find(p => p.interval === 1);
    if (!monthly || plan.interval === 1) return null;
    const fullPrice = monthly.price * plan.interval;
    const saved = fullPrice - plan.price;
    if (saved <= 0) return null;
    const percent = Math.round((saved / fullPrice) * 100);
    return { saved: saved.toFixed(2), percent };
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <button className="btn btn-gray btn-sm mb-12" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {paymentStatus === 'success' && (
          <div className="msg msg-success" style={{ marginBottom: 20 }}>
            Payment successful! You now have unlimited predictions.
            <button
              className="btn btn-purple btn-sm"
              style={{ marginLeft: 12 }}
              onClick={() => navigate('/predictions')}
            >
              Go to Predictions
            </button>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="msg msg-error" style={{ marginBottom: 20 }}>
            Payment was cancelled. You can try again anytime.
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ color: '#ece3d5', fontSize: '2rem', marginBottom: 8 }}>
            Upgrade to Premium
          </h1>
          <p style={{ color: 'rgba(236,227,213,0.5)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            You've used your 2 free predictions. Subscribe to unlock unlimited AI-powered college admissions analysis.
          </p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(236,227,213,0.5)', marginTop: 40 }}>
            No plans available at the moment.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
            gap: 20,
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {plans.map(plan => {
              const badge = getBadge(plan.interval);
              const savings = getSavings(plan, plans);
              return (
                <div
                  key={plan._id || plan.id}
                  className="panel"
                  style={{
                    textAlign: 'center',
                    padding: '32px 24px',
                    position: 'relative',
                    border: badge === 'Best Value' ? '2px solid #c4a44a' : undefined,
                  }}
                >
                  {badge && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#c4a44a',
                      color: '#2c2521',
                      padding: '3px 14px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontFamily: 'Fredoka One, cursive',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}>
                      {badge}
                    </div>
                  )}

                  <h3 style={{
                    color: '#ece3d5',
                    fontSize: '1.2rem',
                    marginBottom: 12,
                    fontFamily: 'Fredoka One, cursive',
                  }}>
                    {plan.name}
                  </h3>

                  <div style={{ marginBottom: 20 }}>
                    <span style={{
                      color: '#c4a44a',
                      fontSize: '2.4rem',
                      fontFamily: 'Fredoka One, cursive',
                    }}>
                      ${plan.price}
                    </span>
                    <span style={{
                      color: 'rgba(236,227,213,0.4)',
                      fontSize: '0.9rem',
                    }}>
                      {getIntervalLabel(plan.interval)}
                    </span>
                    {savings && (
                      <div style={{
                        marginTop: 8,
                        color: '#8a9a6b',
                        fontSize: '0.82rem',
                        fontFamily: 'Fredoka One, cursive',
                      }}>
                        Save ${savings.saved} ({savings.percent}% off)
                      </div>
                    )}
                  </div>

                  <ul style={{
                    listStyle: 'none',
                    textAlign: 'left',
                    marginBottom: 24,
                    fontSize: '0.88rem',
                    color: 'rgba(236,227,213,0.7)',
                    lineHeight: '1.8',
                  }}>
                    <li>Unlimited predictions</li>
                    <li>Detailed AI analysis</li>
                    <li>Personalized roadmaps</li>
                    <li>Activity recommendations</li>
                  </ul>

                  <button
                    className="btn btn-purple btn-full"
                    disabled={checkoutLoading === (plan._id || plan.id)}
                    onClick={() => handleSubscribe(plan._id || plan.id)}
                  >
                    {checkoutLoading === (plan._id || plan.id)
                      ? 'Redirecting...'
                      : 'Subscribe'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: 40,
          color: 'rgba(236,227,213,0.3)',
          fontSize: '0.8rem',
        }}>
          Secure payment powered by Stripe. Cancel anytime.
        </div>
      </div>
    </>
  );
}
