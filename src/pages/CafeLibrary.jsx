import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cafes as cafesApi, reviews as reviewsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';

const GR = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];
const AV = ['#c0623a','#6b7d5a','#917256','#a8502c','#7a4a3a','#996b3d','#5b7d8a'];
function cafeGrad(name) { return GR[(name?.charCodeAt(0) ?? 0) % GR.length]; }
function avColor(name)  { return AV[(name?.charCodeAt(0) ?? 0) % AV.length]; }
const starStr = n => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));

export default function CafeLibrary() {
  const { id }  = useParams();
  const { t }   = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const [cafe,          setCafe]          = useState(null);
  const [error,         setError]         = useState(null);
  const [libQ,          setLibQ]          = useState('');
  const [reviewStars,   setReviewStars]   = useState(0);
  const [reviewBody,    setReviewBody]    = useState('');
  const [reviewPosting, setReviewPosting] = useState(false);
  const [reviewDone,    setReviewDone]    = useState(false);

  useEffect(() => {
    cafesApi.get(id).then(setCafe).catch(e => setError(e.message));
  }, [id]);

  if (error) return <div className="section"><p className="muted">{error}</p></div>;
  if (!cafe)  return <div className="section"><div className="spinner"><i /><span>Loading…</span></div></div>;

  const grad    = cafeGrad(cafe.name);
  const initial = (cafe.name || '?').trim()[0].toUpperCase();
  const avg     = cafe.rating ?? (cafe.reviews?.length
    ? (cafe.reviews.reduce((s, r) => s + r.stars, 0) / cafe.reviews.length).toFixed(1)
    : '—');

  const filteredGames = libQ
    ? cafe.games.filter(g => g.title?.toLowerCase().includes(libQ.toLowerCase()))
    : cafe.games;

  const avatarColor = user?.avatarColor ?? AV[(user?.name?.charCodeAt(0) ?? 0) % AV.length];
  const avatarLabel = user?.avatarIcon  || (user?.name?.trim()[0]?.toUpperCase() ?? '?');

  async function postReview() {
    if (!reviewStars) return;
    setReviewPosting(true);
    try {
      await reviewsApi.post({ cafeId: cafe.id, stars: reviewStars, body: reviewBody.trim() || null });
      setReviewDone(true);
      // Reload to get updated reviews
      cafesApi.get(id).then(setCafe).catch(() => {});
    } catch (e) {
      alert(e.message);
    } finally {
      setReviewPosting(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="crumb">
        <Link to="/">← {t('cafes')}</Link> &nbsp;/&nbsp; {cafe.name}
      </div>

      {/* ── Café header ── */}
      <div className="cafe-head">
        <div className="cover-box" style={{ background: grad }}>
          {cafe.coverUrl
            ? <img src={cafe.coverUrl} alt={cafe.name} />
            : <span className="initial">{initial}</span>}
          {cafe.hours && <span className="openpill">Open · {cafe.hours}</span>}
        </div>

        <div className="cafe-info">
          <h1>{cafe.name}</h1>
          <div className="loc">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {cafe.address}
          </div>
          {cafe.about && <p className="desc">{cafe.about}</p>}

          <div className="stats">
            <div className="stat">
              <div className="n">{cafe.games?.length ?? 0}</div>
              <div className="l">{t('games')}</div>
            </div>
            <div className="stat">
              <div className="n">★ {avg}</div>
              <div className="l">{cafe.reviews?.length ?? 0} {t('reviews').toLowerCase()}</div>
            </div>
            {cafe.dayPass && (
              <div className="stat">
                <div className="n">{cafe.dayPass}</div>
                <div className="l">Day pass</div>
              </div>
            )}
          </div>

          <div className="info-links">
            {cafe.mapUrl && (
              <a href={cafe.mapUrl} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {t('map')}
              </a>
            )}
            {cafe.fanpage && (
              <a href={cafe.fanpage} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Fanpage
              </a>
            )}
            {cafe.contact && (
              <a href={`tel:${cafe.contact}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>
                {cafe.contact}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Menu ── */}
      {cafe.menu?.length > 0 && (
        <div className="section">
          <h2>{t('cafeMenu')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {cafe.menu.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
                {m.imageUrl && (
                  <img
                    src={m.imageUrl} alt={m.name}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    loading="lazy"
                  />
                )}
                <span style={{ flex: 1, fontWeight: 600 }}>{m.name}</span>
                {m.price && <span style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>{m.price}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Game library ── */}
      <div className="toolbar">
        <h2>{t('gameLibrary')}</h2>
        <div className="minisearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
          <input
            placeholder={t('phGame')}
            value={libQ}
            onChange={e => setLibQ(e.target.value)}
          />
        </div>
      </div>

      {filteredGames.length === 0
        ? <p className="empty">No games match that here.</p>
        : <div className="ggrid" style={{ marginBottom: 32 }}>
            {filteredGames.map(g => <GameCard key={g.id} g={g} featured={g.featured} />)}
          </div>}

      <p className="empty" style={{ textAlign: 'center', marginBottom: 40 }}>
        {t('poweredBy')}{' '}
        <a href="https://boardgamegeek.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>BoardGameGeek</a>.
      </p>

      {/* ── Reviews ── */}
      <div className="section">
        <div className="comhead">
          <h2>{t('reviews')}</h2>
          <span className="count">{cafe.reviews?.length ?? 0}</span>
        </div>

        {/* Review composer — auth-aware */}
        {isAuthenticated ? (
          reviewDone ? (
            <div className="login-prompt" style={{ background: 'var(--chip)' }}>
              <p>✅ Review posted! Thank you.</p>
            </div>
          ) : (
            <div className="composer">
              <div className="top">
                <div className="me" style={{ background: avatarColor }}>{avatarLabel}</div>
                <div style={{ flex: 1 }}>
                  {/* Star picker */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setReviewStars(n)}
                        style={{
                          fontSize: 22, lineHeight: 1, border: 'none', background: 'none',
                          cursor: 'pointer', color: reviewStars >= n ? '#e6a817' : 'var(--line)',
                          padding: '0 2px',
                        }}
                      >★</button>
                    ))}
                    {reviewStars > 0 && (
                      <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center', marginLeft: 4 }}>
                        {reviewStars}/5
                      </span>
                    )}
                  </div>
                  <textarea
                    placeholder="Share your experience…"
                    value={reviewBody}
                    onChange={e => setReviewBody(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="row">
                <button className="btn" onClick={postReview} disabled={reviewPosting || !reviewStars}>
                  {reviewPosting ? '…' : 'Post Review'}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="login-prompt">
            <p>Log in to leave a review.</p>
            <Link to="/login"><button className="btn">{t('loginCommentBtn')}</button></Link>
          </div>
        )}

        {/* Review list */}
        {cafe.reviews?.length === 0
          ? <p className="empty">{t('noReviews')}</p>
          : <div className="feedgrid">
              {(cafe.reviews ?? []).map(r => (
                <div className="review-card" key={r.id}>
                  <div className="rh">
                    <div className="av" style={{ background: avColor(r.userName) }}>
                      {(r.userName || '?').trim()[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="nm">{r.userName}</div>
                      <div className="st">{starStr(r.stars)}</div>
                      <div className="tm">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {r.body && <div className="rt">{r.body}</div>}
                </div>
              ))}
            </div>}
      </div>

      {/* ── Photos ── */}
      {cafe.photos?.length > 0 && (
        <div className="section">
          <h2>Photos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {cafe.photos.map((url, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
