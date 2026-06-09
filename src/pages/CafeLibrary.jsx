import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi } from '../api/client';
import Stars from '../components/Stars';

// Full café page: header, game library, menu, about, photos, reviews. Mirrors viewCafe().
export default function CafeLibrary() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [cafe, setCafe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cafesApi.get(id).then(setCafe).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="card"><p className="muted">{error}</p></div>;
  if (!cafe) return <div className="card"><p className="muted">Loading…</p></div>;

  return (
    <div>
      <div className="hero-cover" style={{ backgroundImage: cafe.coverUrl ? `url(${cafe.coverUrl})` : 'none' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>{cafe.name}</h1>
        <span><Stars value={cafe.rating} /> <span className="muted">{cafe.rating}</span></span>
      </div>
      <p className="muted">{cafe.address}</p>

      <div className="cols">
        <div>
          <h2>{t('gameLibrary')}</h2>
          <div className="grid">
            {cafe.games.map((g) => (
              <Link key={g.id} to={`/games/${g.gameId}`} className="tile">
                <div className="body">
                  {g.featured && <span className="badge">{t('featured')}</span>}
                  <h3 style={{ marginTop: g.featured ? 6 : 0 }}>{g.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {g.minPlayers}–{g.maxPlayers} players · {g.copies} {g.copies > 1 ? 'copies' : 'copy'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <h2>{t('reviews')}</h2>
          {cafe.reviews.length === 0 && <p className="muted">{t('noReviews')}</p>}
          {cafe.reviews.map((r) => (
            <div className="review" key={r.id}>
              <strong>{r.userName}</strong> <Stars value={r.stars} />
              <p style={{ margin: '4px 0 0' }}>{r.body}</p>
            </div>
          ))}
        </div>

        <aside>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>{t('aboutCafe')}</h3>
            <p className="muted">{cafe.about}</p>
            {cafe.hours && <p style={{ margin: '6px 0 0' }}>🕑 {cafe.hours}</p>}
            {cafe.dayPass && <p style={{ margin: '6px 0 0' }}>🎟️ {cafe.dayPass}</p>}
            {cafe.mapUrl && <p style={{ margin: '6px 0 0' }}><a href={cafe.mapUrl} target="_blank" rel="noreferrer">{t('map')} →</a></p>}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3>{t('cafeMenu')}</h3>
            <ul className="menu-list">
              {cafe.menu.map((m) => (
                <li key={m.id}><span>{m.name}</span><span className="muted">{m.price}</span></li>
              ))}
            </ul>
          </div>

          {cafe.photos.length > 0 && (
            <div className="card">
              <h3>Photos</h3>
              <div className="photos">
                {cafe.photos.map((p, i) => <img key={i} src={p} alt="" loading="lazy" />)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
