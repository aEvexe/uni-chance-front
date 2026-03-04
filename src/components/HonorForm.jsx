const LEVELS = ['SCHOOL', 'CITY', 'STATE', 'NATIONAL', 'INTERNATIONAL'];

export default function HonorForm({ honors, setHonors }) {
  function add() {
    setHonors([...honors, { title: '', level: 'SCHOOL', description: '', dateReceived: '' }]);
  }

  function remove(i) {
    setHonors(honors.filter((_, idx) => idx !== i));
  }

  function update(i, field, val) {
    setHonors(honors.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  }

  return (
    <div>
      {honors.map((honor, i) => (
        <div key={i} style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div className="dynamic-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Honor / Award Title</label>
              <input
                className="form-input"
                placeholder="e.g. National Science Fair Winner"
                value={honor.title}
                onChange={e => update(i, 'title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={honor.level} onChange={e => update(i, 'level', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-salmon btn-sm" style={{ marginBottom: 2 }} onClick={() => remove(i)}>✕</button>
          </div>
          <div className="dynamic-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Description (optional)</label>
              <input
                className="form-input"
                placeholder="Brief description"
                value={honor.description}
                onChange={e => update(i, 'description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date Received</label>
              <input className="form-input" type="date" value={honor.dateReceived} onChange={e => update(i, 'dateReceived', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-green btn-sm" onClick={add}>+ Add Honor</button>
    </div>
  );
}
