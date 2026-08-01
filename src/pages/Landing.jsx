import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Users, Shield, Zap, Star } from "lucide-react";
import "animate.css";

const features = [
  {
    icon: Heart,
    title: "Smart Matching",
    desc: "Our algorithm connects you with people who share your interests and values.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    desc: "Instant messaging with typing indicators, read receipts, and photo sharing.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Make Friends",
    desc: "Not just dates — build genuine friendships with people around you.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Safe & Private",
    desc: "Your data is encrypted and your privacy is always our top priority.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Instant Matches",
    desc: "When you both like each other, a chat opens up instantly.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Star,
    title: "Pro at ৳199/mo",
    desc: "Unlock unlimited photos, see who liked you, and more premium features.",
    color: "from-fuchsia-500 to-pink-500",
  },
];

const floatingHearts = [
  { x: "10%", delay: 0, size: 20 },
  { x: "25%", delay: 0.5, size: 14 },
  { x: "60%", delay: 1, size: 18 },
  { x: "80%", delay: 0.3, size: 12 },
  { x: "45%", delay: 1.5, size: 16 },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-mesh" />
        {floatingHearts.map((h, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 text-pink-500/20"
            style={{ left: h.x, fontSize: h.size * 2 }}
            animate={{ y: [0, -800], opacity: [0, 0.6, 0] }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: h.delay,
              ease: "easeOut",
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ff3d7f, #8b5cf6)" }}>
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold gradient-text">LoveLink</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Sign In
          </Link>
          <Link to="/signup" className="btn-brand text-sm">
            Get Started
          </Link>
        </motion.div>
      </header>

      {/* Hero */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 glass-card"
          >
            <span className="animate__animated animate__heartBeat animate__infinite">❤️</span>
            <span className="text-white/70">The Dating App Made for Connection</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6">
            <span className="text-white">Find Your</span>
            <br />
            <span className="gradient-text">Perfect Match</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with people who truly get you. Chat, match, make friends — 
            all in one beautiful, safe space. Starting at just{" "}
            <span className="text-pink-400 font-semibold">৳199/month</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="btn-brand text-base px-8 py-3.5 animate__animated animate__pulse animate__infinite animate__slow">
              Start for Free →
            </Link>
            <Link to="/login" className="btn-brand-outline text-base px-8 py-3.5">
              I have an account
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-white/30"
          >
            <span>✓ Free to join</span>
            <span>•</span>
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ Cancel anytime</span>
          </motion.div>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative mt-16 w-full max-w-sm mx-auto"
        >
          {[
            { name: "Ariana", age: 24, rotate: -8, y: 20, zIndex: 0, color: "from-pink-600 to-rose-700" },
            { name: "Mehdi", age: 27, rotate: 4, y: 10, zIndex: 1, color: "from-purple-600 to-indigo-700" },
            { name: "Sofia", age: 22, rotate: 0, y: 0, zIndex: 2, color: "from-pink-500 to-purple-600" },
          ].map((card, i) => (
            <motion.div
              key={i}
              className={`absolute left-1/2 -translate-x-1/2 w-64 h-80 rounded-3xl bg-gradient-to-b ${card.color} flex flex-col justify-end p-5`}
              style={{
                rotate: card.rotate,
                zIndex: card.zIndex,
                y: card.y,
                boxShadow: i === 2 ? "0 25px 60px rgba(255,61,127,0.4)" : "0 10px 30px rgba(0,0,0,0.5)",
              }}
              animate={{ y: card.y + (i === 2 ? [-4, 4, -4] : 0) }}
              transition={{ duration: 3, repeat: i === 2 ? Infinity : 0, ease: "easeInOut" }}
            >
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{card.name}</span>
                  <span className="text-white/70 text-sm">{card.age}</span>
                </div>
                {i === 2 && (
                  <p className="text-white/60 text-xs">Loves hiking and coffee ☕</p>
                )}
              </div>
            </motion.div>
          ))}
          <div className="h-80" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display text-white mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto">
            Packed with features to make your experience fun, safe, and meaningful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-6 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <div className="text-5xl mb-4 animate__animated animate__heartBeat animate__infinite animate__slow">💝</div>
            <h2 className="text-3xl font-bold font-display text-white mb-4">
              Your story starts here
            </h2>
            <p className="text-white/50 mb-8">
              Join thousands of people finding meaningful connections every day.
            </p>
            <Link to="/signup" className="btn-brand text-base px-10 py-4 inline-block">
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/20 text-sm border-t border-white/5">
        <p>© 2026 LoveLink. All rights reserved. Made with ❤️</p>
      </footer>
    </div>
  );
}
