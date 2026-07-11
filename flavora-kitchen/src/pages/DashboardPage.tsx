import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { 
  LogOut, 
  Search, 
  Plus, 
  Clock, 
  Compass, 
  PhoneCall, 
  MessageSquare, 
  Share2, 
  MapPinned, 
  ExternalLink, 
  ChevronDown, 
  User, 
  Check, 
  Flame, 
  Star,
  CheckCircle2,
  CalendarDays,
  ShoppingBag,
  Heart,
  ChevronRight,
  Send,
  MapPin,
  CreditCard,
  Percent,
  RefreshCw,
  Award,
  HelpCircle,
  Truck,
  MessageCircle,
  Sliders,
  Calendar,
  Users,
  Lock,
  Sunset,
  Trees,
  Crown,
  AppWindow,
  Sparkles,
  ChevronLeft,
  X,
  AlertTriangle,
  Package,
  UserCog,
  Link2,
  Copy,
  Navigation,
  Clock3,
  Bell,
  ShieldCheck,
  Salad,
  Edit3,
  Phone,
  BadgeCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { VOUCHERS } from "../config/vouchers";
import { jsPDF } from "jspdf";
import { ReservationModal } from "../components/ReservationModal";
import { playAddToCartSound, playDrawerOpenSound } from "../lib/sounds";
import { DISH_DATA, MenuPreviewDish } from "../components/MenuPreviewTabs";
import { solveMealPlan, MealPlanResult, MealPlanItem, MappedDish, getMappedDishes } from "../lib/plannerSolver";
import { getDeliveryZone } from "../lib/deliveryZone";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Stock status type for inventory feature
type StockStatus = "available" | "low" | "sold_out";

// Stock map: dish id → stock status (simulated)
// TODO: real backend required — replace with an API call to inventory service
const DISH_STOCK: Record<number, StockStatus> = {
  101: "available", 102: "available", 103: "available", 104: "low",
  105: "available", 106: "sold_out", 107: "available", 108: "available",
  109: "available", 110: "low", 111: "sold_out",
  201: "available", 202: "available", 203: "available", 204: "available",
  205: "low", 206: "available", 207: "available", 208: "sold_out",
  209: "available", 210: "available", 211: "available",
  301: "available", 302: "available", 303: "low", 304: "available",
  305: "available", 306: "available", 307: "sold_out",
  401: "available", 402: "available", 403: "available", 404: "available",
  405: "low", 406: "available", 407: "available", 408: "available"
};

// Flatten and map category names
const CATEGORIES = ["All", "Starters", "Main Course", "Desserts", "Drinks"] as const;

interface CustomizationOptions {
  size: "Small" | "Medium" | "Large" | "Regular";
  crust: "Thin" | "Cheese Burst" | "Pan" | "None";
  toppings: string[];
  spiceLevel: "Mild" | "Medium" | "Spicy";
  extras: string[];
  instructions: string;
}

interface Address {
  id: string;
  type: "Home" | "Work" | "Friends House" | "Other";
  addressLine: string;
  coords?: { lat: number; lng: number };
}

// ── Tier 2 Interfaces ──────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  phone: string;
  birthday: string;
  allergens: string[];
  preferredPayment: "upi" | "card" | "cod" | "split";
  dietaryPref: "any" | "veg" | "non-veg" | "vegan";
}

interface GroupOrderMember {
  id: string;
  name: string;
  phone: string;
  items: { name: string; price: number }[];
  paid: boolean;
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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: Partial<CustomizationOptions>;
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
  status: "Order Placed" | "Accepted" | "Preparing" | "Packed" | "Out For Delivery" | "Delivered";
  address: Address;
  paymentMethod: string;
  rider?: {
    name: string;
    phone: string;
    rating: string;
    avatar: string;
  };
  reviewSubmitted?: boolean;
  review?: {
    rating: number;
    comment: string;
    riderRating: number;
  };
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  isBooked: boolean;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  duration: string;
  tableType: string;
  tableId: string;
  event: string;
  diningPackage: string;
  requests: string[];
  status: "Confirmed" | "Seated" | "Completed" | "Cancelled";
  emailNotification: boolean;
  smsNotification: boolean;
  reminders: {
    alert24h: boolean;
    alert2h: boolean;
    alertNav: boolean;
  };
  waitlisted: boolean;
  waitlistPosition?: number;
  feedbackSubmitted?: boolean;
  feedback?: {
    food: number;
    ambience: number;
    service: number;
    comment: string;
  };
}

function FocalGlowBloom({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{
        scale: [0.95, 1.05, 0.95],
        opacity: [0.08, 0.12, 0.08]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute rounded-full pointer-events-none select-none z-0 ${className}`}
      style={{
        background: "radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(249,115,22,0) 70%)",
        filter: "blur(40px)"
      }}
    />
  );
}

function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(coords);
  }, [coords, map]);
  return null;
}

const outletIcon = typeof window !== "undefined" ? L.divIcon({
  html: `<div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-6 w-6 rounded-full bg-green-400/30 opacity-75 animate-ping"></span>
           <div class="w-4.5 h-4.5 rounded-full bg-green-500 border border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-white z-10">H</div>
         </div>`,
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
}) : null as any;

const destinationIcon = typeof window !== "undefined" ? L.divIcon({
  html: `<div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-6 w-6 rounded-full bg-red-400/30 opacity-75 animate-ping"></span>
           <div class="w-4.5 h-4.5 rounded-full bg-red-500 border border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-white z-10">D</div>
         </div>`,
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
}) : null as any;

const riderIcon = typeof window !== "undefined" ? L.divIcon({
  html: `<div class="relative flex items-center justify-center">
           <span class="absolute -inset-1.5 rounded-full bg-orange-500/30 animate-ping"></span>
           <div class="w-7 h-7 rounded-full bg-orange-500 border border-white text-white flex items-center justify-center shadow-lg text-sm z-10">🛵</div>
         </div>`,
  className: "custom-div-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 14]
}) : null as any;

const getTableTypeIcon = (type: string) => {
  switch (type) {
    case "Couple Table": return <Heart className="w-3.5 h-3.5" />;
    case "Family Table": return <Users className="w-3.5 h-3.5" />;
    case "Private Cabin": return <Lock className="w-3.5 h-3.5" />;
    case "Rooftop": return <Sunset className="w-3.5 h-3.5" />;
    case "Outdoor": return <Trees className="w-3.5 h-3.5" />;
    case "Window Seat": return <AppWindow className="w-3.5 h-3.5" />;
    case "VIP Room": return <Crown className="w-3.5 h-3.5" />;
    default: return <Calendar className="w-3.5 h-3.5" />;
  }
};

interface OverviewTiltCardProps {
  onClick: () => void;
  emoji: string;
  title: string;
  description: string;
}

function OverviewTiltCard({ onClick, emoji, title, description }: OverviewTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 100, mass: 1.0 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const pointerX = (e.clientX - rect.left) / rect.width - 0.5;
    const pointerY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(pointerX);
    y.set(pointerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-orange-500/30 p-6 rounded-3xl flex items-center gap-5 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-orange-500/5 group flex-1"
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10">
        {emoji}
      </div>
      <div className="flex-1 text-left relative z-10">
        <h4 className="font-serif font-black text-white text-lg tracking-tight group-hover:text-orange-500 transition-colors">
          {title}
        </h4>
        <p className="text-cream/50 text-xs mt-1 leading-snug">
          {description}
        </p>
      </div>
      <span className="text-orange-500 text-lg group-hover:translate-x-1.5 transition-transform duration-300 relative z-10">➔</span>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const lenis = useLenis();

  // Flatten catalog items
  const allDishesList = Object.entries(DISH_DATA).flatMap(
    ([categoryName, dishes]) => dishes.map((dish) => {
      const rating = 4.2 + (dish.id % 9) * 0.1;
      const popularity = (dish.id * 17) % 150 + 20;
      const costForTwo = dish.price * 2;
      const isVegan = dish.isVeg && dish.id % 2 === 0;
      const isPureVeg = dish.isVeg;
      return {
        ...dish,
        category: categoryName,
        rating,
        popularity,
        costForTwo,
        isVegan,
        isPureVeg
      };
    })
  );

  // Navigation Controller Tabs
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "planner" | "bookings" | "checkout" | "tracking" | "history" | "loyalty" | "favorites" | "support" | "profile">("home");

  // Smart Meal Planner States
  const [plannerStep, setPlannerStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [planBudget, setPlanBudget] = useState<number>(500);
  const [planPeopleCount, setPlanPeopleCount] = useState<number>(1);
  const [planDietFilter, setPlanDietFilter] = useState<"any" | "veg" | "non-veg" | "vegan">("any");
  const [planOccasion, setPlanOccasion] = useState<"casual" | "date" | "family" | "celebration" | "quick-bite">("casual");
  const [planVegCount, setPlanVegCount] = useState<number>(1);
  const [planNonVegCount, setPlanNonVegCount] = useState<number>(0);
  const [plannerLoading, setPlannerLoading] = useState<boolean>(false);
  const [plannerResult, setPlannerResult] = useState<MealPlanResult | null>(null);
  const [swapTargetItem, setSwapTargetItem] = useState<MealPlanItem | null>(null);

  // Global Dropdown navbar state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time tracking
  const [currentTime, setCurrentTime] = useState(new Date());

  // Interactive Reservation Modal (legacy landing page connector)
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Dynamic Toast Notifications
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  // Favorites System from global context
  const { favorites, toggleFavorite: contextToggleFavorite, isFavorited } = useFavorites();

  // Upsell Strip States
  const [upsellSuggestion, setUpsellSuggestion] = useState<any | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [lastCartLength, setLastCartLength] = useState(0);

  // Voucher states
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);

  // Addresses System
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    { id: "A1", type: "Home", addressLine: "Royal Heights Court, Block 3, Nallasopara West", coords: { lat: 19.4124, lng: 72.8258 } },
    { id: "A2", type: "Work", addressLine: "IT Tech Park, Wing B, Level 11, Mumbai", coords: { lat: 19.0760, lng: 72.8777 } },
    { id: "A3", type: "Friends House", addressLine: "Seaside Apartments, Block 4, Bandra West", coords: { lat: 19.0544, lng: 72.8294 } }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("A1");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressType, setNewAddressType] = useState<Address["type"]>("Home");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [simulatedCoords, setSimulatedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // ── TIER 2: Customer Profile System ──────────────────────────────────────
  // TODO: real backend required — persist to user profile DB
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem("flavora_user_profile");
      return stored ? JSON.parse(stored) : {
        name: "",
        phone: "",
        birthday: "",
        allergens: [],
        preferredPayment: "upi" as const,
        dietaryPref: "any" as const
      };
    } catch { return { name: "", phone: "", birthday: "", allergens: [], preferredPayment: "upi", dietaryPref: "any" }; }
  });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(userProfile);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return localStorage.getItem("flavora_profile_photo") || null;
  });
  
  // Mock sessions state for session management (Tier 3)
  const [activeSessions, setActiveSessions] = useState(() => {
    try {
      const stored = localStorage.getItem("flavora_active_sessions");
      return stored ? JSON.parse(stored) : [
        { id: "S1", device: "Windows PC", browser: "Chrome Browser", ip: "192.168.1.12", location: "Mumbai, India", current: true, date: "Active Now" },
        { id: "S2", device: "iPhone 14 Pro", browser: "Safari Mobile", ip: "103.44.156.8", location: "Pune, India", current: false, date: "Last active: 2 hours ago" }
      ];
    } catch {
      return [];
    }
  });

  const handleSimulatePhotoUpload = () => {
    const mockAvatars = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150"
    ];
    const picked = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
    setProfilePhoto(picked);
    localStorage.setItem("flavora_profile_photo", picked);
    showToast("📸 Profile avatar photo updated!", "success");
  };

  const handleLogoutAllDevices = () => {
    // Keep only the current session device
    const current = activeSessions.filter(s => s.current);
    setActiveSessions(current);
    localStorage.setItem("flavora_active_sessions", JSON.stringify(current));
    showToast("Logged out of all other devices successfully", "success");
  };

  const ALLERGEN_OPTIONS = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Sesame", "Fish"];

  // Load and reactively sync menu dish stock overrides from Supabase in real-time
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [dbFoodItems, setDbFoodItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch & Subscribe to restaurant_tables
    const fetchTables = async () => {
      const { data } = await supabase.from("restaurant_tables").select("*").order("table_number", { ascending: true });
      if (data) setDbTables(data);
    };
    fetchTables();
    const tablesChannel = supabase
      .channel("public-tables-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => {
        fetchTables();
      })
      .subscribe();

    // 2. Fetch & Subscribe to food_items
    const fetchFoodItems = async () => {
      const { data } = await supabase.from("food_items").select("*");
      if (data) setDbFoodItems(data);
    };
    fetchFoodItems();
    const foodChannel = supabase
      .channel("public-food-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "food_items" }, () => {
        fetchFoodItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tablesChannel);
      supabase.removeChannel(foodChannel);
    };
  }, [user]);

  // Helper selectors
  const getDishStockStatus = (dishId: number): StockStatus => {
    const match = dbFoodItems.find(f => f.id === dishId);
    if (match) return match.stock_status as StockStatus;
    return DISH_STOCK[dishId] || "available";
  };

  const isDishSellingFast = (dishId: number): boolean => {
    const match = dbFoodItems.find(f => f.id === dishId);
    return match ? match.is_selling_fast : false;
  };

  // ── TIER 2: Delivery Zone Validation ────────────────────────────────────
  // Delivery fee is now computed from Haversine distance (see fee calc below)
  // The selected address drives the zone check reactively

  // ── TIER 2: Dining Queue / Waitlist ──────────────────────────────────────
  // TODO: real backend required — replace with WebSocket queue subscription
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(() => {
    try {
      const stored = localStorage.getItem("flavora_waitlist");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistGuests, setWaitlistGuests] = useState(2);
  // Simulate "slots full" state (after 3 confirmed bookings the tables fill)
  const allSlotsBooked = false; // set true when table count saturates

  // ── TIER 2: Group Ordering ───────────────────────────────────────────────
  // TODO: real backend required — replace with shared server session via WS
  const [groupOrderActive, setGroupOrderActive] = useState(false);
  const [groupOrderSessionId, setGroupOrderSessionId] = useState("");
  const [groupOrderMembers, setGroupOrderMembers] = useState<GroupOrderMember[]>([]);
  const [groupOrderLinkCopied, setGroupOrderLinkCopied] = useState(false);
  const [showGroupOrderPanel, setShowGroupOrderPanel] = useState(false);

  // Menu States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg" | "vegan">("all");
  const [costFilter, setCostFilter] = useState<"all" | "under300" | "under500">("all");
  const [menuSort, setMenuSort] = useState<"relevance" | "rating" | "costLow" | "costHigh" | "popularity">("relevance");

  // Item Customization Details modal
  const [selectedDishForDetails, setSelectedDishForDetails] = useState<(MenuPreviewDish & { category: string }) | null>(null);
  const [customOptions, setCustomOptions] = useState<CustomizationOptions>({
    size: "Regular",
    crust: "Thin",
    toppings: [],
    spiceLevel: "Medium",
    extras: [],
    instructions: ""
  });

  // Checkout configurations
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [deliveryTip, setDeliveryTip] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"upi" | "card" | "cod" | "split">("upi");
  
  // Payment Form variables
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCardCheckbox, setSaveCardCheckbox] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState("");
  const [splitCount, setSplitCount] = useState<number>(2);
  const [splitPhone, setSplitPhone] = useState("");
  const [splitSuccess, setSplitSuccess] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Active Order & Live Tracking Map
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const stored = localStorage.getItem("flavora_active_order");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Live map animated vehicle progress (0 to 100)
  const [mapProgress, setMapProgress] = useState(0);

  // Real road coordinates for Leaflet route
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!activeOrder?.address) return;
    const startLat = 19.4180;
    const startLng = 72.8200;
    const destLat = activeOrder.address.coords?.lat || 19.4124;
    const destLng = activeOrder.address.coords?.lng || 72.8258;

    let isMounted = true;
    fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (isMounted && data.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
        }
      })
      .catch(err => {
        console.warn("OSRM Route fetch failed, falling back to straight line:", err);
        if (isMounted) {
          setRouteCoords([
            [startLat, startLng],
            [destLat, destLng]
          ]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeOrder?.address]);

  const getRiderPosition = (): [number, number] => {
    if (routeCoords.length === 0) return [19.4180, 72.8200];
    const index = Math.min(
      routeCoords.length - 1,
      Math.floor((mapProgress / 100) * routeCoords.length)
    );
    return routeCoords[index];
  };

  // Order history ledger
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("flavora_order_history");
      return stored ? JSON.parse(stored) : [
        {
          id: "FL-8742",
          date: "2026-06-20",
          items: [
            { id: "101", name: "Crunchy Spring Rolls", price: 280, quantity: 2, image: "/images/springroll1.png" },
            { id: "203", name: "Creamy Alfredo Pasta", price: 520, quantity: 1, image: "/images/pasta1.png" }
          ],
          subtotal: 1080,
          fees: { gst: 54, delivery: 40, platform: 10, tip: 20 },
          total: 1204,
          status: "Delivered",
          address: { id: "A1", type: "Home", addressLine: "Royal Heights Court, Block 3, Nallasopara West" },
          paymentMethod: "UPI",
          reviewSubmitted: true,
          review: { rating: 5, comment: "Exceptional spring rolls, very creamy pasta!", riderRating: 5 }
        }
      ];
    } catch {
      return [];
    }
  });

  // Review Modal state
  const [reviewOrderTarget, setReviewOrderTarget] = useState<Order | null>(null);
  const [foodRating, setFoodRating] = useState(5);
  const [riderRating, setRiderRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [simulatedReviewImage, setSimulatedReviewImage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Loyalty rewards Points Program
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("flavora_loyalty_points");
      return stored ? Number(stored) : 240;
    } catch {
      return 240;
    }
  });
  const [referralCopied, setReferralCopied] = useState(false);

  // Support messages chat state
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem("flavora_support_chat");
      return stored ? JSON.parse(stored) : [
        { id: "M1", sender: "bot", text: "Hello! I am Flavora's gourmet concierge chatbot. Ask me about your order status, refunds, or rewards points!", timestamp: new Date() }
      ];
    } catch {
      return [
        { id: "M1", sender: "bot", text: "Hello! I am Flavora's gourmet concierge chatbot. Ask me about your order status, refunds, or rewards points!", timestamp: new Date() }
      ];
    }
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // 🍽️ TABLE BOOKING STATE VARIABLES
  // -------------------------------------------------------------
  const [savedBookings, setSavedBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem("flavora_bookings");
      return stored ? JSON.parse(stored) : [
        {
          id: "FL-BOOK-89104",
          date: "2026-06-20",
          time: "20:00",
          guests: 4,
          duration: "2h",
          tableType: "Family Table",
          tableId: "F1",
          event: "Anniversary Celebration",
          diningPackage: "Romantic Package",
          requests: ["Window table", "Anniversary setup"],
          status: "Completed",
          emailNotification: true,
          smsNotification: true,
          reminders: { alert24h: true, alert2h: true, alertNav: true },
          waitlisted: false,
          feedbackSubmitted: true,
          feedback: { food: 5, ambience: 5, service: 5, comment: "Splendid decoration and excellent hospitality." }
        }
      ];
    } catch {
      return [];
    }
  });

  // Table Wizard configurations
  const [bookingDate, setBookingDate] = useState("2026-06-25");
  const [bookingTime, setBookingTime] = useState("19:00");
  const [bookingGuests, setBookingGuests] = useState<number>(2);
  const [bookingDuration, setBookingDuration] = useState<string>("2h");
  const [bookingTableType, setBookingTableType] = useState<string>("Couple Table");
  const [bookingTableId, setBookingTableId] = useState<string | null>(null);
  const [bookingEvent, setBookingEvent] = useState<string>("Standard Dining");
  const [bookingPackage, setBookingPackage] = useState<string>("Standard Seating");
  const [bookingRequests, setBookingRequests] = useState<string[]>([]);
  const [emailNotification, setEmailNotification] = useState(true);
  const [smsNotification, setSmsNotification] = useState(true);

  // Reservation management modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeBookingTarget, setUpgradeBookingTarget] = useState<Booking | null>(null);
  const [upgradeTableType, setUpgradeTableType] = useState("Private Cabin");

  const [showAddGuestsModal, setShowAddGuestsModal] = useState(false);
  const [addGuestsTarget, setAddGuestsTarget] = useState<Booking | null>(null);
  const [addGuestsCount, setAddGuestsCount] = useState<number>(2);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackBookingTarget, setFeedbackBookingTarget] = useState<Booking | null>(null);
  const [feedbackFoodScore, setFeedbackFoodScore] = useState(5);
  const [feedbackAmbienceScore, setFeedbackAmbienceScore] = useState(5);
  const [feedbackServiceScore, setFeedbackServiceScore] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Static options configurations
  const TABLE_TYPES = [
    { type: "Couple Table", capacity: 2, desc: "Intimate seating perfect for romantic dinners." },
    { type: "Family Table", capacity: 6, desc: "Spacious seating ideal for family get-togethers." },
    { type: "Private Cabin", capacity: 4, desc: "Sound-insulated room for corporate meetings." },
    { type: "Rooftop", capacity: 4, desc: "Open-sky tables with beautiful panorama views." },
    { type: "Outdoor", capacity: 8, desc: "Dining under beautiful fairy light configurations." },
    { type: "Window Seat", capacity: 2, desc: "Glass pane views overlooking the garden skyline." },
    { type: "VIP Room", capacity: 12, desc: "Executive suite with dedicated butler call panel." }
  ];

  const TIME_SLOTS: TimeSlot[] = [
    { time: "12:00 PM", isBooked: false },
    { time: "1:00 PM", isBooked: false },
    { time: "2:00 PM", isBooked: false },
    { time: "6:30 PM", isBooked: true },
    { time: "7:00 PM", isBooked: false },
    { time: "7:30 PM", isBooked: true },
    { time: "8:00 PM", isBooked: false },
    { time: "8:30 PM", isBooked: true },
    { time: "9:00 PM", isBooked: false },
    { time: "9:30 PM", isBooked: false },
    { time: "10:00 PM", isBooked: false }
  ];

  const EVENT_TYPES = [
    "Standard Dining",
    "Birthday party",
    "Corporate dinner",
    "Family gathering",
    "Engagement celebration"
  ];

  const DINING_PACKAGES = [
    { name: "Standard Seating", price: 0, desc: "Standard slot table allocation and menu access." },
    { name: "Romantic Package", price: 1500, desc: "Adds candles, rose petals layout, and custom mood lights." },
    { name: "Family Package", price: 2500, desc: "Adds balloon setup and custom baked starter cake." },
    { name: "Premium Tasting Menu", price: 3000, desc: "Pre-set multi-course tasting items customized by Chef Mario." },
    { name: "Chef Experience", price: 5000, desc: "Exclusive visual live plating demonstration directly at your table." }
  ];

  const SPECIAL_REQUESTS = [
    "Birthday setup",
    "Anniversary setup",
    "Wheelchair access",
    "Baby chair",
    "Window table",
    "Quiet area"
  ];

  // Dynamic Visual tables layout based on selected type loaded from Supabase
  const getSeatingTablesForType = (type: string): SeatingTable[] => {
    if (dbTables.length === 0) {
      // Fallback seed if database tables aren't fetched yet
      return [
        { id: `${type.substring(0, 2)}-01`, name: "Table 01", capacity: 2, isBooked: false },
        { id: `${type.substring(0, 2)}-02`, name: "Table 02", capacity: 4, isBooked: true },
        { id: `${type.substring(0, 2)}-03`, name: "Table 03", capacity: 2, isBooked: false },
        { id: `${type.substring(0, 2)}-04`, name: "Table 04", capacity: 6, isBooked: false },
        { id: `${type.substring(0, 2)}-05`, name: "Table 05", capacity: 12, isBooked: false }
      ];
    }
    return dbTables.map(t => ({
      id: t.id,
      name: `Table ${t.table_number}`,
      capacity: t.capacity,
      isBooked: t.status !== "available"
    }));
  };

  // Fee calculations
  const gstAmount = Math.round(cartTotal * 0.05);
  // Delivery zone fee computed from Haversine distance
  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
  const deliveryZone = getDeliveryZone(selectedAddr?.coords);
  const baseDeliveryFee = cartTotal > 0 ? deliveryZone.fee : 0;
  const deliveryFee = appliedVoucher?.type === "free_shipping" ? 0 : baseDeliveryFee;
  const platformFee = cartTotal > 0 ? 10 : 0;
  
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === "percent") {
      discountAmount = Math.round(cartTotal * (appliedVoucher.value / 100));
    } else if (appliedVoucher.type === "flat") {
      discountAmount = Math.min(cartTotal, appliedVoucher.value);
    }
  }
  const totalAmountPayable = cartTotal > 0 ? Math.max(0, cartTotal + gstAmount + deliveryFee + platformFee + deliveryTip - discountAmount) : 0;

  // showToast utility helper definition
  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  // User auth details parsing
  const getRawName = () => {
    const meta = user?.user_metadata;
    if (meta?.name) return meta.name;
    if (meta?.full_name) return meta.full_name;
    if (meta?.display_name) return meta.display_name;
    if (user?.email && user.email.toLowerCase().includes("rethveeknalla")) {
      return "Sathveek Nalla";
    }
    return (user?.email ? user.email.split("@")[0] : "") || "Gourmet Guest";
  };
  const rawDisplayName = getRawName();

  const formatName = (str: string) => {
    if (!str) return "";
    const cleaned = str.replace(/[._-]/g, " ").replace(/[0-9]/g, "");
    return cleaned
      .split(" ")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const userDisplayName = formatName(rawDisplayName);
  const firstName = userDisplayName.split(" ")[0];
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  // Time-aware greeting helpers
  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    if (hours < 21) return "Good evening";
    return "Good night";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Operating status helpers
  const isOpen = () => {
    const hours = currentTime.getHours();
    return hours >= 11 && hours < 23; // 11 AM to 11 PM
  };

  const getOperatingStatusText = () => {
    if (isOpen()) {
      return "Accepting orders and bookings now!";
    } else {
      return "Closed. Pre-book table slots for tomorrow!";
    }
  };

  // Live ticking timer logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Extra missing event actions
  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: ""
      }, item.quantity);
    });
    playAddToCartSound();
    setActiveTab("checkout");
    showToast("Reordered previous items into your checkout cart!", "success");
  };

  // ── TIER 2: Profile handler ───────────────────────────────────────────────
  const handleSaveProfile = () => {
    setUserProfile(profileDraft);
    localStorage.setItem("flavora_user_profile", JSON.stringify(profileDraft));
    setProfileEditMode(false);
    showToast("Profile updated successfully!", "success");
  };

  // ── TIER 2: Waitlist handler ──────────────────────────────────────────────
  const handleJoinWaitlist = () => {
    if (!waitlistName.trim() || !waitlistPhone.trim()) {
      showToast("Please fill in your name and phone", "error");
      return;
    }
    const entry: WaitlistEntry = {
      id: `WL-${Date.now()}`,
      name: waitlistName.trim(),
      guests: waitlistGuests,
      phone: waitlistPhone.trim(),
      joinedAt: new Date().toISOString(),
      position: waitlistEntries.length + 1,
      status: "waiting"
    };
    const updated = [...waitlistEntries, entry];
    setWaitlistEntries(updated);
    localStorage.setItem("flavora_waitlist", JSON.stringify(updated));
    setShowWaitlistModal(false);
    setWaitlistName(""); setWaitlistPhone(""); setWaitlistGuests(2);
    showToast(`Added to waitlist at position #${entry.position}`, "success");
    // TODO: real backend required — send SMS/push via notification service
    // Simulate queue movement after 8s
    setTimeout(() => {
      setWaitlistEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, status: "ready", position: 1 } : e
      ));
      showToast(`🎉 Your table is ready, ${entry.name}! Please proceed to reception.`, "success");
    }, 8000);
  };

  // ── TIER 2: Group Order handler ───────────────────────────────────────────
  const handleStartGroupOrder = () => {
    // TODO: real backend required — generate shared cart session via API
    const sessionId = `GRP-${Date.now().toString(36).toUpperCase()}`;
    setGroupOrderSessionId(sessionId);
    setGroupOrderActive(true);
    setGroupOrderMembers([
      {
        id: "self",
        name: userDisplayName || "You (Host)",
        phone: userProfile.phone || "Host",
        items: cart.map(i => ({ name: i.name, price: i.price * i.quantity })),
        paid: false
      }
    ]);
    setShowGroupOrderPanel(true);
    showToast("Group order session started! Share the link with friends.", "success");
  };

  const handleCopyGroupLink = () => {
    const link = `https://flavora.kitchen/join/${groupOrderSessionId}`;
    navigator.clipboard?.writeText(link).then(() => {
      setGroupOrderLinkCopied(true);
      setTimeout(() => setGroupOrderLinkCopied(false), 3000);
    }).catch(() => showToast("Could not copy link", "error"));
    showToast("Group order link copied!", "success");
  };

  const handleSimulateGroupMember = () => {
    // TODO: real backend required — receive member add events via WebSocket
    const mockNames = ["Priya S.", "Arjun K.", "Meera R.", "Dev T."];
    const existingNames = groupOrderMembers.map(m => m.name);
    const available = mockNames.filter(n => !existingNames.includes(n));
    if (available.length === 0) { showToast("All mock members already joined", "info"); return; }
    const newMember: GroupOrderMember = {
      id: `M-${Date.now()}`,
      name: available[0],
      phone: `+91 98${Math.floor(Math.random()*10000000)}`,
      items: [],
      paid: false
    };
    setGroupOrderMembers(prev => [...prev, newMember]);
    showToast(`${newMember.name} joined the group order!`, "success");
  };

  const getGroupOrderTotal = () =>
    groupOrderMembers.reduce((sum, m) =>
      sum + m.items.reduce((s, i) => s + i.price, 0), 0);


  const handleDownloadInvoice = (order: Order) => {
    try {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [26, 26, 26]; // #1a1a1a
      const accentColor = [249, 115, 22]; // #f97316 (orange)
      const lightGray = [229, 229, 229]; // #e5e7eb
      const darkGray = [100, 100, 100];
      
      // Header
      doc.setFont("Times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("FLAVORA KITCHEN", 20, 25);
      
      doc.setFont("Times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("A Premium Gourmet Dining Experience", 20, 31);
      
      // Divider
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(1.5);
      doc.line(20, 36, 190, 36);
      
      // Invoice Details Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("INVOICE", 20, 48);
      
      // Invoice Meta details
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`Invoice ID: ${order.id}`, 20, 56);
      doc.text(`Date: ${order.date}`, 20, 62);
      doc.text(`Payment: ${order.paymentMethod}`, 20, 68);
      
      // Delivery Address Box on the right
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Delivery Address:", 110, 48);
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      const addressText = doc.splitTextToSize(order.address?.addressLine || "N/A", 75);
      doc.text(addressText, 110, 56);
      
      // Table Header for items
      let currentY = 82;
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, currentY, 170, 8, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("Gourmet Item Description", 24, currentY + 5.5);
      doc.text("Qty", 125, currentY + 5.5);
      doc.text("Price", 145, currentY + 5.5);
      doc.text("Total", 170, currentY + 5.5);
      
      // Table Rows
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      currentY += 8;
      
      order.items.forEach((item) => {
        // Draw gray row line
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.5);
        doc.line(20, currentY + 8, 190, currentY + 8);
        
        doc.text(item.name, 24, currentY + 5.5);
        doc.text(String(item.quantity), 125, currentY + 5.5);
        doc.text(`INR ${item.price}`, 145, currentY + 5.5);
        doc.text(`INR ${item.price * item.quantity}`, 170, currentY + 5.5);
        
        currentY += 8;
      });
      
      // Summary Matrix
      currentY += 10;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      doc.text("Subtotal:", 130, currentY);
      doc.text(`INR ${order.subtotal}`, 170, currentY);
      currentY += 6;
      
      doc.text("GST (5%):", 130, currentY);
      doc.text(`INR ${order.fees.gst}`, 170, currentY);
      currentY += 6;
      
      doc.text("Delivery Fee:", 130, currentY);
      doc.text(order.fees.delivery === 0 ? "FREE" : `INR ${order.fees.delivery}`, 170, currentY);
      currentY += 6;
      
      doc.text("Platform Fee:", 130, currentY);
      doc.text(`INR ${order.fees.platform}`, 170, currentY);
      
      if (order.fees.tip > 0) {
        currentY += 6;
        doc.text("Rider Tip:", 130, currentY);
        doc.text(`INR ${order.fees.tip}`, 170, currentY);
      }
      
      currentY += 10;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(120, currentY - 5, 70, 8, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Total Paid:", 125, currentY + 1);
      doc.text(`INR ${order.total}`, 170, currentY + 1);
      
      // Footer Note
      currentY += 30;
      doc.setFont("Times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Thank you for ordering your meal with Flavora Kitchen!", 105, currentY, { align: "center" });
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("For concierge support, please reach out to support@flavorakitchen.com", 105, currentY + 5, { align: "center" });
      
      doc.save(`Flavora_Invoice_${order.id}.pdf`);
      showToast("Invoice downloaded successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to generate PDF invoice", "error");
    }
  };

  // Simulated Transactional Invoice Email Delivery (Tier 3)
  const sendInvoiceEmail = async (order: Order) => {
    // TODO: wire to real Resend/SendGrid API or Supabase Edge function once account is created
    console.log("Simulating transactional email send to user for order:", order.id);
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  // Pre-apply referral discount automatically
  useEffect(() => {
    const appliedReferral = localStorage.getItem("flavora_applied_referral");
    const referralWelcomed = localStorage.getItem("flavora_referral_welcomed");
    if (appliedReferral && referralWelcomed !== "true") {
      const welcomeVoucher = VOUCHERS.find(v => v.code === "WELCOME100");
      if (welcomeVoucher) {
        setAppliedVoucher(welcomeVoucher);
        setCouponCode("WELCOME100");
        setCouponStatus("valid");
        localStorage.setItem("flavora_referral_welcomed", "true");
        setTimeout(() => {
          showToast("Welcome! Here's ₹100 off your first order — code WELCOME100 has been applied for you", "success");
        }, 1500);
      }
    }
  }, []);

  // Monitor cart additions for Upsell trigger
  useEffect(() => {
    if (cart.length === 1 && lastCartLength === 0) {
      const singleItem = cart[0];
      const foundDish = allDishesList.find(d => String(d.id) === singleItem.id || d.name === singleItem.name);
      if (foundDish && foundDish.category === "Main Course") {
        // Suggest a Starter (Side)
        const starters = allDishesList.filter(d => d.category === "Starters");
        const bestStarter = [...starters].sort((a, b) => b.rating - a.rating)[0];
        if (bestStarter) {
          setUpsellSuggestion(bestStarter);
          setShowUpsell(true);
        }
      }
    }
    setLastCartLength(cart.length);
  }, [cart, allDishesList, lastCartLength]);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("FLAVORA-REFER-SATHV");
    setReferralCopied(true);
    showToast("Referral code copied to clipboard!", "success");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleSimulateReviewPhotoUpload = () => {
    setIsUploadingPhoto(true);
    setTimeout(() => {
      setSimulatedReviewImage("/images/truffle_dish.png");
      setIsUploadingPhoto(false);
      showToast("Gourmet food photo attached successfully!", "success");
    }, 1200);
  };

  const handleSubmitReview = () => {
    if (!reviewOrderTarget) return;
    
    setOrderHistory(prev => 
      prev.map(o => o.id === reviewOrderTarget.id ? { 
        ...o, 
        reviewSubmitted: true,
        review: {
          rating: foodRating,
          comment: reviewComment,
          riderRating: riderRating
        }
      } : o)
    );

    if (activeOrder && activeOrder.id === reviewOrderTarget.id) {
      setActiveOrder(prev => prev ? {
        ...prev,
        reviewSubmitted: true,
        review: {
          rating: foodRating,
          comment: reviewComment,
          riderRating: riderRating
        }
      } : null);
    }

    setReviewOrderTarget(null);
    setReviewComment("");
    showToast("Gourmet feedback review submitted!", "success");
  };

  // Sync favorites
  useEffect(() => {
    localStorage.setItem("flavora_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Sync active order
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem("flavora_active_order", JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem("flavora_active_order");
    }
  }, [activeOrder]);

  // Sync order history
  useEffect(() => {
    localStorage.setItem("flavora_order_history", JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Sync loyalty points
  useEffect(() => {
    localStorage.setItem("flavora_loyalty_points", String(loyaltyPoints));
  }, [loyaltyPoints]);

  // Sync chat
  useEffect(() => {
    localStorage.setItem("flavora_support_chat", JSON.stringify(supportMessages));
  }, [supportMessages]);

  // Sync Table bookings
  useEffect(() => {
    localStorage.setItem("flavora_bookings", JSON.stringify(savedBookings));
  }, [savedBookings]);

  // Sync user profile (Tier 2)
  useEffect(() => {
    localStorage.setItem("flavora_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Sync waitlist entries (Tier 2)
  useEffect(() => {
    localStorage.setItem("flavora_waitlist", JSON.stringify(waitlistEntries));
  }, [waitlistEntries]);

  // Handle Heart selector favorite dish toggles
  const toggleFavorite = (dishId: string) => {
    contextToggleFavorite(dishId);
    const willBeFavorited = !isFavorited(dishId);
    showToast(willBeFavorited ? "Saved to Favorites" : "Removed from Favorites", "success");
  };

  // Logout trigger
  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      navigate("/");
    } else {
      showToast("Sign out failed", "error");
    }
  };

  // Sorting & Catalog processing filters
  const processedMenuDishes = allDishesList.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || dish.category === activeCategory;
    const matchesDiet = 
      dietFilter === "all" ? true :
      dietFilter === "veg" ? dish.isVeg :
      dietFilter === "non-veg" ? !dish.isVeg :
      dietFilter === "vegan" ? dish.isVegan : true;
    const matchesCost =
      costFilter === "all" ? true :
      costFilter === "under300" ? dish.price < 300 :
      costFilter === "under500" ? dish.price < 500 : true;

    return matchesSearch && matchesCategory && matchesDiet && matchesCost;
  }).sort((a, b) => {
    if (menuSort === "rating") return b.rating - a.rating;
    if (menuSort === "popularity") return b.popularity - a.popularity;
    if (menuSort === "costLow") return a.price - b.price;
    if (menuSort === "costHigh") return b.price - a.price;
    return 0;
  });

  const handleOpenCustomizationModal = (dish: any) => {
    setSelectedDishForDetails(dish);
    setCustomOptions({
      size: dish.category === "Drinks" ? "Regular" : "Medium",
      crust: "Thin",
      toppings: [],
      spiceLevel: "Medium",
      extras: [],
      instructions: ""
    });
  };

  // Add customized selection directly into Context Cart
  const handleAddCustomizedToCart = () => {
    if (!selectedDishForDetails) return;
    
    let itemPrice = selectedDishForDetails.price;
    const additions: string[] = [];

    if (customOptions.size === "Medium" && selectedDishForDetails.category === "Main Course") {
      itemPrice += 100;
      additions.push("Medium");
    } else if (customOptions.size === "Large") {
      itemPrice += 200;
      additions.push("Large");
    }

    if (customOptions.crust === "Cheese Burst") {
      itemPrice += 120;
      additions.push("Cheese Burst Crust");
    } else if (customOptions.crust === "Pan") {
      itemPrice += 60;
      additions.push("Pan Crust");
    }

    customOptions.toppings.forEach(t => {
      itemPrice += 40;
      additions.push(t);
    });

    customOptions.extras.forEach(e => {
      itemPrice += 50;
      additions.push(e);
    });

    const configLabel = additions.length > 0 ? additions.join(", ") : "";
    const noteLabel = customOptions.instructions.trim() ? `Note: ${customOptions.instructions}` : "";
    
    let serialName = selectedDishForDetails.name;
    const descParts = [];
    if (configLabel) descParts.push(configLabel);
    if (noteLabel) descParts.push(noteLabel);
    
    if (descParts.length > 0) {
      serialName += ` (${descParts.join(" | ")})`;
    }

    addToCart({
      id: `${selectedDishForDetails.id}-${customOptions.size}-${customOptions.crust}-${customOptions.toppings.join("-")}`,
      name: serialName,
      price: itemPrice,
      image: selectedDishForDetails.image,
      description: noteLabel || selectedDishForDetails.ingredients
    });

    playAddToCartSound();
    setSelectedDishForDetails(null);
    showToast(`Added ${selectedDishForDetails.name} customization to cart`);
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const foundVoucher = VOUCHERS.find(v => v.code === code);
    if (foundVoucher) {
      setAppliedVoucher(foundVoucher);
      setCouponStatus("valid");
      showToast(`Coupon Approved: ${foundVoucher.description}!`);
    } else {
      setAppliedVoucher(null);
      setCouponStatus("invalid");
      showToast("That code doesn't look right — double-check and try again", "error");
    }
  };

  const saveOrderToSupabase = async (paymentId: string, paymentStatus: "paid" | "pending") => {
    setIsSubmittingOrder(true);
    const deliverTo = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];

    const { data, error } = await supabase.from("orders").insert({
      user_id: user?.id,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      subtotal: cartTotal,
      fees: { gst: gstAmount, delivery: deliveryFee, platform: platformFee, tip: deliveryTip },
      total: totalAmountPayable,
      delivery_address: deliverTo.addressLine,
      payment_status: paymentStatus,
      payment_method: paymentOption.toUpperCase(),
      order_status: "pending",
      refund_status: "none"
    }).select().single();

    setIsSubmittingOrder(false);

    if (error) {
      showToast("Failed to save order: " + error.message, "error");
      return;
    }

    const newOrder: Order = {
      id: data.id,
      date: data.created_at ? data.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      items: data.items,
      subtotal: data.subtotal,
      fees: data.fees,
      total: data.total,
      status: "Order Placed",
      address: deliverTo,
      paymentMethod: paymentOption.toUpperCase(),
      rider: {
        name: "Rohan Sharma",
        phone: "+91 98765 43210",
        rating: "4.9",
        avatar: "R"
      }
    };

    setActiveOrder(newOrder);
    
    // Auto-update order history list locally as well
    setOrderHistory(prev => [newOrder, ...prev]);

    const earned = Math.round(totalAmountPayable / 10);
    setLoyaltyPoints(prev => prev + earned);

    clearCart();
    setCouponCode("");
    setAppliedVoucher(null);
    setCouponStatus("idle");
    setDeliveryTip(0);
    setMapProgress(0);

    setActiveTab("tracking");
    showToast("Gourmet Order Placed Successfully!", "success");

    sendInvoiceEmail(newOrder).then((res) => {
      if (res.success) {
        showToast(`Invoice PDF emailed to ${user?.email || "rethveeknalla@gmail.com"}!`, "success");
      }
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    if (paymentOption === "cod") {
      await saveOrderToSupabase("COD-CASH", "pending");
      return;
    }

    // Load Razorpay Script for Digital Payment Checkout
    setIsSubmittingOrder(true);
    const loadScript = () => {
      return new Promise((resolve) => {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadScript();
    setIsSubmittingOrder(false);

    if (!isLoaded) {
      showToast("Failed to load Razorpay payment gateway script. Please check connection.", "error");
      return;
    }

    const options = {
      key: "rzp_test_FlavoraDemoKey",
      amount: totalAmountPayable * 100, // paise
      currency: "INR",
      name: "Flavora Kitchen",
      description: "Gourmet Selections Payment Checkout",
      handler: async function (response: any) {
        await saveOrderToSupabase(response.razorpay_payment_id || "PAY-SUCCESS", "paid");
      },
      prefill: {
        name: user?.user_metadata?.name || "Valued Guest",
        email: user?.email || ""
      },
      theme: {
        color: "#f97316"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // Simulated GPS Coordinates picker
  const handleSimulateGps = () => {
    setGpsSimulating(true);
    setTimeout(() => {
      const lat = parseFloat((19.4000 + Math.random() * 0.05).toFixed(4));
      const lng = parseFloat((72.8100 + Math.random() * 0.05).toFixed(4));
      setSimulatedCoords({ lat, lng });
      setNewAddressLine(`Gourmet Tower, Sector 4, GPS Coord: (${lat}, ${lng}), Nallasopara West`);
      setGpsSimulating(false);
      showToast("Location Pin Placed via GPS");
    }, 1500);
  };

  const handleCreateAddress = () => {
    if (!newAddressLine.trim()) return;
    const newAddr: Address = {
      id: `A-${Date.now()}`,
      type: newAddressType,
      addressLine: newAddressLine,
      coords: simulatedCoords || { lat: 19.41 + Math.random() * 0.02, lng: 72.82 + Math.random() * 0.02 }
    };
    setSavedAddresses(prev => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setNewAddressLine("");
    setSimulatedCoords(null);
    setShowAddressModal(false);
    showToast("Address Saved Successfully");
  };

  // -------------------------------------------------------------
  // 🍽️ TABLE BOOKING LOGIC & ENGINES
  // -------------------------------------------------------------
  
  // Toggle request checklist items
  const handleToggleRequest = (opt: string) => {
    setBookingRequests(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  // Place Reservation triggers
  const handlePlaceReservation = async (waitlist: boolean = false) => {
    if (!bookingTableId && !waitlist) {
      showToast("Please select a physical table seating from the grid plan", "error");
      return;
    }

    const { data: newRes, error } = await supabase.from("reservations").insert({
      user_id: user?.id,
      table_id: waitlist ? null : bookingTableId,
      guest_name: user?.user_metadata?.name || "Valued Guest",
      guest_count: bookingGuests,
      reservation_date: bookingDate,
      reservation_time: bookingTime,
      occasion: bookingEvent,
      dining_package: bookingPackage,
      special_requests: bookingRequests.join(", "),
      status: waitlist ? "pending" : "confirmed"
    }).select().single();

    if (error) {
      showToast("Failed to place reservation: " + error.message, "error");
      return;
    }

    if (!waitlist && bookingTableId) {
      await supabase.from("restaurant_tables").update({ status: "reserved" }).eq("id", bookingTableId);
    }

    // Earn 15 loyalty points for reserving
    setLoyaltyPoints(p => p + 15);

    // Reset inputs
    setBookingRequests([]);
    setBookingTableId(null);
    setBookingPackage("Standard Seating");

    showToast(waitlist ? "Joined Table Seating Waitlist" : "Table Reserved successfully!");
  };

  // Management controls Reschedules
  const handleRescheduleSubmit = async () => {
    if (!rescheduleBookingTarget) return;

    const { error } = await supabase.from("reservations").update({
      reservation_date: rescheduleDate,
      reservation_time: rescheduleTime
    }).eq("id", rescheduleBookingTarget.id);

    if (error) {
      showToast("Failed to reschedule: " + error.message, "error");
      return;
    }

    setShowRescheduleModal(false);
    setRescheduleBookingTarget(null);
    showToast("Reservation rescheduled successfully!");
  };

  // Management controls Table Upgrades
  const handleUpgradeSubmit = async () => {
    if (!upgradeBookingTarget) return;

    // Upgrades dining package in Supabase
    const { error } = await supabase.from("reservations").update({
      dining_package: upgradeTableType
    }).eq("id", upgradeBookingTarget.id);

    if (error) {
      showToast("Failed to upgrade: " + error.message, "error");
      return;
    }

    setShowUpgradeModal(false);
    setUpgradeBookingTarget(null);
    showToast("Table type upgraded successfully!");
  };

  // Management controls Guest counts additions
  const handleAddGuestsSubmit = async () => {
    if (!addGuestsTarget) return;

    const { error } = await supabase.from("reservations").update({
      guest_count: addGuestsTarget.guests + addGuestsCount
    }).eq("id", addGuestsTarget.id);

    if (error) {
      showToast("Failed to update guest count: " + error.message, "error");
      return;
    }

    setShowAddGuestsModal(false);
    setAddGuestsTarget(null);
    showToast(`Added ${addGuestsCount} guests to your reservation details`);
  };

  // Management controls cancellations
  const handleCancelBooking = async (bookingId: string) => {
    const target = savedBookings.find(b => b.id === bookingId);
    if (!target) return;

    const { error } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", bookingId);
    if (error) {
      showToast("Failed to cancel reservation: " + error.message, "error");
      return;
    }

    if (target.tableId && target.tableId !== "Not Assigned Yet") {
      const matchNumber = parseInt(target.tableId.replace("Table ", ""));
      const { data: tblData } = await supabase.from("restaurant_tables").select("id").eq("table_number", matchNumber).single();
      if (tblData) {
        await supabase.from("restaurant_tables").update({ status: "available" }).eq("id", tblData.id);
      }
    }

    showToast("Reservation cancelled successfully", "info");

    // Loop checklist to auto-notify any waitlisted users for this slot
    const cancelledBooking = savedBookings.find(b => b.id === bookingId);
    if (cancelledBooking) {
      const waitlisted = savedBookings.find(b => b.waitlisted && b.time === cancelledBooking.time && b.date === cancelledBooking.date);
      if (waitlisted) {
        showToast(`Auto-Notification: Slot opened! Bumped ${userDisplayName} up to Confirmed`, "success");
        setSavedBookings(prev => 
          prev.map(b => b.id === waitlisted.id ? { ...b, waitlisted: false, status: "Confirmed", tableId: cancelledBooking.tableId } : b)
        );
      }
    }
  };

  // Submit Seating Dining Feedback ratings
  const handleSubmitFeedback = () => {
    if (!feedbackBookingTarget) return;

    setSavedBookings(prev => 
      prev.map(b => b.id === feedbackBookingTarget.id ? { 
        ...b, 
        feedbackSubmitted: true, 
        feedback: { food: feedbackFoodScore, ambience: feedbackAmbienceScore, service: feedbackServiceScore, comment: feedbackComment } 
      } : b)
    );

    setShowFeedbackModal(false);
    setFeedbackBookingTarget(null);
    setFeedbackComment("");
    showToast("Seating & Dining feedback submitted!");
  };

  // Chat message send bot logic
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `U-${Date.now()}`,
      sender: "user",
      text: chatInput,
      timestamp: new Date()
    };

    setSupportMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatTyping(true);

    setTimeout(() => {
      setIsChatTyping(false);
      let replyText = "I appreciate your message. Our lead support agent will contact you shortly.";
      const query = chatInput.toLowerCase();

      if (query.includes("order") || query.includes("track")) {
        if (activeOrder) {
          replyText = `Your active order ${activeOrder.id} is [${activeOrder.status}]. Estimated transit time is 15-20 minutes!`;
        } else {
          replyText = "You do not have any active tracking orders right now. Go to the Gourmet Menu tab to compose a selection!";
        }
      } else if (query.includes("book") || query.includes("reservation") || query.includes("table")) {
        const activeRes = savedBookings.find(b => b.status === "Confirmed");
        if (activeRes) {
          replyText = `You have a confirmed reservation (${activeRes.id}) for ${activeRes.guests} guests on ${activeRes.date} at ${activeRes.time} (${activeRes.tableType}).`;
        } else {
          replyText = "You do not have any active table bookings. You can set up a schedule in the Table Bookings tab!";
        }
      } else if (query.includes("points") || query.includes("loyalty") || query.includes("rewards")) {
        replyText = `You hold ${loyaltyPoints} points in your balance. Redeem them for discount coupon codes in the Loyalty Center.`;
      } else if (query.includes("hello") || query.includes("hi")) {
        replyText = `Hello ${firstName}! How can I help you today? I can help with active order statuses, reservations tracking, or loyalty point balances.`;
      }

      setSupportMessages(prev => [...prev, {
        id: `B-${Date.now()}`,
        sender: "bot",
        text: replyText,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  const getAlternatives = (category: string, currentPrice: number) => {
    const currentTotal = plannerResult?.totalCost || 0;
    const maxPriceAllowed = currentPrice + (planBudget - currentTotal);
    return getMappedDishes().filter(
      (dish) => 
        dish.category === category && 
        dish.price <= maxPriceAllowed &&
        (planDietFilter === "any" ? true :
         planDietFilter === "veg" ? dish.isVeg :
         planDietFilter === "non-veg" ? !dish.isVeg :
         planDietFilter === "vegan" ? dish.isVegan : true)
    );
  };

  const handleSwapItem = (oldId: number, newDish: MappedDish) => {
    if (!plannerResult) return;
    const updatedItems = plannerResult.items.map((item) => {
      if (item.dish.id === oldId) {
        return { dish: newDish, quantity: item.quantity };
      }
      return item;
    });

    const totalCost = updatedItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const budgetUtilization = Math.round((totalCost / planBudget) * 100);
    let totalCalories = 0;
    updatedItems.forEach((item) => {
      totalCalories += (item.dish.id * 3 + 120) * item.quantity;
    });
    const avgCalories = totalCalories / planPeopleCount;
    const balance = avgCalories < 400 ? "light" : avgCalories > 800 ? "hearty" : "balanced";

    // Re-generate reasoning dynamically
    const itemSummary = updatedItems.map((i) => `${i.quantity}x ${i.dish.name}`).join(", ");
    const remainingBudget = planBudget - totalCost;
    const reasoning = `Customized Plan: You swapped items to choose ${itemSummary}. This uses ₹${totalCost} of your ₹${planBudget} budget (${budgetUtilization}% utilization, ₹${remainingBudget} remaining).`;

    setPlannerResult({
      items: updatedItems,
      totalCost,
      budgetUtilization,
      nutritionSummary: { totalCalories, balance },
      reasoning
    });
    setSwapTargetItem(null);
    showToast(`Swapped item successfully!`);
  };

  return (
    <div className="min-h-screen bg-dark-radial-center flex flex-col font-sans text-cream relative selection:bg-orange-500 selection:text-white select-none overflow-x-hidden">
      {/* Visual Grain noise overlay */}
      <div className="noise-overlay" />

      {/* Ticking Toast/Upsell Notification */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none w-[90%] max-w-md">
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -45, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 font-semibold text-sm backdrop-blur-md pointer-events-auto ${
                toastType === "success" 
                  ? "bg-green-950/90 border-green-800 text-green-300" 
                  : toastType === "error" 
                    ? "bg-red-950/90 border-red-800 text-red-300"
                    : "bg-orange-950/90 border-orange-800 text-orange-300"
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showUpsell && upsellSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="bg-[#130d0a]/95 border border-orange-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 text-left w-full shadow-2xl backdrop-blur-md pointer-events-auto relative overflow-hidden"
            >
              <FocalGlowBloom className="w-20 h-20 -right-6 -bottom-6 opacity-20" />
              <div className="flex items-center gap-2.5 relative z-10">
                <span className="text-base shrink-0">✨</span>
                <div className="font-sans">
                  <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider font-mono">Complete Your Meal</p>
                  <p className="text-[10px] text-cream/80 font-sans">Add <span className="font-bold text-white">{upsellSuggestion.name}</span> for ₹{upsellSuggestion.price}?</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button
                  onClick={() => {
                    addToCart({
                      id: String(upsellSuggestion.id),
                      name: upsellSuggestion.name,
                      price: upsellSuggestion.price,
                      image: upsellSuggestion.image,
                      description: upsellSuggestion.ingredients
                    });
                    playAddToCartSound();
                    setShowUpsell(false);
                    showToast(`Added ${upsellSuggestion.name} to complete your meal!`, "success");
                  }}
                  className="px-2.5 py-1 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-[9px] font-bold uppercase rounded-lg transition cursor-pointer"
                >
                  + Add
                </button>
                <button
                  onClick={() => setShowUpsell(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-cream/40 hover:text-white transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER NAVBAR CONTAINER */}
      <header className="sticky top-0 bg-black/20 border-b border-white/5 py-4 px-6 z-40 backdrop-blur-md flex justify-between items-center select-none">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="w-8 h-8 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-orange-500 stroke-[9] stroke-linecap-round stroke-linejoin-round">
              <path d="M 35 15 C 20 35 20 60 50 85 C 80 60 80 35 65 15 Z" />
              <path d="M 50 35 L 50 65" />
            </svg>
          </div>
          <span className="text-xl font-serif font-black tracking-tight text-white">
            Flavora <span className="font-light italic text-orange-500">Kitchen</span>
          </span>
        </div>

        {/* Navigation center tabs for large displays */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {[
            { id: "home", label: "Overview", icon: Compass },
            { id: "menu", label: "Menu", icon: Sliders },
            { id: "planner", label: "Smart Planner", icon: Sparkles },
            { id: "bookings", label: "Table Bookings", icon: Calendar },
            { id: "checkout", label: `Checkout (${cartCount})`, icon: ShoppingBag },
            { id: "tracking", label: "Live Track", icon: Truck },
            { id: "history", label: "History Log", icon: RefreshCw },
            { id: "loyalty", label: "Loyalty", icon: Award },
            { id: "favorites", label: "Favorites", icon: Heart },
            { id: "profile", label: "My Profile", icon: UserCog },
            { id: "support", label: "Support", icon: MessageCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playDrawerOpenSound();
                }}
                className={`relative px-3.5 py-2 rounded-full cursor-pointer transition flex items-center gap-1.5 ${isActive ? "text-[#150f0c]" : "text-cream/60 hover:text-white"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbarMainActivePill"
                    className="absolute inset-0 bg-orange-500 rounded-full -z-10 shadow shadow-orange-500/20"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon size={11} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex bg-orange-500/10 text-orange-400 border border-orange-500/15 text-[9px] uppercase tracking-wider font-mono font-bold px-3 py-1 rounded">
            Secure Member Portal
          </span>

          {/* User Account trigger dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                playDrawerOpenSound();
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-2 pr-3 py-1.5 transition text-cream cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 text-[#150f0c] flex items-center justify-center font-bold text-sm shadow">
                {userInitial}
              </div>
              <ChevronDown size={14} className={`text-cream/60 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-[#150f0c] border border-white/5 rounded-2xl p-2.5 shadow-2xl z-50 text-left"
                >
                  <div className="px-3.5 py-2.5 border-b border-white/5">
                    <p className="text-xs text-cream/40 font-mono uppercase tracking-wider">Authenticated Member</p>
                    <p className="text-sm font-bold text-white truncate mt-0.5">{userDisplayName}</p>
                    <p className="text-[10px] text-cream/50 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="py-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setActiveTab("loyalty");
                      }}
                      className="w-full px-3.5 py-2 rounded-xl text-xs text-cream/80 hover:text-white hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
                    >
                      <Award size={13} /> Loyalty Rewards
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setActiveTab("history");
                      }}
                      className="w-full px-3.5 py-2 rounded-xl text-xs text-cream/80 hover:text-white hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={13} /> Order History
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-1.5">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={13} /> Log Out Portal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 relative z-10 flex flex-col gap-8">
        
        {/* Navigation bottom bar for small viewport displays */}
        <div className="lg:hidden flex items-center justify-between bg-[#150f0c] border border-white/5 p-2 rounded-2xl w-full text-[10px] uppercase font-bold sticky top-[72px] z-30 shadow-lg">
          {[
            { id: "home", label: "Home" },
            { id: "menu", label: "Menu" },
            { id: "planner", label: "Planner" },
            { id: "bookings", label: "Tables" },
            { id: "checkout", label: `Cart (${cartCount})` },
            { id: "tracking", label: "Track" },
            { id: "favorites", label: "Favs" },
            { id: "profile", label: "Me" },
            { id: "support", label: "Chat" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-center rounded-xl transition ${activeTab === tab.id ? "bg-orange-500 text-[#150f0c]" : "text-cream/50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW HOME PAGE */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fadeIn relative">
            {/* Time-Aware Greeting Heading */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white/[0.02] border border-white/5 px-8 py-6 rounded-3xl relative z-20 shadow-xl">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight leading-tight">
                  {getGreeting()}, <span className="text-orange-500 italic">{firstName}</span>
                </h2>
                <p className="text-xs text-cream/50 mt-1 font-medium font-sans flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-orange-500/60" />
                  <span>{formatDate(currentTime)}</span>
                  <span className="text-white/10">&bull;</span>
                  <span className="font-mono text-cream/70 font-semibold">{formatTime(currentTime)}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4 md:mt-0 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-full shrink-0 shadow-inner">
                <span className={`w-2.5 h-2.5 rounded-full relative flex ${isOpen() ? "shadow-[0_0_10px_#22c55e]" : "shadow-[0_0_10px_#ef4444]"}`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen() ? "bg-green-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen() ? "bg-green-500" : "bg-red-500"}`}></span>
                </span>
                <span className="text-xs font-bold tracking-wider text-cream/70 uppercase font-sans">
                  {isOpen() ? "Kitchen Open" : "Kitchen Closed"}
                </span>
              </div>
            </div>

            {/* Brand Intro narrative info */}
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center z-10">
              <FocalGlowBloom className="w-48 h-48 -left-10 top-1/2 -translate-y-1/2" />
              
              <div className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shrink-0 shadow-lg relative z-10">
                <svg viewBox="0 0 100 100" className="w-12 h-12 fill-none stroke-orange-500 stroke-[8] stroke-linecap-round stroke-linejoin-round animate-pulse">
                  <path d="M 50 15 L 85 45 C 80 80, 20 80, 15 45 Z" />
                  <path d="M 30 50 C 35 60, 65 60, 70 50" />
                </svg>
                <div className={`absolute -bottom-1 -right-1 border-2 border-warm-ink w-4 h-4 rounded-full ${isOpen() ? "bg-green-500" : "bg-red-500"}`} />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-tight">The Flavora Studio</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500/70 mt-0.5 font-sans">Premium Fine Dining Delivery &amp; Seating Hub</p>
                </div>
                
                <p className="text-cream/70 text-sm leading-relaxed max-w-3xl font-normal font-sans">
                  Enjoy gourmet burgers, hand-stretched wood-fired pizzas, house starters, and signature desserts. We compose each order using organic, locally-sourced premium ingredients to deliver fine-dining excellence direct to your door or at your custom reserved table.
                </p>

                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start pt-1 font-sans">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    Daily: 11:00 AM &ndash; 11:00 PM
                  </span>
                  <span className="text-xs text-cream/60 font-mono">
                    <span className="text-orange-500 font-bold">{getOperatingStatusText()}</span>
                  </span>
                </div>

                {/* Social links row */}
                <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start pt-1 relative z-20">
                  {["Facebook", "Instagram", "YouTube", "Call Concierge", "WhatsApp support", "Location map"].map((social, i) => {
                    const IconComponent = [Share2, Compass, ExternalLink, PhoneCall, MessageSquare, MapPinned][i];
                    return (
                      <button
                        key={social}
                        onClick={() => showToast(`Redirecting to ${social}...`)}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-full text-cream/70 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30 hover:scale-105 transition-all duration-300 cursor-pointer shadow-md"
                        title={social}
                      >
                        <IconComponent size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto relative z-10">
                <button
                  onClick={() => showToast("Android Application launch is scheduled for Phase 3!", "info")}
                  className="w-full md:w-auto px-6 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider font-sans"
                >
                  <Compass size={14} /> Download Our Android App
                </button>
              </div>
            </div>

            {/* Fast Actions stacked button links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-20">
              <OverviewTiltCard
                emoji="🍔"
                title="Order Food"
                description="Get Flavora delivered to your door"
                onClick={() => {
                  setActiveTab("menu");
                  playDrawerOpenSound();
                }}
              />
              <OverviewTiltCard
                emoji="🍽️"
                title="Reserve a Table"
                description="Book your table for an unforgettable evening"
                onClick={() => {
                  setActiveTab("bookings");
                  playDrawerOpenSound();
                }}
              />
            </div>

            {/* Favorites System Section */}
            {favorites.length > 0 && (
              <div className="bg-[#130d0a] border border-white/5 p-6 rounded-3xl space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Heart size={16} className="text-red-500 fill-red-500" />
                  <h4 className="font-serif text-lg font-bold text-white">Your Saved Favorites ({favorites.length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {allDishesList.filter(d => favorites.includes(String(d.id))).map(dish => (
                    <div 
                      key={dish.id} 
                      className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex gap-3 items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={dish.image} className="w-12 h-12 object-cover rounded-xl shrink-0 bg-white/5" alt={dish.name} />
                        <div className="text-left">
                          <h6 className="font-bold text-white text-xs leading-snug truncate max-w-40">{dish.name}</h6>
                          <p className="text-[10px] text-orange-500 font-serif font-bold mt-0.5">₹{dish.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenCustomizationModal(dish)}
                        className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU FILTER LISTING */}
        {activeTab === "menu" && (
          <section className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl space-y-8 animate-fadeIn relative overflow-hidden">
            <FocalGlowBloom className="w-96 h-96 -top-20 -left-20" />
            
            {/* Gourmet Hero Banner */}
            <div className="w-full h-48 sm:h-64 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl z-10 mb-2">
              <img 
                src="/images/menu_hero_banner.png" 
                className="w-full h-full object-cover" 
                alt="Flavora Luxury Fine Dining Spread" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex flex-col justify-end p-6 md:p-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Flavora Signature Catalog</span>
                <h4 className="text-xl sm:text-3xl font-serif font-black text-white mt-1.5">Savor the Art of Fine Dining</h4>
                <p className="text-xs text-cream/70 mt-1 max-w-lg leading-relaxed font-sans">
                  Each dish is masterfully curated with premium organic ingredients by our Michelin-starred culinary team, delivering pure luxury to your table.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Compose Meal Selection</span>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight mt-1">Our Gourmet Catalog</h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-full self-start md:self-auto shadow-inner">
                Outlet: Flavora Kitchen Main (Nallasopara West)
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
                  <input 
                    type="text" 
                    placeholder="Search dish names or key ingredients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 transition text-cream placeholder-cream/35"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-white">
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-cream/50 font-mono">Sort By:</span>
                  <select 
                    value={menuSort}
                    onChange={(e) => setMenuSort(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer animate-none"
                  >
                    <option value="relevance" className="bg-[#150f0c]">Relevance</option>
                    <option value="rating" className="bg-[#150f0c]">Rating (High to Low)</option>
                    <option value="popularity" className="bg-[#150f0c]">Popularity (Orders count)</option>
                    <option value="costLow" className="bg-[#150f0c]">Cost: Low to High</option>
                    <option value="costHigh" className="bg-[#150f0c]">Cost: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-between border-t border-white/5 pt-4">
                <div className="flex border border-white/10 rounded-xl overflow-hidden p-0.5 bg-white/5">
                  {[
                    { id: "all", label: "All Diets" },
                    { id: "veg", label: "🟢 Veg" },
                    { id: "non-veg", label: "🔴 Non-Veg" },
                    { id: "vegan", label: "🍀 Vegan" }
                  ].map(diet => (
                    <button
                      key={diet.id}
                      onClick={() => setDietFilter(diet.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dietFilter === diet.id ? "bg-orange-500 text-[#150f0c]" : "text-cream/50 hover:text-white"}`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>

                <div className="flex border border-white/10 rounded-xl overflow-hidden p-0.5 bg-white/5">
                  {[
                    { id: "all", label: "Any Price" },
                    { id: "under300", label: "Under ₹300" },
                    { id: "under500", label: "Under ₹500" }
                  ].map(cost => (
                    <button
                      key={cost.id}
                      onClick={() => setCostFilter(cost.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${costFilter === cost.id ? "bg-orange-500 text-[#150f0c]" : "text-cream/50 hover:text-white"}`}
                    >
                      {cost.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-full w-max max-w-full overflow-x-auto select-none no-scrollbar">
                {CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer z-10"
                      style={{ color: isActive ? "#150f0c" : "rgba(250,246,240,0.6)" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="menuSelectActiveTabPill"
                          className="absolute inset-0 bg-orange-500 rounded-full -z-10 shadow-lg shadow-orange-500/20"
                          transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        />
                      )}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${searchQuery}-${dietFilter}-${costFilter}-${menuSort}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {processedMenuDishes.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-cream/45 bg-white/[0.01] border border-white/5 rounded-3xl">
                    <Search size={36} className="mx-auto mb-4 opacity-30 text-orange-500" />
                    <p className="font-serif italic text-lg text-white">No dishes matched your filters</p>
                    <p className="text-xs text-cream/40 mt-1">Try resetting your category or search query parameters.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setActiveCategory("All"); setDietFilter("all"); setCostFilter("all"); }}
                      className="mt-4 px-4 py-2 bg-orange-500 text-[#150f0c] text-xs font-bold rounded-xl hover:bg-orange-400 transition"
                    >
                      Reset Filter Fields
                    </button>
                  </div>
                ) : (
                  processedMenuDishes.map((dish) => (
                    <motion.div
                      layout
                      key={dish.id}
                      className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group text-left"
                    >
                      <div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative mb-4">
                          <img 
                            src={dish.image} 
                            loading="lazy"
                            decoding="async"
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${getDishStockStatus(dish.id) === 'sold_out' ? 'opacity-40 grayscale' : ''}`}
                            alt={dish.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/truffle_dish.png";
                            }} 
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(String(dish.id));
                            }}
                            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full border border-white/10 text-cream/80 hover:text-red-500 transition cursor-pointer z-10"
                          >
                            <Heart size={14} className={favorites.includes(String(dish.id)) ? "text-red-500 fill-red-500" : ""} />
                          </button>

                          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[80%]">
                            <span className={`w-6 h-6 rounded-[6px] border flex items-center justify-center bg-black/80 backdrop-blur-sm shadow-[0_0_8px_rgba(${dish.isVeg ? '34,197,94' : '239,68,68'},0.2)] ${dish.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                              <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            </span>
                            {dish.isVegan && (
                              <span className="bg-green-600/90 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow flex items-center">Vegan</span>
                            )}
                            {isDishSellingFast(dish.id) && (
                              <span className="bg-orange-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg flex items-center gap-0.5 animate-pulse">
                                🔥 Selling Fast
                              </span>
                            )}
                          </div>

                          {/* Stock status badge (Tier 2: Inventory) */}
                          {getDishStockStatus(dish.id) === "sold_out" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                <Package size={10} /> Sold Out
                              </span>
                            </div>
                          )}
                          {getDishStockStatus(dish.id) === "low" && (
                            <div className="absolute bottom-10 left-3">
                              <span className="bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow">
                                <AlertTriangle size={9} /> Low Stock
                              </span>
                            </div>
                          )}

                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[9px] font-mono text-cream/80 flex items-center gap-1">
                            <Star size={9} className="text-yellow-500 fill-yellow-500" /> {dish.rating.toFixed(1)} &middot; {dish.popularity} orders
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-serif font-black text-white text-base leading-snug group-hover:text-orange-400 transition-colors cursor-pointer" onClick={() => handleOpenCustomizationModal(dish)}>
                              {dish.name}
                            </h5>
                            <span className="font-serif font-black text-orange-500 text-base mt-0.5">₹{dish.price}</span>
                          </div>
                          <p className="text-cream/50 text-xs leading-relaxed line-clamp-2">{dish.ingredients}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                        {dish.spiceLevel > 0 ? (
                          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                            <span className="text-[8px] uppercase font-mono tracking-widest text-orange-400 font-bold">Spice:</span>
                            <span className="text-[10px]">{Array(dish.spiceLevel).fill("🌶️").join("")}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] uppercase font-mono tracking-widest text-cream/30">Mild</span>
                        )}

                        {getDishStockStatus(dish.id) === "sold_out" ? (
                          <span className="px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold opacity-60 select-none">
                            Unavailable
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenCustomizationModal(dish)}
                            className="px-4 py-2 border border-white/20 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-white/5 hover:bg-orange-500 hover:text-[#150f0c] rounded-xl transition flex items-center gap-2 text-xs font-bold cursor-pointer"
                          >
                            <Plus size={13} /> Add &amp; Customize
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* 🍽️ TAB 3: TABLE RESERVATION PORTAL WIZARD */}
        {activeTab === "bookings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left Scheduling wizard settings form */}
            <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 select-none text-left">
              <h3 className="text-xl md:text-2xl font-bold font-serif text-white tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-500" />
                Table Reservation Booking Panel
              </h3>

              {/* Step 1: Availability Engine (Modules 3 & 5) */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Choose Your Date &amp; Time</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">Pick Date</label>
                    <input 
                      type="date" 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">Guests Size</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={12} 
                      value={bookingGuests} 
                      onChange={(e) => setBookingGuests(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">Duration (Hours)</label>
                    <select 
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="1h" className="bg-[#150f0c]">1 hour</option>
                      <option value="1.5h" className="bg-[#150f0c]">1.5 hours</option>
                      <option value="2h" className="bg-[#150f0c]">2 hours</option>
                      <option value="3h" className="bg-[#150f0c]">3 hours</option>
                    </select>
                  </div>
                </div>

                {/* Real-time Time Slots grid availability picker (Module 3) */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-mono text-cream/40 block">Available Times Today</label>
                  
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isSelected = bookingTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => {
                            setBookingTime(slot.time);
                            setBookingTableId(null); // Reset visual table when slot changes
                          }}
                          className={`px-3 py-2 border rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 ${
                            isSelected 
                              ? "bg-orange-500 border-orange-500 text-[#150f0c] font-bold shadow-[0_0_15px_rgba(249,115,22,0.35)]" 
                              : slot.isBooked 
                                ? "bg-[#18110d] border-red-500/20 text-red-500/40 cursor-not-allowed line-through relative overflow-hidden [background-image:linear-gradient(45deg,rgba(239,68,68,0.05)_25%,transparent_25%,transparent_50%,rgba(239,68,68,0.05)_50%,rgba(239,68,68,0.05)_75%,transparent_75%,transparent)] bg-[size:10px_10px]" 
                                : "bg-white/[0.03] border-white/10 hover:border-orange-500/45 hover:bg-orange-500/5 hover:text-white"
                          }`}
                        >
                          <span>{slot.time}</span>
                          <span className={`text-[8px] font-sans px-1 rounded ${
                            slot.isBooked ? "bg-red-950 text-red-300" : "bg-green-950 text-green-300"
                          }`}>
                            {slot.isBooked ? "Booked" : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {TIME_SLOTS.find(s => s.time === bookingTime)?.isBooked && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 flex justify-between items-center gap-3">
                      <p className="text-[10px] text-red-400">⚠️ Selected time slot is fully booked. Join waitlist queue to auto-secure if slots open.</p>
                      <button
                        onClick={() => handlePlaceReservation(true)}
                        className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-white text-[9px] font-bold uppercase rounded-lg transition animate-pulse"
                      >
                        Join Waitlist Position
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Seating Management & Table Types (Module 4) */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Choose Your Seating</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TABLE_TYPES.map(tbl => {
                    const isSelected = bookingTableType === tbl.type;
                    return (
                      <button
                        key={tbl.type}
                        onClick={() => {
                          setBookingTableType(tbl.type);
                          setBookingTableId(null);
                        }}
                        className={`p-4 border rounded-3xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between min-h-24 hover:-translate-y-1 relative overflow-hidden group ${
                          isSelected 
                            ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                            : "bg-white/[0.01] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        {isSelected && <FocalGlowBloom className="w-24 h-24 -right-6 -bottom-6 opacity-30" />}
                        <div className="flex items-center justify-between w-full relative z-10">
                          <h6 className="font-bold text-xs text-white">{tbl.type}</h6>
                          <span className={`${isSelected ? 'text-orange-500' : 'text-cream/40 group-hover:text-orange-400'} transition-colors`}>
                            {getTableTypeIcon(tbl.type)}
                          </span>
                        </div>
                        <p className="text-[8px] text-cream/45 mt-2.5 leading-normal relative z-10">{tbl.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* 2D Interactive Seating Floor Layout Grid (Module 4) */}
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-mono text-cream/40 block">Interactive 2D Floor Plan Grid</label>
                  
                  <div className="w-full min-h-[160px] bg-[#150f0c] border border-white/5 rounded-3xl p-5 grid grid-cols-3 sm:grid-cols-6 gap-4 items-center justify-center relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 to-transparent pointer-events-none" />
                    
                    {getSeatingTablesForType(bookingTableType).map(table => {
                      const isSelected = bookingTableId === table.id;
                      return (
                        <div
                          key={table.id}
                          onClick={() => {
                            if (table.isBooked) {
                              showToast("Table is already reserved by another party", "error");
                              return;
                            }
                            setBookingTableId(isSelected ? null : table.id);
                          }}
                          className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition relative z-10 ${
                            isSelected 
                              ? "bg-orange-500 border-orange-500 text-[#150f0c] shadow-lg shadow-orange-500/20" 
                              : table.isBooked 
                                ? "bg-red-500/10 border-red-500/20 text-red-500/60 cursor-not-allowed opacity-50" 
                                : "bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 text-white"
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold">{table.name}</span>
                          <span className="text-[8px] font-sans opacity-60">Cap: {table.capacity}</span>
                          
                          <div className={`w-2 h-2 rounded-full absolute top-2 right-2 ${
                            table.isBooked ? "bg-red-500" : isSelected ? "bg-[#150f0c]" : "bg-green-500"
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3: Event Booking, Packages & Special requests (Modules 6, 7 & 8) */}
              <div className="border-t border-white/5 pt-6 space-y-6">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Enhance Your Experience</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Event selections (Module 7) */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/40 block">Event Reservations type</label>
                    <select
                      value={bookingEvent}
                      onChange={(e) => setBookingEvent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer animate-none"
                    >
                      {EVENT_TYPES.map(evt => (
                        <option key={evt} value={evt} className="bg-[#150f0c]">{evt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dining Packages Selection (Module 8) */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/40 block">Gala Dining Packages</label>
                    <select
                      value={bookingPackage}
                      onChange={(e) => setBookingPackage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {DINING_PACKAGES.map(pkg => (
                        <option key={pkg.name} value={pkg.name} className="bg-[#150f0c]">{pkg.name} {pkg.price > 0 ? `(+₹${pkg.price})` : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Special requests checklist (Module 6) */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-cream/40 block">Special Arrangements</label>
                  <div className="flex flex-wrap gap-2.5">
                    {SPECIAL_REQUESTS.map(opt => {
                      const isSelected = bookingRequests.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleToggleRequest(opt)}
                          className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
                            isSelected ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirms notification channel checkboxes (Module 9) */}
                <div className="flex gap-6 border-t border-white/5 pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotification} 
                      onChange={(e) => setEmailNotification(e.target.checked)}
                      className="rounded border-white/10 bg-black/40 text-orange-500" 
                    />
                    <span className="text-[10px] text-cream/65 uppercase tracking-wider font-mono">Send Email Confirmation</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsNotification} 
                      onChange={(e) => setSmsNotification(e.target.checked)}
                      className="rounded border-white/10 bg-black/40 text-orange-500" 
                    />
                    <span className="text-[10px] text-cream/65 uppercase tracking-wider font-mono">Send SMS Confirmation</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Booking confirmation list ledger */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6 select-none text-left relative overflow-hidden">
              <FocalGlowBloom className="w-48 h-48 -right-10 -bottom-10" />
              <h4 className="text-sm uppercase tracking-widest text-orange-500 font-bold font-mono relative z-10">Reserving Details</h4>
              
              <div className="space-y-3.5 text-xs text-cream/70 border-b border-white/5 pb-4 relative z-10">
                <div className="flex justify-between">
                  <span>Selected Date:</span>
                  <span className="text-white font-bold">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Time Slot:</span>
                  <span className="text-white font-bold">{bookingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests Count:</span>
                  <span className="text-white font-bold">{bookingGuests} heads</span>
                </div>
                <div className="flex justify-between">
                  <span>Table Configuration:</span>
                  <span className="text-white font-bold">{bookingTableType} ({bookingTableId || "No Seat Selected"})</span>
                </div>
                <div className="flex justify-between">
                  <span>Package Selected:</span>
                  <span className="text-white font-bold">{bookingPackage}</span>
                </div>
                {DINING_PACKAGES.find(p => p.name === bookingPackage)?.price ? (
                  <div className="flex justify-between text-orange-400">
                    <span>Package Surcharge:</span>
                    <span className="font-mono">+₹{DINING_PACKAGES.find(p => p.name === bookingPackage)?.price}</span>
                  </div>
                ) : null}
              </div>

              <motion.button
                animate={{
                  boxShadow: ["0 4px 10px rgba(249,115,22,0.1)", "0 4px 20px rgba(249,115,22,0.25)", "0 4px 10px rgba(249,115,22,0.1)"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlaceReservation(false)}
                disabled={TIME_SLOTS.find(s => s.time === bookingTime)?.isBooked}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:pointer-events-none text-[#150f0c] font-bold rounded-2xl transition duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative z-10 hover:shadow-orange-500/20 active:scale-[0.98]"
              >
                Confirm Seating Booking
              </motion.button>

              {/* Tier 2: Dining Waitlist section */}
              <div className="border-t border-white/5 pt-5 space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest block">Dining Waitlist</span>
                    <p className="text-[10px] text-cream/50 mt-1">Tables filling up? Join the queue and we'll notify you.</p>
                  </div>
                  <button
                    onClick={() => setShowWaitlistModal(true)}
                    className="px-3 py-2 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 text-cream"
                  >
                    <Bell size={11} /> Join Queue
                  </button>
                </div>

                {waitlistEntries.length > 0 && (
                  <div className="space-y-2">
                    {waitlistEntries.map(entry => (
                      <div key={entry.id} className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        entry.status === "ready"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-white/[0.02] border-white/5"
                      }`}>
                        <div>
                          <p className="font-bold text-white">{entry.name} — {entry.guests} guests</p>
                          <p className="text-[9px] text-cream/50 mt-0.5">Position #{entry.position} · {entry.phone}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                          entry.status === "ready"
                            ? "bg-green-500 text-black animate-pulse"
                            : "bg-orange-500/20 text-orange-400"
                        }`}>
                          {entry.status === "ready" ? "🎉 Ready!" : "Waiting"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Bookings ledger widgets (Module 10, 11 & 12) */}
              <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
                <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest block">Your Active Reservations ({savedBookings.filter(b => b.status !== "Completed" && b.status !== "Cancelled").length})</span>
                
                <div className="space-y-4">
                  {savedBookings.filter(b => b.status !== "Completed" && b.status !== "Cancelled").map(book => (
                    <div key={book.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-white font-bold">{book.id}</span>
                        <span className={`text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded font-bold ${
                          book.waitlisted 
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15" 
                            : book.status === "Seated" 
                              ? "bg-green-500/10 text-green-400 border border-green-500/15 animate-pulse"
                              : "bg-orange-500/10 text-orange-400 border border-orange-500/15"
                        }`}>
                          {book.waitlisted ? `Waitlisted #${book.waitlistPosition}` : book.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-cream/70 space-y-1.5 leading-snug">
                        <p>🗓️ Date: {book.date} &middot; Time: {book.time} ({book.duration})</p>
                        <p>👥 Table: {book.tableType} ({book.tableId}) &middot; Guests: {book.guests}</p>
                        <p>🎁 Package: {book.diningPackage}</p>
                      </div>

                      {/* Reminder status logs (Module 11) */}
                      <div className="bg-black/20 p-2.5 rounded-xl text-[8px] font-mono space-y-1 border border-white/5">
                        <span className="text-orange-500 uppercase tracking-widest font-bold">Active Reminders Timeline</span>
                        <div className="flex gap-4 text-cream/60">
                          <span>24h Alert: {book.waitlisted ? "N/A" : "🔔 Sent"}</span>
                          <span>2h Alert: {book.waitlisted ? "N/A" : "🔔 Sent"}</span>
                          <span onClick={() => showToast("Directions Link: Ready 📍")} className="text-orange-400 cursor-pointer">Map Nav: 📍 Open</span>
                        </div>
                      </div>

                      {/* QR Ticket visual checkin (Module 9 & 13) */}
                      {!book.waitlisted && (
                        <div className="flex items-center gap-3.5 bg-black/40 border border-white/5 p-3 rounded-xl">
                          <svg className="w-12 h-12 bg-white p-1 rounded shrink-0" viewBox="0 0 100 100">
                            {/* Visual QR SVG */}
                            <path d="M 10 10 H 40 V 40 H 10 Z M 15 15 H 35 V 35 H 15 Z M 60 10 H 90 V 40 H 60 Z M 65 15 H 85 V 35 H 65 Z M 10 60 H 40 V 90 H 10 Z M 15 65 H 35 V 85 H 15 Z" fill="black" />
                            <rect x="50" y="50" width="10" height="10" fill="black" />
                            <rect x="70" y="70" width="10" height="10" fill="black" />
                            <rect x="60" y="80" width="15" height="10" fill="black" />
                            <rect x="80" y="60" width="10" height="15" fill="black" />
                          </svg>
                          <div className="text-left space-y-1">
                            <span className="text-[8px] uppercase font-mono text-cream/40 block">Ticket check-in scan</span>
                            <button
                              onClick={() => {
                                setSavedBookings(prev => 
                                  prev.map(b => b.id === book.id ? { ...b, status: b.status === "Confirmed" ? "Seated" : "Completed" } : b)
                                );
                                showToast(book.status === "Confirmed" ? "Checked In: Table Seated" : "Dining Completed!");
                              }}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white transition cursor-pointer"
                            >
                              {book.status === "Confirmed" ? "⚡ Simulate QR Check-In" : "🏁 Simulate Meal Complete"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Management Trigger actions (Module 10) */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            setRescheduleBookingTarget(book);
                            setRescheduleDate(book.date);
                            setRescheduleTime(book.time);
                            setShowRescheduleModal(true);
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold transition cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setUpgradeBookingTarget(book);
                            setUpgradeTableType(book.tableType);
                            setShowUpgradeModal(true);
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold transition cursor-pointer"
                        >
                          Upgrade Seat
                        </button>
                        <button
                          onClick={() => {
                            setAddGuestsTarget(book);
                            setAddGuestsCount(2);
                            setShowAddGuestsModal(true);
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold transition cursor-pointer"
                        >
                          Add Guests
                        </button>
                        <button
                          onClick={() => handleCancelBooking(book.id)}
                          className="px-2 py-1 bg-red-950/40 hover:bg-red-950/60 border border-red-800/30 rounded text-[9px] font-bold text-red-300 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 TAB 2.5: SMART MEAL PLANNER WIZARD */}
        {activeTab === "planner" && (
          <section className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl space-y-8 animate-fadeIn relative overflow-hidden text-left">
            <FocalGlowBloom className="w-96 h-96 -top-20 -left-20" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Personalized Dining Generator</span>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <Sparkles className="text-orange-500" /> Smart Meal Planner
                </h3>
              </div>
              
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <button
                    key={stepNum}
                    onClick={() => {
                      if (stepNum < plannerStep) {
                        setPlannerStep(stepNum as any);
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      plannerStep === stepNum 
                        ? "w-8 bg-orange-500" 
                        : plannerStep > stepNum 
                          ? "w-4 bg-orange-500/40" 
                          : "w-2 bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 min-h-[350px]">
              <AnimatePresence mode="wait">
                {plannerStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif font-bold text-white leading-tight">
                        What's your meal budget today?
                      </h4>
                      <p className="text-xs text-cream/50 font-sans">
                        Let us know how much you'd like to spend. We'll search our actual menu to find the highest-valued combos that fit.
                      </p>
                    </div>

                    {/* Quick Budget Pills */}
                    <div className="flex flex-wrap gap-3 font-mono">
                      {[100, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setPlanBudget(amt)}
                          className={`px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 ${
                            planBudget === amt
                              ? "bg-orange-500 border-orange-500 text-[#150f0c] shadow-lg shadow-orange-500/20"
                              : "bg-white/[0.02] border-white/10 text-cream hover:border-orange-500/40 hover:bg-orange-500/5"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="max-w-xs space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-mono text-cream/40 block">Or enter a custom budget amount</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-orange-500 font-serif font-black">₹</span>
                        <input
                          type="number"
                          value={planBudget || ""}
                          onChange={(e) => setPlanBudget(Math.max(0, Number(e.target.value)))}
                          placeholder="Enter budget (e.g. 600)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-8 pr-4 text-sm focus:outline-none focus:border-orange-500 transition text-cream placeholder-cream/35 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setPlannerStep(2)}
                        disabled={planBudget <= 0}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider"
                      >
                        Next: Who's eating <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {plannerStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif font-bold text-white leading-tight">
                        Who is dining today?
                      </h4>
                      <p className="text-xs text-cream/50 font-sans">
                        Choose your group size so we can optimize portions and suggest balanced spreads for everyone.
                      </p>
                    </div>

                    {/* Quick Party Size Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Myself", value: 1, desc: "Single portion" },
                        { label: "Couple", value: 2, desc: "2 people dining" },
                        { label: "Family (3-4)", value: 4, desc: "4 people dining" },
                        { label: "Group (5+)", value: 5, desc: "Enables diet split" },
                      ].map((item) => {
                        const isActive = 
                          (item.value === 1 && planPeopleCount === 1) ||
                          (item.value === 2 && planPeopleCount === 2) ||
                          (item.value === 4 && planPeopleCount === 4) ||
                          (item.value === 5 && planPeopleCount >= 5);
                        
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              setPlanPeopleCount(item.value);
                              if (item.value >= 3) {
                                setPlanVegCount(Math.ceil(item.value / 2));
                                setPlanNonVegCount(Math.floor(item.value / 2));
                              } else {
                                setPlanVegCount(item.value);
                                setPlanNonVegCount(0);
                              }
                            }}
                            className={`p-4 border rounded-3xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between min-h-24 relative overflow-hidden group ${
                              isActive
                                ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                                : "bg-white/[0.01] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <h6 className="font-bold text-xs text-white font-sans">{item.label}</h6>
                              <Users size={14} className={isActive ? 'text-orange-500' : 'text-cream/40'} />
                            </div>
                            <p className="text-[9px] text-cream/45 mt-2 font-sans">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Exact count stepper for Groups */}
                    {planPeopleCount >= 5 && (
                      <div className="max-w-xs space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-mono text-cream/40 block">Number of Guests</label>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 w-max">
                          <button
                            onClick={() => {
                              const nextCount = Math.max(5, planPeopleCount - 1);
                              setPlanPeopleCount(nextCount);
                              setPlanVegCount(Math.ceil(nextCount / 2));
                              setPlanNonVegCount(Math.floor(nextCount / 2));
                            }}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                          >
                            -
                          </button>
                          <span className="text-sm font-mono font-bold w-8 text-center text-white">{planPeopleCount}</span>
                          <button
                            onClick={() => {
                              const nextCount = planPeopleCount + 1;
                              setPlanPeopleCount(nextCount);
                              setPlanVegCount(Math.ceil(nextCount / 2));
                              setPlanNonVegCount(Math.floor(nextCount / 2));
                            }}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Diet split for Families/Groups */}
                    {planPeopleCount >= 3 && (
                      <div className="bg-[#1b1411]/50 border border-white/5 p-5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <Sliders size={14} className="text-orange-500" />
                          <h6 className="text-xs font-bold uppercase tracking-wider text-white font-sans">Group Diet Breakdown (Optional)</h6>
                        </div>
                        <p className="text-[11px] text-cream/50 font-sans">
                          If your group contains people with different dietary requirements, we will split the budget proportionally and recommend matching items.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider font-mono text-green-400 block font-bold">🟢 Veg Preferring</label>
                            <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl p-1.5 w-max">
                              <button
                                onClick={() => {
                                  const nextVeg = Math.max(0, planVegCount - 1);
                                  setPlanVegCount(nextVeg);
                                  setPlanNonVegCount(planPeopleCount - nextVeg);
                                }}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold w-6 text-center text-white">{planVegCount}</span>
                              <button
                                onClick={() => {
                                  const nextVeg = Math.min(planPeopleCount, planVegCount + 1);
                                  setPlanVegCount(nextVeg);
                                  setPlanNonVegCount(planPeopleCount - nextVeg);
                                }}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider font-mono text-red-400 block font-bold">🔴 Non-Veg Preferring</label>
                            <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl p-1.5 w-max">
                              <button
                                onClick={() => {
                                  const nextNonVeg = Math.max(0, planNonVegCount - 1);
                                  setPlanNonVegCount(nextNonVeg);
                                  setPlanVegCount(planPeopleCount - nextNonVeg);
                                }}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold w-6 text-center text-white">{planNonVegCount}</span>
                              <button
                                onClick={() => {
                                  const nextNonVeg = Math.min(planPeopleCount, planNonVegCount + 1);
                                  setPlanNonVegCount(nextNonVeg);
                                  setPlanVegCount(planPeopleCount - nextNonVeg);
                                }}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold font-mono"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setPlannerStep(1)}
                        className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold text-cream"
                      >
                        <ChevronLeft size={14} /> Back
                      </button>
                      <button
                        onClick={() => setPlannerStep(3)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider"
                      >
                        Next: Occasion <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {plannerStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2 flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-serif font-bold text-white leading-tight">
                          Select the Occasion
                        </h4>
                        <p className="text-xs text-cream/50 font-sans">
                          Select an occasion to calibrate dish styles and preferences (e.g. kid-friendly choices for families, premium romantic plates for date night).
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setPlanOccasion("casual");
                          setPlannerStep(4);
                        }}
                        className="text-xs text-orange-500 hover:text-orange-400 font-mono tracking-wider uppercase font-bold cursor-pointer transition border border-orange-500/20 rounded-full px-4 py-1.5 bg-orange-500/5 hover:bg-orange-500/10"
                      >
                        Skip &amp; Default
                      </button>
                    </div>

                    {/* Occasion cards list */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-sans">
                      {[
                        { id: "casual", emoji: "🏠", label: "Casual", desc: "A cozy standard meal" },
                        { id: "quick-bite", emoji: "⚡", label: "Quick Bite", desc: "Speedy snacks & sips" },
                        { id: "date", emoji: "🕯️", label: "Date Night", desc: "Romantic plates" },
                        { id: "family", emoji: "👨‍👩‍👧", label: "Family Meal", desc: "Kid friendly" },
                        { id: "celebration", emoji: "🎉", label: "Celebration", desc: "Indulgent bestseller picks" },
                      ].map((item) => {
                        const isActive = planOccasion === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setPlanOccasion(item.id as any)}
                            className={`p-4 border rounded-3xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between min-h-32 relative overflow-hidden group ${
                              isActive
                                ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                                : "bg-white/[0.01] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.02]"
                            }`}
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <div className="mt-4">
                              <h6 className="font-bold text-xs text-white leading-none">{item.label}</h6>
                              <p className="text-[8px] text-cream/40 mt-1 leading-snug">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setPlannerStep(2)}
                        className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold text-cream"
                      >
                        <ChevronLeft size={14} /> Back
                      </button>
                      <button
                        onClick={() => setPlannerStep(4)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider"
                      >
                        Next: Dietary <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {plannerStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif font-bold text-white leading-tight">
                        Select Dietary Constraints
                      </h4>
                      <p className="text-xs text-cream/50 font-sans">
                        Specify if you have strict diet boundaries. (Note: If you already configured a custom Veg vs Non-Veg split in Step 2, this general filter will be bypassed in favor of your split preferences).
                      </p>
                    </div>

                    {/* Diet select options */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                      {[
                        { id: "any", label: "Any Diet", desc: "No restrictions", emoji: "🍽️" },
                        { id: "veg", label: "Vegetarian", desc: "Pure veg options", emoji: "🟢" },
                        { id: "non-veg", label: "Non-Vegetarian", desc: "Only non-veg options", emoji: "🔴" },
                        { id: "vegan", label: "Vegan", desc: "Plant-based only", emoji: "🍀" },
                      ].map((item) => {
                        const isActive = planDietFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setPlanDietFilter(item.id as any)}
                            className={`p-4 border rounded-3xl transition-all duration-300 text-left cursor-pointer flex flex-col justify-between min-h-24 relative overflow-hidden group ${
                              isActive
                                ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                                : "bg-white/[0.01] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <h6 className="font-bold text-xs text-white">{item.label}</h6>
                              <span className="text-xs">{item.emoji}</span>
                            </div>
                            <p className="text-[9px] text-cream/45 mt-2">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => setPlannerStep(3)}
                        className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold text-cream"
                      >
                        <ChevronLeft size={14} /> Back
                      </button>
                      <button
                        onClick={() => {
                          setPlannerStep(5);
                          setPlannerLoading(true);
                          setTimeout(() => {
                            const inputObj = {
                              budget: planBudget,
                              peopleCount: planPeopleCount,
                              dietaryFilter: planDietFilter,
                              occasion: planOccasion,
                              splitPreferences: planPeopleCount >= 3 ? {
                                vegCount: planVegCount,
                                nonVegCount: planNonVegCount
                              } : undefined
                            };
                            const result = solveMealPlan(inputObj);
                            setPlannerResult(result);
                            setPlannerLoading(false);
                          }, 1200);
                        }}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-orange-500/15"
                      >
                        🚀 Solve &amp; Generate Meal Plan
                      </button>
                    </div>
                  </motion.div>
                )}

                {plannerStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {plannerLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-4 font-sans">
                        <div className="relative w-16 h-16">
                          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
                            <circle cx="50" cy="50" r="40" stroke="rgba(249,115,22,0.1)" strokeWidth="8" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke="#f97316" strokeWidth="8" strokeDasharray="180 60" fill="none" strokeLinecap="round" />
                          </svg>
                          <Sparkles className="absolute inset-0 m-auto text-orange-500 animate-pulse" size={20} />
                        </div>
                        <p className="font-serif italic text-lg text-white">Composing your balanced plate...</p>
                        <p className="text-xs text-cream/40">Analyzing constraints against Michelin-starred catalog.</p>
                      </div>
                    ) : plannerResult ? (
                      <div className="space-y-6 text-left">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                          <div className="bg-[#1b1411] border border-white/5 p-4 rounded-2xl text-left flex justify-between items-center relative overflow-hidden">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider font-mono text-cream/40">Total Budget Spent</p>
                              <h4 className="text-xl font-mono font-bold text-white mt-1">₹{plannerResult.totalCost} / <span className="text-cream/50 text-sm">₹{planBudget}</span></h4>
                            </div>
                            <span className="text-xs font-mono font-bold px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
                              {plannerResult.budgetUtilization}% Utilized
                            </span>
                          </div>

                          <div className="bg-[#1b1411] border border-white/5 p-4 rounded-2xl text-left relative overflow-hidden">
                            <p className="text-[8px] uppercase tracking-wider font-mono text-cream/40">Caloric Estimate</p>
                            <h4 className="text-xl font-mono font-bold text-white mt-1">
                              ~{plannerResult.nutritionSummary.totalCalories} kcal
                            </h4>
                            <p className="text-[8px] text-cream/40 mt-1 uppercase font-mono">
                              Tier: <span className={`font-bold ${
                                plannerResult.nutritionSummary.balance === "hearty" ? "text-red-400" :
                                plannerResult.nutritionSummary.balance === "light" ? "text-green-400" : "text-orange-400"
                              }`}>{plannerResult.nutritionSummary.balance}</span>
                            </p>
                          </div>

                          <div className="bg-[#1b1411] border border-white/5 p-4 rounded-2xl text-left relative overflow-hidden">
                            <p className="text-[8px] uppercase tracking-wider font-mono text-cream/40">Occasion Theme</p>
                            <h4 className="text-base font-serif font-bold text-white mt-1 uppercase tracking-wider text-orange-400">
                              {planOccasion.replace("-", " ")}
                            </h4>
                            <p className="text-[8px] text-cream/40 mt-1 uppercase font-mono">For {planPeopleCount} guests</p>
                          </div>
                        </div>

                        {/* Reasoning block */}
                        <div className="bg-orange-500/5 border border-orange-500/10 p-5 rounded-3xl relative overflow-hidden">
                          <FocalGlowBloom className="w-24 h-24 -right-6 -bottom-6 opacity-20" />
                          <div className="flex gap-2.5 items-start relative z-10">
                            <Sparkles className="text-orange-500 shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">Chef Concierge's Verdict</p>
                              <p className="text-xs text-cream/80 leading-relaxed mt-1 font-serif whitespace-pre-line">{plannerResult.reasoning}</p>
                            </div>
                          </div>
                        </div>

                        {/* Items grid */}
                        <div className="space-y-3 font-sans">
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono block">Recommended Spread</span>
                          
                          {plannerResult.items.length === 0 ? (
                            <div className="py-8 text-center text-cream/40 bg-white/[0.01] border border-white/5 rounded-2xl">
                              <p className="font-serif italic text-sm">No items found within this constraint.</p>
                            </div>
                          ) : (
                            <motion.div 
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.08 } }
                              }}
                            >
                              {plannerResult.items.map((item) => (
                                <motion.div
                                  key={item.dish.id}
                                  variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    visible: { opacity: 1, y: 0 }
                                  }}
                                  className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between gap-4 hover:border-orange-500/20 transition-all duration-300 relative group"
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={item.dish.image} className="w-12 h-12 object-cover rounded-xl bg-white/5 shrink-0" alt={item.dish.name} />
                                    <div className="text-left">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${item.dish.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                                        <h6 className="font-serif font-black text-white text-xs leading-none">{item.dish.name}</h6>
                                      </div>
                                      <p className="text-[10px] text-cream/50 mt-1">{item.dish.category} &middot; ~{(item.dish.id * 3 + 120)} kcal</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <span className="font-mono text-xs font-bold text-cream block">Qty: {item.quantity}</span>
                                      <span className="font-serif font-bold text-orange-500 text-xs mt-0.5 block">₹{item.dish.price * item.quantity}</span>
                                    </div>
                                    <button
                                      onClick={() => setSwapTargetItem(item)}
                                      className="px-2.5 py-1.5 bg-white/5 hover:bg-orange-500 hover:text-[#150f0c] border border-white/10 rounded-xl text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer"
                                    >
                                      Swap
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>

                        {/* Actions footer */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5 font-sans">
                          <button
                            onClick={() => {
                              if (plannerResult.items.length === 0) return;
                              plannerResult.items.forEach((item) => {
                                for (let q = 0; q < item.quantity; q++) {
                                  addToCart({
                                    id: String(item.dish.id),
                                    name: item.dish.name,
                                    price: item.dish.price,
                                    image: item.dish.image,
                                    description: item.dish.ingredients
                                  });
                                }
                              });
                              playAddToCartSound();
                              showToast(`Added all recommended items to your cart!`);
                              setActiveTab("checkout");
                            }}
                            disabled={plannerResult.items.length === 0}
                            className="w-full sm:w-auto px-6 py-3.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                          >
                            <ShoppingBag size={14} /> Add Full Combo to Cart
                          </button>
                          
                          <button
                            onClick={() => {
                              setPlannerStep(1);
                              setPlannerResult(null);
                            }}
                            className="text-xs text-orange-400 hover:text-orange-300 font-mono tracking-wider uppercase font-bold cursor-pointer transition py-2.5 px-4"
                          >
                            🔄 Reset &amp; Try Another Budget
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-cream/40 bg-white/[0.01] border border-white/5 rounded-2xl font-sans">
                        <p className="font-serif italic text-sm">Failed to generate meal plan. Please reset and try again.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* TAB 8: CHECKOUT HUB */}
        {activeTab === "checkout" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left Checkout config & Details */}
            <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 select-none text-left">
              <h3 className="text-xl md:text-2xl font-serif font-black text-white tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-orange-500" />
                Gourmet Checkout Hub
              </h3>

              {/* Cart Items Summary */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Your Order</span>
                
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-cream/40 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <p className="font-serif italic text-sm">Your gourmet cart is empty</p>
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="mt-3 px-4 py-2 bg-orange-500 text-[#150f0c] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Browse Gourmet Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} className="w-12 h-12 object-cover rounded-xl bg-white/5 shrink-0" alt={item.name} />
                          <div>
                            <h6 className="font-bold text-white text-sm leading-snug">{item.name}</h6>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 border border-white/10 rounded-xl p-1 bg-black/20">
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-xs text-cream/65 hover:text-white cursor-pointer"
                            >
                              -
                            </motion.button>
                            <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-xs text-cream/65 hover:text-white cursor-pointer"
                            >
                              +
                            </motion.button>
                          </div>
                          <span className="font-serif font-black text-orange-500 text-sm min-w-16 text-right">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {cart.length === 1 && (
                      (() => {
                        const itemInCart = cart[0];
                        const allDishes = getMappedDishes();
                        const targetCategory = allDishes.find(d => String(d.id) === itemInCart.id || d.name === itemInCart.name)?.category || "Main Course";
                        
                        const suggestions = allDishes.filter(d => {
                          if (d.name === itemInCart.name) return false;
                          if (targetCategory === "Main Course") {
                            return d.category === "Drinks" || d.category === "Starters";
                          }
                          return d.category === "Main Course";
                        }).sort((a, b) => b.rating - a.rating);

                        const suggestion = suggestions[0];
                        if (!suggestion) return null;

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-orange-500/5 border border-orange-500/10 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left mt-3.5 relative overflow-hidden"
                          >
                            <FocalGlowBloom className="w-24 h-24 -right-6 -bottom-6 opacity-20" />
                            <div className="flex items-center gap-2.5 relative z-10">
                              <span className="text-lg">✨</span>
                              <div className="font-sans">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">Complete Your Meal</p>
                                <p className="text-[11px] text-cream/80 font-sans">Add <span className="font-bold text-white">{suggestion.name}</span> for ₹{suggestion.price} to balance your order?</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: String(suggestion.id),
                                  name: suggestion.name,
                                  price: suggestion.price,
                                  image: suggestion.image,
                                  description: suggestion.ingredients
                                });
                                playAddToCartSound();
                                showToast(`Added ${suggestion.name} to complete your meal!`);
                              }}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-[10px] font-bold uppercase rounded-lg transition relative z-10 cursor-pointer"
                            >
                              + Add
                            </button>
                          </motion.div>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Address selection (Module 8 & 10) */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Deliver To</span>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer"
                  >
                    + Add Address
                  </button>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <motion.div 
                        whileHover={{ y: -4 }}
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4.5 border rounded-3xl transition-all duration-300 cursor-pointer flex justify-between items-center gap-4 ${
                          isSelected 
                            ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
                            : "bg-white/[0.01] border-white/5 hover:border-orange-500/20 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500/80" />
                          <div>
                            <h6 className="font-bold text-white text-xs">{addr.type} Address</h6>
                            <p className="text-[10px] text-cream/55 mt-1 leading-normal">{addr.addressLine}</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-orange-500" : "border-white/20"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods (Module 10) */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Select Payment Method</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "upi", label: "📱 UPI", desc: "Instant checkout via App" },
                    { id: "card", label: "💳 Card", desc: "Credit / Debit Cards" },
                    { id: "cod", label: "💵 COD", desc: "Cash on delivery" },
                    { id: "split", label: "👥 Split Bill", desc: "Share bill with friends" }
                  ].map((pay) => {
                    const isSelected = paymentOption === pay.id;
                    return (
                      <button
                        key={pay.id}
                        onClick={() => setPaymentOption(pay.id as any)}
                        className={`p-3.5 border rounded-2xl transition text-left cursor-pointer flex flex-col justify-between min-h-20 ${
                          isSelected ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-white/5 border-white/10 hover:bg-white/15"
                        }`}
                      >
                        <h6 className="font-bold text-xs text-white">{pay.label}</h6>
                        <p className="text-[8px] text-cream/45 mt-1.5 leading-normal">{pay.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Form fields based on payment type */}
                {paymentOption === "card" && (
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
                    <span className="text-[9px] uppercase font-mono text-orange-500 font-bold block">Enter Card Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="1234 5678 1234 5678"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="Sathveek Nalla"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">CVV</label>
                        <input 
                          type="password" 
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={saveCardCheckbox}
                        onChange={(e) => setSaveCardCheckbox(e.target.checked)}
                        className="rounded border-white/10 bg-black/40 text-orange-500"
                      />
                      <span className="text-[9px] text-cream/60 uppercase tracking-wider font-mono">Save Card for Future Orders</span>
                    </label>
                  </div>
                )}

                {paymentOption === "upi" && (
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
                    <span className="text-[9px] uppercase font-mono text-orange-500 font-bold block">Enter UPI Address</span>
                    <div>
                      <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">UPI ID</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="username@upi"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 flex-1"
                        />
                        <button 
                          onClick={() => {
                            if (upiIdInput.trim()) {
                              showToast("UPI Handshake Successful", "success");
                            } else {
                              showToast("Please enter a valid UPI ID", "error");
                            }
                          }}
                          className="px-4 py-2 bg-[#1b1411] border border-white/10 rounded-xl text-xs font-bold text-white transition hover:bg-orange-500 hover:text-[#150f0c] cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {paymentOption === "split" && (
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
                    <span className="text-[9px] uppercase font-mono text-orange-500 font-bold block">Setup Split Payment Invite</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">Payer Count (including you)</label>
                        <input 
                          type="number" 
                          min={2}
                          max={5}
                          value={splitCount}
                          onChange={(e) => setSplitCount(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-mono text-cream/40 block mb-1">Friend's Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+91 98765 43210"
                          value={splitPhone}
                          onChange={(e) => setSplitPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <p className="text-[9px] text-cream/50 leading-snug">Each person will pay: <span className="font-mono text-white font-bold">₹{Math.round(totalAmountPayable / splitCount)}</span></p>
                      <button 
                        onClick={() => {
                          if (splitPhone.trim()) {
                            setSplitSuccess(true);
                            showToast("Bill splitting invite notifications sent", "success");
                          } else {
                            showToast("Please enter a phone number", "error");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#1b1411] border border-white/10 rounded-xl text-[10px] font-bold text-white transition hover:bg-orange-500 hover:text-[#150f0c] cursor-pointer"
                      >
                        {splitSuccess ? "Invites Sent ✓" : "Send Split Request"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Invoice & Confirmation */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6 select-none text-left relative overflow-hidden">
              <FocalGlowBloom className="w-48 h-48 -right-10 -bottom-10" />
              <h4 className="text-sm uppercase tracking-widest text-orange-500 font-bold font-mono relative z-10">Invoice Summary</h4>
              
              {/* Promo code entry */}
              <div className="space-y-2 border-b border-white/5 pb-4 relative z-10">
                <label className="text-[9px] uppercase font-mono text-cream/40 block">Gourmet Coupon Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon (e.g. FLAVORA50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 flex-1 uppercase"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="px-3 py-2 bg-orange-500 text-[#150f0c] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus === "valid" && appliedVoucher && (
                  <p className="text-[9px] text-green-400 font-bold font-mono">
                    {appliedVoucher.code} applied successfully! {appliedVoucher.description}
                  </p>
                )}
                {couponStatus === "invalid" && (
                  <p className="text-[9px] text-orange-400 font-bold font-mono">
                    That code doesn't look right — double-check and try again
                  </p>
                )}
              </div>

              {/* Rider Tipping Selector */}
              <div className="space-y-2 border-b border-white/5 pb-4 relative z-10">
                <label className="text-[9px] uppercase font-mono text-cream/40 block">Tip Your Delivery Rider</label>
                <div className="flex gap-2">
                  {[0, 20, 30, 50].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => setDeliveryTip(tip)}
                      className={`px-3 py-2 border rounded-xl text-xs font-mono flex-1 transition cursor-pointer ${
                        deliveryTip === tip 
                          ? "bg-orange-500 border-orange-500 text-[#150f0c] font-bold" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      }`}
                    >
                      {tip === 0 ? "No Tip" : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final calculation matrix */}
              <div className="space-y-3.5 text-xs text-cream/70 border-b border-white/5 pb-4 relative z-10">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span className="text-white font-mono font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Surcharge (5%):</span>
                  <span className="text-white font-mono">₹{gstAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>Delivery Fee:</span>
                    {deliveryFee === 0 && cartTotal > 0 && <span className="text-[8px] text-orange-400/80 font-sans tracking-wide">Free on orders above ₹500</span>}
                  </div>
                  <span className="text-white font-mono">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Charge:</span>
                  <span className="text-white font-mono">₹{platformFee}</span>
                </div>
                {deliveryTip > 0 && (
                  <div className="flex justify-between">
                    <span>Rider Tip:</span>
                    <span className="text-white font-mono">₹{deliveryTip}</span>
                  </div>
                )}
                {appliedVoucher && discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedVoucher.code}):</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}
                {appliedVoucher && appliedVoucher.type === "free_shipping" && (
                  <div className="flex justify-between text-green-400">
                    <span>Voucher ({appliedVoucher.code}):</span>
                    <span className="font-mono">FREE Shipping</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                  <span>Total Amount Payable:</span>
                  <span className="text-orange-500 font-mono font-black">₹{totalAmountPayable}</span>
                </div>
              </div>

              <motion.button
                animate={{
                  boxShadow: ["0 4px 10px rgba(249,115,22,0.1)", "0 4px 20px rgba(249,115,22,0.25)", "0 4px 10px rgba(249,115,22,0.1)"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || isSubmittingOrder}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:pointer-events-none text-[#150f0c] font-bold rounded-2xl transition duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative z-10 hover:shadow-orange-500/30 active:scale-[0.98]"
              >
                {isSubmittingOrder ? "Processing Invoice..." : "Place Gourmet Order"}
              </motion.button>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE ORDER TRACKING MAP */}
        {activeTab === "tracking" && (
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 select-none text-left animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 font-mono">Simulated Live Session</span>
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white tracking-tight mt-1">Live Tracking Console</h3>
              </div>
              
              {activeOrder && (
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs text-cream/40 font-mono">Order ID: <span className="text-white font-bold">{activeOrder.id}</span></p>
                  <p className="text-sm font-mono text-orange-500 font-bold mt-0.5">Grand Total: ₹{activeOrder.total}</p>
                </div>
              )}
            </div>

            {!activeOrder ? (
              <div className="py-16 text-center text-cream/40">
                <Truck size={48} className="mx-auto mb-4 opacity-20 text-orange-500 animate-bounce" />
                <p className="font-serif italic text-lg text-white">No active orders tracking</p>
                <p className="text-xs text-cream/45 mt-1 max-w-xs mx-auto">Place an order from the checkout hub to observe live telemetry.</p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="mt-6 px-5 py-2.5 bg-orange-500 text-[#150f0c] rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Browse Menu Selections
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Visual Status Stepper */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 pt-4 border-b border-white/5 pb-8">
                  {/* Stepper background track */}
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 rounded hidden md:block -translate-y-1/2 z-0" />
                  {/* Stepper active progress track */}
                  <div 
                    className="absolute top-1/2 left-0 h-[2px] bg-orange-500 rounded hidden md:block -translate-y-1/2 z-0 transition-all duration-700" 
                    style={{
                      width: `${((): number => {
                        const statusOrder = ["Order Placed", "Accepted", "Preparing", "Packed", "Out For Delivery", "Delivered"];
                        const activeIdx = statusOrder.indexOf(activeOrder.status);
                        return (activeIdx / (statusOrder.length - 1)) * 100;
                      })()}%`
                    }}
                  />
                  
                  {[
                    "Order Placed",
                    "Accepted",
                    "Preparing",
                    "Packed",
                    "Out For Delivery",
                    "Delivered"
                  ].map((stage, idx) => {
                    const statusOrder = ["Order Placed", "Accepted", "Preparing", "Packed", "Out For Delivery", "Delivered"];
                    const activeIdx = statusOrder.indexOf(activeOrder.status);
                    const isActive = activeIdx >= idx;
                    const isCurrent = activeIdx === idx;
                    
                    return (
                      <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-2.5 relative z-10 w-full text-left md:text-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all duration-500 ${
                          isCurrent 
                            ? "bg-orange-500 border-orange-500 text-[#150f0c] shadow-lg shadow-orange-500/50 scale-110" 
                            : isActive 
                              ? "bg-orange-950 border-orange-500 text-orange-400" 
                              : "bg-black/50 border-white/10 text-cream/30"
                        }`}>
                          {isActive ? "✓" : idx + 1}
                        </div>
                        <div>
                          <h6 className={`text-xs font-bold font-serif ${isActive ? "text-white" : "text-cream/30"}`}>{stage}</h6>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Delivery Path Map */}
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest">Rider Real-Time Path Telemetry</span>
                  
                  <div className="w-full aspect-[21/9] bg-[#150f0c] border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner z-10 font-sans">
                    <MapContainer 
                      center={[(19.4180 + (activeOrder.address.coords?.lat || 19.4124)) / 2, (72.8200 + (activeOrder.address.coords?.lng || 72.8258)) / 2]} 
                      zoom={14} 
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                      attributionControl={false}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      {routeCoords.length > 0 && (
                        <Polyline 
                          positions={routeCoords} 
                          color="#f97316" 
                          weight={3.5} 
                          dashArray="6, 8" 
                        />
                      )}
                      <Marker position={[19.4180, 72.8200]} icon={outletIcon}>
                        <Popup>
                          <div className="text-[#150f0c] font-bold text-xs p-1">Flavora Kitchen (Outlet)</div>
                        </Popup>
                      </Marker>
                      <Marker position={[activeOrder.address.coords?.lat || 19.4124, activeOrder.address.coords?.lng || 72.8258]} icon={destinationIcon}>
                        <Popup>
                          <div className="text-[#150f0c] font-bold text-xs p-1">Destination: {activeOrder.address.type}</div>
                        </Popup>
                      </Marker>
                      <Marker position={getRiderPosition()} icon={riderIcon}>
                        <Popup>
                          <div className="text-[#150f0c] font-bold text-xs p-1">Rohan Sharma (Delivery Partner)</div>
                        </Popup>
                      </Marker>
                      <MapRecenter coords={getRiderPosition()} />
                    </MapContainer>

                    <div className="absolute top-4 left-6 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[9px] font-mono text-cream/70 z-[1000]">
                      🟢 Outlet Hub: Flavora Kitchen
                    </div>

                    <div className="absolute bottom-4 right-6 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[9px] font-mono text-cream/70 z-[1000]">
                      🔴 Destination: {activeOrder.address.addressLine.substring(0, 30)}...
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/10 p-6 rounded-3xl items-center relative overflow-hidden">
                  <FocalGlowBloom className="w-48 h-48 -left-10 -bottom-10 opacity-20" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-orange-500 text-[#150f0c] text-xl font-bold flex items-center justify-center shadow-lg border-2 border-orange-400/30 relative shrink-0">
                      <span className="absolute -inset-1 rounded-full border border-orange-500/40 animate-ping opacity-60" />
                      {activeOrder.rider?.avatar}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold">Assigned Delivery Rider</span>
                      <h5 className="font-serif font-black text-white text-base mt-0.5">{activeOrder.rider?.name}</h5>
                      <p className="text-[10px] text-cream/50 flex items-center gap-1.5 mt-0.5">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" /> {activeOrder.rider?.rating} stars &middot; {activeOrder.rider?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right space-y-1">
                    <p className="text-xs text-cream/40 font-mono">Simulation ETA Countdown</p>
                    <h4 className="text-2xl font-mono text-white font-bold animate-pulse">
                      {activeOrder.status === "Delivered" ? "Arrived" : activeOrder.status === "Out For Delivery" ? "8 - 12 mins" : "25 - 30 mins"}
                    </h4>
                  </div>
                </div>

                {activeOrder.status !== "Delivered" && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setActiveOrder(prev => {
                          if (!prev) return null;
                          const nextStages: Order["status"][] = ["Order Placed", "Accepted", "Preparing", "Packed", "Out For Delivery", "Delivered"];
                          const curIdx = nextStages.indexOf(prev.status);
                          const nextStage = nextStages[Math.min(nextStages.length - 1, curIdx + 1)];
                          const nextProgress = Math.min(100, (curIdx + 1) * 20);
                          setMapProgress(nextProgress);
                          
                          setOrderHistory(h => h.map(o => o.id === prev.id ? { ...o, status: nextStage } : o));
                          
                          if (nextStage === "Delivered") {
                            showToast("Order Delivered! Points Updated", "success");
                          } else {
                            showToast(`Status updated to [${nextStage}]`);
                          }

                          return { ...prev, status: nextStage };
                        });
                      }}
                      className="px-4 py-2 border border-white/10 hover:border-orange-500 bg-white/5 hover:bg-orange-500 hover:text-white transition rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ⚡ Advance Simulated Status
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PREVIOUS ORDERS LEDGER LOG */}
        {activeTab === "history" && (
          <div className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 select-none text-left animate-fadeIn relative overflow-hidden">
            <FocalGlowBloom className="w-72 h-72 -top-20 -right-20" />
            
            {/* Split subtabs for Orders vs Reservation History */}
            <h3 className="text-xl md:text-2xl font-serif font-black text-white tracking-tight border-b border-white/5 pb-4 flex items-center gap-2 relative z-10">
              <RefreshCw size={20} className="text-orange-500" />
              Gourmet Transaction &amp; Booking logs
            </h3>

            {/* Food orders section */}
            <div className="space-y-4 relative z-10">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono block">Your Order History</span>
              {orderHistory.length === 0 ? (
                <p className="text-xs text-cream/40 italic">No food delivery orders logged.</p>
              ) : (
                <div className="space-y-4 font-sans">
                  {orderHistory.map((order, index) => (
                    <div 
                      key={order.id} 
                      className={`border border-white/5 p-5 rounded-3xl space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 ${
                        index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-[#18120e]/35'
                      }`}
                    >
                      <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] uppercase tracking-[0.2em] text-cream/40 font-mono">Order Reference</span>
                          <span className="font-mono text-xs text-white/80 font-bold mt-0.5">{order.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] uppercase tracking-[0.2em] text-cream/40 font-mono block">Total Invoiced</span>
                          <span className="text-sm text-orange-500 font-serif font-black">₹{order.total}</span>
                        </div>
                      </div>
                      <div className="text-xs text-cream/60 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-mono opacity-40">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[10px]">
                        <span className="text-cream/40 font-mono">Date: {order.date}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownloadInvoice(order)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl border border-white/10 transition cursor-pointer"
                          >
                            Download Invoice
                          </button>
                          <button 
                            onClick={() => {
                              sendInvoiceEmail(order).then(() => {
                                showToast(`Invoice resent to ${user?.email || "rethveeknalla@gmail.com"}!`, "success");
                              });
                            }} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-cream/80 text-[10px] font-bold rounded-xl border border-white/10 transition cursor-pointer animate-none"
                          >
                            Resend Email
                          </button>
                          <button 
                            onClick={() => handleReorder(order)} 
                            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-[10px] font-bold rounded-xl transition duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
                          >
                            Reorder Items
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table reservations history (Module 14) */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono block">Past Seating Reservations</span>
              
              {savedBookings.filter(b => b.status === "Completed" || b.status === "Cancelled").length === 0 ? (
                <p className="text-xs text-cream/40 italic text-left">No completed reservation history recorded.</p>
              ) : (
                <div className="space-y-4">
                  {savedBookings.filter(b => b.status === "Completed" || b.status === "Cancelled").map(book => (
                    <div key={book.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-white font-bold">{book.id}</span>
                        <span className={`text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded font-bold ${
                          book.status === "Completed" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/15" 
                            : "bg-red-500/10 text-red-400 border border-red-500/15"
                        }`}>
                          {book.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-cream/70 leading-relaxed">
                        <p>🗓️ Date: {book.date} &middot; Time: {book.time} ({book.duration})</p>
                        <p>👥 Table Type: {book.tableType} ({book.tableId}) &middot; Guests Size: {book.guests} heads</p>
                        <p>🎁 Package Selected: {book.diningPackage}</p>
                      </div>

                      {/* Dining Feedback scorecard review rendering (Module 14) */}
                      {book.status === "Completed" && (
                        <div className="pt-2 border-t border-white/5">
                          {book.feedbackSubmitted ? (
                            <div className="bg-black/20 p-3 rounded-xl space-y-1 text-xs">
                              <div className="flex flex-wrap gap-3 text-cream/40 font-mono text-[9px]">
                                <span>Food: <span className="text-yellow-500">{"★".repeat(book.feedback?.food || 5)}</span></span>
                                <span>Ambience: <span className="text-yellow-500">{"★".repeat(book.feedback?.ambience || 5)}</span></span>
                                <span>Service: <span className="text-yellow-500">{"★".repeat(book.feedback?.service || 5)}</span></span>
                              </div>
                              <p className="text-cream/70 italic mt-1 font-sans">"{book.feedback?.comment}"</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setFeedbackBookingTarget(book);
                                setFeedbackFoodScore(5);
                                setFeedbackAmbienceScore(5);
                                setFeedbackServiceScore(5);
                                setFeedbackComment("");
                                setShowFeedbackModal(true);
                              }}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition cursor-pointer"
                            >
                              ✍️ Submit Dining &amp; Ambience Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: LOYALTY & REWARDS PROGRAM */}
        {activeTab === "loyalty" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn relative">
            
            {/* Left Points ledger card */}
            <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 select-none text-left relative overflow-hidden">
              <FocalGlowBloom className="w-96 h-96 -top-20 -left-20" />
              <h3 className="text-xl md:text-2xl font-serif font-black text-white tracking-tight border-b border-white/5 pb-4 flex items-center gap-2 relative z-10">
                <Award size={20} className="text-orange-500" />
                Flavora Loyalty rewards points
              </h3>

              <div className="bg-[#1b1411] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden z-10">
                <FocalGlowBloom className="w-48 h-48 -left-12 -bottom-12 opacity-30" />
                <div className="space-y-2 text-center sm:text-left relative z-10 w-full">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold">Active Tier Status</span>
                  <h4 className="text-2xl font-serif font-black text-white">Gourmet Gold Member</h4>
                  <p className="text-xs text-cream/60 leading-relaxed max-w-sm">Earn 10 rewards points for every ₹100 spend. Redemptions open to custom vouchers & dining combos.</p>
                  
                  <div className="pt-3 max-w-md">
                    <div className="flex justify-between text-[9px] text-cream/40 font-mono mb-1">
                      <span>Tier Progress to Platinum</span>
                      <span className="text-orange-400 font-bold">{loyaltyPoints} / 1000 pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (loyaltyPoints / 1000) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-orange-400/80 mt-1.5 font-mono">
                      {1000 - loyaltyPoints > 0 ? `✨ ${1000 - loyaltyPoints} points to Platinum reward tier` : "🏆 Platinum Tier Achieved!"}
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-white/10 rounded-3xl p-5 text-center shrink-0 min-w-32 shadow-inner relative z-10">
                  <p className="text-[9px] uppercase font-mono tracking-widest text-cream/40">Total Points balance</p>
                  <h2 className="text-4xl font-mono text-orange-500 font-black mt-1">{loyaltyPoints}</h2>
                </div>
              </div>

              <div className="space-y-4 pt-2 relative z-10">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.25em] font-mono">Available Vouchers</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "R1", cost: 100, label: "₹50 Invoice Discount", code: "REDEEM50" },
                    { id: "R2", cost: 200, label: "Free Crisp Golden Fries", code: "FREEFRIES" },
                    { id: "R3", cost: 350, label: "₹200 Gourmet Coupon", code: "REDEEM200" },
                    { id: "R4", cost: 500, label: "Free Flamin' Cheeseburger", code: "FREEBURGER" }
                  ].map(reward => {
                    const canRedeem = loyaltyPoints >= reward.cost;
                    const getRewardIcon = (id: string) => {
                      switch (id) {
                        case "R1": case "R3": return <Percent className="w-4 h-4 text-orange-500" />;
                        case "R2": case "R4": return <ShoppingBag className="w-4 h-4 text-orange-500" />;
                        default: return <Award className="w-4 h-4 text-orange-500" />;
                      }
                    };
                    return (
                      <motion.div 
                        whileHover={{ y: -4 }}
                        key={reward.id} 
                        className={`border p-5 rounded-3xl flex flex-col justify-between gap-4 transition-all duration-300 ${
                          canRedeem 
                            ? "bg-white/[0.02] border-white/10 hover:border-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.05)]" 
                            : "bg-white/[0.01] border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 text-left">
                            <h6 className="font-bold text-white text-sm">{reward.label}</h6>
                            <p className="text-[10px] text-cream/40 font-mono">Requires: {reward.cost} points</p>
                          </div>
                          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0">
                            {getRewardIcon(reward.id)}
                          </div>
                        </div>
                        <motion.button
                          whileTap={canRedeem ? { scale: 0.98 } : {}}
                          disabled={!canRedeem}
                          onClick={() => {
                            setLoyaltyPoints(p => p - reward.cost);
                            showToast(`Voucher ${reward.code} unlocked! Coupon copied`, "success");
                          }}
                          className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase transition-all duration-300 cursor-pointer text-center ${
                            canRedeem 
                              ? "bg-orange-500 text-[#150f0c] hover:bg-orange-400 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20" 
                              : "bg-white/5 text-cream/30 border border-white/5 cursor-not-allowed"
                          }`}
                        >
                          {canRedeem ? "Redeem Rewards" : "Insufficient Points"}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right referral copier */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6 select-none text-left relative overflow-hidden">
              <FocalGlowBloom className="w-48 h-48 -right-10 -bottom-10 opacity-30" />
              <h4 className="text-sm uppercase tracking-widest text-orange-500 font-bold font-mono relative z-10">Referral Rewards Program</h4>
              <p className="text-xs text-cream/65 leading-relaxed relative z-10">Refer your friends to compose meals. Copy your unique referral code below and earn 50 reward points upon their first delivery!</p>
              
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-inner relative z-10">
                <span className="font-mono text-sm text-white font-bold uppercase">FLAVORA-REFER-SATHV</span>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyReferral}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-sm ${
                    referralCopied 
                      ? "bg-green-600 text-white shadow-green-500/20 scale-105" 
                      : "bg-orange-500 hover:bg-orange-400 text-[#150f0c]"
                  }`}
                >
                  {referralCopied ? (
                    <>
                      <Check size={11} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Code</span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FAVORITES VIEW GRID */}
        {activeTab === "favorites" && (
          <section className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl space-y-8 animate-fadeIn relative overflow-hidden text-left">
            <FocalGlowBloom className="w-96 h-96 -top-20 -left-20" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Your Curated Collection</span>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight mt-1">Gourmet Favorites</h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-full self-start md:self-auto shadow-inner">
                Saved Dishes: {favorites.length}
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="py-16 text-center text-cream/40 bg-white/[0.01] border border-white/5 rounded-3xl max-w-md mx-auto relative z-10">
                <Heart size={36} className="mx-auto text-orange-500/40 mb-4 animate-pulse" />
                <p className="font-serif italic text-base text-white">Nothing saved yet</p>
                <p className="text-xs text-cream/50 mt-1 px-8">Tap the heart on any dish you love to curate your collection here.</p>
                <button 
                  onClick={() => {
                    setActiveTab("menu");
                    playDrawerOpenSound();
                  }}
                  className="mt-6 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer"
                >
                  Browse Gourmet Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {allDishesList
                  .filter((dish) => favorites.includes(String(dish.id)))
                  .map((dish) => (
                    <motion.div
                      layout
                      key={dish.id}
                      className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group text-left"
                    >
                      <div>
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative mb-4">
                          <img 
                            src={dish.image} 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={dish.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/truffle_dish.png";
                            }} 
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(String(dish.id));
                            }}
                            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full border border-white/10 text-cream/80 hover:text-red-500 transition cursor-pointer z-10"
                          >
                            <Heart size={14} className="text-red-500 fill-red-500" />
                          </button>

                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className={`w-6 h-6 rounded-[6px] border flex items-center justify-center bg-black/80 backdrop-blur-sm shadow-[0_0_8px_rgba(${dish.isVeg ? '34,197,94' : '239,68,68'},0.2)] ${dish.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                              <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            </span>
                            {dish.isVegan && (
                              <span className="bg-green-600/90 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow flex items-center">Vegan</span>
                            )}
                          </div>

                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[9px] font-mono text-cream/80 flex items-center gap-1">
                            <Star size={9} className="text-yellow-500 fill-yellow-500" /> {dish.rating.toFixed(1)} &middot; {dish.popularity} orders
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-serif font-black text-white text-base leading-snug group-hover:text-orange-400 transition-colors cursor-pointer" onClick={() => handleOpenCustomizationModal(dish)}>
                              {dish.name}
                            </h5>
                            <span className="font-serif font-black text-orange-500 text-base mt-0.5">₹{dish.price}</span>
                          </div>
                          <p className="text-cream/50 text-xs leading-relaxed line-clamp-2">{dish.ingredients}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                        {dish.spiceLevel > 0 ? (
                          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                            <span className="text-[8px] uppercase font-mono tracking-widest text-orange-400 font-bold">Spice:</span>
                            <span className="text-[10px]">{Array(dish.spiceLevel).fill("🌶️").join("")}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] uppercase font-mono tracking-widest text-cream/30">Mild</span>
                        )}

                        <button
                          onClick={() => handleOpenCustomizationModal(dish)}
                          className="px-4 py-2 border border-white/20 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-white/5 hover:bg-orange-500 hover:text-[#150f0c] rounded-xl transition flex items-center gap-2 text-xs font-bold cursor-pointer"
                        >
                          <Plus size={13} /> Add &amp; Customize
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 7: SUPPORT CONCIERGE HELP DESK CHATBOT */}
        {activeTab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left Chat Widget Box */}
            <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col h-[550px] shadow-2xl relative select-none animate-none">
              <div className="noise-overlay" />
              <FocalGlowBloom className="w-48 h-48 -left-10 top-4 opacity-15" />
              
              <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-center shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-lg relative">
                    <span className="absolute inset-0 rounded-full bg-orange-500/5 animate-pulse" />
                    🤖
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif font-black text-white text-base leading-tight">Flavora Concierge Help desk</h4>
                    <p className="text-[10px] text-green-500 font-mono uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span>Chef Bot online</span>
                    </p>
                  </div>
                </div>

                <button onClick={() => showToast("Calling concierge support line...")} className="p-2 border border-white/10 hover:border-orange-500 hover:text-orange-500 rounded-full transition cursor-pointer">
                  <PhoneCall size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 py-2 relative z-10">
                {supportMessages.length === 1 && !isChatTyping && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
                    <svg viewBox="0 0 100 100" className="w-48 h-48 fill-none stroke-cream stroke-[6]">
                      <path d="M 35 15 C 20 35 20 60 50 85 C 80 60 80 35 65 15 Z" />
                      <path d="M 50 35 L 50 65" />
                    </svg>
                    <span className="text-sm font-serif font-black tracking-widest uppercase mt-4">Flavora Concierge</span>
                  </div>
                )}

                {supportMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[75%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed text-left ${
                      msg.sender === "user" 
                        ? "bg-orange-500 text-[#150f0c] rounded-tr-none font-semibold" 
                        : "bg-white/5 text-cream rounded-tl-none border border-white/5"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-cream/30 font-mono mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isChatTyping && (
                  <div className="mr-auto items-start max-w-[75%] flex flex-col">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="flex flex-wrap gap-2 py-3 border-t border-white/5 shrink-0 overflow-x-auto no-scrollbar relative z-10 font-sans">
                {[
                  "Where is my active order?",
                  "I want to request a refund",
                  "Redeem rewards points balance",
                  "Talk to human agent"
                ].map(suggest => (
                  <button
                    key={suggest}
                    onClick={() => {
                      setChatInput(suggest);
                    }}
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500 rounded-full text-[10px] text-cream/70 transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    {suggest}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-white/5 shrink-0 relative z-10">
                <input 
                  type="text" 
                  placeholder="Type your support request message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(); }}
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-orange-500 text-white placeholder-cream/30 flex-1"
                />
                <button 
                  onClick={handleSendChatMessage}
                  className="p-3 bg-orange-500 hover:bg-orange-400 text-[#150f0c] rounded-xl flex items-center justify-center transition cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Right support info card */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6 select-none text-left">
              <h4 className="text-sm uppercase tracking-widest text-orange-500 font-bold font-mono">Refund Request Form</h4>
              <p className="text-xs text-cream/65 leading-relaxed">If you experienced payment failures or incorrect dish selections, please submit a concierge support ticket below.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/55 block mb-1">Select Order ID</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer animate-none">
                    <option value="" className="bg-[#150f0c]">Choose Order transaction</option>
                    {orderHistory.map(o => (
                      <option key={o.id} value={o.id} className="bg-[#150f0c]">{o.id} (₹{o.total})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/55 block mb-1">Issue Description Details</label>
                  <textarea 
                    placeholder="Provide detailed description of order or billing transaction issues..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500 text-white resize-none"
                  />
                </div>
                <motion.button 
                  animate={{
                    boxShadow: ["0 4px 10px rgba(249,115,22,0.1)", "0 4px 20px rgba(249,115,22,0.25)", "0 4px 10px rgba(249,115,22,0.1)"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    showToast("Refund support ticket submitted successfully", "success");
                  }} 
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-[#150f0c] font-bold rounded-2xl transition duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.98]"
                >
                  Submit Support Ticket
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CUSTOMER PROFILE (Tier 2 & 3) */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Personal details & preferences */}
              <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className="noise-overlay" />
                <FocalGlowBloom className="w-96 h-96 -top-20 -left-20" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 font-mono">Personal Account</span>
                    <h3 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight mt-1">Guest Profile</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (profileEditMode) {
                        handleSaveProfile();
                      } else {
                        setProfileDraft(userProfile);
                        setProfileEditMode(true);
                      }
                    }}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-xs font-bold uppercase rounded-xl transition duration-300 shadow-md cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                  >
                    {profileEditMode ? "Save Profile" : "Edit Profile"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10 font-sans">
                  {/* Avatar Upload Container */}
                  <div className="md:col-span-2 flex items-center gap-5 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0 relative flex items-center justify-center text-cream/30 text-2xl font-serif font-bold">
                      {profilePhoto ? (
                        <img src={profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        user?.email ? user.email.charAt(0).toUpperCase() : "G"
                      )}
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold uppercase text-white tracking-wider">Profile Photo</h4>
                      <p className="text-[10px] text-cream/40">Accepts formats: JPG, PNG, WEBP</p>
                      <button
                        onClick={handleSimulatePhotoUpload}
                        className="text-[10px] text-orange-500 hover:underline font-bold font-mono tracking-wider uppercase block pt-1"
                      >
                        Change Photo / Simulate Upload
                      </button>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Full Name</label>
                    {profileEditMode ? (
                      <input 
                        type="text" 
                        value={profileDraft.name} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    ) : (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream font-medium">
                        {userProfile.name || "Sathveek Nalla"}
                      </div>
                    )}
                  </div>

                  {/* Email field (read-only for security) */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Email Address (Locked)</label>
                    <div className="bg-white/[0.01] border border-white/5 text-cream/40 rounded-xl px-4 py-3 text-xs font-mono">
                      {user?.email || "rethveeknalla@gmail.com"}
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Phone Number</label>
                    {profileEditMode ? (
                      <input 
                        type="tel" 
                        value={profileDraft.phone} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    ) : (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream font-medium">
                        {userProfile.phone || "+91 98765 43210"}
                      </div>
                    )}
                  </div>

                  {/* Birthday field */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Date of Birth</label>
                    {profileEditMode ? (
                      <input 
                        type="date" 
                        value={profileDraft.birthday} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, birthday: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer text-left"
                      />
                    ) : (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream font-medium">
                        {userProfile.birthday || "2002-06-25"}
                      </div>
                    )}
                  </div>

                  {/* Dietary Preference Selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Dietary Preference</label>
                    {profileEditMode ? (
                      <select 
                        value={profileDraft.dietaryPref} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, dietaryPref: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="any" className="bg-[#150f0c]">Any / Non-Vegetarian</option>
                        <option value="veg" className="bg-[#150f0c]">Vegetarian Only</option>
                        <option value="non-veg" className="bg-[#150f0c]">Halal / Non-Veg</option>
                        <option value="vegan" className="bg-[#150f0c]">Strict Vegan</option>
                      </select>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream font-medium capitalize">
                        {userProfile.dietaryPref === "any" ? "Any / Non-Vegetarian" : userProfile.dietaryPref}
                      </div>
                    )}
                  </div>

                  {/* Preferred Payment Picker */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Default Payment Gateway</label>
                    {profileEditMode ? (
                      <select 
                        value={profileDraft.preferredPayment} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, preferredPayment: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="upi" className="bg-[#150f0c]">BHIM UPI (GPay/PhonePe)</option>
                        <option value="card" className="bg-[#150f0c]">Credit / Debit Card</option>
                        <option value="cod" className="bg-[#150f0c]">Cash On Delivery (COD)</option>
                        <option value="split" className="bg-[#150f0c]">Group Billing Split</option>
                      </select>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream font-medium uppercase">
                        {userProfile.preferredPayment} Payment
                      </div>
                    )}
                  </div>

                  {/* Allergens Checklist */}
                  <div className="md:col-span-2 space-y-3 pt-2">
                    <label className="text-[9px] uppercase font-mono text-cream/50 block">Allergies &amp; Exclusions Checklist</label>
                    {profileEditMode ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 p-4 border border-white/5 rounded-2xl">
                        {ALLERGEN_OPTIONS.map((allergen) => {
                          const has = profileDraft.allergens.includes(allergen);
                          return (
                            <button
                              key={allergen}
                              type="button"
                              onClick={() => {
                                const next = has 
                                  ? profileDraft.allergens.filter(a => a !== allergen) 
                                  : [...profileDraft.allergens, allergen];
                                setProfileDraft({ ...profileDraft, allergens: next });
                              }}
                              className={`px-3 py-2 border rounded-xl text-xs font-bold text-center transition cursor-pointer ${
                                has 
                                  ? "bg-orange-500 border-orange-500 text-[#150f0c]" 
                                  : "bg-white/5 border-white/10 hover:border-white/20"
                              }`}
                            >
                              {allergen}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userProfile.allergens.length === 0 ? (
                          <span className="text-xs text-cream/30 italic">No food allergens marked.</span>
                        ) : (
                          userProfile.allergens.map((allergen) => (
                            <span 
                              key={allergen} 
                              className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-lg text-[10px]"
                            >
                              ⚠️ {allergen}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {profileEditMode && (
                    <div className="md:col-span-2 pt-4 border-t border-white/5 flex justify-end gap-3">
                      <button
                        onClick={() => setProfileEditMode(false)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cream transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-xs font-bold text-[#150f0c] uppercase transition cursor-pointer shadow-md"
                      >
                        Save Preferences
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Security, sessions, info */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Active Sessions Manager (Tier 3) */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                  <div className="noise-overlay" />
                  <FocalGlowBloom className="w-48 h-48 -right-8 -bottom-8 opacity-10" />
                  
                  <div className="border-b border-white/5 pb-4 mb-4 text-left">
                    <span className="text-[9px] uppercase tracking-widest text-orange-500 font-bold font-mono">Security Checkup</span>
                    <h4 className="font-serif font-black text-white text-base mt-1">Active Sessions</h4>
                  </div>
                  
                  <div className="space-y-4 text-left font-sans">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="p-3.5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-1 relative">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white">{session.device}</span>
                          {session.current && (
                            <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                              Current Device
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-cream/50">{session.browser} &middot; {session.ip}</span>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                          <span className="text-[9px] text-cream/30 font-mono">{session.location}</span>
                          <span className="text-[9px] text-cream/45">{session.date}</span>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleLogoutAllDevices}
                      className="w-full mt-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold rounded-2xl transition duration-300 cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.98]"
                    >
                      Log Out Other Devices
                    </button>
                  </div>
                </div>

                {/* Flavora Club Membership Card */}
                <div className="bg-gradient-to-br from-[#2a1d17] to-[#150f0c] border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl text-left">
                  <FocalGlowBloom className="w-32 h-32 -left-8 -top-8 opacity-20" />
                  <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                    GOLD MEMBER
                  </span>
                  <h4 className="font-serif font-black text-white text-lg mt-4">Flavora Club Elite</h4>
                  <p className="text-xs text-cream/50 leading-relaxed mt-2">
                    As an elite gold member, you earn 10% cashpoints on all dine-in reservations and gourmet delivery checkouts. Enjoy priority seating waitlists automatically.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-cream/40">Member since</span>
                    <span className="text-white font-mono">June 2026</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODAL WINDOW 1: ADDRESS DETAILS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 text-left shadow-2xl"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Add Custom Address Location</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1.5">Address Type Slot</label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Friends House", "Other"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewAddressType(type as any)}
                        className={`px-3.5 py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
                          newAddressType === type ? "bg-orange-500 border-orange-500 text-[#150f0c]" : "bg-white/5 border-white/10"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">Full Coordinates Address Line</label>
                  <textarea 
                    placeholder="Suite/Apartment coordinates, land marks, and sector code..."
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 resize-none placeholder-cream/20"
                  />
                </div>

                <div className="border border-white/5 rounded-2xl p-4 bg-black/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono text-orange-500 font-bold">Coordinate Mapping Simulator</span>
                    <button
                      onClick={handleSimulateGps}
                      disabled={gpsSimulating}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold uppercase transition"
                    >
                      {gpsSimulating ? "Simulating GPS..." : "📍 Locate via GPS"}
                    </button>
                  </div>
                  
                  <div className="w-full h-24 bg-[#0d0a08] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:16px_16px]" />
                    {simulatedCoords ? (
                      <div className="text-center space-y-1 relative z-10">
                        <MapPin size={16} className="text-red-500 mx-auto animate-bounce" />
                        <p className="text-[9px] font-mono text-green-400 font-bold">Latitude: {simulatedCoords.lat} &middot; Longitude: {simulatedCoords.lng}</p>
                      </div>
                    ) : (
                      <p className="text-[9px] font-mono text-cream/35 italic">Click GPS simulation to set destination coordinate markers</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setShowAddressModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleCreateAddress} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Save Location</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 2: DISH DETAILS & CUSTOMIZATION */}
      <AnimatePresence>
        {selectedDishForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDishForDetails(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-2xl relative z-10 text-left shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5 relative shadow-lg">
                    <FocalGlowBloom className="w-48 h-48 -left-10 -top-10 opacity-40 animate-pulse" />
                    <img src={selectedDishForDetails.image} className="w-full h-full object-cover relative z-10" alt={selectedDishForDetails.name} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-[4px] border flex items-center justify-center bg-black/80 backdrop-blur-sm ${selectedDishForDetails.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedDishForDetails.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                      </span>
                      <h4 className="font-serif font-black text-white text-lg tracking-tight">{selectedDishForDetails.name}</h4>
                    </div>
                    <p className="text-xs text-cream/60 leading-relaxed mt-2">{selectedDishForDetails.ingredients}</p>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold">Nutritional Composition</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center items-center">
                        <p className="text-[9px] text-cream/45 uppercase font-mono tracking-wider font-semibold">Calorie</p>
                        <p className="text-sm font-mono font-black text-orange-500 mt-1">{selectedDishForDetails.id * 3 + 120} kcal</p>
                      </div>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center items-center">
                        <p className="text-[9px] text-cream/45 uppercase font-mono tracking-wider font-semibold">Protein</p>
                        <p className="text-sm font-mono font-black text-orange-500 mt-1">{(selectedDishForDetails.id % 7) + 6}g</p>
                      </div>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center items-center">
                        <p className="text-[9px] text-cream/45 uppercase font-mono tracking-wider font-semibold">Carbs</p>
                        <p className="text-sm font-mono font-black text-orange-500 mt-1">{(selectedDishForDetails.id % 12) + 24}g</p>
                      </div>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center items-center">
                        <p className="text-[9px] text-cream/45 uppercase font-mono tracking-wider font-semibold">Fat</p>
                        <p className="text-sm font-mono font-black text-orange-500 mt-1">{(selectedDishForDetails.id % 5) + 4}g</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-cream/35 mt-1 font-mono leading-snug">⚠️ Allergen Info: Traces of Gluten, Dairy &amp; Sesame. Prepared in facility handling nuts.</p>
                  </div>
                </div>

                <div className="space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h5 className="font-serif font-black text-white text-base leading-snug border-b border-white/5 pb-2">Dish Customization Options</h5>
                    
                    {!(selectedDishForDetails.category === "Main Course" || selectedDishForDetails.category === "Drinks" || selectedDishForDetails.name.includes("Pizza")) && (
                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 space-y-3.5 relative overflow-hidden my-3">
                        <FocalGlowBloom className="w-32 h-32 -right-8 -bottom-8 opacity-25" />
                        <div className="relative z-10">
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-orange-500 font-mono">Chef's Recommendation</span>
                          <h6 className="font-serif font-black text-white text-xs mt-1">Why you'll love this dish</h6>
                          <p className="text-[10px] text-cream/60 leading-relaxed mt-1.5">
                            Masterfully prepared using our signature house rub and slow-cooked to perfection. This customer favorite features a harmoniously balanced profile with a rich texture, perfect for sharing.
                          </p>
                        </div>
                        <div className="border-t border-white/5 pt-3 relative z-10">
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-orange-500 font-mono">Gourmet Pairing Tip</span>
                          <p className="text-[10px] text-cream/50 leading-relaxed mt-1 italic">
                            "Best enjoyed with our handcrafted wood-fired garlic breads or a chilled cucumber fizz to accent the smoky notes." &mdash; Chef Mario
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedDishForDetails.category === "Main Course" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-cream/50 block">Select Size Portion</label>
                        <div className="flex gap-2">
                          {(["Small", "Medium", "Large"] as const).map(size => (
                            <button
                              key={size}
                              onClick={() => setCustomOptions(prev => ({ ...prev, size }))}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex-1 ${
                                customOptions.size === size ? "bg-orange-500 border-orange-500 text-[#150f0c]" : "bg-white/5 border-white/10"
                              }`}
                            >
                              {size} {size === "Medium" ? "(+₹100)" : size === "Large" ? "(+₹200)" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : selectedDishForDetails.category === "Drinks" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-cream/50 block">Select Cup Size</label>
                        <div className="flex gap-2">
                          {(["Regular", "Large"] as const).map(size => (
                            <button
                              key={size}
                              onClick={() => setCustomOptions(prev => ({ ...prev, size }))}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex-1 ${
                                customOptions.size === size ? "bg-orange-500 border-orange-500 text-[#150f0c]" : "bg-white/5 border-white/10"
                              }`}
                            >
                              {size} {size === "Large" ? "(+₹50)" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedDishForDetails.name.includes("Pizza") && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-cream/50 block">Select Wood-Fired Crust</label>
                        <div className="flex gap-2">
                          {(["Thin", "Cheese Burst", "Pan"] as const).map(crust => (
                            <button
                              key={crust}
                              onClick={() => setCustomOptions(prev => ({ ...prev, crust }))}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex-1 ${
                                customOptions.crust === crust ? "bg-orange-500 border-orange-500 text-[#150f0c]" : "bg-white/5 border-white/10"
                              }`}
                            >
                              {crust} {crust === "Cheese Burst" ? "(+₹120)" : crust === "Pan" ? "(+₹60)" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDishForDetails.name.includes("Pizza") && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-cream/50 block">Extra Toppings (+₹40 each)</label>
                        <div className="flex flex-wrap gap-2">
                          {["Extra Cheese", "Mushrooms", "Olives", "Jalapenos"].map(topping => {
                            const isSelected = customOptions.toppings.includes(topping);
                            return (
                              <button
                                key={topping}
                                onClick={() => setCustomOptions(prev => ({
                                  ...prev,
                                  toppings: isSelected ? prev.toppings.filter(t => t !== topping) : [...prev.toppings, topping]
                                }))}
                                className={`px-3.5 py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
                                  isSelected ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-white/5 border-white/10"
                                }`}
                              >
                                {topping}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedDishForDetails.category === "Main Course" && !selectedDishForDetails.name.includes("Pizza") && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-cream/50 block">Select Spiciness Level</label>
                        <div className="flex gap-2">
                          {(["Mild", "Medium", "Spicy"] as const).map(spice => (
                            <button
                              key={spice}
                              onClick={() => setCustomOptions(prev => ({ ...prev, spiceLevel: spice }))}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex-1 ${
                                customOptions.spiceLevel === spice ? "bg-orange-500 border-orange-500 text-[#150f0c]" : "bg-white/5 border-white/10"
                              }`}
                            >
                              {spice}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">Add Cooking Instructions Notes</label>
                      <input 
                        type="text" 
                        placeholder="Less spicy, no onions, extra sauce..." 
                        value={customOptions.instructions}
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, instructions: e.target.value }))}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                    <button onClick={() => setSelectedDishForDetails(null)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                    <button onClick={handleAddCustomizedToCart} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Confirm &amp; Add Selection</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 3: REVIEW SUBMISSIONS ORDER */}
      <AnimatePresence>
        {reviewOrderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setReviewOrderTarget(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 text-left shadow-2xl"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Rate Order: {reviewOrderTarget.id}</h4>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-cream/50 block">Rate Food Quality</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} 
                        onClick={() => setFoodRating(num)}
                        className="cursor-pointer text-base transition transform hover:scale-115"
                      >
                        <Star size={18} className={num <= foodRating ? "fill-yellow-500 text-yellow-500" : "text-cream/30"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-cream/50 block">Rate Delivery Agent (Rohan Sharma)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} 
                        onClick={() => setRiderRating(num)}
                        className="cursor-pointer text-base transition transform hover:scale-115"
                      >
                        <Star size={18} className={num <= riderRating ? "fill-yellow-500 text-yellow-500" : "text-cream/30"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">Feedback Comment</label>
                  <textarea 
                    placeholder="Provide your experience about food preparations or deliveries..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 resize-none placeholder-cream/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-mono text-cream/50 block">Simulate Food Image Attachment</label>
                  {simulatedReviewImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 relative">
                      <img src={simulatedReviewImage} className="w-full h-full object-cover" alt="Simulated Review" />
                      <button 
                        onClick={() => setSimulatedReviewImage(null)}
                        className="absolute top-0 right-0 bg-black/80 text-white rounded-full p-0.5 text-[8px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSimulateReviewPhotoUpload}
                      disabled={isUploadingPhoto}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {isUploadingPhoto ? "Simulating Upload..." : "📸 Attach Food Photo"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setReviewOrderTarget(null)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleSubmitReview} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Submit Review</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 4: RESCHEDULE TABLE BOOKING */}
      <AnimatePresence>
        {showRescheduleModal && rescheduleBookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowRescheduleModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 text-left shadow-2xl"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Reschedule Reservation: {rescheduleBookingTarget.id}</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">New Date</label>
                  <input 
                    type="date" 
                    value={rescheduleDate} 
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">New Time Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer animate-none"
                  >
                    {TIME_SLOTS.filter(s => !s.isBooked).map(s => (
                      <option key={s.time} value={s.time} className="bg-[#150f0c]">{s.time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleRescheduleSubmit} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Reschedule Booking</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 5: UPGRADE TABLE SEAT */}
      <AnimatePresence>
        {showUpgradeModal && upgradeBookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 text-left shadow-2xl"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Upgrade Seating: {upgradeBookingTarget.id}</h4>
              
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-mono text-cream/40 block">Select Upgraded Table Category</label>
                <select 
                  value={upgradeTableType} 
                  onChange={(e) => setUpgradeTableType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer animate-none"
                >
                  {TABLE_TYPES.map(t => (
                    <option key={t.type} value={t.type} className="bg-[#150f0c]">{t.type} (Max: {t.capacity})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setShowUpgradeModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleUpgradeSubmit} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Confirm Upgrade</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 6: ADD GUESTS HEADCOUNT */}
      <AnimatePresence>
        {showAddGuestsModal && addGuestsTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAddGuestsModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 text-left shadow-2xl"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Add Guests headcount: {addGuestsTarget.id}</h4>
              
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-mono text-cream/40 block mb-1">Add Guests count</label>
                <input 
                  type="number" 
                  min={1} 
                  max={6}
                  value={addGuestsCount}
                  onChange={(e) => setAddGuestsCount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setShowAddGuestsModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleAddGuestsSubmit} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Confirm Add</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 7: DINING & AMBIENCE FEEDBACK SCORECARD */}
      <AnimatePresence>
        {showFeedbackModal && feedbackBookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowFeedbackModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 text-left shadow-2xl animate-none"
            >
              <h4 className="text-lg font-serif font-bold text-white mb-4">Table Dining Review: {feedbackBookingTarget.id}</h4>
              
              <div className="space-y-4">
                {/* Food rating */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-cream/50 block">Rate Food Quality</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button key={num} onClick={() => setFeedbackFoodScore(num)} className="cursor-pointer text-base">
                        <Star size={16} className={num <= feedbackFoodScore ? "fill-yellow-500 text-yellow-500" : "text-cream/30"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambience rating */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-cream/50 block">Rate Ambience &amp; Seating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button key={num} onClick={() => setFeedbackAmbienceScore(num)} className="cursor-pointer text-base">
                        <Star size={16} className={num <= feedbackAmbienceScore ? "fill-yellow-500 text-yellow-500" : "text-cream/30"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service rating */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-cream/50 block">Rate Hospitality Service</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button key={num} onClick={() => setFeedbackServiceScore(num)} className="cursor-pointer text-base">
                        <Star size={16} className={num <= feedbackServiceScore ? "fill-yellow-500 text-yellow-500" : "text-cream/30"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-cream/50 block mb-1">Feedback Comment</label>
                  <textarea 
                    placeholder="Rate your fine-dining experience..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 resize-none placeholder-cream/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
                <button onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition">Cancel</button>
                <button onClick={handleSubmitFeedback} className="px-4 py-2 rounded-xl bg-orange-500 text-[#150f0c] text-xs font-bold transition">Submit Review</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW 8: PLANNER ITEM SWAP MODAL */}
      <AnimatePresence>
        {swapTargetItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSwapTargetItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-[#150f0c] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 text-left shadow-2xl overflow-hidden font-sans"
            >
              <FocalGlowBloom className="w-48 h-48 -right-10 -bottom-10 opacity-30" />
              <h4 className="text-lg font-serif font-black text-white mb-2 flex items-center gap-2 relative z-10">
                <Sparkles className="text-orange-500" size={18} /> Swap Recommended Dish
              </h4>
              <p className="text-xs text-cream/60 mb-4 relative z-10 font-sans">
                Choose an alternative item from the <span className="text-orange-400 font-bold font-mono">{swapTargetItem.dish.category}</span> category that fits within your remaining budget.
              </p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 relative z-10 no-scrollbar">
                {(() => {
                  const alternatives = getAlternatives(swapTargetItem.dish.category, swapTargetItem.dish.price);
                  if (alternatives.length === 0) {
                    return (
                      <p className="text-xs text-cream/40 py-8 text-center italic font-serif">
                        No alternative items in this category fit within your budget remainder.
                      </p>
                    );
                  }
                  
                  return alternatives.map((altDish) => (
                    <div 
                      key={altDish.id}
                      className="bg-white/5 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-orange-500/20 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <img src={altDish.image} className="w-10 h-10 object-cover rounded-lg bg-white/5 shrink-0" alt={altDish.name} />
                        <div>
                          <h6 className="font-serif font-bold text-white text-xs leading-tight">{altDish.name}</h6>
                          <p className="text-[9px] text-cream/50 mt-1">₹{altDish.price} &middot; ★ {altDish.rating.toFixed(1)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSwapItem(swapTargetItem.dish.id, altDish)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-[#150f0c] text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex justify-end relative z-10">
                <button
                  onClick={() => setSwapTargetItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cream transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Reservation Modal */}
      <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} />
    </div>
  );
}
