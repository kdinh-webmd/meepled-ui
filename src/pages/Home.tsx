import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi, games as gamesApi } from '../api/client';
import GameCard, { gameGrad, gameEmoji } from '../components/GameCard';
import type { CafeCard, GameCardData, HotGame } from '../types';

const AV_COLORS = ['#c0623a','#6b7d5a','#917256','#a8502c','#7a4a3a','#996b3d'];
const CATS = ['Family','Party','Strategy','Cooperative','Abstract','Card Game'];

// Deterministic initial from café name
function cafeInitial(name: string): string { return (name || '?').trim()[0].toUpperCase(); }
function cafeGrad(idx: number): string {
  const GR = ['linear-gradient(135deg,#8a5a3c,#c0623a)','linear-gradient(135deg,#6b7d5a,#9aa873)',
    'linear-gradient(135deg,#a8502c,#d98a4e)','linear-gradient(135deg,#5b4636,#917256)',
    'linear-gradient(135deg,#996b3d,#caa46a)','linear-gradient(135deg,#7a4a3a,#b87a52)'];
  return GR[idx % GR.length];
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<CafeCard[]>([]);
  const [games, setGames] = useState<GameCardData[]>([]);
  const [hotGames, setHotGames] = useState<HotGame[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cafesApi.list().then(setCafes).catch(() => {});
    gamesApi.list().then(setGames).catch(() => {});
    gamesApi.hot().then(setHotGames).catch(() => {});
  }, []);

  function doSearch() {
    const query = q || cityRef.current?.value || '';
    navigate(`/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(cat)}`);
  }

  return (
    <div className="fade-in">
      {/* ── Hero ── */}
      <section className="hero">
        <span className="eyebrow">
          {cafes.length || '—'} {t('cafesWord')} · {games.length || '—'} {t('games').toLowerCase()}
        </span>
        <h1 className="big" dangerouslySetInnerHTML={{ __html: t('heroTitle') }} />
        <p className="hero-sub">{t('heroSub')}</p>

        <div className="hsearch">
          <div className="field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <input ref={cityRef} placeholder={t('phCity')} onKeyDown={e => e.key === 'Enter' && doSearch()} />
          </div>
          <div className="divider" />
          <div className="field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
            <input placeholder={t('phGame')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option>All</option>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={doSearch}>{t('btnSearch')}</button>
        </div>

        <div className="chips">
          <button className="chip" onClick={() => navigate('/search?cat=Family')}>👨‍👩‍👧 {t('chFamily')}</button>
          <button className="chip" onClick={() => navigate('/search?cat=Party')}>🎉 {t('chParty')}</button>
          <button className="chip" onClick={() => navigate('/search?cat=Strategy')}>🧠 {t('chStrategy')}</button>
          <button className="chip" onClick={() => navigate('/search?cat=Cooperative')}>🤝 {t('chCoop')}</button>
        </div>
      </section>

      {/* ── Cafés ── */}
      <section className="sec">
        <div className="sec-head">
          <h2>{t('secCafes')}</h2>
          <Link to="/map">{t('lnkMap')}</Link>
        </div>
        <div className="cgrid">
          {cafes.map((c, i) => (
            <Link key={c.id} to={`/cafes/${c.id}`} className="ccard">
              <div className="photo" style={{ background: cafeGrad(i) }}>
                {c.coverUrl
                  ? <img src={c.coverUrl} alt={c.name} />
                  : <span style={{ position: 'relative', zIndex: 1 }}>{cafeInitial(c.name)}</span>}
                <span className="badge">{c.gameCount} {t('games').toLowerCase()}</span>
              </div>
              <div className="b">
                <h3>{c.name}</h3>
                <div className="loc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {c.address}
                </div>
                <div className="meta">
                  <span className="tag">Board games</span>
                  <span className="stars" style={{ marginLeft: 'auto' }}>★ {c.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending games (strip) ── */}
      <section className="sec">
        <div className="sec-head">
          <h2>{t('secTrending')}</h2>
          <Link to="/search">{t('lnkAll')}</Link>
        </div>
        <div className="strip">
          {hotGames.slice(0, 10).map(g => {
            const href = g.localId ? `/games/${g.localId}` : `https://boardgamegeek.com/boardgame/${g.bggId}`;
            const isExternal = !g.localId;
            return (
              <a key={g.bggId} href={href}
                 target={isExternal ? '_blank' : undefined}
                 rel={isExternal ? 'noreferrer' : undefined}
                 className="gtile" style={{ textDecoration: 'none' }}>
                <div className="gimg" style={{ background: g.thumbnailUrl ? undefined : gameGrad(g.bggId) }}>
                  {g.thumbnailUrl
                    ? <img src={g.thumbnailUrl} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    : gameEmoji(g.bggId)}
                </div>
                <p>{g.name}</p>
                <span>#{g.rank}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Games grid ── */}
      <section className="sec" style={{ paddingBottom: 60 }}>
        <div className="sec-head">
          <h2>Browse games</h2>
          <Link to="/search">{t('lnkAll')}</Link>
        </div>
        <div className="ggrid">
          {games.slice(0, 8).map(g => <GameCard key={g.id} g={g} />)}
        </div>
      </section>
    </div>
  );
}
