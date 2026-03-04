import { useNavigate } from 'react-router-dom';

function statusBadge(status) {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETE' || s === 'COMPLETED') return 'badge-complete';
  if (s === 'FAILED') return 'badge-failed';
  return 'badge-pending';
}

function categoryBadge(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'REACH') return 'badge-reach';
  if (c === 'LOW') return 'badge-low';
  return 'badge-match';
}

export default function PredictionCard({ prediction }) {
  const navigate = useNavigate();
  const p = prediction;
  const id = p._id || p.id;
  const result = p.predictionResult;

  return (
    <div className="prediction-item" onClick={() => navigate(`/predictions/${id}`)}>
      <div>
        <div style={{ fontWeight: 'bold', color: '#e8e4df', fontSize: '1rem' }}>
          {p.universityName || p.university?.name || 'University'}
        </div>
        <div style={{ color: 'rgba(232,228,223,0.6)', fontSize: '0.85rem', marginTop: 3 }}>
          {p.major || '—'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {result?.overallScore != null && (
          <span style={{ color: '#e8e4df', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {Math.round(result.overallScore)}
          </span>
        )}
        {result?.category && (
          <span className={`badge ${categoryBadge(result.category)}`}>
            {result.category}
          </span>
        )}
        <span className={`badge ${statusBadge(p.status)}`}>
          {p.status || 'PENDING'}
        </span>
      </div>
    </div>
  );
}
