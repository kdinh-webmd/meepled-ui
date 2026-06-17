import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi, cafes as cafesApi } from '../api/client';
import GameCard from '../components/GameCard';
import { GameCardSkeleton } from '../components/Skeletons';
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
  const [bggGames, setBggGames] = useState<GameCardData[]>([]);
  const [localGames, setLocalGames] = useState<GameCardData[]>([]);
  const [cafes, setCafes] = useState<CafeCard[]>([]);
  const [bggLoading, setBggLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(overrideQ?: string, overrideCat?: string) {
    const query    = overrideQ    ?? q;
    const category = overrideCat ?? cat;
    setBggGames([]);
    setLocalGames([]);

    // BGG search (when query present)
    if (query) {
      setBggLoading(true);
      gamesApi.bggSearch(query)
        .then(results =>
          setBggGames(results.slice(0, 24).map(r => ({
            id: String(r.bggId),
            title: r.name,
            bggId: r.bggId,
          })))
        )
        .catch(() => {})
        .finally(() => setBggLoading(false));
    }

    // Local DB + cafes search
    setLoading(true);
    const p: Record<string, string> = {};
    if (query) p.q = query;
    if (category && category !== 'All') p.category = category;
    try {
      const [gs, cs] = await Promise.all([
        query ? Promise.resolve([]) : gamesApi.list(p),
        cafesApi.list(query || undefined),
      ]);
      setLocalGames(gs);
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

  const showBgg   = q.length > 0;
  const totalCount = (showBgg ? bggGames.length : localGames.length) + cafes.length;

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

      {!bggLoading && !loading && (
        <p className="muted" style={{ margin: '14px 0 4px' }}>
          {totalCount} result{totalCount !== 1 ? 's' : ''}
          {cat !== 'All' ? ` · ${cat}` : ''}
          {showBgg ? ' · via BoardGameGeek' : ''}
        </p>
      )}

      {/* BGG results (when query present) */}
      {showBgg && (
        <section className="sec">
          <div className="sec-head">
            <h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
              BoardGameGeek Results
            </h2>
          </div>
          {bggLoading ? (
            <div className="resgrid">
              {Array(8).fill(0).map((_, i) => <GameCardSkeleton key={i} />)}
            </div>
          ) : bggGames.length > 0 ? (
            <div className="resgrid">
              {bggGames.map(g => <GameCard key={g.bggId} g={g} />)}
            </div>
          ) : (
            <p className="empty">No results on BoardGameGeek for "{q}".</p>
          )}
        </section>
      )}

      {/* Local games (when browsing by category, no query) */}
      {!showBgg && localGames.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>{t('games')}</h2></div>
          <div className="resgrid">
            {localGames.map(g => <GameCard key={g.id} g={g} />)}
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

      {!bggLoading && !loading && totalCount === 0 && (
        <p className="empty">No results — try a different search or category.</p>
      )}
    </div>
  );
}
