import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
    }, 1500);
  };

  return (
    <section className="py-24 bg-[#0d0a08] relative z-10 font-sans select-none overflow-hidden border-b border-white/5 text-cream text-center">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom centered */}
      <motion.div
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.12, 0.16, 0.12]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-xl"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-orange-500" />
            <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">
              Concierge Newsletter
            </span>
            <span className="h-[1px] w-8 bg-orange-500" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
            Stay <span className="font-extrabold italic text-orange-500">Delicious</span>
          </h2>
          <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed">
            Seasonal menu releases, private concierge tasting alerts, and secret chef recipes sent directly to your inbox.
          </p>
        </motion.div>

        {/* Input Form with AnimatePresence transition */}
        <div className="w-full max-w-md mt-10 min-h-[100px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="subscription-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubscribe}
                className="w-full space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cream/35">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email details..."
                      className="w-full bg-white/5 text-white rounded-full pl-12 pr-6 py-4 outline-none border border-white/10 focus:border-orange-500 transition-all text-sm placeholder-cream/20"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-full transition shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
                
                <span className="block text-[10px] text-cream/40 uppercase font-mono tracking-widest leading-none">
                  No spam. Unsubscribe concierge notifications anytime.
                </span>
              </motion.form>
            ) : (
              <motion.div
                key="success-banner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-6 py-4 rounded-full shadow-xl"
              >
                <div className="w-7 h-7 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/15 shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Subscribed! Welcome to the table.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
