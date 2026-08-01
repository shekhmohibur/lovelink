import { NavLink } from "react-router-dom";
import { Compass, MessageCircle, Users, User, Star } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/pricing", icon: Star, label: "Pro" },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe"
      style={{
        background: "rgba(10,10,15,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative ${
                isActive ? "text-pink-400" : "text-white/30"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(255,61,127,0.12)" }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
