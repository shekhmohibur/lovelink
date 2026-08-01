import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, RefreshCw, LogOut, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";
import { auth } from "../lib/firebase";

export default function VerifyEmail() {
  const { user, logOut, sendVerification } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await sendVerification();
      toast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to resend email.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        toast.success("Email verified! Welcome to LoveLink 🎉");
        navigate("/discover");
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    } catch (err) {
      toast.error("Failed to check status.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (err) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="glass-card p-8 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-pink-500/10 border border-pink-500/20">
            <Mail className="w-10 h-10 text-pink-400" />
          </div>

          <h1 className="text-2xl font-bold font-display text-white mb-2">Verify Your Email</h1>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            We've sent a verification link to <br />
            <span className="font-semibold text-white">{user?.email}</span>
            <br />
            Please check your inbox and spam folder.
          </p>

          <div className="space-y-4">
            <Button
              variant="brand"
              className="w-full"
              loading={refreshing}
              onClick={handleRefresh}
              size="lg"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              I've verified my email
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              loading={resending}
              onClick={handleResend}
            >
              <Send className="w-4 h-4 mr-2" />
              Resend Link
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Use a different account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
