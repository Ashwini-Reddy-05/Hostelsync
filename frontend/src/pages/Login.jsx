import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { homeFor, useAuth } from '../AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
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
      <h2>Sign in</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Password</label>
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="muted">
        New student? <Link to="/register">Create an account</Link>
      </p>
      <p className="muted small">
        Demo staff: warden@hostelsync.com / warden123 · tech@hostelsync.com / tech123
      </p>
    </div>
  );
}
