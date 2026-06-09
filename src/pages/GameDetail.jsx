import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi } from '../api/client';

// Stub of viewGame(): game detail, where-to-play, about, BGG link, discussion.
export default function GameDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    gamesApi.get(id).then(setGame).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="card"><p className="muted">{error}</p></div>;
  if (!game) return <div className="card"><p className="muted">Loading…</p></div>;

  return (
    <div className="card">
      <h1>{game.title}</h1>
      <h2>{t('aboutGame')}</h2>
      <p className="muted">{game.description?.slice(0, 300) || '—'}</p>
      <p>
        <a href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noreferrer">
          {t('viewBgg')}
        </a>
      </p>
      <h2>{t('whereToPlay')}</h2>
      <h2>{t('discussion')}</h2>
    </div>
  );
}
