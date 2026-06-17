import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi, cafes as cafesApi } from '../api/client';
import GameCard from '../components/GameCard';
import type { CafeCard, GameCardData } from '../types';

const CATS = ['All', 'Family', 'Party', 'Cooperative', 'Strategy', 'Engine Building', 'Abstract', 'Card Game'];
const GR = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];

export default function Search() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [cat, setCat] = useState(params.get('cat') ?? 'All');
  const [games, setGames] = useState<GameCardData[]>([]);
  const [cafes, setCafes] = useState<CafeCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(overrideQ?: string, overrideCat?: string) {
    const query = overrideQ ?? q;
    const category = overrideCat ?? cat;
    setLoading(true);
    const p: Record<string, string> = {};
    if (query) p.q = query;
    if (category && category !== 'All') p.category = category;
    try {
      const [gs, cs] = await Promise.all([
        gamesApi.list(p),
        cafesApi.list(query || undefined),
      ]);
      setGames(gs);
      setCafes(cs);
    } finally {
      setLoading(false);
    }
  }

  function changeQ(v: string) {
    setQ(v);
    setParams({ q: v, cat });
  }
  function changeCat(c: string) {
    setCat(c);
    setParams({ q, cat: c });
    run(q, c);
  }

  return (
    <div className="fade-in">
      <div className="crumb"><Link to="/">← {t('cafes')}</Link> &nbsp;/&nbsp; {t('games')}</div>
      <h1 className="big" style={{ fontSize: 'clamp(28px,4vw,40px)', marginBottom: 4 }}>
        {q ? `"${q}"` : t('games')}
      </h1>

      {/* Search + category */}
      <form onSubmit={e => { e.preventDefault(); run(); setParams({ q, cat }); }}
        style={{ display: 'flex', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <div className="minisearch" style={{ flex: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
          <input placeholder={t('phGame')} value={q} onChange={e => changeQ(e.target.value)} />
        </div>
        <button className="btn" type="submit">{t('btnSearch')}</button>
      </form>

      <div className="chips" style={{ marginTop: 14 }}>
        {CATS.map(c => (
          <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => changeCat(c)}>{c}</button>
        ))}
      </div>

      {loading && <div className="spinner" style={{ marginTop: 20 }}><i /><span>Searching…</span></div>}

      {!loading && (
        <p className="muted" style={{ margin: '14px 0 4px' }}>
          {games.length} {t('games').toLowerCase()} · {cafes.length} {t('cafesWord')}
          {cat !== 'All' ? ` · ${cat}` : ''}
        </p>
      )}

      {/* Games */}
      {games.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>{t('games')}</h2></div>
          <div className="resgrid">
            {games.map(g => <GameCard key={g.id} g={g} />)}
          </div>
        </section>
      )}

      {/* Cafés */}
      {cafes.length > 0 && (
        <section className="sec" style={{ paddingBottom: 60 }}>
          <div className="sec-head"><h2>{t('cafes')}</h2></div>
          <div className="cgrid">
            {cafes.map((c, i) => (
              <Link key={c.id} to={`/cafes/${c.id}`} className="ccard">
                <div className="photo" style={{ background: GR[i % GR.length] }}>
                  {c.coverUrl
                    ? <img src={c.coverUrl} alt={c.name} />
                    : <span style={{ position: 'relative', zIndex: 1 }}>{(c.name || '?').trim()[0].toUpperCase()}</span>}
                  <span className="badge">{c.gameCount} {t('games').toLowerCase()}</span>
                </div>
                <div className="b">
                  <h3>{c.name}</h3>
                  <div className="loc">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {c.address}
                  </div>
                  <div className="meta">
                    <span className="stars" style={{ marginLeft: 'auto' }}>★ {c.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && games.length === 0 && cafes.length === 0 && (
        <p className="empty">No results — try a different search or category.</p>
      )}
    </div>
  );
}
