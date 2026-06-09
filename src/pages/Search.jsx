import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games as gamesApi } from '../api/client';

// Stub of viewSearch(): query box + category chips + results, mirroring the prototype.
const CHIPS = ['chFamily', 'chParty', 'chStrategy', 'chCoop'];

export default function Search() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  async function run(e) {
    e?.preventDefault();
    setResults(await gamesApi.list(q ? { q } : {}));
  }

  return (
    <div>
      <form onSubmit={run} style={{ display: 'flex', gap: 8 }}>
        <input className="fld" style={{ flex: 1 }} placeholder={t('phGame')} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" type="submit">{t('btnSearch')}</button>
      </form>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {CHIPS.map((c) => <button key={c} className="btn ghost sm">{t(c)}</button>)}
      </div>
      <ul>
        {results.map((g) => <li key={g.id}><Link to={`/games/${g.id}`}>{g.title}</Link></li>)}
      </ul>
    </div>
  );
}
