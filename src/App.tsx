import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import { NavSpinnerProvider } from './context/SpinnerContext';
import Home from './pages/Home';
import CafeLibrary from './pages/CafeLibrary';
import GameDetail from './pages/GameDetail';
import Search from './pages/Search';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import CafeAdmin from './pages/CafeAdmin';

interface RequireAuthProps {
  children: React.ReactNode;
  owner?: boolean;
}

function RequireAuth({ children, owner = false }: RequireAuthProps) {
  const { isAuthenticated, isOwner, openLoginModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      openLoginModal(location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return null;
  if (owner && !isOwner) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <NavSpinnerProvider>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cafes/:id" element={<CafeLibrary />} />
          <Route path="/games/:bggId" element={<GameDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth owner><CafeAdmin /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </NavSpinnerProvider>
  );
}
