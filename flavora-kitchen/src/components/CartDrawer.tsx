import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, CheckCircle2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useCart();
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Form states
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Premium cubic deceleration count-up for subtotal
  useEffect(() => {
    if (isOpen) {
      let startTimestamp: number | null = null;
      const startValue = 0;
      const targetValue = cartTotal;
      const duration = 1000; // 1s animation

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        setAnimatedTotal(startValue + easeProgress * (targetValue - startValue));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isOpen, cartTotal]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutSuccess(false);
        setAddress("");
        setPhone("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCheckoutSuccess(true);
      clearCart();
    }, 1500);
  };

  const deliveryFee = cartTotal > 0 ? 50 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 pointer-events-auto"
          />

          {/* Cart Drawer Panel (Redesigned in Deep Warm Ink) */}
          <motion.div
            initial={{ x: "100%", rotateY: -20 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: "100%", rotateY: -20 }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[440px] bg-dark-radial-center border-l border-white/5 z-50 shadow-2xl p-6 flex flex-col font-sans overflow-hidden text-cream pointer-events-auto"
            style={{ transformOrigin: "right center", perspective: "1000px" }}
          >
            {/* Noise/Grain Overlay */}
            <div className="noise-overlay" />

            {/* Amber spotlight glow bloom centered inside the drawer */}
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
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 shrink-0">
              <h2 className="text-2xl font-serif font-black text-white flex items-center gap-2">
                {isCheckingOut ? "Checkout" : "Your Order"}
                {!isCheckingOut && cartCount > 0 && (
                  <span className="bg-orange-500 text-xs w-5 h-5 rounded-full flex items-center justify-center text-white font-sans font-bold">
                    {cartCount}
                  </span>
                )}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {checkoutSuccess ? (
                /* Dynamic Confirmation Ticket in Contrast Cream style */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center px-4 py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-lg mb-6 animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-serif font-black text-white mb-2">Order Received</h3>
                  <p className="text-cream/60 text-sm mb-8">
                    Your gourmet dishes are currently being composed by the kitchen team. Est. delivery: 30-40 minutes.
                  </p>
                  
                  {/* Styled physical paper receipt */}
                  <div className="w-full bg-cream text-warm-ink rounded-3xl p-6 text-left relative overflow-hidden shadow-2xl">
                    <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0d0a08] -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0d0a08] -translate-y-1/2" />
                    
                    <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                      <div className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Receipt Details</div>
                      <div className="font-mono text-xs text-gray-500 mt-1">Order #FL-{Math.floor(100000 + Math.random() * 900000)}</div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Preparation:</span>
                        <span className="font-bold text-gray-800">Gourmet Station</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-600 font-extrabold uppercase tracking-wider">Confirmed</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-cream text-warm-ink font-bold rounded-full hover:bg-white transition w-full cursor-pointer text-sm"
                  >
                    Done
                  </button>
                </motion.div>
              ) : isCheckingOut ? (
                /* Checkout Form styled premium */
                <motion.form 
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleCheckoutSubmit}
                  className="space-y-6 pt-2"
                >
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="flex items-center gap-2 text-xs font-bold text-cream/40 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Return to Cart
                  </button>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-cream/50 mb-2">Delivery Location</label>
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Suite/Apartment number, street name & area details"
                        rows={3}
                        className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition resize-none text-white placeholder-cream/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-cream/50 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99999 99999"
                        className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-cream/50 mb-2">Payment Choice</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("stripe")}
                          className={`py-3 rounded-2xl border font-bold text-xs tracking-wider uppercase transition flex items-center justify-center cursor-pointer ${paymentMethod === "stripe" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/10 text-cream/60 hover:bg-white/5"}`}
                        >
                          Stripe Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("razorpay")}
                          className={`py-3 rounded-2xl border font-bold text-xs tracking-wider uppercase transition flex items-center justify-center cursor-pointer ${paymentMethod === "razorpay" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/10 text-cream/60 hover:bg-white/5"}`}
                        >
                          Razorpay UPI
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-white/5 pt-6 space-y-2.5 text-sm text-cream/60">
                    <div className="flex justify-between">
                      <span>Food items</span>
                      <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery surcharge</span>
                      <span className="font-semibold text-white">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white border-t border-white/5 pt-3">
                      <span>Total Amount</span>
                      <span className="text-orange-500">₹{(cartTotal + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/15 hover:bg-orange-400 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      `Place Order — ₹${(cartTotal + deliveryFee).toFixed(2)}`
                    )}
                  </button>
                </motion.form>
              ) : cart.length === 0 ? (
                /* Empty Cart */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center px-6"
                >
                  <div className="text-cream/20 mb-4 animate-pulse">
                    <ShoppingBag size={64} strokeWidth={1} />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">Your cart is empty</h3>
                  <p className="text-cream/40 text-sm max-w-xs leading-relaxed">
                    Browse our curated selections and add them to order.
                  </p>
                </motion.div>
              ) : (
                /* Cart Items List */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 pb-4"
                >
                  {cart.map((item) => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                      onRemove={() => removeFromCart(item.id)}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bottom pricing section in Cart Mode */}
            {!isCheckingOut && !checkoutSuccess && cart.length > 0 && (
              <div className="border-t border-white/5 pt-6 mt-4 shrink-0 bg-[#0d0a08]">
                <div className="flex justify-between text-cream/60 text-sm mb-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cream">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cream/60 text-sm mb-4">
                  <span>Delivery</span>
                  <span className="font-semibold text-cream">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-2xl font-serif font-black mb-6">
                  <span>Total</span>
                  <span className="text-orange-500">₹{(animatedTotal + deliveryFee).toFixed(2)}</span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition cursor-pointer text-sm"
                >
                  Checkout Now
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateX: 3, rotateY: -3 }}
      className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex gap-4 items-center relative shadow-md hover:shadow-lg transition-all duration-300"
      style={{ perspective: "500px", transformStyle: "preserve-3d" }}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-serif font-bold text-sm line-clamp-1 leading-snug">{item.name}</h4>
        <div className="text-orange-500 font-serif font-extrabold mt-1 text-sm">₹{(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button 
          onClick={onRemove}
          className="text-cream/35 hover:text-red-400 transition-colors p-1 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 shadow-md">
          <button 
            onClick={onDecrease}
            className="w-5 h-5 flex items-center justify-center text-cream/40 hover:text-white font-black text-sm cursor-pointer"
          >
            -
          </button>
          <span className="text-white text-xs font-bold w-4 text-center">{item.quantity}</span>
          <button 
            onClick={onIncrease}
            className="w-5 h-5 flex items-center justify-center text-cream/40 hover:text-white font-black text-sm cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}
