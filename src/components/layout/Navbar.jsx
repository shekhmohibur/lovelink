import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Compass, MessageCircle, Users, User, Star, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../ui/Avatar";
import toast from "react-hot-toast";

const navItems = [
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/chat", icon: MessageCircle, label: "Messages" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/pricing", icon: Star, label: "Upgrade" },
];

export default function Navbar() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 lg:w-64 flex-col items-center lg:items-start py-6 px-3 lg:px-5 gap-2 border-r border-white/5 z-40"
      style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)" }}>

      {/* Logo */}
      <NavLink to="/discover" className="flex items-center gap-3 px-2 mb-6 group">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}>
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="hidden lg:block text-lg font-bold gradient-text">LoveLink</span>
      </NavLink>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 w-full flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-pink-400" : ""}`} />
                <span className="hidden lg:block text-sm font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-pink-500"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="w-full border-t border-white/5 pt-4 flex items-center justify-between gap-3 px-2">
        <NavLink to="/profile" className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar src={user?.photoURL} name={user?.displayName} uid={user?.uid} size="sm" />
          <div className="hidden lg:block min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.displayName || "You"}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
