import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bgg as bggApi } from '../api/client';

// Gradient palette — mirrors the prototype's GR array.
const GR = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];

// Emoji per BGG id — the 10 seeded games.
const EMOJI = {
  13: '🏝', 822: '🏰', 30549: '🦠', 9209: '🚂',
  230802: '🟦', 68448: '🏛', 266192: '🐦',
  148228: '💎', 178900: '🕵️', 174430: '🐉',
};

export function gameGrad(bggId) {
  return GR[Math.abs((bggId || 0) + 1) % GR.length];
}
export function gameEmoji(bggId) {
  return EMOJI[bggId] || '🎲';
}

// Module-level cache so we only call BGG once per bggId per page load.
const bggThumbCache = {};

/**
 * g = { id, gameId?, title, bggId, bggRating, minPlayers, maxPlayers, minTime, maxTime, weight, imageUrl }
 * featured = bool
 */
export default function GameCard({ g, featured = false }) {
  const id    = g.gameId ?? g.id;
  const grad  = gameGrad(g.bggId);
  const emoji = gameEmoji(g.bggId);

  const [thumbUrl, setThumbUrl] = useState(() => bggThumbCache[g.bggId] ?? null);

  // Fetch BGG thumbnail via our backend proxy (avoids CORS/401 from direct BGG calls).
  useEffect(() => {
    if (g.imageUrl || thumbUrl || !g.bggId) return;
    if (bggThumbCache[g.bggId] !== undefined) {
      if (bggThumbCache[g.bggId]) setThumbUrl(bggThumbCache[g.bggId]);
      return;
    }
    // Mark as in-flight so sibling cards with the same bggId don't double-fetch.
    bggThumbCache[g.bggId] = null;
    let cancelled = false;
    bggApi.image(g.bggId)
      .then(r => {
        if (cancelled) return;
        const url = r.thumbnailUrl || r.imageUrl || null;
        bggThumbCache[g.bggId] = url;
        if (url) setThumbUrl(url);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.bggId, g.imageUrl]);

  const artUrl  = g.imageUrl || thumbUrl;
  const players = g.minPlayers && g.maxPlayers ? `${g.minPlayers}–${g.maxPlayers}` : g.minPlayers ?? '?';
  const time    = g.maxTime ?? g.minTime;
  const weight  = typeof g.weight === 'number' ? g.weight : null;

  return (
    <Link to={`/games/${id}`} className="gcard">
      <div className="box" style={{ background: artUrl ? undefined : grad }}>
        {artUrl
          ? <img src={artUrl} alt={g.title} />
          : <span className="emoji">{emoji}</span>}
        {g.bggRating != null && (
          <span className="rate">★ <b>{Number(g.bggRating).toFixed(1)}</b></span>
        )}
      </div>
      <div className="b">
        <h3>
          {featured && <span className="tag feat" style={{ marginRight: 6 }}>★ Featured</span>}
          {g.title}
        </h3>
        <div className="specs">
          <span>👥 {players}</span>
          {time && <span>⏱ {time}m</span>}
        </div>
        {weight != null && (
          <div className="wt">
            <div className="bar"><div className="fill" style={{ width: `${(weight / 5) * 100}%` }} /></div>
            <span className="lbl">{weight.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
