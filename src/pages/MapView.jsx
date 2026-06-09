import { useTranslation } from 'react-i18next';

// Stub of viewMap(): Google Maps of cafés, keyed off VITE_GOOGLE_MAPS_KEY + lat/lng.
export default function MapView() {
  const { t } = useTranslation();
  const hasKey = !!import.meta.env.VITE_GOOGLE_MAPS_KEY;
  return (
    <div className="card">
      <h1>{t('map')}</h1>
      <p className="muted">
        {hasKey
          ? 'Google Maps will render here using café lat/lng.'
          : 'Set VITE_GOOGLE_MAPS_KEY in .env to enable the map.'}
      </p>
    </div>
  );
}
