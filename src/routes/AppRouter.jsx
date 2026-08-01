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
import VerifyEmail from "../pages/VerifyEmail";
import AppLayout from "../components/layout/AppLayout";
import LoadingScreen from "../components/ui/LoadingScreen";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    return user.emailVerified ? <Navigate to="/discover" replace /> : <Navigate to="/verify-email" replace />;
  }
  return children;
}

function VerifyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.emailVerified) return <Navigate to="/discover" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Verification */}
      <Route path="/verify-email" element={<VerifyRoute><VerifyEmail /></VerifyRoute>} />

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
