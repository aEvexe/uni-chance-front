import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../api.js';

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <button className="accordion-header" onClick={() => setOpen(!open)}>
        {title} <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export default function University() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/university/${id}`)
      .then(res => setUni(res.data))
      .catch(() => setError('Failed to load university'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><Navbar /><div className="spinner" /></>;
  if (error) return <><Navbar /><div className="page-container"><div className="msg msg-error">{error}</div></div></>;
  if (!uni) return null;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <button className="btn btn-gray btn-sm mb-12" onClick={() => navigate('/universities')}>← Back</button>

        <div className="panel">
          {/* Hero */}
          <div className="uni-hero">
            {uni.univ_logo ? (
              <img src={uni.univ_logo} alt={uni.name} className="uni-logo" />
            ) : (
              <div className="uni-logo-placeholder">🎓</div>
            )}
            <div className="uni-info" style={{ flex: 1 }}>
              <h1>{uni.name}</h1>
              {uni.desc && (
                <p style={{ color: 'rgba(232,228,223,0.7)', marginTop: 8, fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {uni.desc}
                </p>
              )}
              <div className="uni-meta mt-12">
                {uni.location && <span className="uni-meta-item">📍 {typeof uni.location === 'string' ? uni.location : [uni.location.city, uni.location.state, uni.location.country].filter(Boolean).join(', ')}</span>}
                {uni.ranking != null && <span className="uni-meta-item">🏆 Rank #{uni.ranking}</span>}
                {uni.acceptanceRate != null && <span className="uni-meta-item">✅ {uni.acceptanceRate}% acceptance</span>}
                {uni.phone && <span className="uni-meta-item">📞 {uni.phone}</span>}
                {uni.scholarship && <span className="uni-meta-item">💰 {uni.scholarship.replace(/_/g, ' ')}</span>}
              </div>
            </div>
          </div>

          {/* Cheerup message */}
          {uni.cheerup_message && (
            <div style={{ background: 'rgba(138,172,134,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#e8e4df', fontSize: '0.92rem', lineHeight: 1.5, border: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              💬 {uni.cheerup_message}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              className="btn btn-purple"
              onClick={() => navigate(`/predictions?universityId=${id}&universityName=${encodeURIComponent(uni.name)}`)}
            >
              🎯 Run Prediction
            </button>
          </div>

          {/* Deadlines */}
          {(uni.early_desicion || uni.regular_desicion) && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-heading">📅 Application Deadlines</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {uni.early_desicion?.ED_starting && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>ED Opens</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.early_desicion.ED_starting).toLocaleDateString()}</div>
                  </div>
                )}
                {uni.early_desicion?.ED_deadline && (
                  <div style={{ background: 'rgba(196,144,138,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>ED Deadline</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.early_desicion.ED_deadline).toLocaleDateString()}</div>
                  </div>
                )}
                {uni.early_desicion?.ED2_starting && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>ED2 Opens</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.early_desicion.ED2_starting).toLocaleDateString()}</div>
                  </div>
                )}
                {uni.early_desicion?.ED2_deadline && (
                  <div style={{ background: 'rgba(196,144,138,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>ED2 Deadline</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.early_desicion.ED2_deadline).toLocaleDateString()}</div>
                  </div>
                )}
                {uni.regular_desicion?.RD_starting && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>RD Opens</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.regular_desicion.RD_starting).toLocaleDateString()}</div>
                  </div>
                )}
                {uni.regular_desicion?.RD_deadline && (
                  <div style={{ background: 'rgba(196,144,138,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.78rem' }}>RD Deadline</div>
                    <div style={{ color: '#e8e4df', fontSize: '0.95rem' }}>{new Date(uni.regular_desicion.RD_deadline).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Majors — full detail table */}
          {uni.major && uni.major.length > 0 && (
            <Accordion title={`📚 Majors (${uni.major.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {uni.major.map((m, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ color: '#e8e4df', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: 6 }}>{m.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {m.ranking != null && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>Rank #{m.ranking}</span>}
                      {m.acceptanceRate != null && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>{m.acceptanceRate}% accept</span>}
                      {m.averageGPA != null && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>GPA {m.averageGPA}</span>}
                      {m.avarageSAT != null && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>SAT {m.avarageSAT}</span>}
                      {m.averageIELTS != null && <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e4df' }}>IELTS {m.averageIELTS}</span>}
                      {m.minIELTS != null && <span className="badge" style={{ background: 'rgba(196,144,138,0.25)', color: '#e8e4df' }}>Min IELTS {m.minIELTS}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {/* Links */}
          {uni.links && uni.links.length > 0 && (
            <Accordion title="🔗 Links">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {uni.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#9ab8c8', fontSize: '0.9rem' }}>
                    {link.title || link.url}
                  </a>
                ))}
              </div>
            </Accordion>
          )}
        </div>
      </div>
    </>
  );
}
