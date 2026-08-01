import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send, Image, ArrowLeft, MoreVertical, Phone, Video,
  CheckCheck, Check, ImageIcon, AlertCircle
} from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import Avatar from "../ui/Avatar";
import { formatChatTime, formatTime } from "../../lib/utils";
import toast from "react-hot-toast";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// ─── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine, showAvatar, otherUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {showAvatar && !isMine && (
        <Avatar src={otherUser?.photoURL} name={otherUser?.displayName} uid={otherUser?.uid} size="xs" className="self-end mb-1 flex-shrink-0" />
      )}
      {!showAvatar && !isMine && <div className="w-7 flex-shrink-0" />}

      <div className={`max-w-[72%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {msg.type === "image" ? (
          <div className={`rounded-2xl overflow-hidden ${isMine ? "rounded-br-sm" : "rounded-bl-sm"} shadow-lg`}>
            <img
              src={msg.content}
              alt="Shared photo"
              className="max-w-[240px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => window.open(msg.content, "_blank")}
            />
          </div>
        ) : (
          <div className={isMine ? "chat-bubble-sent" : "chat-bubble-received"}>
            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-white/25">
            {formatChatTime(msg.createdAt)}
          </span>
          {isMine && (
            msg.readBy?.length > 1
              ? <CheckCheck className="w-3 h-3 text-pink-400" />
              : <Check className="w-3 h-3 text-white/30" />
          )}
          {msg.sending && (
            <div className="w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3">
      <div className="chat-bubble-received flex items-center gap-1 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ chatId, otherUser }) {
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendMessage, startTyping, stopTyping, markRead } = useSocket();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quota, setQuota] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  // Load message history
  const { isLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const res = await api.get(`/api/chat/${chatId}/messages`);
      setMessages(res.data);
      return res.data;
    },
    enabled: !!chatId,
    staleTime: 0,
  });

  // Load quota
  useEffect(() => {
    api.get("/api/chat/quota/me").then((r) => setQuota(r.data)).catch(() => {});
  }, [chatId]);

  // Socket room
  useEffect(() => {
    if (!chatId) return;
    joinRoom(chatId);
    return () => leaveRoom(chatId);
  }, [chatId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        // Replace optimistic message if tempId matches
        if (msg.tempId) {
          const idx = prev.findIndex((m) => m.id === msg.tempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = msg;
            return updated;
          }
        }
        // Skip duplicate
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Mark as read if window is focused
      if (msg.senderId !== user.uid) {
        markRead(chatId, msg.id);
      }
    };

    const onTypingStart = ({ uid }) => {
      if (uid !== user.uid) setIsTyping(true);
    };
    const onTypingStop = ({ uid }) => {
      if (uid !== user.uid) setIsTyping(false);
    };
    const onRead = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, readBy: [...(m.readBy || []), "other"] } : m)
      );
    };
    const onQuotaExceeded = ({ message }) => {
      setQuotaExceeded(true);
      toast.error(message);
    };

    socket.on("message:new", onNewMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:read", onRead);
    socket.on("quota:exceeded", onQuotaExceeded);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:read", onRead);
      socket.off("quota:exceeded", onQuotaExceeded);
    };
  }, [socket, chatId, user.uid]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback((e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const tempId = uuidv4();
    const optimistic = {
      id: tempId,
      tempId,
      senderId: user.uid,
      content: input.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
      readBy: [user.uid],
      sending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    sendMessage(chatId, input.trim(), "text", tempId);
    setInput("");
    stopTyping(chatId);
  }, [input, chatId, user.uid]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    startTyping(chatId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => stopTyping(chatId), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only image files are allowed");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image must be less than 5MB");
    }

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const imgRef = ref(storage, `chat-images/${chatId}/${uuidv4()}-${file.name}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);

      const tempId = uuidv4();
      const optimistic = {
        id: tempId,
        tempId,
        senderId: user.uid,
        content: url,
        type: "image",
        createdAt: new Date().toISOString(),
        readBy: [user.uid],
        sending: true,
      };

      setMessages((prev) => [...prev, optimistic]);
      sendMessage(chatId, url, "image", tempId);

      // Refresh quota
      api.get("/api/chat/quota/me").then((r) => {
        setQuota(r.data);
        setQuotaExceeded(r.data.remaining === 0);
      });
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="text-5xl mb-3">💌</div>
            <p className="text-white/50 text-sm">Start the conversation!</p>
            <p className="text-white/25 text-xs mt-1">Say hello to {otherUser?.displayName || "them"}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={msg.senderId === user.uid}
              showAvatar={i === 0 || messages[i - 1]?.senderId !== msg.senderId}
              otherUser={otherUser}
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Image quota banner */}
      {quota && (
        <div className={`px-4 py-2 flex items-center gap-2 text-xs ${
          quotaExceeded ? "bg-red-500/10 text-red-400" : "bg-white/3 text-white/40"
        }`}>
          <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {quotaExceeded
              ? `Daily image limit reached (${quota.limit}/day). Upgrade to Pro for more!`
              : `${quota.remaining} photo${quota.remaining !== 1 ? "s" : ""} remaining today`}
          </span>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-white/5 flex items-end gap-3">
        {/* Image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => !quotaExceeded && fileInputRef.current?.click()}
          disabled={uploading || quotaExceeded}
          className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
            quotaExceeded
              ? "text-white/20 cursor-not-allowed"
              : "text-white/40 hover:text-pink-400 hover:bg-pink-500/10"
          }`}
          title={quotaExceeded ? "Daily image limit reached" : "Send image"}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          ) : (
            <Image className="w-5 h-5" />
          )}
        </button>

        {/* Text input */}
        <textarea
          rows={1}
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 input-dark resize-none py-2.5 min-h-[44px] max-h-32 leading-relaxed"
          style={{ height: "auto" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2.5 rounded-xl transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          style={input.trim() ? { background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" } : { background: "rgba(255,255,255,0.05)" }}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
