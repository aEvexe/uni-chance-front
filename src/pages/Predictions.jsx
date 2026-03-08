import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import PredictionCard from '../components/PredictionCard.jsx';
import ExamForm from '../components/ExamForm.jsx';
import ActivityForm from '../components/ActivityForm.jsx';
import HonorForm from '../components/HonorForm.jsx';
import api from '../api.js';

const NOW = new Date();
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const COMMON_MAJORS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Business Administration', 'Economics', 'Finance',
  'Biology', 'Chemistry', 'Physics', 'Mathematics',
  'Political Science', 'International Relations', 'Psychology',
  'Medicine (Pre-Med)', 'Nursing', 'Public Health',
  'Law (Pre-Law)', 'Philosophy', 'History', 'English Literature',
  'Environmental Science', 'Data Science', 'Biomedical Engineering',
  'Architecture', 'Film & Media Studies', 'Music',
  'Neuroscience', 'Statistics', 'Applied Mathematics',
  'Communications', 'Journalism', 'Education',
];

function fmtLocation(loc) {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}

function UniSearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const closingTimer = useRef(null);

  function openDropdown() {
    clearTimeout(closingTimer.current);
    setDropdownClosing(false);
    setDropdownVisible(true);
    setDropdownOpen(true);
  }

  function closeDropdown() {
    if (!dropdownOpen) return;
    setDropdownClosing(true);
    setDropdownOpen(false);
    closingTimer.current = setTimeout(() => {
      setDropdownVisible(false);
      setDropdownClosing(false);
    }, 250);
  }

  async function fetchResults(q) {
    try {
      const res = await api.get('/university', { params: q ? { search: q } : {} });
      return (res.data?.data || res.data || []).slice(0, 10);
    } catch { return []; }
  }

  const skipNextOpen = useRef(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      const data = await fetchResults(query);
      setResults(data);
      if (data.length > 0 && query && !skipNextOpen.current) openDropdown();
      skipNextOpen.current = false;
    }, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [query]);

  async function handleClick() {
    if (dropdownOpen) { closeDropdown(); return; }
    if (results.length > 0) { openDropdown(); return; }
    const data = await fetchResults('');
    setResults(data);
    if (data.length > 0) openDropdown();
  }

  function handleClear() {
    setQuery('');
    onChange(null);
    closeDropdown();
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          style={{ paddingRight: query ? 36 : 12 }}
          placeholder="🔍 Search university…"
          value={query}
          onChange={e => { setQuery(e.target.value); openDropdown(); if (!e.target.value) onChange(null); }}
          onClick={handleClick}
          onBlur={() => setTimeout(() => closeDropdown(), 200)}
        />
        {query && (
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleClear}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
              width: 22, height: 22, color: '#e8e4df', fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fredoka One, cursive'
            }}
          >✕</button>
        )}
      </div>
      {dropdownVisible && results.length > 0 && (
        <div className={`search-dropdown-wrap ${dropdownClosing ? 'closing' : ''}`}>
        <div className="search-dropdown">
          {results.map(u => (
            <div key={u._id || u.id} className="search-dropdown-item"
              onMouseDown={() => { onChange({ id: u._id || u.id, name: u.name }); skipNextOpen.current = true; setQuery(u.name); setDropdownOpen(false); setDropdownVisible(false); setDropdownClosing(false); clearTimeout(closingTimer.current); }}
            >
              {u.univ_logo ? (
                <img src={u.univ_logo} alt="" style={{
                  width: 32, height: 32, objectFit: 'contain',
                  borderRadius: 6, background: 'rgba(255,255,255,0.1)', padding: 2, flexShrink: 0
                }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0
                }}>🎓</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e8e4df', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.name}
                </div>
                {u.location && (
                  <div style={{ color: 'rgba(232,228,223,0.4)', fontSize: '0.78rem' }}>
                    {fmtLocation(u.location)}
                  </div>
                )}
              </div>
              {u.ranking != null && (
                <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px', color: 'rgba(232,228,223,0.6)', fontSize: '0.75rem', flexShrink: 0 }}>
                  #{u.ranking}
                </span>
              )}
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default function Predictions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem('userId');

  const prefillUniId = searchParams.get('universityId');
  const prefillUniName = searchParams.get('universityName');

  const [predictions, setPredictions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(!!prefillUniId);

  // form state — restore from sessionStorage on mount
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem('predictionForm') || '{}'); } catch { return {}; } })();
  const [university, setUniversity] = useState(
    prefillUniId ? { id: prefillUniId, name: prefillUniName || '' } : saved.university || null
  );
  const [major, setMajor] = useState(saved.major || '');
  const [majorSuggestions, setMajorSuggestions] = useState([]);
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
  const [exams, setExams] = useState(saved.exams || []);
  const [activities, setActivities] = useState(saved.activities || []);
  const [honors, setHonors] = useState(saved.honors || []);
  const [currentMonth, setCurrentMonth] = useState(saved.currentMonth || NOW.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(saved.currentYear || NOW.getFullYear());
  const [applyMonth, setApplyMonth] = useState(saved.applyMonth || 1);
  const [applyYear, setApplyYear] = useState(saved.applyYear || NOW.getFullYear() + 1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // persist form state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('predictionForm', JSON.stringify({
      university, major, exams, activities, honors, currentMonth, currentYear, applyMonth, applyYear
    }));
  }, [university, major, exams, activities, honors, currentMonth, currentYear, applyMonth, applyYear]);

  const loadPredictions = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/predictions/me');
      setPredictions(res.data?.data || res.data || []);
    } catch {}
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { loadPredictions(); }, [loadPredictions]);

  // fetch majors when university changes — use COMMON_MAJORS as fallback
  useEffect(() => {
    if (!university?.id) { setMajorSuggestions(COMMON_MAJORS); return; }
    api.get(`/university/${university.id}`)
      .then(res => {
        const apiMajors = (res.data?.major || []).map(m => m.name).filter(Boolean);
        // merge: API majors first, then common majors not already in the list
        const merged = [...apiMajors];
        for (const cm of COMMON_MAJORS) {
          if (!merged.some(m => m.toLowerCase() === cm.toLowerCase())) merged.push(cm);
        }
        setMajorSuggestions(merged);
      })
      .catch(() => { setMajorSuggestions(COMMON_MAJORS); });
  }, [university?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!university) { setFormError('Please select a university'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        universityId: university.id,
        major,
        status: 'PENDING',
        currentMonth: Number(currentMonth),
        currentYear: Number(currentYear),
        applyMonth: Number(applyMonth),
        applyYear: Number(applyYear),
        exams: exams.map(ex => ({
          type: ex.type,
          score: Number(ex.score),
          ...(ex.maxScore ? { maxScore: Number(ex.maxScore) } : {}),
          ...(ex.dateTaken ? { dateTaken: new Date(ex.dateTaken).toISOString() } : {}),
        })),
        activities: activities.map(a => ({
          name: a.name,
          level: a.level,
          position: a.position,
          ...(a.description ? { description: a.description } : {}),
          ...(a.hoursPerWeek ? { hoursPerWeek: Number(a.hoursPerWeek) } : {}),
          ...(a.startDate ? { startDate: new Date(a.startDate).toISOString() } : {}),
          ...(a.endDate ? { endDate: new Date(a.endDate).toISOString() } : {}),
        })),
        honors: honors.map(h => ({
          title: h.title,
          level: h.level,
          ...(h.description ? { description: h.description } : {}),
          ...(h.dateReceived ? { dateReceived: new Date(h.dateReceived).toISOString() } : {}),
        })),
      };
      const createRes = await api.post('/predictions', payload);
      const predId = createRes.data?._id || createRes.data?.id;
      await api.post(`/predictions/${predId}/predict`);
      sessionStorage.removeItem('predictionForm');
      setShowForm(false);
      await loadPredictions();
      navigate(`/predictions/${predId}`);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/pricing');
        return;
      }
      setFormError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const years = Array.from({ length: 8 }, (_, i) => NOW.getFullYear() - 2 + i);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <button className="btn btn-gray btn-sm mb-12" onClick={() => navigate('/')}>← Back</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ color: '#e8e4df', fontSize: '1.8rem' }}>My Predictions</h1>
          <button className="btn btn-purple" onClick={() => setShowForm(f => !f)}>
            {showForm ? '✕ Cancel' : '+ New Prediction'}
          </button>
        </div>

        {showForm && (
          <div className="panel mb-12" style={{ marginBottom: 24 }}>
            <div className="panel-title" style={{ textAlign: 'left', marginBottom: 16 }}>New Prediction</div>
            {formError && <div className="msg msg-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">University *</label>
                <UniSearch value={university} onChange={setUniversity} />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Major / Field of Study</label>
                <input
                  className="form-input"
                  placeholder="Click to see majors or type to search…"
                  value={major}
                  onChange={e => { setMajor(e.target.value); setMajorDropdownOpen(true); }}
                  onClick={() => setMajorDropdownOpen(!majorDropdownOpen)}
                  onBlur={() => setTimeout(() => setMajorDropdownOpen(false), 200)}
                />
                {majorDropdownOpen && majorSuggestions.length > 0 && (() => {
                  const filtered = majorSuggestions.filter(m => !major || m.toLowerCase().includes(major.toLowerCase()));
                  if (filtered.length === 0) return null;
                  return (
                    <div className="search-dropdown-wrap">
                      <div className="search-dropdown">
                        {filtered.map((m, i) => (
                          <div
                            key={i}
                            className="search-dropdown-item"
                            onMouseDown={() => { setMajor(m); setMajorDropdownOpen(false); }}
                          >
                            <span style={{ fontSize: '0.92rem', color: '#e8e4df', fontWeight: 'bold' }}>📚 {m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="section-heading mt-16">📝 Standardized Exams</div>
              <ExamForm exams={exams} setExams={setExams} />

              <div className="section-heading mt-16">🏃 Extracurricular Activities</div>
              <ActivityForm activities={activities} setActivities={setActivities} />

              <div className="section-heading mt-16">🏅 Academic Honors</div>
              <HonorForm honors={honors} setHonors={setHonors} />

              <div className="section-heading mt-16">📅 Timeline</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Current Month</label>
                  <select className="form-select" value={currentMonth} onChange={e => setCurrentMonth(e.target.value)}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Current Year</label>
                  <select className="form-select" value={currentYear} onChange={e => setCurrentYear(e.target.value)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Apply Month</label>
                  <select className="form-select" value={applyMonth} onChange={e => setApplyMonth(e.target.value)}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Apply Year</label>
                  <select className="form-select" value={applyYear} onChange={e => setApplyYear(e.target.value)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-16">
                <button className="btn btn-purple btn-full" type="submit" disabled={submitting}>
                  {submitting ? '🔮 Analyzing…' : '🚀 Run Prediction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Premium banner */}
        <div
          onClick={() => navigate('/pricing')}
          style={{
            background: 'linear-gradient(135deg, #3a3330 0%, #453c36 100%)',
            border: '1px solid rgba(196,164,74,0.3)',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,164,74,0.6)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(196,164,74,0.3)'}
        >
          <div>
            <div style={{
              fontFamily: 'Fredoka One, cursive',
              color: '#c4a44a',
              fontSize: '1.1rem',
              marginBottom: 4,
            }}>
              Get Premium
            </div>
            <div style={{
              color: 'rgba(236,227,213,0.5)',
              fontSize: '0.85rem',
            }}>
              Unlock unlimited AI predictions, detailed roadmaps & activity recommendations
            </div>
          </div>
          <div style={{
            background: '#c4a44a',
            color: '#2c2521',
            padding: '8px 20px',
            borderRadius: 8,
            fontFamily: 'Fredoka One, cursive',
            fontSize: '0.85rem',
            flexShrink: 0,
            marginLeft: 16,
          }}>
            View Plans
          </div>
        </div>

        {loadingList ? (
          <div className="spinner" />
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(232,228,223,0.5)', marginTop: 40, fontSize: '1.1rem' }}>
            No predictions yet. Create your first one!
          </div>
        ) : (
          <div>
            {predictions.map(p => (
              <PredictionCard key={p._id || p.id} prediction={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
