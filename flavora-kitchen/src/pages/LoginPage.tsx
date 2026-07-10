import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer for rate limiting
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await login(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setCooldown(30);
          return 0; // Reset count
        }
        return next;
      });
    } else {
      setFailedAttempts(0);
      navigate("/app");
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address to request a reset link.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const { error } = await forgotPassword(email.trim());
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg("Password reset link sent to your email! (Or mock reset confirmed)");
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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative z-10"
      >
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-bold font-serif tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-cream/50 text-xs tracking-wider uppercase font-mono">
            Log in to Flavora Kitchen
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
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
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
              />
            </div>
            
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-orange-500/80 hover:text-orange-500 font-bold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className={`w-full py-4 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm font-sans ${
              cooldown > 0 
                ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed" 
                : "bg-orange-500 text-white shadow-orange-500/10 hover:bg-orange-400"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cooldown > 0 ? (
              <span>Locked: Try in {cooldown}s</span>
            ) : (
              <>
                <LogIn size={15} /> Log In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-cream/50">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
