import { Link } from 'react-router-dom';

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

/**
 * g = { id, gameId?, title, bggId, bggRating, minPlayers, maxPlayers, minTime, maxTime, weight, imageUrl }
 * featured = bool  |  linkTo = path string (defaults to /games/:id)
 */
export default function GameCard({ g, featured = false }) {
  const id = g.gameId ?? g.id;
  const grad = gameGrad(g.bggId);
  const emoji = gameEmoji(g.bggId);
  const players = g.minPlayers && g.maxPlayers
    ? `${g.minPlayers}–${g.maxPlayers}`
    : g.minPlayers ?? '?';
  const time = g.maxTime ?? g.minTime;
  const weight = typeof g.weight === 'number' ? g.weight : null;

  return (
    <Link to={`/games/${id}`} className="gcard">
      <div className="box" style={{ background: g.imageUrl ? undefined : grad }}>
        {g.imageUrl
          ? <img src={g.imageUrl} alt={g.title} />
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
