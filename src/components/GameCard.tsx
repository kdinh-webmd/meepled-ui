import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bgg as bggApi } from '../api/client';
import { useStartNav } from '../context/SpinnerContext';
import type { GameCardData } from '../types';

const GR = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];

const EMOJI: Record<number, string> = {
  13: '🏝', 822: '🏰', 30549: '🦠', 9209: '🚂',
  230802: '🟦', 68448: '🏛', 266192: '🐦',
  148228: '💎', 178900: '🕵️', 174430: '🐉',
};

export function gameGrad(bggId: number): string {
  return GR[Math.abs((bggId || 0) + 1) % GR.length];
}
export function gameEmoji(bggId: number): string {
  return EMOJI[bggId] || '🎲';
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const inFlight: Record<number, boolean> = {};

function getCachedThumb(bggId: number): string | null | undefined {
  try {
    const raw = localStorage.getItem(`bgg_img_${bggId}`);
    if (!raw) return undefined;
    const { url, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(`bgg_img_${bggId}`); return undefined; }
    return url;
  } catch { return undefined; }
}

function setCachedThumb(bggId: number, url: string | null): void {
  try {
    localStorage.setItem(`bgg_img_${bggId}`, JSON.stringify({ url, expires: Date.now() + CACHE_TTL }));
  } catch {}
}

interface GameCardProps {
  g: GameCardData;
  featured?: boolean;
  to?: string;
}

export default function GameCard({ g, featured = false, to }: GameCardProps) {
  const startNav = useStartNav();
  const href  = to ?? `/games/${g.bggId}`;
  const grad  = gameGrad(g.bggId);
  const emoji = gameEmoji(g.bggId);

  const [thumbUrl, setThumbUrl] = useState<string | null>(() => {
    const cached = getCachedThumb(g.bggId);
    return cached !== undefined ? cached : null;
  });

  useEffect(() => {
    if (g.thumbnailUrl || g.imageUrl || thumbUrl || !g.bggId) return;
    const cached = getCachedThumb(g.bggId);
    if (cached !== undefined) { if (cached) setThumbUrl(cached); return; }
    if (inFlight[g.bggId]) return;
    inFlight[g.bggId] = true;
    let cancelled = false;
    bggApi.image(g.bggId)
      .then(r => {
        if (cancelled) return;
        const url = r.thumbnailUrl || r.imageUrl || null;
        setCachedThumb(g.bggId, url);
        delete inFlight[g.bggId];
        if (url) setThumbUrl(url);
      })
      .catch(() => { delete inFlight[g.bggId]; });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.bggId, g.thumbnailUrl, g.imageUrl]);

  const artUrl  = g.thumbnailUrl || g.imageUrl || thumbUrl;
  const players = g.minPlayers && g.maxPlayers ? `${g.minPlayers}–${g.maxPlayers}` : g.minPlayers ?? '?';
  const time    = g.maxTime ?? g.minTime;
  const weight  = typeof g.weight === 'number' ? g.weight : null;

  return (
    <Link to={href} className="gcard" onClick={startNav}>
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
