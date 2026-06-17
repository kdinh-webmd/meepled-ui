import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { wishlist as wishlistApi } from '../api/client';
import { gameGrad, gameEmoji } from '../components/GameCard';

const COLORS = ['#c0623a', '#6b7d5a', '#917256', '#a8502c', '#7a4a3a', '#5b7d8a'];
const ICONS  = ['🎲', '♟', '🎯', '🃏', '🧩', '🏆', '♛', '🐉'];

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();

  const [color,  setColor]  = useState(user?.avatarColor ?? COLORS[0]);
  const [icon,   setIcon]   = useState(user?.avatarIcon  ?? '🎲');
  const [lang,   setLang]   = useState(i18n.resolvedLanguage ?? 'en');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [wishes, setWishes] = useState([]);
  const [wLoad,  setWLoad]  = useState(true);

  useEffect(() => {
    wishlistApi.list()
      .then(setWishes)
      .catch(() => {})
      .finally(() => setWLoad(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await updateUser({ language: lang, avatarColor: color, avatarIcon: icon });
      i18n.changeLanguage(lang);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(26px,4vw,34px)', marginBottom: 24 }}>
        {t('settingsTitle')}
      </h1>

      {/* Avatar preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: color,
          display: 'grid', placeItems: 'center', fontSize: 26,
          boxShadow: '0 4px 14px rgba(0,0,0,.13)', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Color picker */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>
            {t('avatarColor')}
          </div>
          <div className="swatches">
            {COLORS.map(c => (
              <button
                key={c}
                className={'swatch' + (color === c ? ' on' : '')}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>
            {t('avatarIcon')}
          </div>
          <div className="emojis">
            {ICONS.map(ic => (
              <button key={ic} className={'emo' + (icon === ic ? ' on' : '')} onClick={() => setIcon(ic)}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>
            {t('language')}
          </div>
          <span className="langtog">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'vi' ? 'on' : ''} onClick={() => setLang('vi')}>VI</button>
          </span>
        </div>

        {/* Save */}
        <button className="btn" onClick={save} disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? '…' : saved ? `✓ ${t('saved')}` : t('save')}
        </button>
      </div>

      {/* Wishlist */}
      <h2 style={{ fontFamily: 'var(--display)', marginTop: 36, marginBottom: 16 }}>{t('wishlist')}</h2>
      {wLoad ? (
        <div className="spinner"><i /><span>Loading…</span></div>
      ) : wishes.length === 0 ? (
        <p className="empty">
          No games on your wishlist yet.{' '}
          <Link to="/search" style={{ color: 'var(--accent-ink)' }}>Browse games</Link>.
        </p>
      ) : (
        <div className="ggrid">
          {wishes.map(w => {
            const grad = gameGrad(w.bggId);
            const emoji = gameEmoji(w.bggId);
            return (
              <Link key={w.gameId} to={`/games/${w.gameId}`} className="gcard">
                <div className="box" style={{ background: w.imageUrl ? undefined : grad }}>
                  {w.imageUrl
                    ? <img src={w.imageUrl} alt={w.title} />
                    : <span className="emoji">{emoji}</span>}
                  {w.bggRating != null && (
                    <span className="rate">★ <b>{Number(w.bggRating).toFixed(1)}</b></span>
                  )}
                </div>
                <div className="b">
                  <h3>{w.title}</h3>
                  {w.minPlayers && w.maxPlayers && (
                    <div className="specs"><span>👥 {w.minPlayers}–{w.maxPlayers}</span></div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
