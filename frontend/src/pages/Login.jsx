import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { homeFor, useAuth } from '../AuthContext.jsx';

const HINTS = {
  student: null,
  warden: 'Demo: warden@hostelsync.com / warden123',
  technician: 'Demo: tech@hostelsync.com / tech123',
};

export default function Login() {
  const { role } = useParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!(role in HINTS)) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role: role.toUpperCase() });
      login(data);
      navigate(homeFor(data.role));
    } catch (err) {
      setError(errMsg(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2 style={{ textTransform: 'capitalize' }}>{role} login</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Password</label>
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {role === 'student' && (
        <p className="muted">New student? <Link to="/register">Create an account</Link></p>
      )}
      {HINTS[role] && <p className="muted small">{HINTS[role]}</p>}
      <p className="muted small"><Link to="/">← Choose a different login</Link></p>
    </div>
  );
}
