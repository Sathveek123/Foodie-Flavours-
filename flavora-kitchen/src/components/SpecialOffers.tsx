import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { playTickSound } from "../lib/sounds";

function TypographicClock() {
  const [timeLeft, setTimeLeft] = useState(3600 * 2 + 45 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          playTickSound();
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-6 select-none font-serif text-5xl md:text-7xl font-extrabold text-white">
      <div className="flex flex-col">
        <span className="text-orange-500 font-black tracking-tight">{hours}</span>
        <span className="text-[10px] text-cream/40 uppercase tracking-widest font-mono font-bold mt-1">Hours</span>
      </div>
      <span className="text-cream/10 -translate-y-2">:</span>
      <div className="flex flex-col">
        <span className="text-white font-light tracking-tight">{minutes}</span>
        <span className="text-[10px] text-cream/40 uppercase tracking-widest font-mono font-bold mt-1">Mins</span>
      </div>
      <span className="text-cream/10 -translate-y-2">:</span>
      <div className="flex flex-col">
        <span className="text-orange-500 font-black tracking-tight">{seconds}</span>
        <span className="text-[10px] text-cream/40 uppercase tracking-widest font-mono font-bold mt-1">Secs</span>
      </div>
    </div>
  );
}

export function SpecialOffers() {
  const lenis = useLenis();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Parallax motion tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.9 };

  // Drift values (translate offsets in pixels)
  const driftX = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);
  const driftY = useSpring(useTransform(y, [-0.5, 0.5], [-8, 8]), springConfig);

  const driftXLeft = useSpring(useTransform(x, [-0.5, 0.5], [-18, 18]), springConfig);
  const driftYLeft = useSpring(useTransform(y, [-0.5, 0.5], [-18, 18]), springConfig);

  const driftXRight = useSpring(useTransform(x, [-0.5, 0.5], [14, -14]), springConfig);
  const driftYRight = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalized pointer coordinates (-0.5 to 0.5)
    const pointerX = (e.clientX - rect.left) / width - 0.5;
    const pointerY = (e.clientY - rect.top) / height - 0.5;

    x.set(pointerX);
    y.set(pointerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section id="offers-section" className="py-28 bg-dark-radial-right relative z-10 font-sans overflow-hidden border-y border-white/5">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom centered behind the combo image on the right */}
      <motion.div
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.12, 0.16, 0.12]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl overflow-hidden backdrop-blur-3xl gap-12"
        >
          {/* Limited Time Ribbon */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12 bg-gradient-to-r from-orange-500 to-red-500 px-5 py-1.5 rounded-full font-bold text-[10px] text-white tracking-[0.2em] shadow-lg shadow-red-500/10 uppercase select-none">
            Limited Weekend Deal
          </div>

          {/* Left Column */}
          <div className="relative z-30 w-full lg:w-1/2 space-y-8 pt-8 lg:pt-0">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-cream leading-[1.05] tracking-tight">
              Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 font-extrabold italic">20% OFF</span>
              <br />
              Premium Combos
            </h2>

            <p className="text-cream/60 text-base md:text-lg max-w-sm leading-relaxed">
              Dine like royalty this weekend. Grab our hand-crafted, three-course signature bundle and enjoy exclusive savings.
            </p>

            <TypographicClock />

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const el = document.getElementById("menu-section");
                  if (el) {
                    if (lenis) {
                      lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                    } else {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                data-cursor="Claim"
                className="px-8 py-4 bg-cream text-warm-ink font-bold rounded-full hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                Claim Offer Now
              </motion.button>
            </div>
          </div>

          {/* Right Column: Stacked product shots with parallax */}
          <motion.div
            className="w-full lg:w-1/2 flex items-center justify-center select-none"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[500px] h-[340px] md:h-[420px] flex items-center justify-center pointer-events-auto cursor-default overflow-visible"
            >
              {/* Warm glow behind the image stack */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 blur-3xl scale-110 pointer-events-none z-0" />

              {/* 1. Back-Left Image: burger1.png peeking out */}
              <motion.div
                style={{
                  x: driftXLeft,
                  y: driftYLeft,
                }}
                className="absolute left-[3%] bottom-[8%] w-[42%] aspect-square z-10 pointer-events-none"
              >
                <img
                  src="/images/burger1.png"
                  alt="Premium Gourmet Burger"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain rounded-2xl shadow-xl rotate-[-12deg]"
                  style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.5))" }}
                />
              </motion.div>

              {/* 2. Back-Right Image: pizza1.png peeking out */}
              <motion.div
                style={{
                  x: driftXRight,
                  y: driftYRight,
                }}
                className="absolute right-[3%] top-[8%] w-[48%] aspect-square z-10 pointer-events-none"
              >
                <img
                  src="/images/pizza1.png"
                  alt="Stone-baked Pepperoni Pizza"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain rounded-2xl shadow-xl rotate-[15deg]"
                  style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.5))" }}
                />
              </motion.div>

              {/* 3. Main Foreground Image: combo_deal.png */}
              <motion.div
                style={{
                  x: driftX,
                  y: driftY,
                }}
                className="relative w-[70%] z-20 pointer-events-none"
              >
                <img
                  src="/images/combo_deal.png"
                  alt="Premium Combo Deal — Burger, Pizza, Fries, Chicken, Spring Rolls"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                  style={{ filter: "drop-shadow(0 25px 50px rgba(249,115,22,0.3))" }}
                />

                {/* Combo badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl border border-orange-400/30">
                  🔥 20% OFF
                </div>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
