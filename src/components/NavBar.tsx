import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const AV = ['#c0623a','#6b7d5a','#917256','#a8502c','#7a4a3a','#996b3d'];

export default function NavBar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isOwner, logout, user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const setLang = (lng: string) => i18n.changeLanguage(lng);
  const lang = i18n.resolvedLanguage;

  function doSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ('');
    }
  }

  const avatarColor = user?.avatarColor ?? AV[(user?.name?.charCodeAt(0) ?? 0) % AV.length];
  const avatarLabel = user?.avatarIcon || (user?.name?.trim()[0]?.toUpperCase() ?? '?');

  return (
    <>
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-mark">♟</span>
          Meepled
        </Link>

        {/* Search */}
        <div className="navsearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>
          </svg>
          <input
            ref={inputRef}
            placeholder={t('phGame')}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={doSearch}
          />
        </div>

        {/* Links */}
        <div className="navlinks">
          <Link to="/">{t('cafes')}</Link>
          <Link to="/search">{t('games')}</Link>
          <Link to="/map">{t('map')}</Link>

          <span className="langtog">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'vi' ? 'on' : ''} onClick={() => setLang('vi')}>VI</button>
          </span>

          {isOwner && <Link to="/admin">{t('dashboard')}</Link>}

          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <div className="avatar" style={{ background: avatarColor }} title={user?.name}>
                  {avatarLabel}
                </div>
              </Link>
              <button className="btn ghost sm" onClick={() => { logout(); navigate('/'); }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <button className="btn ghost sm" onClick={() => openLoginModal()}>{t('login')}</button>
          )}
        </div>
      </div>
    </nav>
    <LoginModal />
    </>
  );
}
