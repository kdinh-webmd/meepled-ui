import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi } from '../api/client';

const GR = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];

// Convert real lat/lng to % positions on the schematic map (Vietnam-centred)
function latLngToXY(lat, lng) {
  // Rough bounding box: lat 8–24, lng 102–110
  const x = ((lng - 102) / (110 - 102)) * 80 + 10;
  const y = ((24 - lat) / (24 - 8)) * 70 + 10;
  return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(90, y)) };
}

export default function MapView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);

  useEffect(() => { cafesApi.list().then(setCafes).catch(() => {}); }, []);

  return (
    <div className="fade-in">
      <div className="sec-head" style={{ marginTop: 12 }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 30 }}>{t('map')}</h2>
      </div>
      <div className="map-box">
        {cafes.map((c, i) => {
          const { x, y } = latLngToXY(c.lat ?? 15, c.lng ?? 106);
          return (
            <div key={c.id} className="map-pin" style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => navigate(`/cafes/${c.id}`)}>
              <div className="dot" style={{ background: GR[i % GR.length] }}>
                <span>{(c.name || '?').trim()[0].toUpperCase()}</span>
              </div>
              <div className="lab">{c.name}</div>
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>
        Schematic map — add a Google Maps API key to render a live tile layer.
      </p>
    </div>
  );
}
