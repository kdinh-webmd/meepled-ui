import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi, games as gamesApi } from '../api/client';
import Stars from '../components/Stars';

// Landing page: hero, cafés to explore, trending games. Mirrors viewHome().
export default function Home() {
  const { t } = useTranslation();
  const [cafes, setCafes] = useState([]);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cafesApi.list().then(setCafes).catch((e) => setError(e.message));
    gamesApi.list().then(setGames).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <section className="card" style={{ marginBottom: 8 }}>
        <p className="eyebrow">{cafes.length} {t('cafesWord')} · {games.length} {t('games').toLowerCase()}</p>
        <h1>{t('heroTitle')}</h1>
        <p className="muted">{t('heroSub')}</p>
        <Link to="/search"><button className="btn">{t('btnSearch')}</button></Link>
      </section>

      {error && <p className="muted">API: {error}</p>}

      <div className="sec-head">
        <h2>{t('secCafes')}</h2>
        <Link to="/map">{t('lnkMap')}</Link>
      </div>
      <div className="grid">
        {cafes.map((c) => (
          <Link key={c.id} to={`/cafes/${c.id}`} className="tile">
            <div className="cover" style={{ backgroundImage: c.coverUrl ? `url(${c.coverUrl})` : 'none' }} />
            <div className="body">
              <h3>{c.name}</h3>
              <p className="muted" style={{ margin: '0 0 6px' }}>{c.address}</p>
              <Stars value={c.rating} /> <span className="muted">· {c.gameCount} {t('games').toLowerCase()}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="sec-head">
        <h2>{t('secTrending')}</h2>
        <Link to="/search">{t('lnkAll')}</Link>
      </div>
      <div className="grid">
        {games.slice(0, 8).map((g) => (
          <Link key={g.id} to={`/games/${g.id}`} className="tile">
            <div className="body">
              <h3>{g.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {g.minPlayers}–{g.maxPlayers} players · ⭐ {g.bggRating ?? '—'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
