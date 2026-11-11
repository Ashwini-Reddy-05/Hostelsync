import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import StatusBadge from '../components/StatusBadge.jsx';
import Tabs from '../components/Tabs.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');
const today = () => new Date().toISOString().slice(0, 10);

function OutPassTab() {
  const [filter, setFilter] = useState('PENDING');
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/outpasses', { params: filter === 'ALL' ? {} : { status: filter } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, [filter]);

  const decide = async (id, approved) => {
    const remark = window.prompt(approved ? 'Remark (optional):' : 'Reason for rejection:') ?? null;
    if (remark === null) return;
    try {
      await api.put(`/outpasses/${id}/decision`, { approved, remark });
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="card">
      <div className="row">
        <h3>Out-pass requests</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 160 }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <table>
        <thead><tr><th>Student</th><th>Destination / reason</th><th>Out</th><th>Return</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.student.name}<div className="muted small">{p.student.rollNumber || p.student.email}</div></td>
              <td>{p.destination}<div className="muted small">{p.reason}</div></td>
              <td>{fmt(p.outTime)}</td><td>{fmt(p.expectedReturn)}</td>
              <td><StatusBadge status={p.status} /></td>
              <td>
                {p.status === 'PENDING' && (
                  <div className="actions">
                    <button className="btn btn-green" onClick={() => decide(p.id, true)}>Approve</button>
                    <button className="btn btn-red" onClick={() => decide(p.id, false)}>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan="6" className="muted">Nothing here</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', capacity: 3 });
  const [alloc, setAlloc] = useState({ roomId: '', studentId: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.get('/rooms').then((r) => setRooms(r.data));
    api.get('/rooms/summary').then((r) => setSummary(r.data));
    api.get('/users/students').then((r) => setStudents(r.data));
  };
  useEffect(() => { load(); }, []);

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { roomNumber: newRoom.roomNumber, capacity: Number(newRoom.capacity) });
      setNewRoom({ roomNumber: '', capacity: 3 });
      setMsg({ ok: true, text: 'Room added' });
      load();
    } catch (err) { setMsg({ ok: false, text: errMsg(err) }); }
  };

  const allocate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/rooms/${alloc.roomId}/allocate`, { studentId: Number(alloc.studentId) });
      setMsg({ ok: true, text: 'Room allocated' });
      load();
    } catch (err) { setMsg({ ok: false, text: errMsg(err) }); }
  };

  return (
    <>
      {summary && (
        <div className="stats">
          <div className="stat"><b>{summary.totalRooms}</b><span>Rooms</span></div>
          <div className="stat"><b>{summary.totalBeds}</b><span>Total beds</span></div>
          <div className="stat"><b>{summary.occupiedBeds}</b><span>Occupied</span></div>
          <div className="stat"><b>{summary.availableBeds}</b><span>Available</span></div>
        </div>
      )}
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
      <div className="grid2">
        <form className="card" onSubmit={addRoom}>
          <h3>Add room</h3>
          <label>Room number</label>
          <input required value={newRoom.roomNumber} onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })} />
          <label>Capacity</label>
          <input type="number" min="1" required value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} />
          <button className="btn">Add</button>
        </form>
        <form className="card" onSubmit={allocate}>
          <h3>Allocate room</h3>
          <label>Student</label>
          <select required value={alloc.studentId} onChange={(e) => setAlloc({ ...alloc, studentId: e.target.value })}>
            <option value="">Select…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}{s.room ? ` (now ${s.room.roomNumber})` : ''}</option>)}
          </select>
          <label>Room</label>
          <select required value={alloc.roomId} onChange={(e) => setAlloc({ ...alloc, roomId: e.target.value })}>
            <option value="">Select…</option>
            {rooms.filter((r) => r.available > 0).map((r) => <option key={r.id} value={r.id}>{r.roomNumber} ({r.available} free)</option>)}
          </select>
          <button className="btn">Allocate</button>
        </form>
      </div>
      <div className="card">
        <h3>Room availability</h3>
        <table>
          <thead><tr><th>Room</th><th>Occupied</th><th>Capacity</th><th>Available</th></tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.roomNumber}</td><td>{r.occupied}</td><td>{r.capacity}</td>
                <td><span className={`badge ${r.available > 0 ? 'badge-green' : 'badge-red'}`}>{r.available > 0 ? `${r.available} free` : 'Full'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MessTab() {
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);

  useEffect(() => { api.get('/mess/report', { params: { date } }).then((r) => setReport(r.data)); }, [date]);

  const ratingFor = (meal) => report?.ratings.find((r) => r.mealType === meal);

  return (
    <div className="card">
      <div className="row">
        <h3>Mess headcount &amp; feedback</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 170 }} />
      </div>
      {report && (
        <>
          <div className="stats">
            {report.headcount.map((h) => (
              <div className="stat" key={h.mealType}>
                <b>{h.count}</b><span>{h.mealType} headcount</span>
                <small className="muted">{ratingFor(h.mealType) ? `★ ${ratingFor(h.mealType).average} (${ratingFor(h.mealType).responses})` : 'no ratings'}</small>
              </div>
            ))}
          </div>
          <p className="muted small">Headcount counts students who confirmed they will eat. Use it to plan cooking quantities.</p>
          <table>
            <thead><tr><th>Meal</th><th>Student</th><th>Attending</th><th>Rating</th><th>Comment</th></tr></thead>
            <tbody>
              {report.feedback.map((f) => (
                <tr key={f.id}>
                  <td>{f.mealType}</td><td>{f.student.name}</td><td>{f.attending ? 'Yes' : 'No'}</td>
                  <td>{f.rating ? '★'.repeat(f.rating) : '-'}</td><td>{f.comment || '-'}</td>
                </tr>
              ))}
              {report.feedback.length === 0 && <tr><td colSpan="5" className="muted">No entries for this date</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function ComplaintsTab() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/complaints').then((r) => setList(r.data)); }, []);
  return (
    <div className="card">
      <h3>Student complaints &amp; technician progress</h3>
      <table>
        <thead><tr><th>Student</th><th>Category</th><th>Details</th><th>Photo</th><th>Status</th><th>Technician note</th><th>Last updated</th></tr></thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.student.name}<div className="muted small">{c.student.room?.roomNumber || ''}</div></td>
              <td>{c.category}</td><td>{c.description}</td>
              <td>{c.imageUrl ? <a href={c.imageUrl} target="_blank" rel="noreferrer"><img className="thumb" src={c.imageUrl} alt="complaint" /></a> : '-'}</td>
              <td><StatusBadge status={c.status} /></td>
              <td>{c.technicianRemark || '-'}</td>
              <td>{fmt(c.updatedAt)}</td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan="7" className="muted">No complaints</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div className={`stat ${tone || ''}`}>
      <b>{value}</b><span>{label}</span>
    </div>
  );
}

function OverviewTab() {
  const [o, setO] = useState(null);
  const [mess, setMess] = useState(null);
  const load = () => {
    api.get('/warden/overview').then((r) => setO(r.data));
    api.get('/mess/report', { params: { date: today() } }).then((r) => setMess(r.data));
  };
  useEffect(() => { load(); }, []);
  if (!o) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className="row"><h3>Hostel today</h3><button className="btn btn-outline" onClick={load}>Refresh</button></div>
      <h4 className="section">Student headcount</h4>
      <div className="stats">
        <Stat value={o.totalStudents} label="Registered students" />
        <Stat value={o.studentsInHostel} label="In hostel now" tone="good" />
        <Stat value={o.studentsOut} label="Out on approved out-pass" tone="warn" />
        <Stat value={o.pendingOutPasses} label="Out-passes awaiting approval" />
      </div>

      <h4 className="section">Mess headcount today (students eating)</h4>
      <div className="stats">
        {(mess?.headcount || []).map((h) => <Stat key={h.mealType} value={h.count} label={h.mealType} />)}
      </div>

      <h4 className="section">Room availability</h4>
      <div className="stats">
        <Stat value={o.rooms.totalRooms} label="Rooms" />
        <Stat value={o.rooms.totalBeds} label="Total beds" />
        <Stat value={o.rooms.occupiedBeds} label="Occupied" />
        <Stat value={o.rooms.availableBeds} label="Available beds" tone="good" />
      </div>

      <h4 className="section">Complaints</h4>
      <div className="stats">
        <Stat value={o.complaintsPending} label="Pending" tone="warn" />
        <Stat value={o.complaintsInProgress} label="In progress" />
        <Stat value={o.complaintsResolved} label="Resolved" tone="good" />
      </div>

      <div className="card">
        <h3>Students currently out</h3>
        <table>
          <thead><tr><th>Student</th><th>Room</th><th>Destination</th><th>Expected return</th></tr></thead>
          <tbody>
            {o.studentsOutList.map((s, i) => (
              <tr key={i}><td>{s.name}</td><td>{s.room || '-'}</td><td>{s.destination}</td><td>{fmt(s.expectedReturn)}</td></tr>
            ))}
            {o.studentsOutList.length === 0 && <tr><td colSpan="4" className="muted">Everyone is in the hostel</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function WardenDashboard() {
  const [tab, setTab] = useState('Overview');
  return (
    <>
      <h2>Warden dashboard</h2>
      <Tabs tabs={['Overview', 'Out-passes', 'Rooms', 'Mess', 'Complaints']} active={tab} onChange={setTab} />
      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Out-passes' && <OutPassTab />}
      {tab === 'Rooms' && <RoomsTab />}
      {tab === 'Mess' && <MessTab />}
      {tab === 'Complaints' && <ComplaintsTab />}
    </>
  );
}
