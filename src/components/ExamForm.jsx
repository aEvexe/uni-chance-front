const EXAM_TYPES = ['SAT', 'ACT', 'IELTS', 'DUOLINGO', 'CEFR', 'TOEFL'];

export default function ExamForm({ exams, setExams }) {
  function add() {
    setExams([...exams, { type: 'SAT', score: '', maxScore: '', dateTaken: '' }]);
  }

  function remove(i) {
    setExams(exams.filter((_, idx) => idx !== i));
  }

  function update(i, field, val) {
    const next = exams.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    setExams(next);
  }

  return (
    <div>
      {exams.map((exam, i) => (
        <div className="dynamic-row" key={i}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={exam.type}
              onChange={e => update(i, 'type', e.target.value)}
            >
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Score</label>
            <input
              className="form-input"
              type="number"
              placeholder="Score"
              value={exam.score}
              onChange={e => update(i, 'score', e.target.value)}
            />
          </div>
<div className="form-group">
            <label className="form-label">Date Taken</label>
            <input
              className="form-input"
              type="date"
              value={exam.dateTaken}
              onChange={e => update(i, 'dateTaken', e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-salmon btn-sm" style={{ marginBottom: 2 }} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-green btn-sm" onClick={add}>+ Add Exam</button>
    </div>
  );
}
