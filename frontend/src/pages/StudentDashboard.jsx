import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import StatusBadge from '../components/StatusBadge.jsx';
import Tabs from '../components/Tabs.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');
const today = () => new Date().toISOString().slice(0, 10);

function OutPassTab() {
  const empty = { reason: '', destination: '', outTime: '', expectedReturn: '' };
  const [form, setForm] = useState(empty);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/outpasses/my').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/outpasses', form);
      setForm(empty);
      setMsg({ ok: true, text: 'Out-pass request submitted' });
      load();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="card">
        <h3>Apply for out-pass</h3>
        {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
        <form onSubmit={submit} className="grid2">
          <div><label>Destination</label><input required value={form.destination} onChange={set('destination')} /></div>
          <div><label>Reason</label><input required value={form.reason} onChange={set('reason')} /></div>
          <div><label>Out time</label><input type="datetime-local" required value={form.outTime} onChange={set('outTime')} /></div>
          <div><label>Expected return</label><input type="datetime-local" required value={form.expectedReturn} onChange={set('expectedReturn')} /></div>
          <div><button className="btn">Submit request</button></div>
        </form>
      </div>
      <div className="card">
        <h3>My out-passes</h3>
        <table>
          <thead><tr><th>Destination</th><th>Out</th><th>Return</th><th>Status</th><th>Warden remark</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.destination}<div className="muted small">{p.reason}</div></td>
                <td>{fmt(p.outTime)}</td><td>{fmt(p.expectedReturn)}</td>
                <td><StatusBadge status={p.status} /></td><td>{p.wardenRemark || '-'}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="5" className="muted">No requests yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ComplaintsTab() {
  const [form, setForm] = useState({ category: 'Electrical', description: '' });
  const [image, setImage] = useState(null);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/complaints/my').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    fd.append('category', form.category);
    fd.append('description', form.description);
    if (image) fd.append('image', image);
    try {
      await api.post('/complaints', fd);
      setForm({ category: 'Electrical', description: '' });
      setImage(null);
      e.target.reset();
      setMsg({ ok: true, text: 'Complaint logged. You will get email updates.' });
      load();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="card">
        <h3>Log a maintenance complaint</h3>
        {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Internet', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
          <label>Description</label>
          <textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label>Photo (optional, max 5MB)</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
          <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Submit complaint'}</button>
        </form>
      </div>
      <div className="card">
        <h3>My complaints</h3>
        <table>
          <thead><tr><th>Category</th><th>Details</th><th>Photo</th><th>Status</th><th>Technician note</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.category}</td>
                <td>{c.description}<div className="muted small">{fmt(c.createdAt)}</div></td>
                <td>{c.imageUrl ? <a href={c.imageUrl} target="_blank" rel="noreferrer"><img className="thumb" src={c.imageUrl} alt="complaint" /></a> : '-'}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{c.technicianRemark || '-'}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="5" className="muted">No complaints yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MessTab() {
  const [form, setForm] = useState({ date: today(), mealType: 'LUNCH', attending: true, rating: '', comment: '' });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/mess/my').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mess', {
        date: form.date,
        mealType: form.mealType,
        attending: form.attending,
        rating: form.rating ? Number(form.rating) : null,
        comment: form.comment || null,
      });
      setMsg({ ok: true, text: 'Saved. Submitting again for the same meal updates it.' });
      load();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  return (
    <>
      <div className="card">
        <h3>Mess attendance &amp; feedback</h3>
        {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
        <form onSubmit={submit} className="grid2">
          <div><label>Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div>
            <label>Meal</label>
            <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
              <option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option>
            </select>
          </div>
          <div>
            <label>Will you eat this meal?</label>
            <select value={form.attending ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, attending: e.target.value === 'yes' })}>
              <option value="yes">Yes</option><option value="no">No</option>
            </select>
          </div>
          <div>
            <label>Rating (optional)</label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              <option value="">-</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
            </select>
          </div>
          <div className="span2"><label>Comment (optional)</label><input maxLength={500} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></div>
          <div><button className="btn">Save</button></div>
        </form>
      </div>
      <div className="card">
        <h3>My mess history</h3>
        <table>
          <thead><tr><th>Date</th><th>Meal</th><th>Attending</th><th>Rating</th><th>Comment</th></tr></thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id}>
                <td>{m.date}</td><td>{m.mealType}</td><td>{m.attending ? 'Yes' : 'No'}</td>
                <td>{m.rating ? '★'.repeat(m.rating) : '-'}</td><td>{m.comment || '-'}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="5" className="muted">Nothing recorded yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function StudentDashboard() {
  const [tab, setTab] = useState('Out-pass');
  return (
    <>
      <h2>Student dashboard</h2>
      <Tabs tabs={['Out-pass', 'Complaints', 'Mess']} active={tab} onChange={setTab} />
      {tab === 'Out-pass' && <OutPassTab />}
      {tab === 'Complaints' && <ComplaintsTab />}
      {tab === 'Mess' && <MessTab />}
    </>
  );
}
