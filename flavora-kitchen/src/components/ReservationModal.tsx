import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUEST_OPTIONS = [1, 2, 3, 4, 5, "6+"];
const TIME_SLOTS = [
  "12:00 PM", "1:30 PM", "3:00 PM",
  "7:00 PM", "8:30 PM", "10:00 PM"
];

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState<number | string>(2);
  const [time, setTime] = useState("7:00 PM");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    // Delay resetting state to let fade transition finish
    setTimeout(() => {
      setStep(1);
      setGuests(2);
      setTime("7:00 PM");
      setName("");
      setEmail("");
      setPhone("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-dark-radial-center border border-white/5 rounded-[2rem] w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden z-10 font-sans text-cream"
          >
            {/* Noise/Grain Overlay */}
            <div className="noise-overlay" />

            {/* Amber spotlight glow bloom centered inside the modal */}
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none select-none z-0"
              style={{
                background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
                filter: "blur(60px)"
              }}
            />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center px-8 pt-8 pb-4 border-b border-white/5">
              <h2 className="text-2xl font-serif font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Book a Table
              </h2>
              <button
                onClick={handleClose}
                className="p-2 bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative z-10 p-8">
              {step === 1 ? (
                /* Step 1: Input Booking Information */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Select Guests */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-cream/50 uppercase tracking-wider mb-3">
                      <Users size={14} className="text-orange-500" /> Number of Guests
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {GUEST_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setGuests(opt)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            guests === opt
                              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                              : "bg-white/5 border border-white/15 text-cream/70 hover:bg-white/10"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cream/50 uppercase tracking-wider mb-3">
                        <Calendar size={14} className="text-orange-500" /> Date
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ colorScheme: "dark" }}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition text-white"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cream/50 uppercase tracking-wider mb-3">
                        <Clock size={14} className="text-orange-500" /> Time Slot
                      </label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-[#1a1410] text-white">
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                      />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                      />
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Confirm Reservation"
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Reservation Confirmation Ticket */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-lg mb-6 animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-2xl font-serif font-black text-white mb-2">Reservation Confirmed!</h3>
                  <p className="text-cream/60 text-sm max-w-sm mb-8">
                    We look forward to serving you. A confirmation ticket has been dispatched to <span className="font-semibold text-white">{email}</span>.
                  </p>

                  {/* Styled physical paper receipt */}
                  <div className="w-full bg-cream text-warm-ink rounded-3xl p-6 text-left relative overflow-hidden shadow-2xl">
                    <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0d0a08] -translate-y-1/2 shadow-inner" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0d0a08] -translate-y-1/2 shadow-inner" />

                    <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Reservation Details</div>
                      <h4 className="text-lg font-serif font-bold text-gray-900">{name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                      <div>
                        <div className="text-gray-400 font-medium mb-1">Guests</div>
                        <div className="font-bold text-gray-800 text-sm">{guests} People</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium mb-1">Date</div>
                        <div className="font-bold text-gray-800 text-sm">{date}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium mb-1">Time Slot</div>
                        <div className="font-bold text-gray-800 text-sm">{time}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="mt-8 px-8 py-3 bg-cream text-warm-ink font-bold rounded-full hover:bg-white transition w-full cursor-pointer text-sm"
                  >
                    Great, thank you!
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
