import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// Top nav mirroring the prototype: brand, primary links, language toggle, auth.
export default function NavBar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isOwner, logout, user } = useAuth();
  const navigate = useNavigate();

  const setLang = (lng) => i18n.changeLanguage(lng);

  return (
    <nav className="nav">
      <Link to="/" className="brand">Meepled</Link>
      <Link to="/">{t('cafes')}</Link>
      <Link to="/search">{t('games')}</Link>
      <Link to="/map">{t('map')}</Link>
      <span className="spacer" />

      <span className="langtog">
        <button className={i18n.resolvedLanguage === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
        <button className={i18n.resolvedLanguage === 'vi' ? 'on' : ''} onClick={() => setLang('vi')}>VI</button>
      </span>

      {isOwner && <Link to="/admin">{t('dashboard')}</Link>}

      {isAuthenticated ? (
        <>
          <Link to="/profile">{user?.name || t('settings')}</Link>
          <button className="btn ghost sm" onClick={() => { logout(); navigate('/'); }}>
            {t('logout')}
          </button>
        </>
      ) : (
        <Link to="/login"><button className="btn ghost sm">{t('login')}</button></Link>
      )}
    </nav>
  );
}
