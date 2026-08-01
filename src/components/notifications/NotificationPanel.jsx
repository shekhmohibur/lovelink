import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../contexts/SocketContext";
import { Heart, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function NotificationPanel() {
  const { notifications, clearNotification } = useSocket();

  useEffect(() => {
    notifications.forEach((n) => {
      if (n.type === "new_match") {
        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card px-4 py-3 flex items-center gap-3 min-w-[280px]"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}>
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">It's a Match! 🎉</p>
                <p className="text-xs text-white/50">You matched with someone new</p>
              </div>
            </motion.div>
          ),
          { duration: 5000 }
        );
        clearNotification(n.id);
      }

      if (n.type === "friend_request") {
        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card px-4 py-3 flex items-center gap-3 min-w-[280px]"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20 border border-purple-500/30">
                <UserPlus className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Friend Request</p>
                <p className="text-xs text-white/50">{n.fromName || "Someone"} wants to be friends</p>
              </div>
            </motion.div>
          ),
          { duration: 5000 }
        );
        clearNotification(n.id);
      }
    });
  }, [notifications]);

  return null;
}
