import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, Phone } from "lucide-react";
import { BUSINESS_CONFIG } from "../config";

export function StickyUtilities({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button after scrolling past the fold (past Hero section)
      if (window.scrollY > window.innerHeight * 0.8) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 1. Stacked Call & WhatsApp Cluster (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3.5 items-center">
        {/* Call concierge action */}
        <motion.a
          initial={{ opacity: 0, scale: 0.8, x: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          href={BUSINESS_CONFIG.isPhonePending ? "#" : BUSINESS_CONFIG.phoneCallUrl}
          onClick={(e) => {
            if (BUSINESS_CONFIG.isPhonePending) {
              e.preventDefault();
              triggerToast("Concierge phone line pending verification.");
            }
          }}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1a1410] border border-white/10 text-cream flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Call Concierge"
        >
          <Phone size={18} />
        </motion.a>

        {/* WhatsApp chat action */}
        <motion.a
          initial={{ opacity: 0, scale: 0.8, x: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          href={BUSINESS_CONFIG.isPhonePending ? "#" : BUSINESS_CONFIG.whatsappUrl}
          onClick={(e) => {
            if (BUSINESS_CONFIG.isPhonePending) {
              e.preventDefault();
              triggerToast("WhatsApp chat pending configuration.");
            }
          }}
          target={BUSINESS_CONFIG.isPhonePending ? undefined : "_blank"}
          rel="noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="WhatsApp Chat"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.475 1.332 5.006L2 22l5.161-1.354c1.472.803 3.125 1.228 4.839 1.228h.005c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.657 14.154c-.274.773-1.378 1.403-1.9 1.455-.472.046-.957.067-1.554-.127-.373-.122-.843-.284-1.423-.533-2.464-1.056-4.047-3.568-4.17-3.733-.122-.165-1.001-1.332-1.001-2.543 0-1.21.633-1.808.857-2.052.224-.244.49-.305.653-.305.163 0 .326.002.469.008.148.006.348-.056.544.417.204.49.695 1.696.756 1.819.061.122.102.264.02.427-.081.162-.122.264-.245.407-.122.143-.255.318-.367.427-.122.122-.25.255-.108.498.142.244.633 1.042 1.358 1.688.933.83 1.722 1.087 1.966 1.209.244.122.387.102.469.008.081-.094.347-.407.44-.546.093-.14.187-.118.326-.067.14.05 1.077.509 1.261.6.183.091.306.137.351.213.045.076.045.438-.13.882z" />
          </svg>
        </motion.a>
      </div>

      {/* 2. Scroll-to-Top Action (Bottom Right) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Scroll to Top"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
