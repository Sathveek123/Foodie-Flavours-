import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Sparkles } from "lucide-react";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthGateModal({ isOpen, onClose }: AuthGateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#1a1410] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-cream text-center overflow-hidden z-10"
          >
            {/* Noise texture overlay */}
            <div className="noise-overlay" />

            {/* Glowing Accent */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none select-none z-0"
              style={{
                background: "radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(249,115,22,0) 70%)",
                filter: "blur(20px)",
              }}
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-cream/40 hover:text-white rounded-full transition hover:bg-white/5 cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="relative w-14 h-14 bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center rounded-2xl mx-auto mb-6">
              <Lock size={20} />
            </div>

            {/* Content */}
            <div className="space-y-3 relative z-10 mb-8">
              <span className="text-orange-500 font-mono font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-1">
                <Sparkles size={8} /> Member Gated Action
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-serif text-white tracking-tight">
                Unlock Gourmet Dining
              </h3>
              <p className="text-cream/65 text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                Create a free account or log in to place online orders, unlock loyalty points, and book dining tables.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 relative z-10">
              <Link
                to="/signup"
                onClick={onClose}
                className="block w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 transition text-sm font-sans"
              >
                Sign Up Now
              </Link>
              
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full py-3.5 bg-white/5 hover:bg-white/10 text-cream rounded-xl transition border border-white/10 text-sm font-sans"
              >
                Log In to Account
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
