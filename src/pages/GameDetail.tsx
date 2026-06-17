import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi, wishlist as wishlistApi, comments as commentsApi, bgg as bggApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStartNav } from '../context/SpinnerContext';
import { gameGrad, gameEmoji } from '../components/GameCard';
import type { GameDetailData, Comment } from '../types';

const GR_CAFE = [
  'linear-gradient(135deg,#8a5a3c,#c0623a)',
  'linear-gradient(135deg,#6b7d5a,#9aa873)',
  'linear-gradient(135deg,#a8502c,#d98a4e)',
  'linear-gradient(135deg,#5b4636,#917256)',
  'linear-gradient(135deg,#996b3d,#caa46a)',
  'linear-gradient(135deg,#7a4a3a,#b87a52)',
];
const AV = ['#c0623a','#6b7d5a','#917256','#a8502c','#7a4a3a','#996b3d'];
function cafeGrad(name: string | undefined): string { return GR_CAFE[(name?.charCodeAt(0) ?? 0) % GR_CAFE.length]; }
function avColor(name: string | undefined): string { return AV[(name?.charCodeAt(0) ?? 0) % AV.length]; }

export default function GameDetail() {
  const { id, bggId } = useParams<{ id?: string; bggId?: string }>();
  const { t } = useTranslation();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const startNav = useStartNav();

  const [game,        setGame]        = useState<GameDetailData | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [bggImageUrl, setBggImageUrl] = useState<string | null>(null);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [posting,     setPosting]     = useState(false);

  useEffect(() => {
    setGame(null);
    setError(null);
    setBggImageUrl(null);
    if (bggId) {
      gamesApi.getByBggId(Number(bggId)).then(setGame).catch(e => setError((e as Error).message));
    } else {
      gamesApi.get(id!).then(setGame).catch(e => setError((e as Error).message));
    }
  }, [id, bggId]);

  // Fetch image via proxy when missing from API response
  useEffect(() => {
    if (!game?.bggId || game.imageUrl) return;
    let cancelled = false;
    bggApi.image(game.bggId)
      .then(r => { if (!cancelled && r.imageUrl) setBggImageUrl(r.imageUrl); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [game?.bggId, game?.imageUrl]);

  const loadComments = useCallback(() => {
    const targetId = game?.id;
    if (!targetId) return;
    commentsApi.list('game', targetId).then(setCommentList).catch(() => {});
  }, [game?.id]);
  useEffect(() => { loadComments(); }, [loadComments]);

  useEffect(() => {
    if (!isAuthenticated || !game?.id) return;
    wishlistApi.list()
      .then(items => setWishlisted(items.some(w => w.gameId === game.id)))
      .catch(() => {});
  }, [isAuthenticated, game?.id]);

  async function toggleWish() {
    if (!isAuthenticated) { openLoginModal(); return; }
    if (!game) return;
    setLoadingWish(true);
    try {
      if (wishlisted) { await wishlistApi.remove(game.id); setWishlisted(false); }
      else            { await wishlistApi.add(game.id);    setWishlisted(true);  }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingWish(false);
    }
  }

  async function postComment() {
    if (!commentText.trim() || !game?.id) return;
    setPosting(true);
    try {
      const c = await commentsApi.post({ target: 'game', targetId: game.id, body: commentText.trim() });
      setCommentList(prev => [c, ...prev]);
      setCommentText('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPosting(false);
    }
  }

  if (error) return <div className="section"><p className="muted">{error}</p></div>;
  if (!game)  return <div className="section"><div className="spinner"><i /><span>Loading…</span></div></div>;

  const artUrl  = game.imageUrl || bggImageUrl;
  const grad    = gameGrad(game.bggId);
  const emoji   = gameEmoji(game.bggId);
  const players = game.minPlayers && game.maxPlayers
    ? `${game.minPlayers}–${game.maxPlayers}` : (game.minPlayers ?? '?');
  const time    = game.maxTime ? `${game.minTime ?? game.maxTime}–${game.maxTime}` : `${game.minTime ?? '?'}`;
  const weight  = typeof game.weight === 'number' ? game.weight : null;

  const avatarColor = user?.avatarColor ?? AV[(user?.name?.charCodeAt(0) ?? 0) % AV.length];
  const avatarLabel = user?.avatarIcon  || (user?.name?.trim()[0]?.toUpperCase() ?? '?');

  return (
    <div className="fade-in">
      <div className="crumb">
        <Link to="/search">← {t('games')}</Link> &nbsp;/&nbsp; {game.title}
      </div>

      {/* ── Hero ── */}
      <div className="ghero">
        <div className="art" style={{ background: artUrl ? undefined : grad }}>
          {artUrl
            ? <img src={artUrl} alt={game.title} />
            : <span className="emoji">{emoji}</span>}
          {game.bggRank && (
            <span className="rank">BGG Rank <b>#{game.bggRank}</b></span>
          )}
        </div>

        <div className="ginfo">
          <h1>{game.title}</h1>
          <p className="byline">
            {game.designer     && <>Designed by <b>{game.designer}</b> · </>}
            {game.yearPublished && <>{game.yearPublished} · </>}
            {game.publisher}
          </p>

          <div className="raterow">
            {game.bggRating != null && (
              <div className="bigrate">
                {Number(game.bggRating).toFixed(1)}<span> / 10 · BGG</span>
              </div>
            )}
            <button
              className={`btn${wishlisted ? '' : ' ghost'} sm`}
              onClick={toggleWish}
              disabled={loadingWish}
            >
              {loadingWish ? '…' : wishlisted ? '♥ ' + t('inWish') : '♡ ' + t('addWish')}
            </button>
          </div>

          <div className="quickstats">
            <div className="qs"><div className="l">👥 Players</div><div className="v">{players}</div></div>
            <div className="qs"><div className="l">⏱ Time</div>   <div className="v">{time}m</div></div>
            <div className="qs"><div className="l">🎂 Age</div>    <div className="v">{game.minAge ? `${game.minAge}+` : '—'}</div></div>
            <div className="qs"><div className="l">⚖️ Weight</div> <div className="v">{weight != null ? `${weight.toFixed(1)}/5` : '—'}</div></div>
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
      {(game.description || (game.categories?.length ?? 0) > 0) && (
        <div className="section">
          <h2>{t('aboutGame')}</h2>
          {game.description && (
            <p className="about">
              {game.description.replace(/&#10;/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').slice(0, 600)}
              {game.description.length > 600 ? '…' : ''}
            </p>
          )}
          {(game.categories?.length ?? 0) > 0 && (
            <div className="tags-row">
              {game.categories.map(c => <span key={c} className="tag">{c}</span>)}
            </div>
          )}
        </div>
      )}

      {/* ── Where to play ── */}
      {(game.cafes?.length ?? 0) > 0 && (
        <div className="section" id="wtp">
          <h2>{t('whereToPlay')}</h2>
          <div className="cafe-rows">
            {game.cafes.map((c, i) => (
              <Link key={c.cafeId ?? i} to={`/cafes/${c.cafeId}`} className="crow" onClick={startNav}>
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

      {/* ── Discussion ── */}
      <div className="section">
        <div className="comhead">
          <h2>{t('discussion')}</h2>
          <span className="count">{commentList.length}</span>
        </div>

        {isAuthenticated ? (
          <div className="composer">
            <div className="top">
              <div className="me" style={{ background: avatarColor }}>{avatarLabel}</div>
              <textarea
                placeholder={t('commentPh')}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="row">
              <button className="btn" onClick={postComment} disabled={posting || !commentText.trim()}>
                {posting ? '…' : t('postComment')}
              </button>
            </div>
          </div>
        ) : (
          <div className="login-prompt">
            <p>{t('loginComment')}</p>
            <button className="btn" onClick={() => openLoginModal()}>{t('loginCommentBtn')}</button>
          </div>
        )}

        {commentList.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {commentList.map(c => (
              <div key={c.id} className="comment">
                <div className="av" style={{ background: c.avatarColor ?? avColor(c.userName) }}>
                  {(c.userName || '?').trim()[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="cmeta">
                    <span className="name">{c.userName}</span>
                    {c.isStaff && <span className="pin">Staff</span>}
                    <span className="time">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="txt">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {commentList.length === 0 && (
          <p className="empty" style={{ textAlign: 'center' }}>
            {t('poweredBy')}{' '}
            <a href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>BoardGameGeek</a>.
          </p>
        )}
      </div>
    </div>
  );
}
