import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// Login + register. Mirrors the prototype's login modal; talks to /api/auth.
export default function Login() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2>{mode === 'login' ? t('login') : t('browse')}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <div className="fld">
            <label>Name</label>
            <input value={form.name} onChange={set('name')} required />
          </div>
        )}
        <div className="fld">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="fld">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set('password')} required />
        </div>
        {error && <p className="muted" style={{ color: 'var(--accent-ink)' }}>{error}</p>}
        <button className="btn" type="submit">{t('login')}</button>
      </form>
      <p className="muted" style={{ marginTop: 14 }}>
        <a onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'I already have an account'}
        </a>
      </p>
    </div>
  );
}
