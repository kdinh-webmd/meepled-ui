import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'player', label: "I'm a player", emoji: '🎲' },
  { id: 'owner',  label: "I'm a café",  emoji: '☕' },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole]   = useState<'player' | 'owner'>('player');
  const [mode, setMode]   = useState<'login' | 'register'>('login');
  const [form, setForm]   = useState<{ name: string; email: string; password: string }>({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy]   = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function switchMode(m: 'login' | 'register') { setMode(m); setError(null); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(role === 'owner' ? '/admin' : '/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--card)', borderRadius: 24,
        boxShadow: '0 8px 32px rgba(90,50,20,.12)',
        overflow: 'hidden',
      }}>
        {/* Role tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setRole(r.id as 'player' | 'owner')}
              style={{
                padding: '13px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600,
                transition: 'background .15s, color .15s',
                background: role === r.id ? 'var(--accent)' : 'var(--chip)',
                color: role === r.id ? '#fff' : 'var(--ink)',
                borderBottom: '2px solid ' + (role === r.id ? 'var(--accent)' : 'var(--line)'),
              }}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div style={{ padding: '28px 28px 26px' }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700,
            margin: '0 0 6px', color: 'var(--ink)',
          }}>
            Welcome to Meepled
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 22 }}>
            {mode === 'login'
              ? 'Log in to your account to continue.'
              : role === 'owner'
                ? 'Create your account, then contact us to set up your café.'
                : 'Create an account to start building your wishlist.'}
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div className="fld">
                <label>Your name</label>
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Enter your name"
                  required
                  autoFocus
                />
              </div>
            )}
            <div className="fld">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                required
                autoFocus={mode === 'login'}
              />
            </div>
            <div className="fld">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{error}</p>}

            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 2 }}>
              {busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 18, textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <a
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={{ color: 'var(--accent-ink)', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
