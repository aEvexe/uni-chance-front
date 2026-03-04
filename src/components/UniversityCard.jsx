import { useNavigate } from 'react-router-dom';

export default function UniversityCard({ university }) {
  const navigate = useNavigate();
  const u = university;

  return (
    <div className="card" onClick={() => navigate(`/universities/${u._id || u.id}`)}>
      {u.univ_logo ? (
        <img src={u.univ_logo} alt={u.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.1)', padding: 4, marginBottom: 10 }} />
      ) : (
        <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎓</div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#e8e4df', marginBottom: 6, lineHeight: 1.2 }}>
        {u.name}
      </div>
      {u.location && (
        <div style={{ fontSize: '0.83rem', color: 'rgba(232,228,223,0.6)', marginBottom: 4 }}>
          📍 {typeof u.location === 'string' ? u.location : [u.location.city, u.location.state, u.location.country].filter(Boolean).join(', ')}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {u.ranking != null && (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>
            #{u.ranking}
          </span>
        )}
        {u.acceptanceRate != null && (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#e8e4df' }}>
            {u.acceptanceRate}% accept
          </span>
        )}
      </div>
    </div>
  );
}
