import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi, games as gamesApi } from '../api/client';
import GameCard from '../components/GameCard';
import { CafeCardSkeleton, GameCardSkeleton } from '../components/Skeletons';
import { useStartNav } from '../context/SpinnerContext';
import type { CafeCard, GameCardData, HotGame } from '../types';

const CATS = ['Family','Party','Strategy','Cooperative','Abstract','Card Game'];

function cafeInitial(name: string): string { return (name || '?').trim()[0].toUpperCase(); }
function cafeGrad(idx: number): string {
  const GR = ['linear-gradient(135deg,#8a5a3c,#c0623a)','linear-gradient(135deg,#6b7d5a,#9aa873)',
    'linear-gradient(135deg,#a8502c,#d98a4e)','linear-gradient(135deg,#5b4636,#917256)',
    'linear-gradient(135deg,#996b3d,#caa46a)','linear-gradient(135deg,#7a4a3a,#b87a52)'];
  return GR[idx % GR.length];
}

function hotToCard(h: HotGame): GameCardData {
  return { id: String(h.bggId), title: h.name, bggId: h.bggId, thumbnailUrl: h.thumbnailUrl };
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startNav = useStartNav();
  const [cafes,        setCafes]        = useState<CafeCard[]>([]);
  const [cafesLoading, setCafesLoading] = useState(true);
  const [hotGames,     setHotGames]     = useState<HotGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [q, setQ]     = useState('');
  const [cat, setCat] = useState('All');
  const cityRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cafesMin = new Promise<void>(r => setTimeout(r, 600));
    const gamesMin = new Promise<void>(r => setTimeout(r, 600));
    cafesApi.list().then(d => setCafes(d)).catch(() => {}).then(() => cafesMin).then(() => setCafesLoading(false));
    gamesApi.hot().then(d => setHotGames(d)).catch(() => {}).then(() => gamesMin).then(() => setGamesLoading(false));
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
          {cafes.length || '—'} {t('cafesWord')} · {hotGames.length || '—'} {t('games').toLowerCase()}
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
          {cafesLoading
            ? Array(4).fill(0).map((_, i) => <CafeCardSkeleton key={i} />)
            : cafes.map((c, i) => (
            <Link key={c.id} to={`/cafes/${c.id}`} className="ccard" onClick={startNav}>
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

      {/* ── Trending games from BGG ── */}
      <section className="sec" style={{ paddingBottom: 60 }}>
        <div className="sec-head">
          <h2>🔥 {t('secTrending')}</h2>
          <Link to="/search">{t('lnkAll')}</Link>
        </div>
        <div className="ggrid">
          {gamesLoading
            ? Array(12).fill(0).map((_, i) => <GameCardSkeleton key={i} />)
            : hotGames.slice(0, 12).map(g => (
                <GameCard
                  key={g.bggId}
                  g={hotToCard(g)}
                  to={`/games/${g.bggId}`}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
