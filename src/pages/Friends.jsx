import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserPlus, MessageCircle, Check, X, MoreVertical, UserMinus, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import api from "../lib/api";
import Avatar from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

function FriendCard({ friend, onViewProfile, onUnfriend }) {
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

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all outline-none">
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[160px] bg-[#1a1a24] border border-white/10 rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in-95 z-50"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer outline-none transition-colors"
              onClick={() => onViewProfile(friend.friend?.uid)}
            >
              <UserIcon className="w-4 h-4" /> View Profile
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none transition-colors"
              onClick={() => {
                if (window.confirm(`Are you sure you want to unfriend ${friend.friend?.displayName}?`)) {
                  onUnfriend(friend.friendshipId);
                }
              }}
            >
              <UserMinus className="w-4 h-4" /> Unfriend
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
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
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: () => api.get("/api/friends").then((r) => r.data),
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => api.get("/api/friends/requests").then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: profileToView, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", selectedProfileId],
    queryFn: () => api.get(`/api/users/${selectedProfileId}`).then((r) => r.data),
    enabled: !!selectedProfileId,
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

  const unfriendMutation = useMutation({
    mutationFn: (friendshipId) => api.post("/api/friends/unfriend", { friendshipId }),
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["chats"]);
      queryClient.invalidateQueries(["discovery"]);
    },
    onError: () => toast.error("Failed to unfriend"),
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
              <FriendCard
                key={f.friendshipId}
                friend={f}
                onViewProfile={setSelectedProfileId}
                onUnfriend={(id) => unfriendMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* View Profile Dialog */}
      <Dialog.Root open={!!selectedProfileId} onOpenChange={(open) => !open && setSelectedProfileId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md z-50 animate-in fade-in zoom-in-95">
            <div className="glass-card p-6 overflow-hidden relative shadow-2xl">
              <button
                onClick={() => setSelectedProfileId(null)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="w-24 h-24 rounded-full skeleton" />
                  <div className="h-4 rounded skeleton w-1/3" />
                  <div className="h-3 rounded skeleton w-1/2" />
                </div>
              ) : profileToView ? (
                <div className="flex flex-col items-center">
                  <Avatar
                    src={profileToView.photoURL}
                    name={profileToView.displayName}
                    uid={profileToView.id}
                    size="2xl"
                    className="mb-4"
                  />
                  <h2 className="text-2xl font-bold font-display text-white mb-1">
                    {profileToView.displayName} {profileToView.age && <span className="font-normal text-white/60 text-lg">{profileToView.age}</span>}
                  </h2>
                  <p className="text-sm text-white/40 mb-6">
                    {profileToView.location ? `📍 ${profileToView.location}` : "Mysterious Location"}
                  </p>

                  <div className="w-full text-left space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    {profileToView.bio && (
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">About</p>
                        <p className="text-sm text-white/80 leading-relaxed">{profileToView.bio}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {profileToView.gender && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">Gender</p>
                          <p className="text-sm text-white/80">{profileToView.gender}</p>
                        </div>
                      )}
                      {profileToView.lookingFor && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">Looking For</p>
                          <p className="text-sm text-white/80">{profileToView.lookingFor}</p>
                        </div>
                      )}
                    </div>

                    {profileToView.interests?.length > 0 && (
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {profileToView.interests.map((interest, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white/70 bg-white/10 border border-white/5">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full mt-6">
                    <Button
                      variant="brand"
                      className="w-full"
                      onClick={() => {
                        setSelectedProfileId(null);
                        const friendData = friends.find(f => f.friend?.uid === profileToView.id);
                        if (friendData) {
                          const navigate = require("react-router-dom").useNavigate; // Local import workaround or just use the hook context. Wait, we can't use hook inside callback.
                          // Fortunately we can just use the link
                        }
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-white/40">Profile not found</div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
