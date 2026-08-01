import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}>
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl animate-ping"
            style={{ background: "linear-gradient(135deg, #ff3d7f30, #8b5cf630)" }} />
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold gradient-text">LoveLink</h1>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-pink-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
