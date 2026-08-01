import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserPlus, MessageCircle, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Avatar from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

function FriendCard({ friend }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-4 hover:border-pink-500/20 transition-all"
    >
      <Avatar
        src={friend.friend?.photoURL}
        name={friend.friend?.displayName}
        uid={friend.friend?.uid}
        size="lg"
        showOnline
        isOnline={friend.friend?.isOnline}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{friend.friend?.displayName}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {friend.friend?.isOnline ? "🟢 Online" : "Last seen recently"}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/chat/${friend.chatId}`)}
        className="flex-shrink-0"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:block">Chat</span>
      </Button>
    </motion.div>
  );
}

function RequestCard({ request, onAccept, onDecline }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 flex items-center gap-4"
    >
      <Avatar
        src={request.from?.photoURL}
        name={request.from?.displayName}
        uid={request.from?.uid}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{request.from?.displayName}</p>
        <p className="text-xs text-white/40 mt-0.5">Wants to be your friend</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onDecline(request.friendshipId)}
          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAccept(request.friendshipId)}
          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Friends() {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: () => api.get("/api/friends").then((r) => r.data),
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => api.get("/api/friends/requests").then((r) => r.data),
    refetchInterval: 15000,
  });

  const acceptMutation = useMutation({
    mutationFn: (friendshipId) => api.post("/api/friends/accept", { friendshipId }),
    onSuccess: () => {
      toast.success("Friend accepted! 🎉");
      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["friend-requests"]);
      queryClient.invalidateQueries(["chats"]);
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const declineMutation = useMutation({
    mutationFn: (friendshipId) => api.post("/api/friends/decline", { friendshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["friend-requests"]);
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-400" />
          Friends
        </h1>
        <p className="text-white/40 text-sm mt-0.5">People you've connected with</p>
      </motion.div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-400" />
            Friend Requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req.friendshipId}
                request={req}
                onAccept={(id) => acceptMutation.mutate(id)}
                onDecline={(id) => declineMutation.mutate(id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          My Friends ({friends.length})
        </h2>

        {loadingFriends ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded skeleton w-1/2" />
                  <div className="h-2.5 rounded skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🫂</div>
            <p className="text-white/40 text-sm">No friends yet</p>
            <p className="text-white/25 text-xs mt-1">Go to Discover and send a friend request!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <FriendCard key={f.friendshipId} friend={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
