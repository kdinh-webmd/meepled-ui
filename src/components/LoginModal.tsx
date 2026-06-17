import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, loginReturnTo, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]   = useState<Mode>('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy]   = useState(false);

  if (!loginModalOpen) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function switchMode(m: Mode) { setMode(m); setError(null); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      closeLoginModal();
      if (loginReturnTo) navigate(loginReturnTo);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'grid', placeItems: 'center', padding: '16px',
        background: 'rgba(30,15,5,.5)', backdropFilter: 'blur(4px)',
      }}
      onClick={closeLoginModal}
    >
      <div
        style={{
          width: '100%', maxWidth: 400,
          background: 'var(--card)', borderRadius: 24,
          boxShadow: '0 20px 60px rgba(90,50,20,.25)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '26px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{
              fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700,
              margin: 0, color: 'var(--ink)',
            }}>
              Welcome to Meepled
            </h2>
            <button
              onClick={closeLoginModal}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 24, lineHeight: 1, color: 'var(--muted)',
                padding: '0 0 0 8px', marginTop: -2,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Login / Sign up tabs */}
          <div style={{ display: 'flex', marginTop: 20, borderBottom: '1px solid var(--line)' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', background: 'none',
                  cursor: 'pointer', fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600,
                  color: mode === m ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: `2px solid ${mode === m ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: -1,
                }}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 28px 28px' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div className="fld">
                <label>Your name</label>
                <input
                  value={form.name} onChange={set('name')}
                  placeholder="Enter your name" required autoFocus
                />
              </div>
            )}
            <div className="fld">
              <label>Email</label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder="your@email.com" required
                autoFocus={mode === 'login'}
              />
            </div>
            <div className="fld">
              <label>Password</label>
              <input
                type="password" value={form.password} onChange={set('password')}
                placeholder="Enter your password" required
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{error}</p>}

            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
