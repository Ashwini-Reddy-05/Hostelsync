import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

function ComplaintRow({ c, onSaved, onError }) {
  const [status, setStatus] = useState(c.status);
  const [remark, setRemark] = useState(c.technicianRemark || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/complaints/${c.id}/status`, { status, remark });
      onSaved();
    } catch (err) {
      onError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>{c.student.name}<div className="muted small">{c.student.room?.roomNumber || 'no room'}</div></td>
      <td>{c.category}</td>
      <td>{c.description}<div className="muted small">{new Date(c.createdAt).toLocaleString()}</div></td>
      <td>{c.imageUrl ? <a href={c.imageUrl} target="_blank" rel="noreferrer"><img className="thumb" src={c.imageUrl} alt="complaint" /></a> : '-'}</td>
      <td><StatusBadge status={c.status} /></td>
      <td>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <input placeholder="Note to student" value={remark} onChange={(e) => setRemark(e.target.value)} />
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Update'}</button>
      </td>
    </tr>
  );
}

export default function TechnicianDashboard() {
  const [filter, setFilter] = useState('ALL');
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/complaints', { params: filter === 'ALL' ? {} : { status: filter } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, [filter]);

  return (
    <>
      <h2>Technician dashboard</h2>
      <div className="card">
        <div className="row">
          <h3>Repair complaints</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 170 }}>
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <table>
          <thead><tr><th>Student</th><th>Category</th><th>Details</th><th>Photo</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <ComplaintRow key={`${c.id}-${c.updatedAt}`} c={c} onSaved={() => { setError(''); load(); }} onError={setError} />
            ))}
            {list.length === 0 && <tr><td colSpan="6" className="muted">No complaints</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
