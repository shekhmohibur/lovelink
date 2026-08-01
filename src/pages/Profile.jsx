import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Camera, Edit3, Save, X, Plus } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { storage, auth } from "../lib/firebase";
import Avatar from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const INTEREST_OPTIONS = [
  "Travel", "Music", "Movies", "Books", "Gaming", "Sports",
  "Cooking", "Art", "Photography", "Hiking", "Yoga", "Tech",
  "Fashion", "Coffee", "Pets", "Dancing", "Writing", "Fitness",
];

const GENDERS = ["Man", "Woman", "Non-binary", "Prefer not to say"];
const LOOKING_FOR = ["Relationship", "Friendship", "Casual dating", "Networking"];

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => api.get("/api/users/me").then((r) => r.data),
  });

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    age: "",
    gender: "",
    lookingFor: "",
    location: "",
    interests: [],
  });

  // Sync form when profile loads
  const startEditing = () => {
    setForm({
      displayName: profile?.displayName || user?.displayName || "",
      bio: profile?.bio || "",
      age: profile?.age || "",
      gender: profile?.gender || "",
      lookingFor: profile?.lookingFor || "",
      location: profile?.location || "",
      interests: profile?.interests || [],
    });
    setEditing(true);
  };

  const updateMutation = useMutation({
    mutationFn: (data) => api.put("/api/users/me", data),
    onSuccess: async () => {
      // Update Firebase display name
      if (form.displayName && form.displayName !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
      }
      toast.success("Profile updated! ✨");
      queryClient.invalidateQueries(["profile", "me"]);
      setEditing(false);
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const handleSave = () => {
    if (!form.displayName) return toast.error("Name is required");
    updateMutation.mutate(form);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only images allowed");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");

    setUploading(true);
    try {
      const imgRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);

      await updateProfile(auth.currentUser, { photoURL: url });
      await api.put("/api/users/me", { photoURL: url });

      queryClient.invalidateQueries(["profile", "me"]);
      toast.success("Profile photo updated! 📸");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 8
        ? [...prev.interests, interest]
        : prev.interests,
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-6 flex gap-4 items-center">
          <div className="w-24 h-24 rounded-full skeleton" />
          <div className="flex-1 space-y-3">
            <div className="h-5 rounded skeleton w-1/2" />
            <div className="h-3 rounded skeleton w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <User className="w-6 h-6 text-pink-400" />
          My Profile
        </h1>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit3 className="w-4 h-4" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button variant="brand" size="sm" loading={updateMutation.isPending} onClick={handleSave}>
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        )}
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              src={user?.photoURL || profile?.photoURL}
              name={profile?.displayName || user?.displayName}
              uid={user?.uid}
              size="2xl"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0a0a0f] transition-all hover:scale-110"
              style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {profile?.displayName || user?.displayName || "Anonymous"}
            </h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            {profile?.subscription === "pro" && (
              <span className="pro-badge mt-2 inline-block">⭐ Pro Member</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit form / view */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-5">

        {editing ? (
          <>
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Display Name</label>
              <input className="input-dark" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Your name" />
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">About Me</label>
              <textarea
                className="input-dark resize-none"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people a little about yourself..."
                maxLength={200}
              />
              <p className="text-xs text-white/25 mt-1">{form.bio.length}/200</p>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Age</label>
                <input type="number" className="input-dark" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Your age" min="18" max="80" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Gender</label>
                <select className="input-dark" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select...</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Looking for + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Looking For</label>
                <select className="input-dark" value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}>
                  <option value="">Select...</option>
                  {LOOKING_FOR.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Location</label>
                <input className="input-dark" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                Interests (max 8 — {form.interests.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.interests.includes(interest)
                        ? "text-white border border-pink-500/60"
                        : "text-white/40 border border-white/10 hover:border-white/30"
                    }`}
                    style={form.interests.includes(interest) ? { background: "rgba(255,61,127,0.15)" } : {}}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* View mode */
          <div className="space-y-4">
            {profile?.bio && (
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 block">About</label>
                <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {profile?.age && (
                <div>
                  <label className="text-xs text-white/30 block">Age</label>
                  <p className="text-white/80">{profile.age}</p>
                </div>
              )}
              {profile?.gender && (
                <div>
                  <label className="text-xs text-white/30 block">Gender</label>
                  <p className="text-white/80">{profile.gender}</p>
                </div>
              )}
              {profile?.lookingFor && (
                <div>
                  <label className="text-xs text-white/30 block">Looking For</label>
                  <p className="text-white/80">{profile.lookingFor}</p>
                </div>
              )}
              {profile?.location && (
                <div>
                  <label className="text-xs text-white/30 block">Location</label>
                  <p className="text-white/80">📍 {profile.location}</p>
                </div>
              )}
            </div>

            {profile?.interests?.length > 0 && (
              <div>
                <label className="text-xs text-white/30 block mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium text-white/70 glass-card">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!profile?.bio && !profile?.age && (
              <div className="text-center py-6">
                <p className="text-white/30 text-sm">Complete your profile to attract better matches</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={startEditing}>
                  <Edit3 className="w-4 h-4" /> Complete Profile
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
