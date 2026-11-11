import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/student');
    } catch (err) {
      setError(errMsg(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Student registration</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <label>Full name</label>
        <input required value={form.name} onChange={set('name')} />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={set('email')} />
        <label>Password (min 6 characters)</label>
        <input type="password" required minLength={6} value={form.password} onChange={set('password')} />
        <label>Roll number</label>
        <input value={form.rollNumber} onChange={set('rollNumber')} />
        <label>Phone</label>
        <input value={form.phone} onChange={set('phone')} />
        <button className="btn" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
      </form>
      <p className="muted">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
