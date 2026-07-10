import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Phone as PhoneIcon, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { BUSINESS_CONFIG } from "../config";

export function ContactLocation({ triggerToast }: { triggerToast: (msg: string) => void }) {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 1500);
  };

  return (
    <section className="py-28 bg-dark-radial-center relative z-10 font-sans overflow-hidden border-t border-white/5 select-none text-cream">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Amber spotlight glow bloom behind the contact form area */}
      <motion.div
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.10, 0.14, 0.10]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-[15%] -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none select-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(60px)"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-20 text-center flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.25em] text-xs">
                Get in Touch
              </span>
              <span className="h-[1px] w-8 bg-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.05] tracking-tight">
              Connect with <span className="font-extrabold italic text-orange-500">Flavora</span>
            </h2>
            <p className="text-cream/70 text-base md:text-lg font-normal leading-relaxed max-w-md mx-auto">
              Reach out to our gastronomy concierge or find directions to our dining room.
            </p>
          </motion.div>
        </div>

        {/* Split Layout Form & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold font-serif text-white">Concierge Message</h3>
                  <p className="text-cream/50 text-xs">Send us a direct message for booking enquiries, events, or feedback.</p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                      />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                      />
                    </div>

                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Your Message / Request details..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition resize-none text-white placeholder-cream/25"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} /> Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-lg mb-6 animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-white mb-2">Message Sent!</h3>
                  <p className="text-cream/65 text-sm max-w-sm mb-6">
                    Thank you for reaching out. Our gastronomy concierge will review your message and contact you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-cream rounded-xl transition border border-white/10 cursor-pointer text-xs"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Google Map Embed & Contact info */}
          <div className="lg:col-span-6 space-y-8">
            {/* Map Frame wrapper */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5 h-64 md:h-72 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md">
              {BUSINESS_CONFIG.isLocationPending ? (
                <div className="space-y-4 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto animate-pulse">
                    <MapPin size={24} />
                  </div>
                  <h4 className="font-bold font-serif text-white text-base">Location Map Pending Verification</h4>
                  <p className="text-cream/65 text-xs leading-relaxed">
                    Our premium dining room map is undergoing validation. The interactive navigation route will go live immediately upon launch.
                  </p>
                </div>
              ) : (
                <iframe
                  title="Flavora Kitchen Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.925437812984!2d77.61011631527376!3d12.976456918287383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1680d2165b43%3A0x6b7fc93bfca6cf7c!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1655000000000!5m2!1sen!2sin"
                  className="w-full h-full object-cover border-0"
                  allowFullScreen={false}
                  loading="lazy"
                  style={{ filter: "grayscale(1) invert(0.9) contrast(1.2) opacity(0.85)" }}
                />
              )}
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                    <MapPin className="text-orange-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-serif text-white text-sm">Location</h4>
                    {BUSINESS_CONFIG.isLocationPending ? (
                      <p className="text-cream/50 text-xs mt-1 leading-relaxed">
                        Visit us — full address coming soon,<br />
                        call to reserve.
                      </p>
                    ) : (
                      <p className="text-cream/50 text-xs mt-1 leading-relaxed">
                        {BUSINESS_CONFIG.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                    <Clock className="text-orange-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-serif text-white text-sm">Opening Hours</h4>
                    <p className="text-cream/50 text-xs mt-1 leading-relaxed whitespace-pre-line">
                      {BUSINESS_CONFIG.openingHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                    <PhoneIcon className="text-orange-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-serif text-white text-sm">Phone Contact</h4>
                    <p className="text-cream/50 text-xs mt-1 leading-relaxed">
                      {BUSINESS_CONFIG.phoneDisplay}<br />
                      {BUSINESS_CONFIG.phoneDisplaySecondary}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/15">
                    <Mail className="text-orange-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold font-serif text-white text-sm">Email Contact</h4>
                    <p className="text-cream/50 text-xs mt-1 leading-relaxed">
                      {BUSINESS_CONFIG.email}<br />
                      {BUSINESS_CONFIG.emailSecondary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions Trigger Button */}
            <div className="pt-2">
              <a
                href={BUSINESS_CONFIG.isLocationPending ? "#" : "https://maps.google.com/?q=Bengaluru"}
                onClick={(e) => {
                  if (BUSINESS_CONFIG.isLocationPending) {
                    e.preventDefault();
                    triggerToast("Directions pending location map verification.");
                  }
                }}
                target={BUSINESS_CONFIG.isLocationPending ? undefined : "_blank"}
                rel="noreferrer"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-cream rounded-xl transition border border-white/10 flex items-center gap-2 cursor-pointer text-xs w-max"
              >
                <MapPin size={12} className="text-orange-500" /> Get Directions on Maps
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
