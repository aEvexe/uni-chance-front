const LEVELS = ['SCHOOL', 'CITY', 'STATE', 'NATIONAL', 'INTERNATIONAL'];
const POSITIONS = ['MEMBER', 'VICE_PRECIDENT', 'PRESIDENT', 'CAPTAIN', 'ORGANIZER', 'OTHERS'];

const POSITION_LABELS = {
  MEMBER: 'Member',
  VICE_PRECIDENT: 'Vice President',
  PRESIDENT: 'President',
  CAPTAIN: 'Captain',
  ORGANIZER: 'Organizer',
  OTHERS: 'Others',
};

export default function ActivityForm({ activities, setActivities }) {
  function add() {
    setActivities([...activities, { name: '', level: 'SCHOOL', position: 'MEMBER', description: '', hoursPerWeek: '', startDate: '', endDate: '' }]);
  }

  function remove(i) {
    setActivities(activities.filter((_, idx) => idx !== i));
  }

  function update(i, field, val) {
    setActivities(activities.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  }

  return (
    <div>
      {activities.map((act, i) => (
        <div key={i} style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div className="dynamic-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Activity Name</label>
              <input
                className="form-input"
                placeholder="e.g. Math Olympiad"
                value={act.name}
                onChange={e => update(i, 'name', e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-salmon btn-sm" style={{ marginBottom: 2 }} onClick={() => remove(i)}>✕</button>
          </div>
          <div className="dynamic-row">
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={act.level} onChange={e => update(i, 'level', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <select className="form-select" value={act.position} onChange={e => update(i, 'position', e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{POSITION_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Hours/Week</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 10"
                value={act.hoursPerWeek}
                onChange={e => update(i, 'hoursPerWeek', e.target.value)}
              />
            </div>
          </div>
          <div className="dynamic-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Description</label>
              <input
                className="form-input"
                placeholder="Brief description (optional)"
                value={act.description}
                onChange={e => update(i, 'description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={act.startDate} onChange={e => update(i, 'startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={act.endDate} onChange={e => update(i, 'endDate', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-green btn-sm" onClick={add}>+ Add Activity</button>
    </div>
  );
}
