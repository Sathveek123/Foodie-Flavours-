import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

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
    setSuccessMsg("");

    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Your password has been successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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

      {/* Back to Login Button */}
      <Link
        to="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream/50 hover:text-white transition z-10"
      >
        <ArrowLeft size={14} /> Back to Login
      </Link>

      {/* Reset Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative z-10"
      >
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-bold font-serif tracking-tight text-white">
            Reset Password
          </h2>
          <p className="text-cream/50 text-xs tracking-wider uppercase font-mono">
            Set your new credentials
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

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2"
          >
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {!successMsg && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
              {/* New Password Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
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
                  placeholder="Confirm New Password"
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
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
