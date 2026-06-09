import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      background: 'var(--card)',
      padding: '28px 24px',
      marginTop: 60,
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Logo row */}
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          <span style={{ marginRight: 6 }}>♟</span>Meepled
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 14px' }}>
          Discover board-game cafés near you.
        </p>

        {/* Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: 14, marginBottom: 18 }}>
          <Link to="/"       style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}>Cafés</Link>
          <Link to="/search" style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}>Games</Link>
          <Link to="/map"    style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}>Map</Link>
          <a
            href="https://boardgamegeek.com"
            target="_blank" rel="noreferrer"
            style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}
          >
            BoardGameGeek
          </a>
        </div>

        {/* Heart note */}
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Made with ♥ for board-game lovers everywhere &nbsp;·&nbsp; data powered by{' '}
          <a href="https://boardgamegeek.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-ink)' }}>BGG</a>
        </p>
      </div>
    </footer>
  );
}
