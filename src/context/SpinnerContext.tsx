import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Ctx = createContext<() => void>(() => {});
export const useStartNav = () => useContext(Ctx);

export function NavSpinnerProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const loc = useLocation();

  useEffect(() => { setOn(false); }, [loc.pathname]);

  return (
    <Ctx.Provider value={() => setOn(true)}>
      {on && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          display: 'grid', placeItems: 'center',
          background: 'rgba(245,236,224,.8)', backdropFilter: 'blur(3px)',
        }}>
          <div className="spinner"><i /><span>Loading…</span></div>
        </div>
      )}
      {children}
    </Ctx.Provider>
  );
}
