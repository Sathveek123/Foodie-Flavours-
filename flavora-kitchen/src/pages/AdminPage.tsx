import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LogIn, Mail, Lock, ArrowLeft, AlertCircle, ShoppingBag, Calendar,
  RefreshCw, X, Trash2, Edit, Users, DollarSign, Flame, TrendingUp,
  ChefHat, Truck, PackageCheck, CheckCircle, Clock, BarChart3,
  UtensilsCrossed, TableProperties, ListOrdered, Layers, LayoutDashboard,
  BellRing, ArrowUpRight, CircleDot, ChevronRight, Star
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { DISH_DATA } from "../components/MenuPreviewTabs";

type StockStatus = "available" | "low" | "sold_out";

interface OrderItem { id: string; name: string; price: number; quantity: number; image: string; }
interface Order {
  id: string; date: string; items: OrderItem[];
  subtotal: number; fees: { gst: number; delivery: number; platform: number; tip: number; };
  total: number;
  status: "pending" | "accepted" | "preparing" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
  address: string; paymentMethod: string; paymentStatus: "pending" | "paid" | "failed" | "refunded";
  refundStatus?: "none" | "requested" | "processing" | "completed" | "denied";
}
interface Booking {
  id: string; date: string; time: string; guests: number; tableType: string;
  tableId: string; tableNumber?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  name: string; phone: string; waitlisted?: boolean;
}
interface RestaurantTable { id: string; table_number: number; capacity: number; status: "available" | "reserved" | "occupied" | "cleaning"; }
interface WaitlistEntry { id: string; name: string; guests: number; phone: string; joinedAt: string; position: number; status: "waiting" | "ready" | "seated"; }

const ORDER_STAGES = [
  { key: "pending", label: "Received", icon: BellRing, color: "text-blue-400" },
  { key: "accepted", label: "Accepted", icon: CheckCircle, color: "text-indigo-400" },
  { key: "preparing", label: "Preparing", icon: ChefHat, color: "text-amber-400" },
  { key: "packed", label: "Packed", icon: PackageCheck, color: "text-orange-400" },
  { key: "out_for_delivery", label: "En Route", icon: Truck, color: "text-purple-400" },
  { key: "delivered", label: "Delivered", icon: Star, color: "text-green-400" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  preparing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  packed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  out_for_delivery: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  reserved: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  occupied: "bg-red-500/10 text-red-400 border-red-500/20",
  cleaning: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "stock", label: "Menu Stock", icon: Layers },
  { id: "waitlist", label: "Waitlist", icon: ListOrdered },
];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("flavora_admin_token"));
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "bookings" | "stock" | "waitlist">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [foodItemsState, setFoodItemsState] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedTableIdForBooking, setSelectedTableIdForBooking] = useState<string>("");
  const [toastText, setToastText] = useState("");
  const [toastType, setToastType] = useState<"success" | "info">("info");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (adminToken) {
      loadData();
      const channels = [
        supabase.channel("adm-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders).subscribe(),
        supabase.channel("adm-res").on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, fetchReservations).subscribe(),
        supabase.channel("adm-tbl").on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, fetchTables).subscribe(),
        supabase.channel("adm-prof").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchUserCount).subscribe(),
        supabase.channel("adm-food").on("postgres_changes", { event: "*", schema: "public", table: "food_items" }, fetchFoodItems).subscribe(),
      ];
      return () => { channels.forEach(c => supabase.removeChannel(c)); };
    }
  }, [adminToken]);

  const loadData = () => { fetchOrders(); fetchReservations(); fetchTables(); fetchUserCount(); fetchFoodItems(); };

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data.map((o: any) => ({ id: o.id, date: o.created_at?.split("T")[0] ?? "", items: o.items ?? [], subtotal: +o.subtotal, fees: o.fees ?? {}, total: +o.total, status: o.order_status, address: o.delivery_address, paymentMethod: o.payment_method, paymentStatus: o.payment_status, refundStatus: o.refund_status })));
  };

  const fetchReservations = async () => {
    const { data } = await supabase.from("reservations").select("*, restaurant_tables(table_number)").order("created_at", { ascending: false });
    if (data) {
      setBookings(data.filter((b: any) => !(b.table_id === null && b.status === "pending")).map((b: any) => ({ id: b.id, date: b.reservation_date, time: b.reservation_time, guests: b.guest_count, tableType: b.dining_package || "Standard", tableId: b.table_id || "", tableNumber: b.restaurant_tables?.table_number, status: b.status, name: b.guest_name, phone: b.phone || "" })));
      setWaitlist(data.filter((b: any) => b.table_id === null && b.status === "pending").map((b: any, i: number) => ({ id: b.id, name: b.guest_name, guests: b.guest_count, phone: b.phone || "", joinedAt: b.created_at, position: i + 1, status: "waiting" })));
    }
  };

  const fetchTables = async () => {
    const { data } = await supabase.from("restaurant_tables").select("*").order("table_number");
    if (data) setTables(data);
  };

  const fetchUserCount = async () => {
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    if (count !== null) setUserCount(count);
  };

  const fetchFoodItems = async () => {
    const { data } = await supabase.from("food_items").select("*");
    if (data) setFoodItemsState(data);
  };

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToastText(msg); setToastType(type); setToastVisible(true);
  };
  useEffect(() => { if (toastVisible) { const t = setTimeout(() => setToastVisible(false), 3000); return () => clearTimeout(t); } }, [toastVisible]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault(); setLoginLoading(true); setErrorMsg("");
    setTimeout(() => {
      setLoginLoading(false);
      if (email.trim().toLowerCase() === "admin@flavorakitchen.com" && password === "adminpassword2006") {
        const token = "admin-" + Date.now();
        localStorage.setItem("flavora_admin_token", token);
        setAdminToken(token);
      } else { setErrorMsg("Invalid administrator credentials."); }
    }, 900);
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    await supabase.from("orders").update({ order_status: status }).eq("id", id);
    showToast(`Order → ${status.replace(/_/g, " ")}`);
  };

  const handleUpdateRefundStatus = async (id: string, refund: Order["refundStatus"]) => {
    await supabase.from("orders").update({ refund_status: refund }).eq("id", id);
    showToast(`Refund → ${refund}`);
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking["status"], tableId?: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    if (tableId && (status === "completed" || status === "cancelled")) await supabase.from("restaurant_tables").update({ status: "available" }).eq("id", tableId);
    if (tableId && status === "confirmed") await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", tableId);
    showToast(`Booking → ${status}`); fetchReservations(); fetchTables();
  };

  const handleAssignTable = async (bookingId: string) => {
    if (!selectedTableIdForBooking) { showToast("Choose a table first", "info"); return; }
    await supabase.from("reservations").update({ table_id: selectedTableIdForBooking, status: "confirmed" }).eq("id", bookingId);
    await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", selectedTableIdForBooking);
    showToast("Guest seated ✓"); setSelectedTableIdForBooking(""); fetchReservations(); fetchTables();
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    await supabase.from("reservations").update({ reservation_date: rescheduleDate, reservation_time: rescheduleTime }).eq("id", editingBooking.id);
    showToast("Rescheduled ✓"); setEditingBooking(null); fetchReservations();
  };

  const handleToggleStock = async (id: number, name: string, cat: string, price: number, stock: StockStatus) => {
    await supabase.from("food_items").upsert({ id, name, category: cat, price, is_available: stock !== "sold_out", stock_status: stock });
    showToast(`${name} → ${stock}`); fetchFoodItems();
  };

  const handleToggleFomo = async (id: number, name: string, cat: string, price: number, cur: boolean) => {
    await supabase.from("food_items").upsert({ id, name, category: cat, price, is_selling_fast: !cur });
    showToast(`🔥 FOMO ${!cur ? "ON" : "OFF"} — ${name}`); fetchFoodItems();
  };

  // Metrics
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
  const bookedTables = tables.filter(t => t.status !== "available").length;
  const todayOrders = orders.filter(o => o.date === new Date().toISOString().split("T")[0]).length;

  if (!adminToken) return (
    <div className="min-h-screen bg-[#080604] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 text-cream/40 hover:text-cream/70 text-xs font-mono uppercase tracking-widest mb-8 transition">
          <ArrowLeft size={13} /> Back to site
        </Link>

        <div className="bg-white/[0.025] border border-white/[0.07] rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">🔐</div>
            <h1 className="text-2xl font-black font-serif text-white tracking-tight">Admin Console</h1>
            <p className="text-cream/40 text-xs mt-1.5 font-mono tracking-widest uppercase">Flavora Kitchen Operations</p>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" /> {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
              <input type="email" required placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-cream/25 focus:outline-none focus:border-orange-500/60 transition" />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
              <input type="password" required placeholder="Security token" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-cream/25 focus:outline-none focus:border-orange-500/60 transition" />
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-orange-500 transition flex items-center justify-center gap-2 text-sm cursor-pointer">
              {loginLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={15} /> Authenticate</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080604] text-white font-sans select-none">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-15" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)", filter: "blur(120px)" }} />

      <div className="relative z-10 flex min-h-screen">
        {/* ── SIDEBAR ── */}
        <aside className="w-64 shrink-0 border-r border-white/[0.06] bg-black/30 backdrop-blur-3xl flex flex-col min-h-screen sticky top-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-lg">🍽️</div>
              <div>
                <p className="text-white font-black text-sm font-serif leading-none">Flavora</p>
                <p className="text-orange-500 text-[9px] uppercase font-mono tracking-widest mt-0.5">Admin Console</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-cream/50 hover:text-white hover:bg-white/5"}`}>
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.id === "orders" && activeOrders > 0 && (
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-orange-500/15 text-orange-400"}`}>{activeOrders}</span>
                  )}
                  {tab.id === "waitlist" && waitlist.length > 0 && (
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-400"}`}>{waitlist.length}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06] space-y-2">
            <button onClick={loadData} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-cream/50 hover:text-white hover:bg-white/5 transition text-sm cursor-pointer">
              <RefreshCw size={14} /> Refresh Data
            </button>
            <button onClick={() => { localStorage.removeItem("flavora_admin_token"); setAdminToken(null); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition text-sm cursor-pointer">
              <ArrowLeft size={14} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-black/50 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black font-serif text-white">{TABS.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-cream/35 text-xs font-mono mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <CircleDot size={10} className="text-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-bold font-mono">Live</span>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8">
            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "All time sales", icon: DollarSign, color: "orange", trend: "+12%" },
                { label: "Active Orders", value: activeOrders, sub: `${todayOrders} today`, icon: ShoppingBag, color: "purple", trend: "Live" },
                { label: "Tables Occupied", value: `${bookedTables}/${tables.length}`, sub: "Dine-in capacity", icon: TableProperties, color: "blue", trend: `${tables.length - bookedTables} free` },
                { label: "Club Members", value: userCount, sub: "Registered users", icon: Users, color: "green", trend: "Database" },
              ].map((card, i) => {
                const Icon = card.icon;
                const colorMap: Record<string, string> = {
                  orange: "from-orange-500/10 to-orange-500/5 border-orange-500/15 text-orange-400",
                  purple: "from-purple-500/10 to-purple-500/5 border-purple-500/15 text-purple-400",
                  blue: "from-blue-500/10 to-blue-500/5 border-blue-500/15 text-blue-400",
                  green: "from-green-500/10 to-green-500/5 border-green-500/15 text-green-400",
                };
                const iconBg: Record<string, string> = {
                  orange: "bg-orange-500/10 text-orange-500",
                  purple: "bg-purple-500/10 text-purple-500",
                  blue: "bg-blue-500/10 text-blue-500",
                  green: "bg-green-500/10 text-green-500",
                };
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-2xl p-5 relative overflow-hidden`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl ${iconBg[card.color]} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cream/40 bg-white/5 px-2 py-0.5 rounded-full">{card.trend}</span>
                    </div>
                    <p className="text-2xl font-black font-mono text-white">{card.value}</p>
                    <p className="text-xs text-cream/40 mt-1">{card.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">Recent Orders</h3>
                        <button onClick={() => setActiveTab("orders")} className="text-orange-400 text-xs flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">View all <ChevronRight size={12} /></button>
                      </div>
                      {orders.length === 0 ? (
                        <div className="py-16 text-center text-cream/30">
                          <ShoppingBag size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm italic">No orders yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.04]">
                          {orders.slice(0, 6).map(o => (
                            <div key={o.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 text-xs font-black shrink-0">
                                {o.paymentMethod?.charAt(0) || "U"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-white font-bold truncate">#{o.id.substring(0, 12)}...</p>
                                <p className="text-[10px] text-cream/40 mt-0.5">{o.items?.length || 0} items · {o.date}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[o.status] || ""}`}>
                                {o.status.replace(/_/g, " ")}
                              </span>
                              <span className="text-orange-400 font-mono font-black text-sm shrink-0">₹{o.total}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* Table Status */}
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><UtensilsCrossed size={14} className="text-orange-400" /> Table Status</h3>
                        <div className="space-y-2">
                          {tables.map(t => (
                            <div key={t.id} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "available" ? "bg-green-400" : t.status === "reserved" ? "bg-orange-400" : "bg-red-400"}`} />
                              <span className="text-xs text-cream/70 flex-1">Table {t.table_number} <span className="text-cream/35">· {t.capacity}p</span></span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status] || ""}`}>{t.status}</span>
                            </div>
                          ))}
                          {tables.length === 0 && <p className="text-xs text-cream/30 italic">Loading tables...</p>}
                        </div>
                      </div>

                      {/* Payment Mix */}
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-orange-400" /> Payment Split</h3>
                        {["UPI", "CARD", "COD"].map(m => {
                          const sum = orders.filter(o => o.paymentMethod === m).reduce((s, o) => s + o.total, 0);
                          const pct = totalRevenue > 0 ? Math.round((sum / totalRevenue) * 100) : 0;
                          return (
                            <div key={m} className="mb-3 last:mb-0">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-mono font-bold text-white">{m}</span>
                                <span className="text-cream/40 font-mono">₹{sum.toLocaleString("en-IN")} <span className="text-cream/25">({pct}%)</span></span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ORDERS */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="py-24 text-center bg-white/[0.015] border border-white/[0.06] rounded-2xl text-cream/30">
                        <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm italic font-serif">No orders in the system yet.</p>
                      </div>
                    ) : orders.map(order => (
                      <motion.div key={order.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                        {/* Order header */}
                        <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-white/[0.05] bg-white/[0.01]">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-cream/35 font-mono">{order.date}</p>
                            <p className="text-xs font-mono font-bold text-white mt-0.5">#{order.id}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[order.status]}`}>
                            {order.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <div className="text-right">
                            <p className="text-orange-400 font-black font-mono text-lg">₹{order.total}</p>
                            <p className={`text-[9px] font-bold font-mono ${order.paymentStatus === "paid" ? "text-green-400" : "text-yellow-400"}`}>
                              {order.paymentStatus} · {order.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                          {/* Items */}
                          <div className="flex flex-wrap gap-2">
                            {order.items?.map((item, i) => (
                              <span key={i} className="text-[10px] bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg text-cream/70">
                                {item.quantity}× {item.name}
                              </span>
                            ))}
                          </div>

                          {/* Address */}
                          <p className="text-[11px] text-cream/35 flex items-start gap-1.5">
                            <span className="mt-0.5">📍</span> {order.address}
                          </p>

                          {/* Pipeline stepper */}
                          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1">
                            {ORDER_STAGES.map((stage, idx) => {
                              const stageKeys = ORDER_STAGES.map(s => s.key);
                              const currentIdx = stageKeys.indexOf(order.status);
                              const stageIdx = idx;
                              const done = currentIdx >= stageIdx && order.status !== "cancelled";
                              const active = stageIdx === currentIdx;
                              const Icon = stage.icon;
                              return (
                                <React.Fragment key={stage.key}>
                                  <button onClick={() => handleUpdateOrderStatus(order.id, stage.key as Order["status"])}
                                    title={`Set to ${stage.label}`}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition cursor-pointer shrink-0 ${active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : done ? "bg-white/5 text-green-400" : "bg-white/[0.02] text-cream/30 hover:bg-white/5 hover:text-cream/60"}`}>
                                    <Icon size={13} />
                                    <span className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">{stage.label}</span>
                                  </button>
                                  {idx < ORDER_STAGES.length - 1 && (
                                    <div className={`h-px w-4 shrink-0 ${done && currentIdx > idx ? "bg-green-400/40" : "bg-white/8"}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                            <button onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                              className={`ml-2 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition cursor-pointer shrink-0 ${order.status === "cancelled" ? "bg-red-500 text-white" : "bg-white/[0.02] text-red-400/50 hover:bg-red-500/10 hover:text-red-400"}`}>
                              <X size={13} />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Cancel</span>
                            </button>
                          </div>

                          {/* Refund */}
                          <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
                            <span className="text-[10px] text-cream/35 font-mono uppercase tracking-wider">Refund:</span>
                            <select value={order.refundStatus || "none"} onChange={e => handleUpdateRefundStatus(order.id, e.target.value as any)}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-cream focus:outline-none focus:border-orange-500 cursor-pointer">
                              {["none", "requested", "processing", "completed", "denied"].map(r => (
                                <option key={r} value={r} className="bg-[#0d0a08]">{r}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* BOOKINGS */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="py-24 text-center bg-white/[0.015] border border-white/[0.06] rounded-2xl text-cream/30">
                        <Calendar size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm italic font-serif">No confirmed bookings yet.</p>
                      </div>
                    ) : bookings.map(b => (
                      <motion.div key={b.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex flex-wrap items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[b.status]}`}>{b.status.toUpperCase()}</span>
                              <span className="text-[10px] text-cream/30 font-mono">#{b.id.substring(0, 8)}</span>
                            </div>
                            <h3 className="text-white font-black text-base font-serif">{b.name}</h3>
                            {b.phone && <p className="text-cream/40 text-xs mt-0.5">📞 {b.phone}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-white text-sm font-bold">{b.date} <span className="text-orange-400">@ {b.time}</span></p>
                            <p className="text-cream/40 text-xs mt-0.5">👥 {b.guests} guests</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-white/[0.015] rounded-xl p-3.5 border border-white/[0.05]">
                          <div><span className="text-cream/30">Package</span><p className="text-white font-semibold mt-0.5">{b.tableType}</p></div>
                          <div><span className="text-cream/30">Table</span><p className="text-white font-semibold mt-0.5">{b.tableNumber ? `Table ${b.tableNumber}` : "—"}</p></div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {b.status === "confirmed" && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, "completed", b.tableId)}
                              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/25 hover:border-emerald-400 text-emerald-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer">
                              ✓ End Seating & Free Table
                            </button>
                          )}
                          {!["cancelled", "completed"].includes(b.status) && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, "cancelled", b.tableId)}
                              className="px-4 py-2 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl transition cursor-pointer">
                              Cancel Booking
                            </button>
                          )}
                          <button onClick={() => { setEditingBooking(b); setRescheduleDate(b.date); setRescheduleTime(b.time); }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-cream/60 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
                            <Edit size={11} /> Reschedule
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* MENU STOCK */}
                {activeTab === "stock" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-cream/40 text-sm">Toggle availability and FOMO badges for each dish. Changes sync instantly to all users.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(DISH_DATA).flatMap(([category, list]) => list.map(d => ({ ...d, category }))).map(dish => {
                        const m = foodItemsState.find(f => f.id === dish.id);
                        const curStock: StockStatus = m?.stock_status ?? "available";
                        const isFomo: boolean = m?.is_selling_fast ?? false;
                        return (
                          <motion.div key={dish.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <img src={dish.image} alt={dish.name} className="w-12 h-12 object-cover rounded-xl bg-white/5 shrink-0" onError={e => { (e.target as HTMLImageElement).src = "/images/truffle_dish.png"; }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-bold leading-snug truncate">{dish.name}</p>
                                <p className="text-cream/30 text-[10px] font-mono mt-0.5">₹{dish.price} · {dish.category}</p>
                              </div>
                              {/* FOMO toggle */}
                              <button onClick={() => handleToggleFomo(dish.id, dish.name, dish.category, dish.price, isFomo)}
                                className={`p-2 rounded-xl border transition cursor-pointer ${isFomo ? "bg-orange-500/15 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-cream/25 hover:text-cream/60"}`}
                                title="Toggle Selling Fast badge">
                                <Flame size={14} className={isFomo ? "animate-pulse" : ""} />
                              </button>
                            </div>

                            {/* Stock pills */}
                            <div className="flex gap-1.5">
                              {([["available", "✅", "Available"], ["low", "⚠️", "Low Stock"], ["sold_out", "🚫", "Sold Out"]] as const).map(([val, emoji, lbl]) => (
                                <button key={val} onClick={() => handleToggleStock(dish.id, dish.name, dish.category, dish.price, val)}
                                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer border ${curStock === val ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white/[0.02] border-white/8 text-cream/40 hover:border-white/20 hover:text-cream/70"}`}>
                                  {emoji} {lbl}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WAITLIST */}
                {activeTab === "waitlist" && (
                  <div>
                    {waitlist.length === 0 ? (
                      <div className="py-24 text-center bg-white/[0.015] border border-white/[0.06] rounded-2xl text-cream/30">
                        <Users size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm italic font-serif">Waitlist queue is empty.</p>
                        <p className="text-xs mt-1 text-cream/20">Guests who book without a table will appear here.</p>
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">Waiting Guests <span className="text-orange-400 ml-2">{waitlist.length}</span></h3>
                          <p className="text-cream/35 text-[11px]">Assign available tables to seat guests</p>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                          {waitlist.map(w => (
                            <div key={w.id} className="px-6 py-4 flex flex-wrap items-center gap-4">
                              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm shrink-0">
                                #{w.position}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm">{w.name}</p>
                                <p className="text-cream/40 text-xs mt-0.5">👥 {w.guests} guests</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select value={selectedTableIdForBooking} onChange={e => setSelectedTableIdForBooking(e.target.value)}
                                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer">
                                  <option value="">Pick a table…</option>
                                  {tables.filter(t => t.status === "available").map(t => (
                                    <option key={t.id} value={t.id} className="bg-[#0d0a08]">Table {t.table_number} (cap {t.capacity})</option>
                                  ))}
                                </select>
                                <button onClick={() => handleAssignTable(w.id)}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-xs font-black rounded-xl transition cursor-pointer whitespace-nowrap">
                                  Seat Guest
                                </button>
                                <button onClick={() => handleUpdateBookingStatus(w.id, "cancelled")}
                                  className="p-2 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl transition cursor-pointer">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBooking(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="bg-[#0e0b09] border border-white/10 rounded-3xl p-7 w-full max-w-sm relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-base">Reschedule Booking</h3>
                <button onClick={() => setEditingBooking(null)} className="text-cream/40 hover:text-white cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-cream/40 block mb-1.5">New Date</label>
                  <input type="date" required value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-cream/40 block mb-1.5">New Time</label>
                  <select value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-orange-500 cursor-pointer">
                    {["12:00 PM","1:00 PM","2:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM"].map(t => (
                      <option key={t} value={t} className="bg-[#0d0a08]">{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingBooking(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-cream/60 transition cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-sm font-black text-white transition cursor-pointer">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div initial={{ opacity: 0, y: 60, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.85 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1208] border border-orange-500/30 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-black/50 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
            {toastText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
