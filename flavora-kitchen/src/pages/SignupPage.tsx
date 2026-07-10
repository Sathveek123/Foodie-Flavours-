import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { UserPlus, Mail, Lock, User, ArrowLeft, AlertCircle, Gift, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { error } = await signup(email.trim(), password, name.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      if (referralCode.trim()) {
        localStorage.setItem("flavora_applied_referral", referralCode.trim().toUpperCase());
      }
      
      // Real auth requires confirming email link by default
      if (isSupabaseConfigured) {
        setNeedsVerification(true);
      } else {
        navigate("/app");
      }
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

      {/* Conditional verification box vs signup form card */}
      {needsVerification ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative z-10 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <MailCheck size={28} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-white">Verify Your Email</h2>
            <p className="text-xs text-cream/60 leading-relaxed font-sans">
              We have sent a verification link to <span className="text-orange-400 font-bold">{email}</span>. Please check your inbox and click the link to activate your Flavora Club membership.
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-[10px] text-cream/40 leading-relaxed font-mono">
            ℹ️ Email verification is required before logging into the authenticated portal (/app).
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <button
              onClick={() => setNeedsVerification(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-cream text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Change Email / Back
            </button>
            <Link
              to="/login"
              className="text-orange-500 hover:text-orange-400 text-xs font-bold font-sans underline"
            >
              Proceed to Login Page
            </Link>
          </div>
        </motion.div>
      ) : (
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
              Sign up for Flavora Club
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              {/* Name Field */}
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

              {/* Email Field */}
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

              {/* Password Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                />
              </div>

              {/* Referral Code Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                  <Gift size={16} />
                </span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Referral Code (Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
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
                  <UserPlus size={15} /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-cream/50">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 font-bold hover:underline">
              Log In
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
