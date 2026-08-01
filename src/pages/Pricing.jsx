import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, Check, Zap, ImageIcon, Shield, Crown } from "lucide-react";
import api from "../lib/api";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

export default function Pricing() {
  const [upgrading, setUpgrading] = useState(false);

  const { data: geoData } = useQuery({
    queryKey: ["geo"],
    queryFn: () => api.get("/api/geo").then((r) => r.data).catch(() => ({ currency: "USD", symbol: "$" })),
    staleTime: 1000 * 60 * 30,
  });

  const { data: plansData } = useQuery({
    queryKey: ["plans", geoData?.currency],
    queryFn: () => api.get(`/api/subscriptions/plans?currency=${geoData?.currency || "USD"}`).then((r) => r.data),
    enabled: !!geoData,
    staleTime: 1000 * 60 * 10,
  });

  const { data: statusData } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: () => api.get("/api/subscriptions/status").then((r) => r.data),
  });

  const upgradeMutation = useMutation({
    mutationFn: () => api.post("/api/subscriptions/upgrade", { plan: "pro" }),
    onSuccess: () => {
      toast.success("Welcome to Pro! 🎉 Enjoy unlimited features!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Upgrade failed");
    },
  });

  const plans = plansData?.plans || [];
  const currency = geoData?.currency;
  const isBangladesh = currency === "BDT";
  const isPro = statusData?.subscription === "pro";

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeMutation.mutateAsync();
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-white/60 mb-4">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Simple, affordable pricing</span>
        </div>
        <h1 className="text-4xl font-bold font-display text-white mb-3">
          Level Up Your <span className="gradient-text">Love Life</span>
        </h1>
        <p className="text-white/40 text-base">
          {isBangladesh
            ? "Prices shown in Bangladeshi Taka (BDT)"
            : "Prices shown in US Dollars (USD)"}
        </p>
        {isPro && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            You're already a Pro member! 🎉
          </div>
        )}
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, i) => {
          const isPlanPro = plan.id === "pro";
          const isCurrent = statusData?.subscription === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={!isCurrent ? { y: -6 } : {}}
              className={`glass-card p-7 relative overflow-hidden flex flex-col ${
                isPlanPro ? "border-pink-500/30" : ""
              }`}
            >
              {isPlanPro && (
                <div className="absolute top-0 right-0 left-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #ff3d7f, #8b5cf6)" }} />
              )}

              {isPlanPro && (
                <div className="absolute top-4 right-4">
                  <span className="pro-badge text-xs">⭐ POPULAR</span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                isPlanPro
                  ? "bg-gradient-to-br from-pink-500 to-purple-600"
                  : "bg-white/5 border border-white/10"
              }`}>
                {isPlanPro ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Star className="w-6 h-6 text-white/40" />
                )}
              </div>

              {/* Name + Price */}
              <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
              <div className="flex items-end gap-1.5 mb-6">
                <span className="text-4xl font-extrabold font-display gradient-text">
                  {plan.symbol}{plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-white/40 text-sm pb-1">/month</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPlanPro ? "bg-pink-500/20" : "bg-white/5"
                    }`}>
                      <Check className={`w-3 h-3 ${isPlanPro ? "text-pink-400" : "text-white/40"}`} />
                    </div>
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isPlanPro ? (
                isCurrent ? (
                  <div className="py-3 rounded-xl text-center text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    ✓ Current Plan
                  </div>
                ) : (
                  <Button
                    variant="brand"
                    className="w-full"
                    loading={upgrading}
                    onClick={handleUpgrade}
                    size="lg"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                )
              ) : (
                <div className="py-3 rounded-xl text-center text-sm text-white/40">
                  {statusData?.subscription === "free" ? "✓ Your current plan" : "Free"}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center justify-center gap-6 text-xs text-white/25 flex-wrap"
      >
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure payment</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Cancel anytime</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> No hidden fees</span>
      </motion.div>

      {/* Note about payment */}
      <div className="mt-6 glass-card p-4 text-center">
        <p className="text-xs text-white/30">
          💡 Payment gateway integration (Stripe for USD, SSLCommerz/bKash for BDT) is ready to connect.
          Contact support to enable payments for your deployment.
        </p>
      </div>
    </div>
  );
}
