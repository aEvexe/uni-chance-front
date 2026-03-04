import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api.js';

function priorityClass(p) {
  const v = (p || '').toLowerCase();
  if (v === 'high') return 'priority-high';
  if (v === 'medium') return 'priority-medium';
  return 'priority-low';
}

function categoryBadgeClass(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'REACH') return 'badge-reach';
  if (c === 'LOW') return 'badge-low';
  return 'badge-match';
}

function ImprovementList({ items, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="pred-improve-sub">
      <div className="pred-improve-label">{label}</div>
      {items.map((item, i) => (
        <div key={i} className="pred-improve-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ece3d5', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.area}</span>
            {item.impactOnScore != null && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#ece3d5' }}>+{item.impactOnScore} impact</span>
            )}
          </div>
          {(item.currentValue != null || item.targetValue != null) && (
            <div style={{ color: 'rgba(236,227,213,0.5)', fontSize: '0.82rem', marginTop: 4 }}>
              {item.currentValue != null && `Current: ${item.currentValue}`}
              {item.currentValue != null && item.targetValue != null && ' → '}
              {item.targetValue != null && `Target: ${item.targetValue}`}
            </div>
          )}
          {item.explanation && (
            <p style={{ color: 'rgba(236,227,213,0.6)', fontSize: '0.84rem', marginTop: 4, lineHeight: 1.4 }}>{item.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Prediction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    api.get(`/predictions/${id}`)
      .then(res => setPrediction(res.data))
      .catch(() => setError('Failed to load prediction'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRetry() {
    setRetrying(true);
    try {
      await api.post(`/predictions/${id}/predict`);
      const res = await api.get(`/predictions/${id}`);
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Retry failed');
    } finally {
      setRetrying(false);
    }
  }

  if (loading) return <><Navbar /><div className="spinner" /></>;
  if (error) return <><Navbar /><div className="page-container"><div className="msg msg-error">{error}</div></div></>;
  if (!prediction) return null;

  const result = prediction.predictionResult;
  const status = (prediction.status || '').toUpperCase();

  return (
    <>
      <Navbar />
      <div className="page-container">
        <button className="btn btn-gray btn-sm mb-12" onClick={() => navigate('/predictions')}>← Back</button>

        {/* Header section */}
        <div className="pred-header">
          <div style={{ color: 'rgba(236,227,213,0.5)', fontSize: '0.9rem', marginBottom: 6 }}>
            {prediction.universityName || prediction.university?.name || 'University'} · {prediction.major || '—'}
          </div>

          {status === 'PENDING' && (
            <div style={{ color: '#ece3d5', fontSize: '1.1rem' }}>
              ⏳ Prediction in progress…
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-blue btn-sm" onClick={handleRetry} disabled={retrying}>
                  {retrying ? 'Running…' : '▶ Run Now'}
                </button>
              </div>
            </div>
          )}

          {status === 'FAILED' && (
            <div>
              <div className="msg msg-error">Prediction failed</div>
              <button className="btn btn-salmon btn-sm" onClick={handleRetry} disabled={retrying}>
                {retrying ? 'Retrying…' : '🔄 Retry'}
              </button>
            </div>
          )}

          {result && (
            <>
              <div className="score-ring" style={{
                borderColor: result.category === 'REACH' ? '#c4795a'
                  : result.category === 'LOW' ? '#8a9a6b'
                  : '#c4a44a'
              }}>
                <div className="score-number">{Math.round(result.overallScore ?? 0)}</div>
                <div className="score-label">/ 100</div>
              </div>

              {result.category && (
                <span className={`badge ${categoryBadgeClass(result.category)}`} style={{ fontSize: '1rem', padding: '6px 18px' }}>
                  {result.category}
                </span>
              )}
            </>
          )}
        </div>

        {/* Feedback section */}
        {result?.feedback && (
          <div className="pred-feedback">
            <div className="pred-section-title">📝 Your Assessment</div>
            <p className="pred-feedback-text">{result.feedback}</p>
          </div>
        )}

        {/* Cheerup message */}
        {prediction.cheerup_message && (
          <div className="pred-cheerup">
            <div className="pred-section-title">💬 Keep Going!</div>
            <p className="pred-cheerup-text">{prediction.cheerup_message}</p>
          </div>
        )}

        {/* Roadmap section */}
        {result?.roadmap && result.roadmap.length > 0 && (
          <div className="pred-section pred-section--roadmap">
            <div className="pred-section-title">🗺️ Improvement Roadmap</div>
            {result.roadmap.map((step, i) => (
              <div key={i} className={`roadmap-step ${priorityClass(step.priority)}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 'bold', color: '#ece3d5', fontSize: '0.95rem', flex: 1 }}>{step.title}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {step.priority && (
                      <span className={`badge badge-${step.priority.toLowerCase()}`}>{step.priority}</span>
                    )}
                    {step.timeline && (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#ece3d5' }}>{step.timeline}</span>
                    )}
                  </div>
                </div>
                {step.description && (
                  <p style={{ color: 'rgba(236,227,213,0.7)', fontSize: '0.87rem', marginTop: 6, lineHeight: 1.5 }}>{step.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Improvement areas section */}
        {result?.improvementAreas && (
          <div className="pred-section pred-section--improve">
            <div className="pred-section-title">📈 Improvement Areas</div>
            <ImprovementList items={result.improvementAreas.academics} label="🎓 Academics" />
            <ImprovementList items={result.improvementAreas.extracurriculars} label="🏃 Extracurriculars" />
            <ImprovementList items={result.improvementAreas.honors} label="🏅 Honors" />
          </div>
        )}

        {/* Recommended activities section */}
        {result?.recommendedActivities && result.recommendedActivities.length > 0 && (
          <div className="pred-section pred-section--activities">
            <div className="pred-section-title">🌟 Recommended Activities ({result.recommendedActivities.length})</div>
            {result.recommendedActivities.map((act, i) => (
              <div key={i} className="pred-activity-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ color: '#ece3d5', fontWeight: 'bold', fontSize: '0.95rem' }}>{act.title}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {act.type && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#ece3d5' }}>{act.type}</span>}
                    {act.difficulty && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#ece3d5' }}>{act.difficulty}</span>}
                    {act.impactLevel && <span className="badge badge-high">{act.impactLevel} impact</span>}
                  </div>
                </div>
                {act.description && (
                  <p style={{ color: 'rgba(236,227,213,0.6)', fontSize: '0.85rem', marginTop: 6, lineHeight: 1.4 }}>{act.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
