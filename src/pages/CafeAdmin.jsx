import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi, games as gamesApi, cafeGames as cafeGamesApi } from '../api/client';

const TABS = [
  { id: 'games',   label: t => t('gameLibrary') },
  { id: 'menu',    label: t => t('cafeMenu')    },
  { id: 'profile', label: t => t('aboutCafe')   },
];

export default function CafeAdmin() {
  const { t } = useTranslation();

  const [cafe,        setCafe]        = useState(null);
  const [error,       setError]       = useState(null);
  const [tab,         setTab]         = useState('games');

  // BGG search
  const [bggQ,        setBggQ]        = useState('');
  const [bggResults,  setBggResults]  = useState([]);
  const [bggLoading,  setBggLoading]  = useState(false);
  const [adding,      setAdding]      = useState(null);  // bggId being added

  useEffect(() => {
    cafesApi.my()
      .then(setCafe)
      .catch(e => setError(e.message));
  }, []);

  // ── BGG search + add ─────────────────────────────────────────────────────────
  async function searchBgg(e) {
    e.preventDefault();
    if (!bggQ.trim()) return;
    setBggLoading(true);
    setBggResults([]);
    try {
      const res = await gamesApi.bggSearch(bggQ.trim());
      setBggResults(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setBggLoading(false);
    }
  }

  async function addGame(bggId) {
    if (!cafe) return;
    setAdding(bggId);
    try {
      // 1. Import / retrieve game from DB
      const game = await gamesApi.import(bggId);
      // 2. Add to this café's library
      await cafeGamesApi.add({ cafeId: cafe.id, gameId: game.id, copies: 1 });
      // 3. Refresh café data
      const updated = await cafesApi.my();
      setCafe(updated);
      // Remove from BGG results
      setBggResults(r => r.filter(x => x.bggId !== bggId));
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  }

  // ── Library management ───────────────────────────────────────────────────────
  async function toggleFeatured(cg) {
    try {
      await cafeGamesApi.update(cg.id, { featured: !cg.featured });
      setCafe(c => ({
        ...c,
        games: c.games.map(g => g.id === cg.id ? { ...g, featured: !g.featured } : g),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeGame(cgId) {
    if (!window.confirm('Remove this game from your library?')) return;
    try {
      await cafeGamesApi.remove(cgId);
      setCafe(c => ({ ...c, games: c.games.filter(g => g.id !== cgId) }));
    } catch (err) {
      alert(err.message);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (error) return <div className="section"><p className="muted">{error}</p></div>;
  if (!cafe)  return <div className="section"><div className="spinner"><i /><span>Loading…</span></div></div>;

  return (
    <div className="fade-in">
      <div className="crumb">
        <Link to={`/cafes/${cafe.id}`}>← {cafe.name}</Link>
      </div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px,4vw,38px)', marginBottom: 4 }}>
        {t('dashboard')}
      </h1>
      <p className="muted" style={{ marginBottom: 24 }}>{cafe.name}</p>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className="btn sm"
            style={{
              background: tab === id ? 'var(--accent)' : 'var(--chip)',
              color: tab === id ? '#fff' : 'inherit',
              border: 'none',
            }}
            onClick={() => setTab(id)}
          >
            {label(t)}
          </button>
        ))}
      </div>

      {/* ══ Games Tab ══ */}
      {tab === 'games' && (
        <div>
          {/* BGG search panel */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, fontFamily: 'var(--display)' }}>Add a game from BGG</h3>
            <form onSubmit={searchBgg} style={{ display: 'flex', gap: 8 }}>
              <div className="minisearch" style={{ flex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
                <input
                  placeholder="Search BoardGameGeek…"
                  value={bggQ}
                  onChange={e => setBggQ(e.target.value)}
                />
              </div>
              <button className="btn" type="submit" disabled={bggLoading}>
                {bggLoading ? '…' : 'Search'}
              </button>
            </form>

            {bggResults.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {bggResults.map(r => (
                  <div key={r.bggId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{r.name}</span>
                      {r.yearPublished && (
                        <span className="muted" style={{ marginLeft: 6, fontSize: 13 }}>({r.yearPublished})</span>
                      )}
                    </div>
                    <button
                      className="btn sm"
                      onClick={() => addGame(r.bggId)}
                      disabled={adding === r.bggId}
                      style={{ flexShrink: 0 }}
                    >
                      {adding === r.bggId ? '…' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Library list */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--display)' }}>
                Library&nbsp;
                <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>({cafe.games.length} games)</span>
              </h3>
            </div>

            {cafe.games.length === 0 ? (
              <p className="empty">No games yet — search BGG above to add some.</p>
            ) : (
              <div>
                {cafe.games.map(cg => (
                  <div key={cg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    {/* Thumbnail */}
                    <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {cg.imageUrl
                        ? <img src={cg.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        : '🎲'}
                    </div>

                    {/* Name + copies */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cg.title}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {cg.copies} cop{cg.copies !== 1 ? 'ies' : 'y'}
                        {cg.minPlayers && cg.maxPlayers && ` · ${cg.minPlayers}–${cg.maxPlayers} players`}
                      </div>
                    </div>

                    {/* Featured toggle */}
                    <button
                      className="btn sm"
                      onClick={() => toggleFeatured(cg)}
                      style={{
                        background: cg.featured ? 'var(--accent)' : 'var(--chip)',
                        color: cg.featured ? '#fff' : 'inherit',
                        border: 'none',
                        flexShrink: 0,
                      }}
                      title="Toggle featured pin"
                    >
                      {cg.featured ? '★ Featured' : '☆ Feature'}
                    </button>

                    {/* Remove */}
                    <button
                      className="btn ghost sm"
                      onClick={() => removeGame(cg.id)}
                      style={{ color: '#c0392b', flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Menu Tab ══ */}
      {tab === 'menu' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontFamily: 'var(--display)' }}>{t('cafeMenu')}</h3>
          {cafe.menu.length === 0 ? (
            <p className="empty">No menu items yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {cafe.menu.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px' }}>
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl} alt={m.name}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                      loading="lazy"
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    {m.price && <div style={{ color: 'var(--accent-ink)', fontWeight: 700, marginTop: 2 }}>{m.price}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>Menu item editing coming soon.</p>
        </div>
      )}

      {/* ══ Profile Tab ══ */}
      {tab === 'profile' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontFamily: 'var(--display)' }}>{t('aboutCafe')}</h3>
          <dl style={{ display: 'grid', gap: 0 }}>
            {[
              ['Name',     cafe.name],
              ['Address',  cafe.address],
              ['About',    cafe.about],
              ['Hours',    cafe.hours],
              ['Day Pass', cafe.dayPass],
              ['Contact',  cafe.contact],
              ['Map URL',  cafe.mapUrl],
              ['Fanpage',  cafe.fanpage],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px 12px', padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                <dt style={{ fontWeight: 600, fontSize: 13, color: 'var(--muted)', paddingTop: 2 }}>{label}</dt>
                <dd style={{ margin: 0, wordBreak: 'break-word' }}>{val}</dd>
              </div>
            ))}
          </dl>
          <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>Profile editing coming soon.</p>
        </div>
      )}
    </div>
  );
}
