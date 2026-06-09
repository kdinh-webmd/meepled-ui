import { useTranslation } from 'react-i18next';

// Stub of viewAdmin(): café-owner dashboard — manage games, menu, photos, info.
export default function CafeAdmin() {
  const { t } = useTranslation();
  return (
    <div className="card">
      <h1>{t('dashboard')}</h1>
      <h2>{t('gameLibrary')}</h2>
      <p className="muted">Add games (BGG search + import), feature/pin, manage copies.</p>
      <h2>{t('cafeMenu')}</h2>
      <h2>{t('aboutCafe')}</h2>
    </div>
  );
}
