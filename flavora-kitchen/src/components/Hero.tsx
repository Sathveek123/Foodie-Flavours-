import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "motion/react";
import { useLenis } from "lenis/react";
import { ShoppingBag, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";

// Lazy-load the R3F Canvas for performance guards
const Hero3DScene = lazy(() => import("./Hero3DScene"));

const HERO_SLIDES = [
  {
    id: 1,
    title: "Flamin' Cheeseburger",
    subtitle: "Gourmet Selections",
    italicWord: "Fiery",
    titleRest: "Cheeseburger",
    description: "Gourmet double beef patty layered with melted cheddar cheese, fresh lettuce, and our smoky house sauce.",
    bgColor: "#2a1e16",
    radialColor: "from-orange-500/10 to-red-500/10",
  },
  {
    id: 2,
    title: "Pepperoni Feast Pizza",
    subtitle: "Artisanal Baking",
    italicWord: "Authentic",
    titleRest: "Pepperoni Pizza",
    description: "Rich pepperoni slices layered on seasoned tomato pomodoro sauce and bubbly mozzarella cheese.",
    bgColor: "#30141a",
    radialColor: "from-red-500/10 to-orange-500/10",
  },
  {
    id: 3,
    title: "Smoky BBQ Kebab",
    subtitle: "Charcoal Grilled",
    italicWord: "Smoky",
    titleRest: "BBQ Kebab Platter",
    description: "Tender, succulent chicken skewers flame-grilled and served with mint garlic sauce.",
    bgColor: "#2c1f14",
    radialColor: "from-amber-500/10 to-yellow-500/10",
  },
  {
    id: 4,
    title: "Crispy Golden Fries",
    subtitle: "Perfect Sides",
    italicWord: "Salted",
    titleRest: "Golden Fries",
    description: "Fresh, hot french fries crisped to perfection and served with our spicy dipping selection.",
    bgColor: "#301d16",
    radialColor: "from-red-500/10 to-amber-500/10",
  },
  {
    id: 5,
    title: "Creamy Alfredo Pasta",
    subtitle: "Italian Kitchen",
    italicWord: "Creamy",
    titleRest: "Alfredo Pasta",
    description: "Rich and velvety fettuccine tossed in a butter garlic cream sauce and aged Parmesan.",
    bgColor: "#242216",
    radialColor: "from-yellow-500/10 to-orange-500/10",
  },
  {
    id: 6,
    title: "Crunchy Spring Rolls",
    subtitle: "Asian Starters",
    italicWord: "Crunchy",
    titleRest: "Spring Rolls",
    description: "Golden, thin-wrapper spring rolls packed with seasoned vegetables and sweet chili glaze.",
    bgColor: "#261c16",
    radialColor: "from-amber-500/10 to-orange-500/10",
  },
  {
    id: 7,
    title: "Spicy Fried Chicken",
    subtitle: "Deep Fried Delights",
    italicWord: "Crispy",
    titleRest: "Fried Chicken",
    description: "Golden, deep-fried chicken pieces coated in a crunchy spiced batter seasoning.",
    bgColor: "#2b1e16",
    radialColor: "from-yellow-500/10 to-orange-500/10",
  },
  {
    id: 8,
    title: "Classic Chicken Roll",
    subtitle: "Quick Bites",
    italicWord: "Tender",
    titleRest: "Chicken Roll Wrap",
    description: "Griddle-toasted flatbread wrapping juicy spiced chicken cubes and crisp red onions.",
    bgColor: "#2a1722",
    radialColor: "from-pink-500/10 to-rose-500/10",
  },
  {
    id: 9,
    title: "Veggie Garden Pizza",
    subtitle: "Artisanal Baking",
    italicWord: "Healthy",
    titleRest: "Garden Pizza",
    description: "Stone-baked gourmet thin crust topped with dynamic garden vegetables and light pesto drizzle.",
    bgColor: "#222116",
    radialColor: "from-amber-500/10 to-yellow-500/10",
  },
  {
    id: 10,
    title: "Gourmet Monster Burger",
    subtitle: "Michelin Grade Dining",
    italicWord: "Monster",
    titleRest: "Gourmet Burger",
    description: "Giant flame-broiled beef patty stacked high with crispy bacon, cheddar, onion rings, and smoky glaze.",
    bgColor: "#301d16",
    radialColor: "from-red-500/10 to-amber-500/10",
  },
];

// Letter-by-letter blur-to-sharp resolve — same pattern as Splash FLAVORA reveal
function LetterReveal({ text, className = "" }: { text: string; className?: string }) {
  const letters = text.split("");
  return (
    <span className={className} aria-label={text}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: i * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero({ onOrderClick, onReserveClick }: { onOrderClick?: () => void; onReserveClick?: () => void } = {}) {
  const lenis = useLenis();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  // Flash bloom pulse on slide change
  const [bloomPulse, setBloomPulse] = useState(false);
  const prevIndexRef = useRef(activeIndex);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();

    // Debounced resize — fires at most once per 200ms
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 200);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // rAF-throttled scroll — never fires more than once per frame
    let rafId: number;
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (Math.abs(sy - lastScrollY) < 1) return; // skip sub-pixel moves
        lastScrollY = sy;
        const height = window.innerHeight;
        setScrollProgress(Math.min(1, Math.max(0, sy / height)));
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auto-advance every 5s — dependency is [] not [activeIndex] to avoid recreation on every slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Trigger bloom pulse on slide change
  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      prevIndexRef.current = activeIndex;
      setBloomPulse(true);
      const t = setTimeout(() => setBloomPulse(false), 350);
      return () => clearTimeout(t);
    }
  }, [activeIndex]);

  const currentSlide = HERO_SLIDES[activeIndex];

  const goNext = () => setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Scroll-cue opacity — fades out after 100px of scroll
  const scrollCueOpacity = Math.max(0, 1 - scrollProgress * 8);

  return (
    <section
      style={{
        background: `radial-gradient(circle at 75% 50%, ${currentSlide.bgColor} 0%, #0d0a08 100%)`,
        transition: "background 700ms ease-in-out",
      }}
      className="relative w-full min-h-screen flex items-center pt-24 pb-16 overflow-hidden select-none"
    >
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Volumetric Glow — with bloom pulse on slide change */}
      <motion.div
        animate={bloomPulse
          ? { scale: 1.18, opacity: 0.28 }
          : { scale: [0.96, 1.04, 0.96], opacity: [0.12, 0.16, 0.12] }
        }
        transition={bloomPulse
          ? { duration: 0.25, ease: "easeOut" }
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute top-1/2 left-[60%] lg:left-[65%] -translate-x-1/2 -translate-y-1/2 w-[450px] md:w-[700px] h-[450px] md:h-[700px] rounded-full blur-[110px] md:blur-[140px] pointer-events-none z-0 transition-all duration-700"
        style={{ background: "radial-gradient(circle, #f97316 0%, rgba(249,115,22,0) 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left: Text Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left order-2 lg:order-1 pt-6 lg:pt-0 min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Section tag */}
              <div className="flex items-center gap-3 mb-6">
                <span className="h-[1px] w-8 bg-orange-500" />
                <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs font-sans">
                  {currentSlide.subtitle}
                </span>
              </div>

              {/* H1 — italic accent stays simple fade, main dish name gets letter-by-letter reveal */}
              <h1 className="text-5xl md:text-7xl lg:text-[5.8rem] leading-[1.05] tracking-tight font-serif text-cream">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="font-extrabold italic text-orange-500 block"
                >
                  {currentSlide.italicWord}
                </motion.span>
                <span className="font-extrabold block text-white mt-1">
                  <LetterReveal text={currentSlide.titleRest} />
                </span>
              </h1>

              <p className="mt-8 text-cream/70 text-base md:text-lg font-normal font-sans max-w-md leading-relaxed">
                {currentSlide.description}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                {/* Order Now — idle box-shadow pulse */}
                <motion.button
                  onClick={onOrderClick}
                  data-cursor="Order"
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px rgba(249,115,22,0)",
                      "0 0 22px 6px rgba(249,115,22,0.35)",
                      "0 0 10px 2px rgba(249,115,22,0.15)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 0 30px 10px rgba(249,115,22,0.5)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-8 py-4 bg-white text-[#1a1410] rounded-full font-bold shadow-lg hover:bg-cream transition-colors duration-300 cursor-pointer font-sans text-sm"
                >
                  <ShoppingBag size={18} />
                  Order Now
                </motion.button>

                <button
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
                  data-cursor="Details"
                  className="flex items-center gap-2.5 px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold shadow-md hover:bg-white/10 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer font-sans text-sm"
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>

              {/* Review Badge — delayed entrance + rating scale-pop */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 flex items-center gap-4 border-t border-white/5 pt-8 max-w-sm"
              >
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-warm-ink bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">S</div>
                  <div className="w-10 h-10 rounded-full border-2 border-warm-ink bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="w-10 h-10 rounded-full border-2 border-warm-ink bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-orange-500 text-orange-500" />
                    ))}
                    <motion.span
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ duration: 0.5, delay: 0.75, ease: "easeInOut" }}
                      className="text-white text-xs font-bold font-sans ml-1 inline-block"
                    >
                      4.9 / 5.0
                    </motion.span>
                  </div>
                  <div className="text-xs text-cream/50 mt-0.5 font-sans font-normal">Beloved by 12,000+ local gastronomes</div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots + Arrow Buttons Row */}
          <div className="mt-8 flex items-center gap-4 relative z-30">
            <button
              onClick={goPrev}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-cream/60 hover:border-orange-500 hover:text-orange-500 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx ? "bg-orange-500 w-6" : "bg-white/30 hover:bg-white/50 w-2"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              aria-label="Next slide"
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-cream/60 hover:border-orange-500 hover:text-orange-500 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: 3D R3F Canvas — plate breathing wrapper */}
        <div className="lg:col-span-5 h-[320px] md:h-[480px] lg:h-[600px] w-full relative order-1 lg:order-2 overflow-visible select-none pointer-events-none">
          {/* Breathing scale wrapper — layered on top of R3F transition logic */}
          <motion.div
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[100%] lg:w-[110%] h-[100%] top-0 lg:-left-[5%] left-0 z-10 select-none"
          >
            <Suspense fallback={null}>
              <Hero3DScene activeIndex={activeIndex} />
            </Suspense>
          </motion.div>
        </div>
      </div>

      {/* Branded Scroll Cue — fades with scroll */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2.5 z-20 pointer-events-none select-none transition-opacity duration-300"
        style={{ opacity: scrollCueOpacity }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-cream/40 font-mono">Scroll Down</span>
        <div className="w-[1px] h-12 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-orange-500"
          />
        </div>
      </div>
    </section>
  );
}
