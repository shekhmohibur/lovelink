import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Users, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "../components/ui/Avatar";
import { formatTime } from "../lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: matches = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/matches").then((r) => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => api.get("/api/users/me").then((r) => r.data),
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: () => api.get("/api/friends").then((r) => r.data),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white">
          Hey, <span className="gradient-text">{user?.displayName?.split(" ")[0] || "there"}</span> 👋
        </h1>
        <p className="text-white/40 text-sm mt-0.5">Here's what's happening</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Matches", value: matches.length, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
          { label: "Friends", value: friends.length, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Chats", value: matches.length + friends.length, icon: MessageCircle, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent Matches</h2>
            <button onClick={() => navigate("/chat")} className="text-xs text-pink-400 hover:text-pink-300 transition-colors">
              View all →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.slice(0, 8).map((match) => (
              <motion.button
                key={match.matchId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/chat/${match.matchId}`)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <Avatar
                  src={match.user?.photoURL}
                  name={match.user?.displayName}
                  uid={match.user?.uid}
                  size="lg"
                  showOnline
                  isOnline={match.user?.isOnline}
                />
                <span className="text-xs text-white/50 max-w-[60px] truncate">{match.user?.displayName}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Discover People", desc: "Find new matches", icon: Compass, to: "/discover", gradient: "from-pink-500 to-rose-600" },
            { label: "My Messages", desc: "Chat with matches", icon: MessageCircle, to: "/chat", gradient: "from-purple-500 to-indigo-600" },
          ].map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => navigate(action.to)}
              className="glass-card p-5 text-left hover:border-pink-500/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
