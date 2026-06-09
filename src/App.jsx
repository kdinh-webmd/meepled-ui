import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import CafeLibrary from './pages/CafeLibrary';
import GameDetail from './pages/GameDetail';
import Search from './pages/Search';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import CafeAdmin from './pages/CafeAdmin';
import Login from './pages/Login';

// Gate routes that require authentication (and optionally café-owner role).
function RequireAuth({ children, owner = false }) {
  const { isAuthenticated, isOwner } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (owner && !isOwner) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cafes/:id" element={<CafeLibrary />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth owner>
                <CafeAdmin />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
