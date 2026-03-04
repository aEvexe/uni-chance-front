import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UniversityCard from '../components/UniversityCard.jsx';
import api from '../api.js';

function fmtLocation(loc) {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}

export default function Universities() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const inputRef = useRef(null);
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

  const fetchUniversities = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/university', { params: q ? { search: q } : {} });
      const data = res.data?.data || res.data || [];
      setUniversities(data);
      return data;
    } catch (err) {
      setError('Failed to load universities');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUniversities(); }, [fetchUniversities]);

  // debounce search — update both grid and dropdown
  useEffect(() => {
    const t = setTimeout(async () => {
      const data = await fetchUniversities(search);
      setDropdownResults(data.slice(0, 10));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, fetchUniversities]);

  async function handleToggleDropdown() {
    if (dropdownOpen) {
      closeDropdown();
      return;
    }
    if (dropdownResults.length > 0) {
      openDropdown();
    } else if (universities.length > 0) {
      setDropdownResults(universities.slice(0, 10));
      openDropdown();
    } else {
      try {
        const res = await api.get('/university');
        const data = res.data?.data || res.data || [];
        setUniversities(data);
        setDropdownResults(data.slice(0, 10));
        if (data.length > 0) openDropdown();
      } catch {}
    }
  }

  function handleSelect(u) {
    setSearch('');
    closeDropdown();
    navigate(`/universities/${u._id || u.id}`);
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: '#ece3d5', fontSize: '1.8rem', marginBottom: 14 }}>Find Universities</h1>
          <div style={{ position: 'relative' }}>
            <div className="search-bar">
              <input
                ref={inputRef}
                className="form-input"
                type="text"
                placeholder="🔍  Search by name, location…"
                value={search}
                onChange={e => { setSearch(e.target.value); openDropdown(); }}
                onClick={handleToggleDropdown}
                onBlur={() => setTimeout(() => closeDropdown(), 200)}
              />
              {search && (
                <button className="btn btn-gray btn-sm" onClick={() => setSearch('')}>Clear</button>
              )}
            </div>

            {/* Dropdown */}
            {dropdownVisible && dropdownResults.length > 0 && (
              <div className={`search-dropdown-wrap ${dropdownClosing ? 'closing' : ''}`}>
              <div className="search-dropdown">
                {dropdownResults.map(u => (
                  <div key={u._id || u.id} className="search-dropdown-item" onMouseDown={() => handleSelect(u)}>
                    {u.univ_logo ? (
                      <img src={u.univ_logo} alt="" style={{
                        width: 36, height: 36, objectFit: 'contain',
                        borderRadius: 8, background: 'rgba(0,0,0,0.12)', padding: 3, flexShrink: 0
                      }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0
                      }}>🎓</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ece3d5', fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ color: 'rgba(236,227,213,0.5)', fontSize: '0.8rem' }}>
                        {fmtLocation(u.location)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {u.ranking != null && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 8px', color: 'rgba(236,227,213,0.7)', fontSize: '0.78rem' }}>
                          #{u.ranking}
                        </span>
                      )}
                      {u.acceptanceRate != null && (
                        <span style={{ background: 'rgba(0,0,0,0.12)', borderRadius: 6, padding: '2px 8px', color: 'rgba(236,227,213,0.5)', fontSize: '0.78rem' }}>
                          {u.acceptanceRate}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="msg msg-error">{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : universities.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', marginTop: 60, padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏫</div>
            <div style={{ color: '#ece3d5', fontSize: '1.2rem', marginBottom: 8 }}>
              {search ? `No results for "${search}"` : 'No universities yet'}
            </div>
            <div style={{ color: 'rgba(236,227,213,0.5)', fontSize: '0.9rem' }}>
              {search ? 'Try a different search term.' : 'Universities will appear here once added to the database.'}
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {universities.map(u => (
              <UniversityCard key={u._id || u.id} university={u} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
