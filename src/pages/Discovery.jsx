import { motion } from "framer-motion";
import { Compass, Sliders } from "lucide-react";
import CardStack from "../components/discovery/CardStack";

export default function Discovery() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-pink-400" />
            Discover
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Swipe right to like, left to pass</p>
        </div>
        <button className="p-2.5 rounded-xl glass-card text-white/40 hover:text-white/70 transition-colors">
          <Sliders className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Card Stack */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <CardStack />
      </motion.div>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-white/20 mt-6"
      >
        💡 Drag cards left or right, or use the buttons below each card
      </motion.p>
    </div>
  );
}
