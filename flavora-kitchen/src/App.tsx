import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Categories } from "./components/Categories";
import { PopularDishes } from "./components/PopularDishes";
import { SpecialOffers } from "./components/SpecialOffers";
import { ChefsSpecial } from "./components/ChefsSpecial";
import { Reviews } from "./components/Reviews";
import { Footer } from "./components/Footer";

// Layout & Section Components
import { OnlineOrdering } from "./components/OnlineOrdering";
import { MeetChefs } from "./components/MeetChefs";
import { FoodGallery } from "./components/FoodGallery";
import { StatsStrip } from "./components/StatsStrip";
import { FAQ } from "./components/FAQ";
import { ContactLocation } from "./components/ContactLocation";
import { StickyUtilities } from "./components/StickyUtilities";

// New visual sections expansion
import { AnnouncementBar } from "./components/AnnouncementBar";
import { SocialProofBar } from "./components/SocialProofBar";
import { MenuPreviewTabs } from "./components/MenuPreviewTabs";
import { LoyaltyTeaser } from "./components/LoyaltyTeaser";
import { Events } from "./components/Events";
import { InstagramFeed } from "./components/InstagramFeed";
import { NewsletterSection } from "./components/NewsletterSection";

// Auth Components & Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthGateModal } from "./components/AuthGateModal";

import { useAuth } from "./context/AuthContext";
import { SmoothScroll } from "./components/SmoothScroll";

// ── Steam wisp keyframes injected once into the document head ──────────────
const STEAM_STYLE = `
@keyframes steamRise0 {
  0%   { transform: translateY(0px)   translateX(0px)   scaleX(1);   opacity: 0; }
  10%  { opacity: 0.11; }
  60%  { opacity: 0.08; }
  100% { transform: translateY(-90px) translateX(6px)   scaleX(0.7); opacity: 0; }
}
@keyframes steamRise1 {
  0%   { transform: translateY(0px)   translateX(0px)   scaleX(1);   opacity: 0; }
  12%  { opacity: 0.09; }
  55%  { opacity: 0.07; }
  100% { transform: translateY(-80px) translateX(-8px)  scaleX(0.6); opacity: 0; }
}
@keyframes steamRise2 {
  0%   { transform: translateY(0px)   translateX(0px)   scaleX(1);   opacity: 0; }
  8%   { opacity: 0.13; }
  65%  { opacity: 0.06; }
  100% { transform: translateY(-100px) translateX(4px)  scaleX(0.8); opacity: 0; }
}
`;
if (typeof document !== "undefined" && !document.getElementById("steam-keyframes")) {
  const s = document.createElement("style");
  s.id = "steam-keyframes";
  s.textContent = STEAM_STYLE;
  document.head.appendChild(s);
}

function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isAnticipating, setIsAnticipating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const duration = 3000;
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + step;
      });
    }, intervalTime);

    const flareTimer = setTimeout(() => setIsAnticipating(true), 2700);

    return () => { clearInterval(timer); clearTimeout(flareTimer); };
  }, []);

  const titleLetters = "FLAVORA".split("");

  if (reducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[100] bg-[#0d0a08] flex flex-col items-center justify-center font-sans"
      >
        <div className="text-center">
          <h2 className="text-5xl font-serif font-black text-cream uppercase mb-4">Flavora</h2>
          <p className="text-cream/50 text-xs tracking-widest font-mono">LOADING...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] } }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] bg-dark-radial-center flex flex-col items-center justify-center font-sans overflow-hidden"
    >
      <div className="noise-overlay" />

      <motion.div
        animate={isAnticipating
          ? { opacity: 0.22, scale: 1.15 }
          : { opacity: [0.12, 0.16, 0.12], scale: [0.95, 1.05, 0.95] }
        }
        transition={isAnticipating
          ? { duration: 0.3, ease: "easeOut" }
          : { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none select-none z-0"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.7) 0%, rgba(249,115,22,0) 70%)" }}
      />

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: ["105vh", "-5vh"], x: ["0px", `${i % 2 === 0 ? 25 : -25}px`, "0px"] }}
          transition={{ duration: 14 + i * 3, repeat: Infinity, ease: "linear" }}
          style={{ left: `${25 + i * 25}%`, opacity: 0.12 + i * 0.04 }}
          className="absolute w-1 h-1 bg-orange-400 rounded-full blur-[0.5px] pointer-events-none z-10"
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: -60, rotate: -18 }}
        animate={isAnticipating ? {
          opacity: 0.25, y: 0, rotate: -8, scale: 1.03,
          transition: { duration: 0.3, ease: "easeOut" }
        } : {
          opacity: 0.25, y: 0, rotate: -8, scale: 1,
          transition: {
            opacity: { duration: 0.7, delay: 0.15 },
            type: "spring", stiffness: 80, damping: 12, delay: 0.15
          }
        }}
        style={{ filter: "drop-shadow(-8px 12px 20px rgba(0,0,0,0.65))" }}
        className="absolute top-[8%] left-[5%] w-[200px] h-[280px] md:w-[260px] md:h-[360px] bg-white/[0.02] border border-white/10 rounded-2xl p-2.5 z-10 pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, -4, 4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full flex flex-col justify-between"
        >
          <img src="/images/truffle_dish.png" className="w-full h-[85%] object-cover rounded-xl" alt="Truffle Symphony" />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="text-[9px] font-bold tracking-widest text-cream uppercase font-mono mt-2"
          >
            Composition I: Truffle Symphony
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60, rotate: 22 }}
        animate={isAnticipating ? {
          opacity: 0.22, y: 0, rotate: 8, scale: 1.03,
          transition: { duration: 0.3, ease: "easeOut" }
        } : {
          opacity: 0.22, y: 0, rotate: 8, scale: 1,
          transition: {
            opacity: { duration: 0.7, delay: 0.22 },
            type: "spring", stiffness: 80, damping: 12, delay: 0.22
          }
        }}
        style={{ filter: "drop-shadow(8px 12px 20px rgba(0,0,0,0.65))" }}
        className="absolute bottom-[8%] right-[5%] w-[220px] h-[300px] md:w-[280px] md:h-[380px] bg-white/[0.02] border border-white/10 rounded-2xl p-2.5 z-10 pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, 4, -4, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full flex flex-col justify-between"
        >
          <img src="/images/combo_deal.png" className="w-full h-[85%] object-cover rounded-xl" alt="Grand Feast" />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            className="text-[9px] font-bold tracking-widest text-cream uppercase font-mono mt-2"
          >
            Composition II: Grand Feast Spread
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center relative z-20 select-none px-6 text-center max-w-4xl">
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.6em" }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-xs font-bold text-orange-500 uppercase mb-4"
        >
          Welcome To
        </motion.span>

        <div className="relative" style={{ zIndex: 9 }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "calc(100% - 10px)",
              left: "20%",
              width: 18,
              height: 60,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,248,235,0.6) 0%, transparent 70%)",
              filter: "blur(6px)",
              animation: "steamRise0 4.2s ease-in-out infinite",
              animationDelay: "0s",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "calc(100% - 10px)",
              left: "50%",
              width: 14,
              height: 50,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,248,235,0.5) 0%, transparent 70%)",
              filter: "blur(5px)",
              animation: "steamRise1 5.5s ease-in-out infinite",
              animationDelay: "1.4s",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "calc(100% - 10px)",
              left: "75%",
              width: 16,
              height: 55,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,248,235,0.55) 0%, transparent 70%)",
              filter: "blur(7px)",
              animation: "steamRise2 4.8s ease-in-out infinite",
              animationDelay: "0.7s",
            }}
          />

          <motion.h2
            animate={{ scale: [1, 1, 1.015, 1] }}
            transition={{ duration: 1.0, delay: 1.0, times: [0, 0.2, 0.5, 1], ease: "easeInOut" }}
            className="text-7xl sm:text-8xl md:text-9xl lg:text-[7.5rem] font-serif font-black text-cream tracking-tighter leading-none mb-1 uppercase flex select-none relative"
            style={{ zIndex: 10 }}
          >
            {titleLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.6 + index * 0.04,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.55, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent 0%, #d4af37 35%, #d4af37 65%, transparent 100%)",
              marginTop: 4,
              zIndex: 11,
            }}
          />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
          className="text-xs sm:text-sm font-sans font-bold text-white/50 tracking-[0.5em] uppercase mt-3 mb-5"
        >
          Kitchen & Gastronomy
        </motion.h3>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 0.9,
            boxShadow: [
              "0 0 0 0px rgba(212,175,55,0)",
              "0 0 10px 6px rgba(212,175,55,0.5)",
              "0 0 5px 3px rgba(212,175,55,0.25)",
            ],
          }}
          transition={{
            delay: 1.1,
            scale: { duration: 0.4, ease: "easeOut" },
            opacity: { duration: 0.4 },
            boxShadow: { duration: 0.7, delay: 1.1, times: [0, 0.4, 1] },
          }}
          className="w-1.5 h-1.5 rounded-full mb-5"
          style={{ background: "#d4af37" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 0.7, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          className="max-w-md text-cream font-serif italic text-base sm:text-lg leading-relaxed mb-10"
        >
          "A sanctuary of culinary artistry, composed with chef-grade precision."
          </motion.p>

        <div className="w-56 h-[1.5px] bg-white/10 rounded-full overflow-hidden relative mb-4">
          <motion.div
            style={{ width: `${progress}%` }}
            animate={{ backgroundPosition: ["0% center", "-200% center"] }}
            transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
            className="h-full bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 absolute top-0 left-0 bg-[size:200%_auto]"
          />
        </div>

        <LoadingPercentage progress={progress} />
      </div>
    </motion.div>
  );
}

function LoadingPercentage({ progress }: { progress: number }) {
  const rounded = Math.min(100, Math.round(progress));
  return (
    <span className="text-[10px] tracking-[0.2em] text-cream/30 font-mono uppercase">
      Loading{" "}
      <motion.span
        key={rounded}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-block font-bold text-cream"
      >
        {rounded}%
      </motion.span>
    </span>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCartGate = () => {
    if (user) {
      navigate("/app");
    } else {
      setAuthGateOpen(true);
    }
  };

  const handleReservationGate = () => {
    if (user) {
      navigate("/app");
    } else {
      setAuthGateOpen(true);
    }
  };

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("forceLoader") === "true") return true;
      return sessionStorage.getItem("flavoraLoaderPlayed") !== "true";
    }
    return true;
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Item added to your cart");
  const [announcementActive, setAnnouncementActive] = useState(() => {
    return sessionStorage.getItem("announcementDismissed") !== "true";
  });
  const [authGateOpen, setAuthGateOpen] = useState(false);

  const handleDismissAnnouncement = () => {
    setAnnouncementActive(false);
    sessionStorage.setItem("announcementDismissed", "true");
  };

  // Hash-based scrolling is handled by Lenis inside SmoothScroll.tsx

  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem("flavoraLoaderPlayed", "true");
      } catch (e) {
        console.warn("sessionStorage is not available:", e);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  return (
    <Routes>
      {/* Auth Gateways */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin2006" element={<AdminPage />} />

      {/* Protected Routes Dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>

      {/* Public Marketing Showcase */}
      <Route
        path="/"
        element={
          <SmoothScroll>
            <div className="w-full min-h-screen relative bg-cream selection:bg-orange-500 selection:text-white">
              <AnimatePresence>
                {loading && <Loader onComplete={() => {}} />}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col w-full min-h-screen"
              >
                {announcementActive && (
                  <AnnouncementBar onClose={handleDismissAnnouncement} />
                )}
                
                {/* Navbar links open AuthGateModal for transactional elements */}
                <Navbar 
                  onOpenCart={handleCartGate} 
                  onOpenReservation={handleReservationGate} 
                  announcementActive={announcementActive}
                />
                
                <main className="flex flex-col w-full text-gray-900 select-none">
                  {/* Hero triggers AuthGateModal on order and booking CTAs */}
                  <Hero 
                    onOrderClick={handleCartGate} 
                    onReserveClick={handleReservationGate} 
                  />
                  
                  <SocialProofBar />
                  <Categories />
                  
                  {/* PopularDishes and MenuPreviewTabs check authentication before cart additions */}
                  <PopularDishes onTriggerAuthGate={handleCartGate} />
                  <MenuPreviewTabs onTriggerAuthGate={handleCartGate} />
                  
                  <OnlineOrdering />
                  <SpecialOffers />
                  
                  {/* ChefsSpecial triggers AuthGateModal on reservation bookings */}
                  <ChefsSpecial onReserve={handleReservationGate} />
                  
                  <MeetChefs />
                  <FoodGallery />
                  <InstagramFeed />
                  <StatsStrip />
                  
                  {/* LoyaltyTeaser and Events trigger AuthGateModal or Toast alerts */}
                  <LoyaltyTeaser triggerToast={triggerToast} onTriggerAuthGate={handleCartGate} />
                  <Events triggerToast={triggerToast} onTriggerAuthGate={handleReservationGate} />
                  
                  <Reviews />
                  <FAQ />
                  <NewsletterSection />
                  <ContactLocation triggerToast={triggerToast} />
                  <Footer triggerToast={triggerToast} />
                </main>

                <StickyUtilities triggerToast={triggerToast} />

                {/* Fly-in Toast */}
                <AnimatePresence>
                  {toastVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[160] bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg font-sans"
                      style={{ perspective: "500px" }}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-200">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span className="font-medium text-sm">{toastMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auth Gate Modal overlay dialog */}
                <AuthGateModal isOpen={authGateOpen} onClose={() => setAuthGateOpen(false)} />
              </motion.div>
            </div>
          </SmoothScroll>
        }
      />
    </Routes>
  );
}
