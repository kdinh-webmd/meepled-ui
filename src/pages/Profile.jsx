import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// Stub of viewProfile(): wishlist + settings (language, avatar colour/icon).
export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="card">
      <h1>{user?.name}</h1>
      <h2>{t('settingsTitle')}</h2>
      <div className="fld">
        <label>{t('language')}</label>
        <span className="langtog">
          <button className={i18n.resolvedLanguage === 'en' ? 'on' : ''} onClick={() => i18n.changeLanguage('en')}>EN</button>
          <button className={i18n.resolvedLanguage === 'vi' ? 'on' : ''} onClick={() => i18n.changeLanguage('vi')}>VI</button>
        </span>
      </div>
      <h2>{t('wishlist')}</h2>
      <p className="muted">Wishlist items go here.</p>
    </div>
  );
}
