import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Discovery from "../pages/Discovery";
import Chat from "../pages/Chat";
import Friends from "../pages/Friends";
import Profile from "../pages/Profile";
import Pricing from "../pages/Pricing";
import AppLayout from "../components/layout/AppLayout";
import LoadingScreen from "../components/ui/LoadingScreen";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/discover" replace /> : children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected — inside app shell */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="discover" element={<Discovery />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:chatId" element={<Chat />} />
        <Route path="friends" element={<Friends />} />
        <Route path="profile" element={<Profile />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
