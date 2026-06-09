import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi } from '../api/client';
import { gameGrad, gameEmoji } from '../components/GameCard';

const GR_CAFE = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];
function cafeGrad(name) { return GR_CAFE[(name?.charCodeAt(0) ?? 0) % GR_CAFE.length]; }

export default function GameDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    gamesApi.get(id).then(setGame).catch(e => setError(e.message));
  }, [id]);

  if (error) return <div className="section"><p className="muted">{error}</p></div>;
  if (!game) return <div className="section"><div className="spinner"><i /><span>Loading…</span></div></div>;

  const grad = gameGrad(game.bggId);
  const emoji = gameEmoji(game.bggId);
  const players = game.minPlayers && game.maxPlayers
    ? `${game.minPlayers}–${game.maxPlayers}`
    : game.minPlayers ?? '?';
  const time = game.maxTime ? `${game.minTime ?? game.maxTime}–${game.maxTime}` : `${game.minTime ?? '?'}`;
  const weight = typeof game.weight === 'number' ? game.weight : null;

  return (
    <div className="fade-in">
      <div className="crumb">
        <Link to="/search">← {t('games')}</Link> &nbsp;/&nbsp; {game.title}
      </div>

      {/* ── Hero ── */}
      <div className="ghero">
        <div className="art" style={{ background: game.imageUrl ? undefined : grad }}>
          {game.imageUrl
            ? <img src={game.imageUrl} alt={game.title} />
            : <span className="emoji">{emoji}</span>}
          {game.bggRank && (
            <span className="rank">BGG Rank <b>#{game.bggRank}</b></span>
          )}
        </div>

        <div className="ginfo">
          <h1>{game.title}</h1>
          <p className="byline">
            {game.designer && <>Designed by <b>{game.designer}</b> · </>}
            {game.yearPublished && <>{game.yearPublished} · </>}
            {game.publisher}
          </p>

          <div className="raterow">
            {game.bggRating != null && (
              <div className="bigrate">
                {Number(game.bggRating).toFixed(1)}<span> / 10 · BGG</span>
              </div>
            )}
            <button className="btn ghost sm">{t('addWish')}</button>
          </div>

          <div className="quickstats">
            <div className="qs">
              <div className="l">👥 Players</div>
              <div className="v">{players}</div>
            </div>
            <div className="qs">
              <div className="l">⏱ Time</div>
              <div className="v">{time}m</div>
            </div>
            <div className="qs">
              <div className="l">🎂 Age</div>
              <div className="v">{game.minAge ? `${game.minAge}+` : '—'}</div>
            </div>
            <div className="qs">
              <div className="l">⚖️ Weight</div>
              <div className="v">{weight != null ? `${weight.toFixed(1)}/5` : '—'}</div>
            </div>
          </div>

          <div className="game-actions">
            <button className="btn" onClick={() => document.getElementById('wtp')?.scrollIntoView({ behavior: 'smooth' })}>
              📍 {t('findCafe')}
            </button>
            {game.bggId && (
              <a className="bgglink" href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>
                {t('viewBgg')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── About ── */}
      {(game.description || game.categories?.length > 0) && (
        <div className="section">
          <h2>{t('aboutGame')}</h2>
          {game.description && <p className="about">{game.description.slice(0, 500)}{game.description.length > 500 ? '…' : ''}</p>}
          {game.categories?.length > 0 && (
            <div className="tags-row">
              {game.categories.map(c => <span key={c} className="tag">{c}</span>)}
            </div>
          )}
        </div>
      )}

      {/* ── Where to play ── */}
      {game.cafes?.length > 0 && (
        <div className="section" id="wtp">
          <h2>{t('whereToPlay')}</h2>
          <div className="cafe-rows">
            {game.cafes.map((c, i) => (
              <Link key={c.cafeId ?? i} to={`/cafes/${c.cafeId}`} className="crow">
                <div className="av" style={{ background: cafeGrad(c.cafeName) }}>
                  {(c.cafeName || '?').trim()[0].toUpperCase()}
                </div>
                <div className="cx">
                  <h3>{c.cafeName}</h3>
                  <div className="ln">{c.cafeAddress}</div>
                </div>
                <div className="cp">{c.copies} {c.copies > 1 ? 'copies' : 'copy'}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Discussion placeholder ── */}
      <div className="section">
        <div className="comhead">
          <h2>{t('discussion')}</h2>
          <span className="count">0</span>
        </div>
        <div className="login-prompt">
          <p>{t('loginComment')}</p>
          <Link to="/login"><button className="btn">{t('loginCommentBtn')}</button></Link>
        </div>
        <p className="empty" style={{ textAlign: 'center' }}>
          {t('poweredBy')}{' '}
          <a href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>BoardGameGeek</a>.
        </p>
      </div>
    </div>
  );
}
