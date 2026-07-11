import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, User, ArrowLeft, AlertCircle, KeyRound, Check, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { signup, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer for rate limiting resends
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Step 1: Initiate signup email OTP request
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || cooldown > 0) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await signup(email.trim(), name.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      if (referralCode.trim()) {
        localStorage.setItem("flavora_applied_referral", referralCode.trim().toUpperCase());
      }
      setOtpSent(true);
      setCooldown(30);
    }
  };

  // Step 2: Confirm OTP code and complete signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otpToken.trim()) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await verifyOtp(email.trim(), otpToken.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Invalid or expired verification code.");
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a08] flex flex-col justify-center items-center px-6 relative overflow-hidden font-sans select-none text-cream">
      {/* Full-cover ambient background image with vignette blur overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 filter blur-[2.5px]" 
        style={{ backgroundImage: "url('/images/combo_deal.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/85 via-[#0d0a08]/90 to-[#0d0a08] z-0 pointer-events-none" />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-80"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream/50 hover:text-white transition z-10"
      >
        <ArrowLeft size={14} /> Back to Showcase
      </Link>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-bold font-serif tracking-tight text-white">
            Create Account
          </h2>
          <p className="text-cream/50 text-xs tracking-wider uppercase font-mono">
            {otpSent ? "Verify Security Code" : "Sign Up for Flavora Club"}
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 text-left"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!otpSent ? (
            /* STEP 1: Signup Inputs Form */
            <motion.form
              key="signup-inputs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignupSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                  />
                </div>

                {/* Optional Referral Code */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                    <Gift size={16} />
                  </span>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Referral Code (Optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25 font-mono uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={15} /> Request Verification Code
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            /* STEP 2: Verify Code Form */
            <motion.form
              key="signup-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <p className="text-xs text-cream/65 text-center leading-relaxed">
                Verification code dispatched to <span className="text-orange-400 font-bold">{email}</span>.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="Enter 6-digit Code"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25 tracking-widest text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={15} /> Confirm &amp; Register
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSignupSubmit}
                  disabled={cooldown > 0 || loading}
                  className={`w-full py-3 bg-white/5 border border-white/5 text-xs text-cream hover:bg-white/10 rounded-xl transition cursor-pointer ${
                    cooldown > 0 ? "opacity-50 cursor-not-allowed text-cream/30" : ""
                  }`}
                >
                  {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-cream/50">
          Already registered?{" "}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
