import { useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, UserPlus, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import Avatar from "../ui/Avatar";
import toast from "react-hot-toast";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";

function ProfileCard({ profile, onLike, onPass, onFriend, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) {
      onLike(profile);
    } else if (info.offset.x < -120) {
      onPass(profile);
    }
  };

  const interests = profile.interests || [];

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl"
      whileDrag={{ scale: 1.03 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center`}
            style={{ background: "linear-gradient(135deg, #ff3d7f22, #8b5cf622), #111118" }}>
            <Avatar name={profile.displayName} uid={profile.uid} size="2xl" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* LIKE / PASS overlays */}
      <motion.div
        className="absolute top-8 left-8 border-4 border-pink-500 text-pink-500 rounded-xl px-4 py-1 font-black text-2xl rotate-[-20deg]"
        style={{ opacity: likeOpacity }}
      >
        LIKE ❤
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 border-4 border-red-400 text-red-400 rounded-xl px-4 py-1 font-black text-2xl rotate-[20deg]"
        style={{ opacity: passOpacity }}
      >
        NOPE ✕
      </motion.div>

      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">
              {profile.displayName || "Anonymous"}
              {profile.age && <span className="text-white/60 font-normal ml-2 text-lg">{profile.age}</span>}
            </h2>
            {profile.location && (
              <p className="text-white/50 text-sm mt-0.5">📍 {profile.location}</p>
            )}
          </div>
          {profile.subscription === "pro" && (
            <span className="pro-badge">⭐ PRO</span>
          )}
        </div>

        {profile.bio && (
          <p className="text-white/70 text-sm mb-3 line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {interests.slice(0, 4).map((interest, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium text-white/80 glass-card border-white/10">
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onPass(profile)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-all hover:scale-110 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => onFriend(profile)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-purple-500/20 hover:text-purple-400 text-white/60 transition-all hover:scale-110 border border-white/10"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <button
            onClick={() => onLike(profile)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 animate-pulse_glow"
            style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}
          >
            <Heart className="w-6 h-6 fill-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CardStack() {
  const queryClient = useQueryClient();
  const { emitMatch, emitFriendRequest } = useSocket();
  const { user } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["discovery"],
    queryFn: () => api.get("/api/users").then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

  const [dismissed, setDismissed] = useState(new Set());

  const likeMutation = useMutation({
    mutationFn: (targetUid) => api.post("/api/matches/like", { targetUid }),
    onSuccess: (res, targetUid) => {
      if (res.data.matched) {
        const matched = profiles.find((p) => p.uid === targetUid || p.id === targetUid);
        emitMatch(targetUid, res.data.matchId);
        toast.custom(
          () => (
            <div className="glass-card px-5 py-4 text-center match-glow animate__animated animate__bounceIn">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-white font-bold text-lg">It's a Match!</p>
              <p className="text-white/50 text-sm">You and {matched?.displayName} matched!</p>
            </div>
          ),
          { duration: 5000 }
        );
        queryClient.invalidateQueries(["matches"]);
      }
    },
  });

  const passMutation = useMutation({
    mutationFn: (targetUid) => api.post("/api/matches/pass", { targetUid }),
  });

  const friendMutation = useMutation({
    mutationFn: (targetUid) => api.post("/api/friends/request", { targetUid }),
    onSuccess: (_, targetUid) => {
      const p = profiles.find((pr) => pr.uid === targetUid || pr.id === targetUid);
      emitFriendRequest(targetUid, user?.displayName || "Someone");
      toast.success(`Friend request sent to ${p?.displayName || "them"}!`);
    },
  });

  const handleLike = useCallback((profile) => {
    const uid = profile.uid || profile.id;
    setDismissed((prev) => new Set([...prev, uid]));
    likeMutation.mutate(uid);
  }, []);

  const handlePass = useCallback((profile) => {
    const uid = profile.uid || profile.id;
    setDismissed((prev) => new Set([...prev, uid]));
    passMutation.mutate(uid);
  }, []);

  const handleFriend = useCallback((profile) => {
    const uid = profile.uid || profile.id;
    friendMutation.mutate(uid);
    toast.success("Friend request sent!");
  }, []);

  const visible = profiles.filter((p) => !dismissed.has(p.uid || p.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <div className="w-16 h-16 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin mb-4" />
        <p className="text-white/40 text-sm">Finding people for you...</p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4"
        >
          💝
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">You've seen everyone!</h3>
        <p className="text-white/40 text-sm max-w-xs">
          Check back later for new people. Your matches are waiting in your inbox!
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 520 }}>
      <AnimatePresence>
        {visible.slice(0, 3).reverse().map((profile, idx, arr) => (
          <motion.div
            key={profile.uid || profile.id}
            className="absolute inset-0"
            style={{
              zIndex: idx,
              scale: 1 - (arr.length - 1 - idx) * 0.04,
              y: (arr.length - 1 - idx) * 10,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1 - (arr.length - 1 - idx) * 0.04, opacity: 1 }}
            exit={{ x: 300, opacity: 0, rotate: 20 }}
          >
            <ProfileCard
              profile={profile}
              isTop={idx === arr.length - 1}
              onLike={handleLike}
              onPass={handlePass}
              onFriend={handleFriend}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
