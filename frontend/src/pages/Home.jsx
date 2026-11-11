import { Link } from 'react-router-dom';

const ROLES = [
  { key: 'student', icon: '🎓', title: 'Student', text: 'Out-pass, complaints and mess feedback' },
  { key: 'warden', icon: '🛡️', title: 'Warden', text: 'Approvals, headcount, rooms and complaints' },
  { key: 'technician', icon: '🔧', title: 'Technician', text: 'Repair complaints and status updates' },
];

export default function Home() {
  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Welcome to HostelSync</h2>
      <p className="muted" style={{ textAlign: 'center' }}>Choose how you want to sign in</p>
      <div className="role-grid">
        {ROLES.map((r) => (
          <Link key={r.key} to={`/login/${r.key}`} className="card role-card">
            <div className="role-icon">{r.icon}</div>
            <h3>{r.title} login</h3>
            <p className="muted">{r.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
