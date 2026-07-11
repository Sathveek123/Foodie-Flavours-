import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LogIn, Mail, Lock, ArrowLeft, AlertCircle, ShoppingBag, Calendar, 
  RefreshCw, X, ShieldAlert, Trash2, Edit, Check, Users, DollarSign, Flame
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
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
  status: "pending" | "accepted" | "preparing" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
  address: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  refundStatus?: "none" | "requested" | "processing" | "completed" | "denied";
}

interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  tableType: string;
  tableId: string; // References database table ID or number
  tableNumber?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  name: string;
  phone: string;
  waitlisted?: boolean;
}

interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: "available" | "reserved" | "occupied" | "cleaning";
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

  // Dynamic Data States loaded from Supabase
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [foodItemsState, setFoodItemsState] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);

  // Form edit states
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedTableIdForBooking, setSelectedTableIdForBooking] = useState<string>("");

  // Load Admin Data on mount
  useEffect(() => {
    if (adminToken) {
      loadData();

      // Realtime subscription channels for instantaneous updates
      const orderChannel = supabase
        .channel("admin-orders-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
          fetchOrders();
        })
        .subscribe();

      const resChannel = supabase
        .channel("admin-reservations-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
          fetchReservations();
        })
        .subscribe();

      const tableChannel = supabase
        .channel("admin-tables-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => {
          fetchTables();
        })
        .subscribe();

      const profilesChannel = supabase
        .channel("admin-profiles-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
          fetchUserCount();
        })
        .subscribe();

      const foodChannel = supabase
        .channel("admin-food-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "food_items" }, () => {
          fetchFoodItems();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(orderChannel);
        supabase.removeChannel(resChannel);
        supabase.removeChannel(tableChannel);
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(foodChannel);
      };
    }
  }, [adminToken]);

  const loadData = () => {
    fetchOrders();
    fetchReservations();
    fetchTables();
    fetchUserCount();
    fetchFoodItems();
  };

  // 1. Fetch Orders
  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setOrders(data.map((o: any) => ({
        id: o.id,
        date: o.created_at ? o.created_at.split("T")[0] : "",
        items: o.items,
        subtotal: parseFloat(o.subtotal),
        fees: o.fees,
        total: parseFloat(o.total),
        status: o.order_status,
        address: o.delivery_address,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        refundStatus: o.refund_status
      })));
    }
  };

  // 2. Fetch Reservations
  const fetchReservations = async () => {
    const { data, error } = await supabase.from("reservations").select("*, restaurant_tables(table_number)").order("created_at", { ascending: false });
    if (!error && data) {
      // Confirmed bookings (where table_id is assigned)
      const confirmedList: Booking[] = data.filter((b: any) => b.table_id !== null || b.status !== "pending").map((b: any) => ({
        id: b.id,
        date: b.reservation_date,
        time: b.reservation_time,
        guests: b.guest_count,
        tableType: b.dining_package || "Standard Seating",
        tableId: b.table_id || "",
        tableNumber: b.restaurant_tables?.table_number,
        status: b.status,
        name: b.guest_name,
        phone: b.phone || ""
      }));
      setBookings(confirmedList);

      // Pending queue (Waitlist) where table_id is null
      const waitlistQueue: WaitlistEntry[] = data.filter((b: any) => b.table_id === null && b.status === "pending").map((b: any, idx: number) => ({
        id: b.id,
        name: b.guest_name,
        guests: b.guest_count,
        phone: b.phone || "",
        joinedAt: b.created_at,
        position: idx + 1,
        status: b.status === "pending" ? "waiting" : "ready"
      }));
      setWaitlist(waitlistQueue);
    }
  };

  // 3. Fetch Seating Tables
  const fetchTables = async () => {
    const { data, error } = await supabase.from("restaurant_tables").select("*").order("table_number", { ascending: true });
    if (!error && data) {
      setTables(data);
    }
  };

  // 4. Fetch Users Count
  const fetchUserCount = async () => {
    const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      setUserCount(count);
    }
  };

  // 5. Fetch Food Items (stock catalog status)
  const fetchFoodItems = async () => {
    const { data, error } = await supabase.from("food_items").select("*");
    if (!error && data) {
      setFoodItemsState(data);
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

  // 1. Advance Order Status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: Order["status"]) => {
    const { error } = await supabase.from("orders").update({ order_status: nextStatus }).eq("id", orderId);
    if (error) {
      showToast("Error updating order status: " + error.message, "info");
    } else {
      showToast(`Order status updated to [${nextStatus}]`, "success");
      fetchOrders();
    }
  };

  // 2. Manage Refund status
  const handleUpdateRefundStatus = async (orderId: string, nextRefund: Order["refundStatus"]) => {
    const { error } = await supabase.from("orders").update({ refund_status: nextRefund }).eq("id", orderId);
    if (error) {
      showToast("Error updating refund status: " + error.message, "info");
    } else {
      showToast(`Refund status set to: ${nextRefund}`, "success");
      fetchOrders();
    }
  };

  // 3. Confirm Table Reservation check-in / Complete Seating
  const handleUpdateBookingStatus = async (bookingId: string, nextStatus: Booking["status"], tableId?: string) => {
    const { error } = await supabase.from("reservations").update({ status: nextStatus }).eq("id", bookingId);
    if (error) {
      showToast("Error updating reservation status: " + error.message, "info");
      return;
    }

    // If dining finished or cancelled, free table
    if (tableId && (nextStatus === "completed" || nextStatus === "cancelled")) {
      await supabase.from("restaurant_tables").update({ status: "available" }).eq("id", tableId);
    } else if (tableId && nextStatus === "confirmed") {
      await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", tableId);
    }

    showToast(`Reservation #${bookingId.substring(0, 8)} set to: ${nextStatus.toUpperCase()}`, "success");
    fetchReservations();
    fetchTables();
  };

  // 4. Assign physical table to Booking (Seat waitlisted guests)
  const handleAssignTableToBooking = async (bookingId: string) => {
    if (!selectedTableIdForBooking) {
      showToast("Please choose an available seating table", "info");
      return;
    }

    // 1. Assign table to reservation
    const { error } = await supabase.from("reservations").update({
      table_id: selectedTableIdForBooking,
      status: "confirmed"
    }).eq("id", bookingId);

    if (error) {
      showToast("Error assigning table: " + error.message, "info");
      return;
    }

    // 2. Set table status to reserved
    await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", selectedTableIdForBooking);

    showToast("Guest seated and table assigned successfully!", "success");
    setSelectedTableIdForBooking("");
    fetchReservations();
    fetchTables();
  };

  // 5. Update Seating Reservation Schedule
  const handleRescheduleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !rescheduleDate || !rescheduleTime) return;

    const { error } = await supabase.from("reservations").update({
      reservation_date: rescheduleDate,
      reservation_time: rescheduleTime
    }).eq("id", editingBooking.id);

    if (error) {
      showToast("Error rescheduling reservation: " + error.message, "info");
    } else {
      showToast(`Reservation rescheduled successfully!`, "success");
      setEditingBooking(null);
      fetchReservations();
    }
  };

  // 6. Manage Menu Dish Stock and FOMO flags
  const handleToggleDishStock = async (dishId: number, dishName: string, category: string, price: number, nextStock: StockStatus) => {
    const isAvail = nextStock !== "sold_out";
    
    // Upsert into Supabase food_items catalog
    const { error } = await supabase.from("food_items").upsert({
      id: dishId,
      name: dishName,
      category,
      price,
      is_available: isAvail,
      stock_status: nextStock
    });

    if (error) {
      showToast("Failed to update inventory: " + error.message, "info");
    } else {
      showToast(`${dishName} stock set to: ${nextStock.toUpperCase()}`, "success");
      fetchFoodItems();
    }
  };

  // Toggle dynamic Selling Fast flag (FOMO Badge)
  const handleToggleSellingFast = async (dishId: number, dishName: string, category: string, price: number, currentVal: boolean) => {
    const { error } = await supabase.from("food_items").upsert({
      id: dishId,
      name: dishName,
      category,
      price,
      is_selling_fast: !currentVal
    });

    if (error) {
      showToast("Failed to update FOMO tag: " + error.message, "info");
    } else {
      showToast(`${dishName} FOMO badge toggled!`, "success");
      fetchFoodItems();
    }
  };

  // Toast Alerts
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

  // Math Metrics
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;
  const bookedTablesCount = tables.filter(t => t.status === "reserved" || t.status === "occupied").length;
  const refundCount = orders.filter(o => o.refundStatus && o.refundStatus !== "none").length;

  return (
    <div className="min-h-screen bg-[#0d0a08] font-sans text-cream select-none relative overflow-x-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 filter blur-[3px] pointer-events-none" 
        style={{ backgroundImage: "url('/images/combo_deal.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/90 via-[#0d0a08]/95 to-[#0d0a08] z-0 pointer-events-none" />
      <div className="noise-overlay pointer-events-none" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0 opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(90px)",
        }}
      />

      <AnimatePresence mode="wait">
        {!adminToken ? (
          /* AUTH CARD GATED */
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
          /* ADMIN WORKSPACE */
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-8 relative z-10 space-y-8 select-none"
          >
            {/* Top Branding Panel */}
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

            {/* KPI Cards Grid */}
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
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Booked Seating Tables</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-white">{bookedTablesCount} / {tables.length}</h3>
                  <span className="text-[9px] text-green-500 font-bold font-mono">Table Status</span>
                </div>
                <Calendar className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 relative overflow-hidden text-left">
                <span className="text-[9px] uppercase tracking-widest text-cream/40 block">Registered Club Users</span>
                <div className="flex justify-between items-baseline mt-2">
                  <h3 className="text-xl md:text-2xl font-mono font-black text-white">{userCount} users</h3>
                  <span className="text-[9px] text-green-500 font-bold font-mono">Total Database</span>
                </div>
                <Users className="absolute right-3 bottom-3 opacity-5 text-white" size={40} />
              </div>
            </div>

            {/* Tab Controllers */}
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

            {/* Tab view Panels */}
            <div className="relative font-sans text-left">

              {/* TAB 1: SALES OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden">
                    <h4 className="font-serif font-black text-white text-lg">Recent Supabase Orders</h4>
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
                              <th className="py-3 px-2">Total Amount</th>
                              <th className="py-3 px-2">Delivery Status</th>
                              <th className="py-3 px-2">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 5).map(o => (
                              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="py-3.5 px-2 font-mono font-bold text-white max-w-[120px] truncate" title={o.id}>{o.id.substring(0, 8)}...</td>
                                <td className="py-3.5 px-2 text-cream/60">{o.date}</td>
                                <td className="py-3.5 px-2">{o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} items</td>
                                <td className="py-3.5 px-2 text-orange-500 font-mono font-bold">₹{o.total}</td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                    o.status === "delivered" ? "bg-green-500/10 text-green-400" :
                                    o.status === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 font-mono text-[10px]">{o.paymentMethod} &middot; <span className={o.paymentStatus === "paid" ? "text-green-400" : "text-yellow-400"}>{o.paymentStatus}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                    <h4 className="font-serif font-black text-white text-base">Payment Distribution</h4>
                    <div className="space-y-4">
                      {["UPI", "CARD", "COD"].map(method => {
                        const sum = orders.filter(o => o.paymentMethod === method).reduce((s, o) => s + o.total, 0);
                        const pct = totalRevenue > 0 ? Math.round((sum / totalRevenue) * 100) : 0;
                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-white font-bold">{method}</span>
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
                      <p className="font-serif italic text-sm">No orders registered in the system yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div className="text-left">
                              <span className="text-[10px] font-mono text-cream/45">{order.date}</span>
                              <h5 className="font-mono text-xs font-bold text-white mt-0.5">Order ID: #{order.id}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-orange-500 font-mono font-bold text-sm block">₹{order.total}</span>
                              <span className={`text-[8px] font-mono font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-500'}`}>
                                {order.paymentStatus} ({order.paymentMethod})
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-cream/70 text-left font-sans">
                            {order.items?.map((i, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{i.quantity}x {i.name}</span>
                                <span className="font-mono opacity-50">₹{i.price * i.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-[10px] text-cream/45 border-t border-white/5 pt-3 text-left leading-relaxed">
                            📍 <strong>Delivery Address:</strong> {order.address}
                          </div>

                          <div className="flex flex-wrap gap-3 items-center justify-between border-t border-white/5 pt-4">
                            <div className="space-y-1.5 text-left">
                              <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Advance Status</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {["accepted", "preparing", "packed", "out_for_delivery", "delivered"].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateOrderStatus(order.id, status as any)}
                                    className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                      order.status === status 
                                        ? "bg-orange-500 border-orange-500 text-[#0d0a08]" 
                                        : "bg-white/5 border-white/10 hover:border-white/20 text-cream"
                                    }`}
                                  >
                                    {status.split("_").map(s => s[0]).join("")}
                                  </button>
                                ))}
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                                  className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                    order.status === "cancelled" 
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
                              <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Refund Status</span>
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
                      <p className="font-serif italic text-sm">No dine-in bookings found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map(book => (
                        <div key={book.id} className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div className="text-left">
                              <span className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-wider">
                                Booking ID: #{book.id.substring(0, 8)}...
                              </span>
                              <h5 className="font-serif font-black text-white text-base mt-0.5">{book.name}</h5>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                              book.status === "completed" ? "bg-green-500/10 text-green-400" :
                              book.status === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                            }`}>
                              {book.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-sans text-left text-cream/70">
                            <div>📞 <strong>Phone:</strong> {book.phone || "No Phone"}</div>
                            <div>👥 <strong>Guests size:</strong> {book.guests} persons</div>
                            <div>📅 <strong>Schedule:</strong> {book.date}</div>
                            <div>⏰ <strong>Slot time:</strong> {book.time}</div>
                            <div className="col-span-2">🛋️ <strong>Seating Table:</strong> {book.tableNumber ? `Table ${book.tableNumber}` : "Not Assigned"}</div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/5 items-center justify-between">
                            <div className="flex gap-2">
                              {/* Seating check-in toggles */}
                              {book.status === "confirmed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(book.id, "completed", book.tableId)}
                                  className="px-3 py-1.5 bg-green-500 text-[#0d0a08] text-[10px] font-bold rounded-lg transition hover:bg-green-400 cursor-pointer"
                                >
                                  End Seating &amp; Free Table
                                </button>
                              )}
                              {book.status !== "cancelled" && book.status !== "completed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(book.id, "cancelled", book.tableId)}
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
                    <span className="text-[9px] uppercase font-mono tracking-widest text-cream/40">Overrides Live Synced</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(DISH_DATA).flatMap(([category, list]) => list.map(d => ({ ...d, category }))).map(dish => {
                      const matchItem = foodItemsState.find(f => f.id === dish.id);
                      const curStock = matchItem ? matchItem.stock_status : "available";
                      const isFomo = matchItem ? matchItem.is_selling_fast : false;

                      return (
                        <div key={dish.id} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <img src={dish.image} className="w-12 h-12 object-cover rounded-xl bg-white/5 shrink-0" alt={dish.name} />
                              <div className="text-left">
                                <h6 className="font-bold text-white text-xs leading-snug">{dish.name}</h6>
                                <p className="text-[9px] text-cream/40 mt-1 font-mono">₹{dish.price} &middot; ID: {dish.id}</p>
                              </div>
                            </div>

                            {/* Selling Fast tag toggle */}
                            <button
                              onClick={() => handleToggleSellingFast(dish.id, dish.name, dish.category, dish.price, isFomo)}
                              className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                                isFomo 
                                  ? "bg-orange-500/10 border-orange-500 text-orange-500" 
                                  : "bg-white/5 border-white/10 hover:border-white/20 text-cream/40"
                              }`}
                              title="Toggle FOMO 'Selling Fast' tag badge"
                            >
                              <Flame size={14} className={isFomo ? "animate-pulse" : ""} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-[8px] uppercase tracking-wider text-cream/40 font-mono block">Stock status</span>
                            <div className="flex gap-1 bg-black/40 border border-white/10 p-0.5 rounded-lg shrink-0">
                              {[
                                { id: "available", label: "✅", title: "Available" },
                                { id: "low", label: "⚠️", title: "Low Stock" },
                                { id: "sold_out", label: "🚫", title: "Sold Out" }
                              ].map(st => (
                                <button
                                  key={st.id}
                                  onClick={() => handleToggleDishStock(dish.id, dish.name, dish.category, dish.price, st.id as any)}
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
                              <th className="py-3 px-2">Guests Count</th>
                              <th className="py-3 px-2">Assign Physical Table</th>
                              <th className="py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {waitlist.map(w => (
                              <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="py-4 px-2 font-mono font-bold text-orange-500">#{w.position}</td>
                                <td className="py-4 px-2 font-bold text-white">{w.name}</td>
                                <td className="py-4 px-2">{w.guests} guests</td>
                                <td className="py-4 px-2">
                                  <div className="flex gap-2 items-center">
                                    <select
                                      value={selectedTableIdForBooking}
                                      onChange={(e) => setSelectedTableIdForBooking(e.target.value)}
                                      className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer"
                                    >
                                      <option value="">Choose Seated Table...</option>
                                      {tables.filter(t => t.status === "available").map(t => (
                                        <option key={t.id} value={t.id}>
                                          Table {t.table_number} (Cap: {t.capacity})
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAssignTableToBooking(w.id)}
                                      className="px-3 py-1 bg-green-500 text-black font-bold rounded-lg text-[10px] uppercase hover:bg-green-400 transition cursor-pointer"
                                    >
                                      Seat Guest
                                    </button>
                                  </div>
                                </td>
                                <td className="py-4 px-2">
                                  <button
                                    onClick={() => handleUpdateBookingStatus(w.id, "cancelled")}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition cursor-pointer"
                                    title="Cancel reservation entry"
                                  >
                                    <Trash2 size={12} />
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
