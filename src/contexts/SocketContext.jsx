import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, getToken } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let socket;

    const connect = async () => {
      const token = await getToken();
      socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001", {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket error:", err.message);
      });

      // Global notifications
      socket.on("friend:request:received", (data) => {
        setNotifications((prev) => [
          { id: Date.now(), type: "friend_request", ...data },
          ...prev,
        ]);
      });

      socket.on("match:new", (data) => {
        setNotifications((prev) => [
          { id: Date.now(), type: "new_match", ...data },
          ...prev,
        ]);
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      socket?.disconnect();
    };
  }, [user]);

  const joinRoom = (chatId) => {
    socketRef.current?.emit("join:room", chatId);
  };

  const leaveRoom = (chatId) => {
    socketRef.current?.emit("leave:room", chatId);
  };

  const sendMessage = (chatId, content, type = "text", tempId) => {
    socketRef.current?.emit("message:send", { chatId, content, type, tempId });
  };

  const startTyping = (chatId) => {
    socketRef.current?.emit("typing:start", { chatId });
  };

  const stopTyping = (chatId) => {
    socketRef.current?.emit("typing:stop", { chatId });
  };

  const markRead = (chatId, messageId) => {
    socketRef.current?.emit("message:read", { chatId, messageId });
  };

  const emitFriendRequest = (targetUid, fromName) => {
    socketRef.current?.emit("friend:request", { targetUid, fromName });
  };

  const emitMatch = (targetUid, matchId) => {
    socketRef.current?.emit("match:new", { targetUid, matchId });
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    notifications,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    emitFriendRequest,
    emitMatch,
    clearNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
