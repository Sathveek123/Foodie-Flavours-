import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Truck, Percent, Phone, Clock } from "lucide-react";
import { BUSINESS_CONFIG } from "../config";

const MESSAGES = [
  { text: "Free Delivery Above ₹499", icon: Truck },
  { text: "Weekend Special: 20% Off Combos", icon: Percent },
  { text: `Call Us: ${BUSINESS_CONFIG.phoneDisplay}`, icon: Phone },
  { text: "Open Daily: 11 AM - 11 PM", icon: Clock },
];

export function AnnouncementBar({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = MESSAGES[index].icon;

  return (
    <div className="relative w-full h-9 md:h-10 bg-warm-ink text-cream border-b border-white/5 flex items-center justify-center px-12 z-50 overflow-hidden font-sans">
      <div className="noise-overlay" />
      <div className="relative w-full h-full flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-[9px] md:text-[11px] font-mono font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 select-none"
          >
            <CurrentIcon size={12} className="text-orange-500 shrink-0" />
            <span>{MESSAGES[index].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/5"
        title="Dismiss announcement"
      >
        <X size={12} />
      </button>
    </div>
  );
}
