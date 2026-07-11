import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LogIn, Mail, Lock, ArrowLeft, AlertCircle, TrendingUp, ShoppingBag, Calendar, 
  Star, Package, AlertTriangle, CheckCircle, RefreshCw, X, ShieldAlert, 
  Trash2, User, Phone, Users, Clock, Compass, DollarSign, Edit
} from "lucide-react";
import { DISH_DATA } from "../components/MenuPreviewTabs";

// Shared Stock Status Type
type StockStatus = "available" | "low" | "sold_out";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  fees: {
    gst: number;
    delivery: number;
    platform: number;
    tip: number;
  };
  total: number;
  status: "Order Placed" | "Accepted" | "Preparing" | "Packed" | "Out For Delivery" | "Delivered" | "Cancelled";
  address: {
    type: string;
    addressLine: string;
  };
  paymentMethod: string;
  refundStatus?: "none" | "requested" | "processing" | "completed" | "denied";
}

interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  tableType: string;
  tableId: string;
  status: "Confirmed" | "Seated" | "Completed" | "Cancelled";
  name: string;
  phone: string;
  waitlisted?: boolean;
}

interface WaitlistEntry {
  id: string;
  name: string;
  guests: number;
  phone: string;
  joinedAt: string;
  position: number;
  status: "waiting" | "ready" | "seated";
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem("flavora_admin_token");
  });

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "bookings" | "stock" | "waitlist">("overview");

  // Dynamic Data States loaded from localStorage
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [stockOverrides, setStockOverrides] = useState<Record<number, StockStatus>>({});

  // Form edit states
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Load Admin Data on mount
  useEffect(() => {
    if (adminToken) {
      loadData();
    }
  }, [adminToken]);

  const loadData = () => {
    try {
      // 1. Orders
      const storedOrders = localStorage.getItem("flavora_order_history");
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);

      // 2. Bookings
      const storedBookings = localStorage.getItem("flavora_bookings");
      setBookings(storedBookings ? JSON.parse(storedBookings) : []);

      // 3. Waitlist
      const storedWaitlist = localStorage.getItem("flavora_waitlist");
      setWaitlist(storedWaitlist ? JSON.parse(storedWaitlist) : []);

      // 4. Stock status overrides
      const storedStock = localStorage.getItem("flavora_dish_stock_overrides");
      setStockOverrides(storedStock ? JSON.parse(storedStock) : {});
    } catch (e) {
      console.error("Failed to load admin data state:", e);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoginLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setLoginLoading(false);
      if (email.trim().toLowerCase() === "admin@flavorakitchen.com" && password === "adminpassword2006") {
        const token = "admin-session-" + Date.now();
        localStorage.setItem("flavora_admin_token", token);
        setAdminToken(token);
      } else {
        setErrorMsg("Invalid administrator security credentials.");
      }
    }, 1000);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("flavora_admin_token");
    setAdminToken(null);
  };

  // 1. Update Order Status
  const handleUpdateOrderStatus = (orderId: string, nextStatus: Order["status"]) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
    setOrders(updated);
    localStorage.setItem("flavora_order_history", JSON.stringify(updated));
    showToast(`Order #${orderId} set to [${nextStatus}]`);
  };

  // 2. Update Refund Status
  const handleUpdateRefundStatus = (orderId: string, nextRefund: Order["refundStatus"]) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, refundStatus: nextRefund } : o);
    setOrders(updated);
    localStorage.setItem("flavora_order_history", JSON.stringify(updated));
    
    if (nextRefund === "completed") {
      // Mock Sandbox payment refund alert
      showToast(`💸 Refund of Order #${orderId} completed! (Stripe/Razorpay API simulated)`, "success");
    } else {
      showToast(`Refund state of #${orderId} updated to: ${nextRefund}`);
    }
  };

  // 3. Update Booking Status
  const handleUpdateBookingStatus = (bookingId: string, nextStatus: Booking["status"]) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b);
    setBookings(updated);
    localStorage.setItem("flavora_bookings", JSON.stringify(updated));
    showToast(`Booking #${bookingId} status updated to: ${nextStatus}`);
  };

  // 4. Update Seating Reservation Schedule
  const handleRescheduleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !rescheduleDate || !rescheduleTime) return;

    const updated = bookings.map(b => 
      b.id === editingBooking.id 
        ? { ...b, date: rescheduleDate, time: rescheduleTime } 
        : b
    );
    setBookings(updated);
    localStorage.setItem("flavora_bookings", JSON.stringify(updated));
    setEditingBooking(null);
    showToast(`Booking #${editingBooking.id} rescheduled successfully!`, "success");
  };

  // 5. Update Seating Guest Count
  const handleUpdateGuestCount = (bookingId: string, change: number) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const next = Math.max(1, b.guests + change);
        return { ...b, guests: next };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem("flavora_bookings", JSON.stringify(updated));
    showToast(`Guest count updated!`);
  };

  // 6. Manage Menu Dish Stock Override
  const handleToggleDishStock = (dishId: number, nextStock: StockStatus) => {
    const nextOverrides = { ...stockOverrides, [dishId]: nextStock };
    setStockOverrides(nextOverrides);
    localStorage.setItem("flavora_dish_stock_overrides", JSON.stringify(nextOverrides));
    showToast(`Dish #${dishId} stock set to: ${nextStock.toUpperCase()}`);
  };

  // 7. Manage Waitlist promotion
  const handlePromoteWaitlist = (entryId: string, nextStatus: WaitlistEntry["status"]) => {
    const updated = waitlist.map(w => w.id === entryId ? { ...w, status: nextStatus } : w);
    setWaitlist(updated);
    localStorage.setItem("flavora_waitlist", JSON.stringify(updated));
    showToast(`Waitlist guest promoted to: ${nextStatus.toUpperCase()}`);
  };

  // Delete waitlist item
  const handleDeleteWaitlist = (entryId: string) => {
    const filtered = waitlist.filter(w => w.id !== entryId);
    setWaitlist(filtered);
    localStorage.setItem("flavora_waitlist", JSON.stringify(filtered));
    showToast(`Waitlist entry removed`);
  };

  // Quick Toast Alerts
  const [toastText, setToastText] = useState("");
  const [toastType, setToastType] = useState<"success" | "info">("info");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string, type: "success" | "info" = "info") => {
    setToastText(msg);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [toastVisible]);

  // Analytics Math
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const bookedTablesCount = bookings.filter(b => b.status === "Confirmed" || b.status === "Seated").length;
  const refundCount = orders.filter(o => o.refundStatus && o.refundStatus !== "none").length;

  return (
    <div className="min-h-screen bg-[#0d0a08] font-sans text-cream select-none relative overflow-x-hidden">
      {/* Background visual assets */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 filter blur-[3px] pointer-events-none" 
        style={{ backgroundImage: "url('/images/combo_deal.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/90 via-[#0d0a08]/95 to-[#0d0a08] z-0 pointer-events-none" />
      <div className="noise-overlay pointer-events-none" />

      {/* Dynamic glow bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0 opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(90px)",
        }}
      />

      <AnimatePresence mode="wait">
        {!adminToken ? (
          /* LOGIN CARD GATED PANEL */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col justify-center items-center px-6 relative z-10"
          >
            <Link
              to="/"
              className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream/50 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Showcase
            </Link>

            <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative">
              <div className="text-center space-y-3 mb-10">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-xl mx-auto shadow-inner">
                  🔐
                </div>
                <h2 className="text-3xl font-bold font-serif tracking-tight text-white mt-4">
                  Admin Console
                </h2>
                <p className="text-cream/50 text-[10px] tracking-widest uppercase font-mono">
                  Gated Access credentials required
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Admin Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/25">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Security Token Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition text-white placeholder-cream/25"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:bg-orange-400 transition flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
                >
                  {loginLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={15} /> Authenticate Admin
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* ADMIN WORKSPACE PANEL */
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-8 relative z-10 space-y-8 select-none"
          >
            {/* Header branding strip */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
              <div className="noise-overlay" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Control Headquarters</span>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
                  🛡️ Flavora Operations Console
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadData}
                  className="p-3 border border-white/10 hover:border-orange-500 hover:text-orange-500 rounded-full transition cursor-pointer"
                  title="Reload Live Database"
                >
                  <RefreshCw size={14} className="animate-spin-slow" />
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/25 hover:bg-red-500 text-red-400 hover:text-[#0d0a08] font-bold rounded-xl text-xs uppercase transition cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 font-sans">
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 relative overflow-hidden text-left">
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Gross Sales Revenue</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-orange-500">₹{totalRevenue.toLocaleString("en-IN")}</h3>
                  <span className="text-[9px] text-green-500 font-bold font-mono">Real-time</span>
                </div>
                <DollarSign className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 relative overflow-hidden text-left">
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Active Deliveries</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-white">{activeOrdersCount} orders</h3>
                  <span className="text-[9px] text-orange-400 font-bold font-mono">In Kitchen</span>
                </div>
                <ShoppingBag className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 relative overflow-hidden text-left">
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Seated Bookings</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-white">{bookedTablesCount} guests</h3>
                  <span className="text-[9px] text-green-500 font-bold font-mono">Active Seating</span>
                </div>
                <Calendar className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 relative overflow-hidden text-left">
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Refund Transactions</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-red-400">{refundCount} alerts</h3>
                  <span className="text-[9px] text-red-500 font-bold font-mono">Action Required</span>
                </div>
                <ShieldAlert className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
            </div>

            {/* Main tab control buttons */}
            <div className="flex border-b border-white/5 gap-2 md:gap-4 overflow-x-auto no-scrollbar font-sans py-1">
              {[
                { id: "overview", label: "📊 Sales Overview" },
                { id: "orders", label: "🍔 Orders Console" },
                { id: "bookings", label: "🍽️ Seating Bookings" },
                { id: "stock", label: "📦 Menu Stock control" },
                { id: "waitlist", label: "👥 Seating Waitlist" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-orange-500 text-[#0d0a08]" 
                      : "bg-white/5 text-cream/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab contents wrapper */}
            <div className="relative font-sans text-left">

              {/* TAB 1: OVERVIEW & GENERAL LOGS */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden">
                    <h4 className="font-serif font-black text-white text-lg">Recent Checkout Orders</h4>
                    {orders.length === 0 ? (
                      <p className="text-xs text-cream/40 italic">No checkout history available.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-cream/40 text-[9px] uppercase tracking-wider font-mono">
                              <th className="py-3 px-2">Order ID</th>
                              <th className="py-3 px-2">Date</th>
                              <th className="py-3 px-2">Items Count</th>
                              <th className="py-3 px-2">Grand Total</th>
                              <th className="py-3 px-2">Delivery Status</th>
                              <th className="py-3 px-2">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 5).map(o => (
                              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="py-3.5 px-2 font-mono font-bold text-white">{o.id}</td>
                                <td className="py-3.5 px-2 text-cream/60">{o.date}</td>
                                <td className="py-3.5 px-2">{o.items.reduce((sum, i) => sum + i.quantity, 0)} items</td>
                                <td className="py-3.5 px-2 text-orange-500 font-mono font-bold">₹{o.total}</td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                    o.status === "Delivered" ? "bg-green-500/10 text-green-400" :
                                    o.status === "Cancelled" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 font-mono text-[10px]">{o.paymentMethod}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                    <h4 className="font-serif font-black text-white text-base">Payment Analytics</h4>
                    <div className="space-y-4">
                      {["UPI", "CARD", "COD", "SPLIT"].map(method => {
                        const sum = orders.filter(o => o.paymentMethod === method).reduce((s, o) => s + o.total, 0);
                        const pct = totalRevenue > 0 ? Math.round((sum / totalRevenue) * 100) : 0;
                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-white font-bold">{method} Orders</span>
                              <span className="text-cream/50">₹{sum.toLocaleString("en-IN")} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE ORDERS CONSOLE */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-fadeIn">
                  {orders.length === 0 ? (
                    <div className="py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl text-cream/40">
                      <ShoppingBag className="mx-auto mb-4 opacity-25 text-orange-500" size={36} />
                      <p className="font-serif italic text-sm">No checkout orders registered yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div className="text-left">
                              <span className="text-[10px] font-mono text-cream/45">{order.date}</span>
                              <h5 className="font-mono text-sm font-bold text-white mt-0.5">Order ID: #{order.id}</h5>
                            </div>
                            <span className="text-orange-500 font-mono font-bold text-sm">₹{order.total}</span>
                          </div>

                          <div className="space-y-1.5 text-xs text-cream/70 text-left font-sans">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{i.quantity}x {i.name}</span>
                                <span className="font-mono opacity-50">₹{i.price * i.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-[10px] text-cream/45 border-t border-white/5 pt-3 text-left leading-relaxed">
                            📍 <strong>Address:</strong> {order.address?.addressLine}
                          </div>

                          <div className="flex flex-wrap gap-3 items-center justify-between border-t border-white/5 pt-4">
                            <div className="space-y-1.5 text-left">
                              <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Advance Status</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {["Accepted", "Preparing", "Packed", "Out For Delivery", "Delivered"].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateOrderStatus(order.id, status as any)}
                                    className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                      order.status === status 
                                        ? "bg-orange-500 border-orange-500 text-[#0d0a08]" 
                                        : "bg-white/5 border-white/10 hover:border-white/20 text-cream"
                                    }`}
                                  >
                                    {status.split(" ").map(s => s[0]).join("")}
                                  </button>
                                ))}
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                  className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                    order.status === "Cancelled" 
                                      ? "bg-red-500 border-red-500 text-white" 
                                      : "bg-red-500/10 border-red-500/20 text-red-400"
                                  }`}
                                >
                                  Abort
                                </button>
                              </div>
                            </div>

                            {/* Refund Manager */}
                            <div className="space-y-1.5 text-left">
                              <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Refund Status Ledger</span>
                              <div className="flex gap-1.5">
                                <select
                                  value={order.refundStatus || "none"}
                                  onChange={(e) => handleUpdateRefundStatus(order.id, e.target.value as any)}
                                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-cream focus:outline-none focus:border-orange-500 cursor-pointer"
                                >
                                  <option value="none">No Refund</option>
                                  <option value="requested">Requested</option>
                                  <option value="processing">Processing</option>
                                  <option value="completed">Completed</option>
                                  <option value="denied">Denied</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BOOKINGS MANAGER */}
              {activeTab === "bookings" && (
                <div className="space-y-6 animate-fadeIn">
                  {bookings.length === 0 ? (
                    <div className="py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl text-cream/40">
                      <Calendar className="mx-auto mb-4 opacity-25 text-orange-500" size={36} />
                      <p className="font-serif italic text-sm">No dine-in table bookings recorded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map(book => (
                        <div key={book.id} className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div className="text-left">
                              <span className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-wider">
                                Booking: #{book.id}
                              </span>
                              <h5 className="font-serif font-black text-white text-base mt-0.5">{book.name}</h5>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                              book.status === "Completed" ? "bg-green-500/10 text-green-400" :
                              book.status === "Cancelled" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                            }`}>
                              {book.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-sans text-left text-cream/70">
                            <div>📞 <strong>Phone:</strong> {book.phone}</div>
                            <div>👥 <strong>Guests size:</strong> {book.guests} persons</div>
                            <div>📅 <strong>Schedule:</strong> {book.date}</div>
                            <div>⏰ <strong>Slot time:</strong> {book.time}</div>
                            <div className="col-span-2">🛋️ <strong>Seating Table:</strong> {book.tableType} ({book.tableId})</div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/5 items-center justify-between">
                            <div className="flex gap-2">
                              {/* Seating advancement toggles */}
                              {book.status === "Confirmed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(book.id, "Seated")}
                                  className="px-3 py-1.5 bg-orange-500 text-[#0d0a08] text-[10px] font-bold rounded-lg transition hover:bg-orange-400 cursor-pointer"
                                >
                                  Host check-in (Seat)
                                </button>
                              )}
                              {book.status === "Seated" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(book.id, "Completed")}
                                  className="px-3 py-1.5 bg-green-500 text-[#0d0a08] text-[10px] font-bold rounded-lg transition hover:bg-green-400 cursor-pointer"
                                >
                                  End Dining
                                </button>
                              )}
                              {book.status !== "Cancelled" && book.status !== "Completed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(book.id, "Cancelled")}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 rounded-lg transition cursor-pointer"
                                >
                                  Cancel Seating
                                </button>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingBooking(book);
                                  setRescheduleDate(book.date);
                                  setRescheduleTime(book.time);
                                }}
                                className="p-2 border border-white/10 hover:border-orange-500 text-cream/75 hover:text-white rounded-lg transition cursor-pointer"
                                title="Reschedule Date/Time"
                              >
                                <Edit size={12} />
                              </button>

                              {/* Adjust guests count */}
                              <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-black/20">
                                <button 
                                  onClick={() => handleUpdateGuestCount(book.id, -1)} 
                                  className="w-5 h-5 flex items-center justify-center text-[10px] hover:text-white cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-mono font-bold w-4 text-center">{book.guests}</span>
                                <button 
                                  onClick={() => handleUpdateGuestCount(book.id, 1)} 
                                  className="w-5 h-5 flex items-center justify-center text-[10px] hover:text-white cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MENU & STOCK OVERRIDES */}
              {activeTab === "stock" && (
                <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-fadeIn">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <h4 className="font-serif font-black text-white text-lg">Menu Catalog Inventory</h4>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-cream/40">Overrides Synced</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(DISH_DATA).flat().map(dish => {
                      const curStock = stockOverrides[dish.id] || "available";
                      return (
                        <div key={dish.id} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={dish.image} className="w-12 h-12 object-cover rounded-xl bg-white/5 shrink-0" alt={dish.name} />
                            <div className="text-left">
                              <h6 className="font-bold text-white text-xs leading-snug">{dish.name}</h6>
                              <p className="text-[9px] text-cream/40 mt-1 font-mono">₹{dish.price} &middot; ID: {dish.id}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-right">
                            <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Stock Level</span>
                            <div className="flex gap-1 bg-black/40 border border-white/10 p-0.5 rounded-lg shrink-0">
                              {[
                                { id: "available", label: "✅", title: "Available" },
                                { id: "low", label: "⚠️", title: "Low Stock" },
                                { id: "sold_out", label: "🚫", title: "Sold Out" }
                              ].map(st => (
                                <button
                                  key={st.id}
                                  onClick={() => handleToggleDishStock(dish.id, st.id as any)}
                                  className={`w-6 h-6 flex items-center justify-center text-xs rounded transition cursor-pointer ${
                                    curStock === st.id ? "bg-orange-500 text-black shadow-inner" : "hover:bg-white/5 text-cream"
                                  }`}
                                  title={st.title}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: SEATING WAITLIST */}
              {activeTab === "waitlist" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  {waitlist.length === 0 ? (
                    <div className="py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl text-cream/40">
                      <Users className="mx-auto mb-4 opacity-25 text-orange-500" size={36} />
                      <p className="font-serif italic text-sm">Waitlist queue is empty.</p>
                    </div>
                  ) : (
                    <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden">
                      <div className="overflow-x-auto font-sans">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-cream/40 text-[9px] uppercase tracking-wider font-mono">
                              <th className="py-3 px-2">Position</th>
                              <th className="py-3 px-2">Guest Name</th>
                              <th className="py-3 px-2">Phone</th>
                              <th className="py-3 px-2">Guests Count</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {waitlist.map(w => (
                              <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="py-4 px-2 font-mono font-bold text-orange-500">#{w.position}</td>
                                <td className="py-4 px-2 font-bold text-white">{w.name}</td>
                                <td className="py-4 px-2 text-cream/70 font-mono">{w.phone}</td>
                                <td className="py-4 px-2">{w.guests} guests</td>
                                <td className="py-4 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    w.status === "ready" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    w.status === "seated" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                  }`}>
                                    {w.status}
                                  </span>
                                </td>
                                <td className="py-4 px-2 flex items-center gap-2">
                                  {w.status === "waiting" && (
                                    <button
                                      onClick={() => handlePromoteWaitlist(w.id, "ready")}
                                      className="px-2.5 py-1 bg-green-500 text-black text-[9px] font-bold rounded cursor-pointer"
                                    >
                                      Promote Ready
                                    </button>
                                  )}
                                  {w.status === "ready" && (
                                    <button
                                      onClick={() => handlePromoteWaitlist(w.id, "seated")}
                                      className="px-2.5 py-1 bg-orange-500 text-black text-[9px] font-bold rounded cursor-pointer"
                                    >
                                      Mark Seated
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteWaitlist(w.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition cursor-pointer"
                                    title="Remove from Waitlist"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Date/Time popup overlay */}
      <AnimatePresence>
        {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBooking(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative z-10 text-left shadow-2xl font-sans"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h4 className="text-base font-bold text-white">Reschedule Seating Booking</h4>
                <button onClick={() => setEditingBooking(null)} className="text-cream/50 hover:text-white cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRescheduleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">New Time Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {["12:00 PM", "1:00 PM", "2:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"].map(time => (
                      <option key={time} value={time} className="bg-[#150f0c]">{time}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cream transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-xs font-bold text-[#150f0c] uppercase transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Toast Alert popup */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500 border border-orange-400 text-[#0d0a08] px-6 py-3 rounded-full flex items-center gap-3 shadow-lg font-sans font-bold text-xs uppercase tracking-wider"
          >
            {toastType === "success" ? "🎉" : "🛡️"}
            <span>{toastText}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
