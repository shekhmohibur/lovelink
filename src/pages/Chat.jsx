import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ArrowLeft, Search } from "lucide-react";
import api from "../lib/api";
import ChatWindow from "../components/chat/ChatWindow";
import Avatar from "../components/ui/Avatar";
import { formatTime, truncate } from "../lib/utils";

function ChatListItem({ chat, isActive, onClick }) {
  const { participant, lastMessage, lastMessageAt } = chat;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-xl text-left ${
        isActive
          ? "bg-gradient-to-r from-pink-500/15 to-purple-500/10 border border-pink-500/20"
          : "hover:bg-white/5"
      }`}
    >
      <Avatar
        src={participant?.photoURL}
        name={participant?.displayName}
        uid={participant?.uid}
        size="md"
        showOnline
        isOnline={participant?.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {participant?.displayName || "User"}
          </span>
          {lastMessageAt && (
            <span className="text-[10px] text-white/30 flex-shrink-0">
              {formatTime(lastMessageAt)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-white/40 truncate mt-0.5">
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => api.get("/api/chat").then((r) => r.data),
    refetchInterval: 30000,
  });

  const activeChat = chats.find((c) => c.chatId === chatId);

  const filtered = chats.filter(
    (c) =>
      !search ||
      c.participant?.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-48px)] gap-0 rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Sidebar — chat list */}
      <div className={`${chatId ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 flex-shrink-0 border-r border-white/5`}
        style={{ background: "rgba(10,10,15,0.8)" }}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-pink-400" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-dark pl-9 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center p-2">
                  <div className="w-11 h-11 rounded-full skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded skeleton w-3/4" />
                    <div className="h-2.5 rounded skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-white/40 text-sm">No conversations yet</p>
              <p className="text-white/25 text-xs mt-1">Match with someone to start chatting</p>
            </div>
          ) : (
            filtered.map((chat) => (
              <ChatListItem
                key={chat.chatId}
                chat={chat}
                isActive={chat.chatId === chatId}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`${chatId ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}
        style={{ background: "rgba(8,8,12,0.9)" }}>

        {chatId && activeChat ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="md:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar
                src={activeChat.participant?.photoURL}
                name={activeChat.participant?.displayName}
                uid={activeChat.participant?.uid}
                size="sm"
                showOnline
                isOnline={activeChat.participant?.isOnline}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{activeChat.participant?.displayName}</p>
                <p className="text-[11px] text-white/40">
                  {activeChat.participant?.isOnline ? "Online now" : "Last seen recently"}
                </p>
              </div>
            </div>

            {/* Chat messages */}
            <ChatWindow chatId={chatId} otherUser={activeChat.participant} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-6xl mb-4"
            >
              💌
            </motion.div>
            <h3 className="text-lg font-semibold text-white/60">Select a conversation</h3>
            <p className="text-white/25 text-sm mt-1">Choose someone to chat with</p>
          </div>
        )}
      </div>
    </div>
  );
}
