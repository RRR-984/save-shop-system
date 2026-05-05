import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type {
  AppConfig,
  AutoModeType,
  Customer,
  Invoice,
  Product,
} from "../types/store";
import type { NavPage } from "../types/store";

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
  chips?: string[]; // suggestion chips embedded in bot reply
}

function getTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ── QueryType union ──────────────────────────────────────────────────────────
type QueryType =
  // Data queries
  | "greeting"
  | "low_stock"
  | "dead_stock"
  | "today_sales"
  | "recent_sales"
  | "pending_due"
  | "stock_value"
  | "out_of_stock"
  | "total_products"
  | "today_profit"
  | "total_profit"
  | "customer_count"
  | "birthday_today"
  | "best_selling"
  | "vendor_due"
  | "staff_performance"
  | "expiry_alert"
  | "inactive_customers"
  | "lost_customers"
  | "top_customers"
  | "pending_customers"
  // Navigation intents
  | "nav_dashboard"
  | "nav_inventory"
  | "nav_stock"
  | "nav_billing"
  | "nav_drafts"
  | "nav_customers"
  | "nav_vendors"
  | "nav_reports"
  | "nav_settings"
  | "nav_service_repair"
  | "nav_rental"
  | "nav_restaurant_menu"
  | "nav_restaurant_order"
  | "nav_restaurant_kitchen"
  | "nav_restaurant_billing"
  | "nav_restaurant_tables"
  | "nav_staff"
  | "nav_returns"
  | "nav_history"
  | "nav_admin"
  | "nav_super_admin"
  | "nav_rankings"
  | "nav_shop_board"
  | "nav_rewards"
  | "nav_feedback"
  | "nav_referral"
  // Action intents
  | "action_new_job_card"
  | "action_new_sale"
  | "action_add_stock"
  | "action_add_product"
  | "action_new_order"
  | "action_search_vehicle"
  | "action_new_customer"
  | "action_new_vendor"
  // Help guides
  | "help_add_shop"
  | "help_dead_stock_time"
  | "help_add_stock"
  | "help_sell"
  | "help_add_vendor"
  | "help_add_customer"
  | "help_reports"
  | "help_mode"
  | "help_invoice"
  | "help_diamonds"
  | "help_backup"
  | "help_settings"
  | "help_job_card"
  | "help_add_menu"
  | "help_restaurant_order"
  | "help_add_staff"
  | "help_gst"
  | "unknown";

// ── keyword map ──────────────────────────────────────────────────────────────
const KEYWORD_MAP: Array<{ type: QueryType; keywords: string[] }> = [
  // Greetings
  {
    type: "greeting",
    keywords: [
      "hello",
      "namaste",
      "hey",
      "hii",
      "helllo",
      "helo",
      "namaskar",
      "hi there",
      "good morning",
      "good evening",
    ],
  },

  // ── Navigation intents ──
  {
    type: "nav_dashboard",
    keywords: [
      "dashboard",
      "home",
      "ghar",
      "main screen",
      "main page",
      "go home",
      "go to dashboard",
      "dashboard kholo",
      "home page",
    ],
  },
  {
    type: "nav_inventory",
    keywords: [
      "inventory",
      "products list",
      "product list",
      "all products",
      "inventory page",
      "go to inventory",
      "inventory kholo",
      "product page",
    ],
  },
  {
    type: "nav_stock",
    keywords: [
      "add stock",
      "stock in",
      "stock out",
      "stock page",
      "go to stock",
      "stock kholo",
      "stock in out",
      "stock section",
      "maal dalo",
    ],
  },
  {
    type: "nav_billing",
    keywords: [
      "billing",
      "new sale",
      "new bill",
      "sell karo",
      "naya bill",
      "becho",
      "sale karo",
      "billing kholo",
      "billing page",
      "go to billing",
      "sell page",
      "invoice banao",
      "naya invoice",
    ],
  },
  {
    type: "nav_drafts",
    keywords: [
      "draft",
      "drafts",
      "saved bills",
      "draft sales",
      "pending bills",
      "go to drafts",
      "draft page",
      "draft bills",
    ],
  },
  {
    type: "nav_customers",
    keywords: [
      "customers",
      "customer list",
      "grahak",
      "kharidar",
      "buyer",
      "customer page",
      "go to customers",
      "customer dhundo",
      "customer section",
      "customers kholo",
    ],
  },
  {
    type: "nav_vendors",
    keywords: [
      "vendors",
      "vendor list",
      "supplier",
      "suppliers",
      "vendor page",
      "go to vendors",
      "supplier list",
      "vendors kholo",
      "vendor section",
    ],
  },
  {
    type: "nav_reports",
    keywords: [
      "reports",
      "report",
      "analytics",
      "go to reports",
      "reports kholo",
      "report page",
      "report section",
      "daily report",
      "profit report",
      "sales report",
    ],
  },
  {
    type: "nav_settings",
    keywords: [
      "settings",
      "setting",
      "configuration",
      "setup",
      "shop settings",
      "settings kholo",
      "app settings",
      "go to settings",
      "feature toggle",
      "settings page",
    ],
  },
  {
    type: "nav_service_repair",
    keywords: [
      "service repair",
      "service",
      "repair",
      "job card",
      "gaadi",
      "vehicle service",
      "gaadi service",
      "repair order",
      "go to service",
      "service page",
      "repair page",
      "workshop",
      "mechanic",
      "service section",
      "repair section",
      "vehicle repair",
      "gaadi ka kaam",
    ],
  },
  {
    type: "nav_rental",
    keywords: [
      "rental",
      "lending",
      "kiraya",
      "rent",
      "rental page",
      "go to rental",
      "rental section",
      "lending section",
      "lend item",
    ],
  },
  {
    type: "nav_restaurant_menu",
    keywords: [
      "restaurant menu",
      "menu management",
      "menu page",
      "go to menu",
      "menu kholo",
      "add menu item",
      "menu items",
      "food menu",
    ],
  },
  {
    type: "nav_restaurant_order",
    keywords: [
      "restaurant order",
      "new order",
      "table order",
      "dine in",
      "food order",
      "khana order",
      "new food order",
      "restaurant order page",
      "go to order",
      "order kholo",
    ],
  },
  {
    type: "nav_restaurant_kitchen",
    keywords: [
      "kitchen display",
      "kitchen",
      "kot",
      "kitchen order",
      "kitchen screen",
      "go to kitchen",
      "kitchen page",
      "cooking status",
    ],
  },
  {
    type: "nav_restaurant_billing",
    keywords: [
      "restaurant billing",
      "restaurant bill",
      "food bill",
      "hotel bill",
      "go to restaurant billing",
      "restaurant billing page",
    ],
  },
  {
    type: "nav_restaurant_tables",
    keywords: [
      "table management",
      "tables",
      "table status",
      "table page",
      "go to tables",
      "tables kholo",
      "free table",
      "occupied table",
    ],
  },
  {
    type: "nav_staff",
    keywords: [
      "staff management",
      "staff list",
      "employees",
      "worker",
      "staff page",
      "go to staff",
      "staff section",
      "manage staff",
      "staff kholo",
    ],
  },
  {
    type: "nav_returns",
    keywords: [
      "returns",
      "return item",
      "return list",
      "return page",
      "go to returns",
      "wapas karo",
      "return section",
      "refund",
      "maal wapas",
    ],
  },
  {
    type: "nav_history",
    keywords: [
      "history",
      "draft history",
      "past bills",
      "old bills",
      "history page",
      "go to history",
      "purane bills",
      "history section",
    ],
  },
  {
    type: "nav_admin",
    keywords: [
      "admin",
      "admin panel",
      "shop admin",
      "go to admin",
      "admin page",
      "admin section",
      "admin kholo",
    ],
  },
  {
    type: "nav_super_admin",
    keywords: [
      "super admin",
      "super admin panel",
      "go to super admin",
      "super admin page",
    ],
  },
  {
    type: "nav_rankings",
    keywords: [
      "rankings",
      "leaderboard",
      "rank",
      "go to rankings",
      "rankings page",
      "ranking section",
      "top shops",
      "shop ranking",
    ],
  },
  {
    type: "nav_shop_board",
    keywords: [
      "shop board",
      "live board",
      "shop dashboard",
      "live dashboard",
      "go to live board",
      "shop board page",
      "live stats",
      "shop scoreboard",
    ],
  },
  {
    type: "nav_rewards",
    keywords: [
      "diamond rewards",
      "rewards",
      "diamonds",
      "go to rewards",
      "reward page",
      "diamond page",
      "earn diamonds",
      "diamond section",
    ],
  },
  {
    type: "nav_feedback",
    keywords: [
      "feedback",
      "give feedback",
      "submit feedback",
      "feedback page",
      "go to feedback",
      "report issue",
      "suggestion",
    ],
  },
  {
    type: "nav_referral",
    keywords: [
      "referral",
      "refer earn",
      "refer and earn",
      "referral page",
      "go to referral",
      "share app",
      "referral code",
      "invite friend",
    ],
  },

  // ── Action intents ──
  {
    type: "action_new_job_card",
    keywords: [
      "new job card",
      "create job card",
      "naya job card",
      "service card",
      "gaadi ka card",
      "repair entry",
      "vehicle service",
      "start repair",
      "new service order",
      "job card banao",
      "create service",
      "new repair order",
      "job card create",
    ],
  },
  {
    type: "action_new_sale",
    keywords: [
      "start new sale",
      "begin sale",
      "start billing",
      "open billing",
      "new invoice",
      "sell now",
      "quick sale",
      "fast billing",
      "abhi becho",
    ],
  },
  {
    type: "action_add_stock",
    keywords: [
      "add new stock",
      "add stock now",
      "stock add karo",
      "maal add karo",
      "open add stock",
      "stock entry",
      "new stock entry",
    ],
  },
  {
    type: "action_add_product",
    keywords: [
      "add product",
      "new product",
      "create product",
      "product add karo",
      "naya product",
      "product banana",
      "add item to inventory",
    ],
  },
  {
    type: "action_new_order",
    keywords: [
      "start new order",
      "new restaurant order",
      "new food order now",
      "open order form",
      "order banao",
      "table order start",
    ],
  },
  {
    type: "action_search_vehicle",
    keywords: [
      "search vehicle",
      "find vehicle",
      "vehicle dhundo",
      "gaadi search",
      "vehicle number search",
      "check vehicle history",
    ],
  },
  {
    type: "action_new_customer",
    keywords: [
      "add new customer",
      "new customer add",
      "create customer",
      "customer banao",
      "naya grahak",
      "open customer form",
      "customer add form",
    ],
  },
  {
    type: "action_new_vendor",
    keywords: [
      "add new vendor",
      "new vendor add",
      "create vendor",
      "vendor banao",
      "naya vendor",
      "open vendor form",
      "supplier add form",
    ],
  },

  // ── Data queries ──
  {
    type: "birthday_today",
    keywords: [
      "aaj birthday",
      "birthday aaj",
      "birthday today",
      "today birthday",
      "janmdin aaj",
      "aaj janmdin",
      "aaj ka birthday",
      "birthday kaun",
      "whose birthday",
      "kiska birthday",
      "birthday list",
      "birthday reminder",
      "janmdin today",
    ],
  },
  {
    type: "expiry_alert",
    keywords: [
      "expiry",
      "expire",
      "expiry alert",
      "expiring soon",
      "kya expire ho raha",
      "expired products",
      "expiry products",
      "khatam ho raha",
      "expiry check",
      "expired stock",
      "expiry warning",
      "expiring products",
    ],
  },
  {
    type: "help_dead_stock_time",
    keywords: [
      "dead stock time",
      "dead stock period",
      "dead stock setting",
      "dead stock change",
      "ded stock time",
      "dead stock ka time",
      "dead time change",
    ],
  },
  {
    type: "dead_stock",
    keywords: [
      "dead stock",
      "ded stock",
      "deadstock",
      "dead maal",
      "nahi bik raha",
      "nahi bika",
      "not selling",
      "slow moving",
      "unsold stock",
    ],
  },
  {
    type: "low_stock",
    keywords: [
      "low stock",
      "kam stock",
      "lowstock",
      "stock alert",
      "reorder",
      "kya khatam ho raha",
      "low stok",
      "lo stock",
      "stock khatam hone",
      "reorder needed",
      "stock alert products",
    ],
  },
  {
    type: "out_of_stock",
    keywords: [
      "out of stock",
      "outofstock",
      "khatam product",
      "stock khatam",
      "khatam ho",
      "khatm stock",
      "stock nahi hai",
      "zero stock",
      "stock zero",
    ],
  },
  {
    type: "best_selling",
    keywords: [
      "best selling",
      "sabse jyada bikne",
      "sabse zyada sale",
      "sabse zyada bika",
      "top product",
      "most sold",
      "popular product",
      "popular item",
      "top selling",
      "highest sale",
      "zyada bikne wala",
      "sabse popular",
      "bestseller",
    ],
  },
  {
    type: "total_profit",
    keywords: [
      "total profit",
      "kul profit",
      "kul munafa",
      "overall profit",
      "sab ka profit",
      "kitna profit hua",
      "profit kitna hai",
      "total munafa",
    ],
  },
  {
    type: "today_profit",
    keywords: [
      "aaj ka profit",
      "today profit",
      "aaj profit",
      "profit aaj",
      "profit kitna",
      "today's profit",
      "aaj kitna profit",
    ],
  },
  {
    type: "recent_sales",
    keywords: [
      "recent sales",
      "kal ki sale",
      "is hafte ki sale",
      "weekly sales",
      "monthly sales",
      "is mahine ki sale",
      "week sales",
      "month sales",
      "last 7 days",
      "last 30 days",
      "pichle hafte",
      "pichle mahine",
    ],
  },
  {
    type: "today_sales",
    keywords: [
      "aaj ki sale",
      "aaj sale",
      "today sale",
      "today bill",
      "aaj kitni sale",
      "aaj ka sale",
      "sale aaj",
      "aaj biki",
      "today's sales",
      "aaj ki bikri",
      "today sales",
      "aaj ka total",
    ],
  },
  {
    type: "customer_count",
    keywords: [
      "kitne customer",
      "total customer",
      "customer count",
      "customer kitne",
      "total customers",
      "customers kitne",
      "customers hain",
      "how many customers",
    ],
  },
  {
    type: "vendor_due",
    keywords: [
      "vendor due",
      "vendor payment",
      "vendor ko kitna",
      "vendor outstanding",
      "supplier due",
      "vendor baaki",
      "vendor ka payment",
      "vendor paise",
      "vendor ka due",
    ],
  },
  {
    type: "pending_due",
    keywords: [
      "pending pay",
      "due kya",
      "kitna due",
      "credit due",
      "udhari",
      "udhaar",
      "payment pending",
      "due kitna",
      "paise lena",
      "credit lena",
      "payment baaki",
      "baaki hai kiska",
      "kitna baaki hai",
      "customer due",
      "credit pending",
    ],
  },
  {
    type: "staff_performance",
    keywords: [
      "staff performance",
      "staff sales",
      "kaun sa staff",
      "best employee",
      "staff ranking",
      "employee performance",
      "best staff",
      "staff ne kitna",
      "staff report",
      "staff sales report",
    ],
  },
  {
    type: "stock_value",
    keywords: [
      "stock ki value",
      "stock value",
      "inventory value",
      "total stock val",
      "stock ka value",
      "maal ki value",
      "total inventory worth",
    ],
  },
  {
    type: "total_products",
    keywords: [
      "kitne product",
      "total product",
      "product count",
      "products kitne",
      "kitna product",
      "items count",
      "kitne item",
      "stock mein kya",
      "how many products",
    ],
  },

  // ── Help guides ──
  {
    type: "help_job_card",
    keywords: [
      "job card kaise",
      "job card kese",
      "job card banana",
      "how to create job card",
      "how to make job card",
      "job card guide",
      "service card kaise",
      "repair kaise kare",
      "new repair kaise",
      "vehicle service kaise",
      "job card banane ka tarika",
    ],
  },
  {
    type: "help_add_shop",
    keywords: [
      "new shop",
      "naya shop",
      "nayi shop",
      "shop add",
      "add shop",
      "shop kaise banaye",
      "shop kese add",
      "dusri shop",
      "dusra shop",
      "shop banana",
      "shop banao",
      "multi shop",
    ],
  },
  {
    type: "help_add_vendor",
    keywords: [
      "vendor kaise",
      "vender kaise",
      "vendor add kaise",
      "vendor karo",
      "vendor management",
      "how to add vendor",
      "vendor guide",
      "supplier kaise",
    ],
  },
  {
    type: "help_add_stock",
    keywords: [
      "stock add kaise",
      "add stock kaise",
      "stock kaise",
      "stock karo",
      "bulk stock kaise",
      "stock in kaise",
      "how to add stock",
      "maal kaise",
    ],
  },
  {
    type: "help_sell",
    keywords: [
      "billing kaise",
      "bill kaise",
      "sell kaise",
      "invoice kaise",
      "sale kaise",
      "how to bill",
      "how to sell",
      "billing guide",
      "naya bill kaise",
    ],
  },
  {
    type: "help_add_customer",
    keywords: [
      "customer kaise",
      "customer add kaise",
      "how to add customer",
      "customer guide",
      "customer banana",
      "grahak kaise",
    ],
  },
  {
    type: "help_add_menu",
    keywords: [
      "menu item kaise",
      "add menu item",
      "how to add menu",
      "menu add karo",
      "restaurant menu kaise",
      "menu item banana",
      "food item add kaise",
    ],
  },
  {
    type: "help_restaurant_order",
    keywords: [
      "restaurant order kaise",
      "food order kaise",
      "table order kaise",
      "how to create order",
      "new order kaise",
      "dine in kaise",
      "order guide",
    ],
  },
  {
    type: "help_add_staff",
    keywords: [
      "staff kaise",
      "staff add kaise",
      "how to add staff",
      "staff guide",
      "employee kaise",
      "worker kaise add",
      "staff banana",
    ],
  },
  {
    type: "help_gst",
    keywords: [
      "gst setting",
      "gst kaise",
      "gstin kaise",
      "gst add kaise",
      "how to set gst",
      "gst number kahan",
      "gstin add",
      "gst settings",
      "gst lagao",
      "gst setup",
    ],
  },
  {
    type: "help_reports",
    keywords: [
      "report kaise",
      "report kese",
      "report dekhe",
      "reports guide",
      "how to see reports",
      "report chahiye",
    ],
  },
  {
    type: "help_mode",
    keywords: [
      "mode kaise",
      "mode change",
      "mode badlo",
      "advance mode",
      "basic mode",
      "super mode",
      "features unlock",
      "mode switch",
    ],
  },
  {
    type: "help_invoice",
    keywords: [
      "invoice print",
      "bill print",
      "print bill",
      "download bill",
      "whatsapp pe bill",
      "print kaise",
      "pdf download",
      "bill share",
      "invoice share",
    ],
  },
  {
    type: "help_diamonds",
    keywords: [
      "diamond kaise",
      "diamond reward",
      "diamonds earn",
      "diamond milta",
      "diamond badge",
      "diamond level",
      "how to earn diamonds",
    ],
  },
  {
    type: "help_backup",
    keywords: [
      "backup",
      "data export",
      "export data",
      "data save",
      "data download",
      "data copy",
      "how to backup",
    ],
  },
  {
    type: "help_settings",
    keywords: [
      "settings kahan",
      "settings open",
      "how to open settings",
      "settings guide",
      "setting change kaise",
    ],
  },

  // ── Customer analytics ──
  {
    type: "top_customers",
    keywords: [
      "top customers",
      "best customers",
      "sabse zyada customer",
      "top 5",
      "vip customer",
      "high value",
      "best customer",
      "sabse bada customer",
    ],
  },
  {
    type: "inactive_customers",
    keywords: [
      "inactive customers",
      "purane customer",
      "inactive customer",
      "180 din",
      "180 days customer",
      "customers who haven't visited",
    ],
  },
  {
    type: "lost_customers",
    keywords: [
      "lost customers",
      "lost customer",
      "360 din",
      "gayab customer",
      "360 days customer",
      "chale gaye customer",
    ],
  },
  {
    type: "pending_customers",
    keywords: [
      "who has pending",
      "pending customers",
      "due customers",
      "udhaar wale",
      "pending balance",
      "baki hai",
      "baaki hai",
    ],
  },
];

// The first-word fast-path
const GREETING_WORDS = new Set(["hi", "help"]);

export function normaliseQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectQuery(text: string): QueryType {
  const norm = normaliseQuery(text);
  const firstWord = norm.split(" ")[0];
  if (GREETING_WORDS.has(firstWord)) return "greeting";
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (norm.includes(kw)) return entry.type;
    }
  }
  return "unknown";
}

// ── Fuzzy suggestion for unknown queries ─────────────────────────────────────
function getFuzzySuggestions(text: string): string[] {
  const norm = normaliseQuery(text);
  const inputWords = norm.split(" ").filter((w) => w.length > 2);
  const scores: Map<QueryType, number> = new Map();

  for (const entry of KEYWORD_MAP) {
    let score = 0;
    for (const kw of entry.keywords) {
      for (const word of inputWords) {
        if (kw.includes(word) || word.includes(kw.split(" ")[0])) {
          score += 1;
        }
      }
    }
    if (score > 0)
      scores.set(entry.type, (scores.get(entry.type) ?? 0) + score);
  }

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return sorted.map(([type]) => queryTypeToChipLabel(type));
}

function queryTypeToChipLabel(type: QueryType): string {
  const map: Partial<Record<QueryType, string>> = {
    nav_service_repair: "Service / Repair",
    action_new_job_card: "New Job Card",
    nav_billing: "Billing",
    nav_inventory: "Inventory",
    nav_stock: "Add Stock",
    nav_customers: "Customers",
    nav_vendors: "Vendors",
    nav_reports: "Reports",
    low_stock: "Low Stock Alert",
    today_sales: "Today Sales",
    pending_due: "Customer Due",
    nav_restaurant_order: "New Order",
    nav_restaurant_kitchen: "Kitchen Display",
    best_selling: "Best Selling",
    help_job_card: "How to Job Card?",
    help_sell: "How to Sell?",
    help_add_stock: "How to Add Stock?",
    nav_settings: "Settings",
    expiry_alert: "Expiry Alerts",
    dead_stock: "Dead Stock",
  };
  return (
    map[type] ?? type.replace(/_/g, " ").replace(/^(nav|action|help) /, "")
  );
}

function steps(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

function daysSince(dateStr: string | undefined | null): number {
  if (!dateStr) return Number.POSITIVE_INFINITY;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function tierLabel(totalPurchase: number): string {
  if (totalPurchase >= 50000) return "👑 VIP";
  if (totalPurchase >= 20000) return "🥇 Gold";
  if (totalPurchase >= 5000) return "🥈 Silver";
  return "Normal";
}

function todayMMDD(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

// ── Page-aware quick chip sets ───────────────────────────────────────────────
const PAGE_CHIPS: Partial<Record<NavPage, string[]>> = {
  "service-repair": [
    "New Job Card",
    "Vehicle Search",
    "Pending Jobs",
    "Job History",
  ],
  billing: ["Today Sales", "Draft Bills", "New Sale", "Low Stock"],
  dashboard: ["Today Summary", "Low Stock", "Customer Due", "Expiry Alerts"],
  inventory: ["Low Stock Alert", "Expiry Alert", "Add Product", "Dead Stock"],
  customers: [
    "Customer Due",
    "Birthday Alerts",
    "VIP Customers",
    "Add Customer",
  ],
  vendors: ["Vendor Due", "Reorder Alert", "Add Vendor"],
  reports: ["Daily Report", "Profit Report", "Staff Report", "Credit Report"],
  "restaurant-order": [
    "Table Status",
    "New Order",
    "Pending KOT",
    "Kitchen Display",
  ],
  "restaurant-kitchen": [
    "Pending KOT",
    "Kitchen Display",
    "New Order",
    "Table Status",
  ],
  "restaurant-menu": ["Add Menu Item", "Restaurant Order", "Kitchen Display"],
  stock: ["Add Stock", "Low Stock", "Out of Stock", "Dead Stock"],
  "staff-management": ["Add Staff", "Staff Performance", "Attendance"],
  returns: ["Return Item", "Return History", "Today Returns"],
  settings: ["GST Settings", "Feature Toggle", "Shop Profile", "Backup Data"],
};

const DEFAULT_CHIPS = [
  "Today Sales",
  "Low Stock",
  "New Sale",
  "Customer Due",
  "Help",
];

function getChipsForPage(page?: NavPage): string[] {
  if (!page) return DEFAULT_CHIPS;
  return PAGE_CHIPS[page] ?? DEFAULT_CHIPS;
}

// ── Response generator ───────────────────────────────────────────────────────
export function generateResponse(
  type: QueryType,
  _lang: "en" | "hi",
  store: {
    products: Product[];
    invoices: Invoice[];
    customers: Customer[];
    appConfig: AppConfig;
    autoMode: AutoModeType;
    getProductStock: (id: string) => number;
    getTotalStockValue: () => number;
    getLastSoldDate: (id: string) => string | null;
  },
  onNavigate?: (page: NavPage) => void,
  onAction?: (action: string, params?: Record<string, unknown>) => void,
): { text: string; chips?: string[] } {
  const todayStr = new Date().toDateString();
  const now = Date.now();

  const todayInvoices = store.invoices.filter(
    (inv) => new Date(inv.date).toDateString() === todayStr,
  );
  const todayTotal = todayInvoices.reduce((s, i) => s + i.totalAmount, 0);

  // ── Navigation responses ──
  const navMap: Partial<Record<QueryType, { page: NavPage; label: string }>> = {
    nav_dashboard: { page: "dashboard", label: "Dashboard" },
    nav_inventory: { page: "inventory", label: "Inventory" },
    nav_stock: { page: "stock", label: "Stock In/Out" },
    nav_billing: { page: "billing", label: "Billing" },
    nav_drafts: { page: "drafts", label: "Draft Sales" },
    nav_customers: { page: "customers", label: "Customers" },
    nav_vendors: { page: "vendors", label: "Vendors" },
    nav_reports: { page: "reports", label: "Reports" },
    nav_settings: { page: "settings", label: "App Settings" },
    nav_service_repair: { page: "service-repair", label: "Service & Repair" },
    nav_rental: { page: "rental", label: "Rental / Lending" },
    nav_restaurant_menu: { page: "restaurant-menu", label: "Menu Management" },
    nav_restaurant_order: { page: "restaurant-order", label: "New Order" },
    nav_restaurant_kitchen: {
      page: "restaurant-kitchen",
      label: "Kitchen Display",
    },
    nav_restaurant_billing: {
      page: "restaurant-billing",
      label: "Restaurant Billing",
    },
    nav_restaurant_tables: {
      page: "restaurant-tables",
      label: "Table Management",
    },
    nav_staff: { page: "staff-management", label: "Staff Management" },
    nav_returns: { page: "returns", label: "Returns" },
    nav_history: { page: "history", label: "Draft History" },
    nav_admin: { page: "admin", label: "Admin Panel" },
    nav_super_admin: { page: "super-admin", label: "Super Admin" },
    nav_rankings: { page: "rankings", label: "Rankings" },
    nav_shop_board: { page: "shop-board", label: "Live Board" },
    nav_rewards: { page: "diamond-rewards", label: "Diamond Rewards" },
    nav_feedback: { page: "feedback-page", label: "Feedback" },
    nav_referral: { page: "referral-page", label: "Refer & Earn" },
  };

  if (navMap[type]) {
    const { page, label } = navMap[type]!;
    if (onNavigate) {
      setTimeout(() => onNavigate(page), 300);
    }
    return { text: `📂 Opening **${label}**...` };
  }

  // ── Action responses ──
  switch (type) {
    case "action_new_job_card":
      if (onAction) setTimeout(() => onAction("NEW_JOB_CARD"), 300);
      return {
        text: "🔧 Starting New Job Card...\n\nOpening Service & Repair and launching the job card form for you.",
      };

    case "action_new_sale":
      if (onAction) setTimeout(() => onAction("NEW_SALE"), 300);
      return {
        text: "🛒 Starting New Sale...\n\nOpening Billing and ready for you to add products.",
      };

    case "action_add_stock":
      if (onAction) setTimeout(() => onAction("ADD_STOCK"), 300);
      return { text: "📦 Opening Add Stock form..." };

    case "action_add_product":
      if (onAction) setTimeout(() => onAction("ADD_PRODUCT"), 300);
      return { text: "➕ Opening Add Product form in Inventory..." };

    case "action_new_order":
      if (onAction) setTimeout(() => onAction("NEW_ORDER"), 300);
      return { text: "🍽️ Starting New Restaurant Order..." };

    case "action_search_vehicle":
      if (onAction) setTimeout(() => onAction("SEARCH_VEHICLE"), 300);
      return { text: "🔍 Opening Vehicle Search in Service & Repair..." };

    case "action_new_customer":
      if (onAction) setTimeout(() => onAction("NEW_CUSTOMER"), 300);
      return { text: "👤 Opening Add Customer form..." };

    case "action_new_vendor":
      if (onAction) setTimeout(() => onAction("NEW_VENDOR"), 300);
      return { text: "🏭 Opening Add Vendor form..." };
  }

  // ── Data queries ──
  switch (type) {
    case "greeting":
      return {
        text: "Hello! 👋 I'm your Shop Assistant.\n\nYou can ask me anything:\n• Today's sales & profit\n• Low stock / expiry alerts\n• Customer dues & birthdays\n• Navigate to any section\n• Create job cards, new sales\n• Step-by-step guides\n\nOr just type what you need — I'll understand Hindi, English, or Hinglish!",
        chips: DEFAULT_CHIPS,
      };

    case "birthday_today": {
      const mmdd = todayMMDD();
      const birthdays = store.customers.filter((c) => {
        if (!c.birthday) return false;
        return c.birthday.slice(5) === mmdd;
      });
      if (!birthdays.length) {
        return { text: "🎂 No customer birthdays today." };
      }
      const list = birthdays
        .map((c) => `🎂 ${c.name}${c.mobile ? ` (${c.mobile})` : ""}`)
        .join("\n");
      return {
        text: `🎉 ${birthdays.length} customer birthday(s) today:\n${list}\n\nSend them a birthday wish!`,
      };
    }

    case "expiry_alert": {
      const in30 = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const expiring = store.products.filter((p) => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate).getTime();
        return exp <= in30 && store.getProductStock(p.id) > 0;
      });
      if (!expiring.length) {
        return { text: "✅ No products expiring in the next 30 days." };
      }
      const list = expiring
        .slice(0, 8)
        .map(
          (p) =>
            `• ${p.name} — expires ${new Date(p.expiryDate!).toLocaleDateString("en-IN")}`,
        )
        .join("\n");
      return {
        text: `⚠️ ${expiring.length} product(s) expiring within 30 days:\n${list}`,
      };
    }

    case "low_stock": {
      const low = store.products.filter((p) => {
        const stock = store.getProductStock(p.id);
        return stock <= (p.minStockAlert || 0) && stock > 0;
      });
      if (!low.length)
        return { text: "✅ No products are low on stock right now." };
      const list = low
        .slice(0, 8)
        .map(
          (p) =>
            `• ${p.name} (${store.getProductStock(p.id)} ${p.unit || "units"} left)`,
        )
        .join("\n");
      return { text: `⚠️ ${low.length} product(s) low on stock:\n${list}` };
    }

    case "dead_stock": {
      const days = store.appConfig.deadStockThresholdDays || 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      const dead = store.products.filter((p) => {
        const lastSold = store.getLastSoldDate(p.id);
        if (!lastSold) return store.getProductStock(p.id) > 0;
        return (
          new Date(lastSold).getTime() < cutoff &&
          store.getProductStock(p.id) > 0
        );
      });
      if (!dead.length)
        return { text: `✅ No dead stock found (last ${days} days).` };
      const list = dead
        .slice(0, 8)
        .map((p) => `• ${p.name}`)
        .join("\n");
      return {
        text: `🗂️ ${dead.length} dead stock product(s) (not sold in ${days} days):\n${list}`,
      };
    }

    case "today_sales":
      if (!todayInvoices.length) return { text: "📊 No sales yet today." };
      return {
        text: `📊 ${todayInvoices.length} bills today.\nTotal: ${formatCurrency(todayTotal)}`,
      };

    case "recent_sales": {
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const monthMs = 30 * 24 * 60 * 60 * 1000;
      const weekInvoices = store.invoices.filter(
        (inv) => now - new Date(inv.date).getTime() <= weekMs,
      );
      const monthInvoices = store.invoices.filter(
        (inv) => now - new Date(inv.date).getTime() <= monthMs,
      );
      const weekTotal = weekInvoices.reduce((s, i) => s + i.totalAmount, 0);
      const monthTotal = monthInvoices.reduce((s, i) => s + i.totalAmount, 0);
      return {
        text: `📈 Sales Summary:\n\n🗓️ Today: ${todayInvoices.length} bills — ${formatCurrency(todayTotal)}\n📅 This week (7d): ${weekInvoices.length} bills — ${formatCurrency(weekTotal)}\n🗓️ This month (30d): ${monthInvoices.length} bills — ${formatCurrency(monthTotal)}`,
      };
    }

    case "pending_due": {
      const totalDue = store.customers.reduce(
        (s, c) => s + (c.creditBalance || 0),
        0,
      );
      const dueCusts = store.customers.filter(
        (c) => (c.creditBalance || 0) > 0,
      );
      if (totalDue <= 0)
        return { text: "✅ No payment due from any customer." };
      return {
        text: `💰 Total ${formatCurrency(totalDue)} pending from ${dueCusts.length} customer(s).`,
      };
    }

    case "stock_value": {
      const val = store.getTotalStockValue();
      return { text: `📦 Total stock value: ${formatCurrency(val)}` };
    }

    case "out_of_stock": {
      const oos = store.products.filter(
        (p) => store.getProductStock(p.id) <= 0,
      );
      if (!oos.length) return { text: "✅ No products are out of stock." };
      const list = oos
        .slice(0, 8)
        .map((p) => `• ${p.name}`)
        .join("\n");
      return { text: `❌ ${oos.length} product(s) out of stock:\n${list}` };
    }

    case "total_products": {
      const inStock = store.products.filter(
        (p) => store.getProductStock(p.id) > 0,
      ).length;
      return {
        text: `📋 ${store.products.length} total product(s), ${inStock} currently in stock.`,
      };
    }

    case "customer_count":
      return {
        text: `👥 You have ${store.customers.length} registered customer(s).`,
      };

    case "today_profit": {
      let profit = 0;
      for (const inv of todayInvoices) {
        if (inv.items) {
          for (const item of inv.items) {
            profit += (item.sellingRate - item.purchaseCost) * item.quantity;
          }
        }
      }
      return {
        text: `💹 Estimated profit today: ${formatCurrency(Math.max(0, profit))}`,
      };
    }

    case "total_profit": {
      let totalProfit = 0;
      for (const inv of store.invoices) {
        if (inv.items) {
          for (const item of inv.items) {
            totalProfit +=
              (item.sellingRate - item.purchaseCost) * item.quantity;
          }
        }
      }
      return {
        text: `💹 Total estimated profit (all invoices): ${formatCurrency(Math.max(0, totalProfit))}`,
      };
    }

    case "best_selling": {
      if (!store.invoices.length)
        return { text: "📊 No sales records yet. Create some bills first!" };
      const qtySold: Record<string, { name: string; qty: number }> = {};
      for (const inv of store.invoices) {
        for (const item of inv.items ?? []) {
          if (!qtySold[item.productId])
            qtySold[item.productId] = { name: item.productName, qty: 0 };
          qtySold[item.productId].qty += item.quantity;
        }
      }
      const ranked = Object.values(qtySold)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      if (!ranked.length)
        return { text: "📊 Product-wise sale data not available yet." };
      const list = ranked
        .map((p, i) => `${i + 1}. ${p.name} — ${p.qty} units`)
        .join("\n");
      return { text: `🏆 Top 5 Best Selling Products:\n${list}` };
    }

    case "vendor_due":
      return {
        text: "🏭 To check vendor dues:\n1. Go to Vendors in sidebar\n2. Check Purchase Orders — pending orders show vendor dues\n3. Or view Purchase Report in Reports",
      };

    case "staff_performance": {
      if (!store.invoices.length)
        return {
          text: "👥 No sales records yet — staff performance data unavailable.",
        };
      const staffSales: Record<
        string,
        { name: string; count: number; total: number }
      > = {};
      for (const inv of store.invoices) {
        if (!inv.soldByUserId || !inv.soldByName) continue;
        if (!staffSales[inv.soldByUserId])
          staffSales[inv.soldByUserId] = {
            name: inv.soldByName,
            count: 0,
            total: 0,
          };
        staffSales[inv.soldByUserId].count += 1;
        staffSales[inv.soldByUserId].total += inv.totalAmount;
      }
      const ranked = Object.values(staffSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      if (!ranked.length)
        return {
          text: "👥 No staff-wise sales data yet. Staff must be logged in when creating bills to track performance.",
        };
      const list = ranked
        .map(
          (s, i) =>
            `${i + 1}. ${s.name} — ${s.count} bills — ${formatCurrency(s.total)}`,
        )
        .join("\n");
      return { text: `🏅 Staff Performance (by sales):\n${list}` };
    }

    // ── Help guides ──
    case "help_job_card":
      return {
        text: `🔧 How to create a Job Card:\n${steps([
          "Go to Service & Repair (sidebar or say 'Service Repair')",
          "Click the 'New Job Card' button at the top",
          "Enter the Vehicle Number — system shows history if it exists",
          "Fill customer name, mobile, problem description",
          "Add Parts used (auto-deducted from inventory via FIFO)",
          "Enter Labour charges",
          "Click Save → Job Card is created",
          "Click 'Generate Invoice' to create the bill (Parts + Labour)",
          "Share via WhatsApp or print",
        ])}`,
        chips: ["New Job Card", "Vehicle Search"],
      };

    case "help_add_shop":
      return {
        text: `🏪 How to add a new shop:\n${steps([
          "Click '+' near the shop name in the header",
          "Fill shop name, address, city in the form",
          "Select your shop category (Hardware, Medical, etc.)",
          "Click 'Create Shop'",
          "New shop created — switch from the header pill buttons",
        ])}`,
      };

    case "help_dead_stock_time":
      return {
        text: `⏱️ How to change dead stock period:\n${steps([
          "Go to Settings in the sidebar",
          "Find 'Dead Stock Settings' section",
          "Select period: 3 months, 6 months, 12 months, or custom days",
          "Click 'Save' — setting updates immediately",
        ])}`,
      };

    case "help_add_stock":
      return {
        text: `📦 How to add stock:\n${steps([
          "Click 'Stock In/Out' in sidebar (or say 'Add Stock')",
          "Select product or type a new name",
          "Fill Quantity, Purchase Rate, Vendor name",
          "Add Batch No / Expiry Date if applicable",
          "For bulk entry — use the SR No Range or Individual SR No tab",
          "Click 'Save Stock' — done!",
        ])}`,
        chips: ["Add Stock"],
      };

    case "help_sell":
      return {
        text: `🛒 How to do billing / sell:\n${steps([
          "Click the blue 'New Sale' button (bottom-right) or say 'New Sale'",
          "Add customer name/mobile (optional)",
          "Search and add products to cart, set quantity",
          "Apply discount or GST if needed",
          "Select payment mode: Cash / UPI / Credit",
          "Click 'Complete Payment' — bill is done!",
          "Share invoice via WhatsApp or print",
        ])}`,
        chips: ["New Sale"],
      };

    case "help_add_vendor":
      return {
        text: `🏭 How to add a vendor:\n${steps([
          "Go to Vendors in the sidebar",
          "Click '+ Add Vendor' button",
          "Fill vendor name, mobile, address",
          "Click 'Save' — vendor added!",
        ])}`,
        chips: ["Add Vendor"],
      };

    case "help_add_customer":
      return {
        text: `👤 How to add a customer:\n${steps([
          "Go to Customers in the sidebar",
          "Click '+ Add Customer' button",
          "Fill customer name and mobile",
          "Optionally add birthday — you'll get birthday reminders",
          "Click 'Save' — customer added!",
        ])}`,
        chips: ["Add Customer"],
      };

    case "help_add_menu":
      return {
        text: `🍽️ How to add a menu item (Restaurant):\n${steps([
          "Go to Menu Management in sidebar (Restaurant section)",
          "Click '+ Add Item' or '+ New Menu Item'",
          "Enter Item Name, Category (Veg/Non-Veg/Drinks/Snacks)",
          "Set Full Price — optionally set Half and Quarter prices",
          "Click 'Save' — menu item is live immediately",
        ])}`,
      };

    case "help_restaurant_order":
      return {
        text: `📋 How to create a Restaurant Order:\n${steps([
          "Go to New Order in the Restaurant section",
          "Select Order Type: Dine-in / Takeaway / Online",
          "For Dine-in — select the table number",
          "Browse menu items and add to order, set quantities",
          "Click 'Send to Kitchen' — KOT is created",
          "Kitchen sees order in Kitchen Display",
          "When ready — go to Restaurant Billing to generate final bill",
          "Apply GST / Service Charge if needed and complete payment",
        ])}`,
      };

    case "help_add_staff":
      return {
        text: `👥 How to add staff:\n${steps([
          "Go to Staff Management in the sidebar",
          "Click '+ Add Staff' button",
          "Fill name, mobile, role (Manager/Staff), PIN",
          "Click 'Save'",
          "Staff can now login with their mobile + PIN",
        ])}`,
      };

    case "help_gst":
      return {
        text: `🧾 How to set up GST:\n${steps([
          "Go to Settings in the sidebar",
          "Find 'Shop Profile' section",
          "Enter your GSTIN number in the GST Number field",
          "Click Save — GSTIN prints on every invoice automatically",
          "In Billing — toggle GST ON and select rate (5% / 12% / 18% / 28%)",
          "CGST and SGST will auto-split on the invoice",
        ])}`,
      };

    case "help_reports":
      return {
        text: `📈 How to view reports:\n${steps([
          "Go to Reports in the sidebar",
          "Select report type: Daily, Profit, Returns, Staff, Credit",
          "Set the date range",
          "Report table will appear",
          "You can export, print, or share via WhatsApp",
        ])}`,
      };

    case "help_mode":
      return {
        text: `🔧 How to change mode:\n${steps([
          "Click the mode dropdown in the header (Simple/Smart/Pro)",
          "Select your mode:",
          "  • Simple — essentials only (Stock, Billing)",
          "  • Smart — + Inventory, Reports, Customers",
          "  • Pro — all features unlocked",
          "Mode switches instantly, data is safe",
        ])}`,
      };

    case "help_invoice":
      return {
        text: `🖨️ How to print/share invoice:\n${steps([
          "Complete payment after billing",
          "Invoice popup shows 3 options: [WhatsApp] [Print] [PDF]",
          "WhatsApp: customer mobile pre-filled, just send",
          "Print: opens in 80mm thermal format",
          "PDF: saves to your device",
        ])}`,
      };

    case "help_diamonds":
      return {
        text: "💎 Diamond Rewards:\n\nEarn 1 diamond every 10 transactions.\n\nLevels:\n• Bronze — 0 to 9 diamonds\n• Silver — 10 to 49 diamonds\n• Gold — 50 to 99 diamonds\n• Diamond — 100+ diamonds\n\nWatch a 30-second ad for bonus diamonds!",
      };

    case "help_backup":
      return {
        text: `💾 How to backup your data:\n${steps([
          "Go to Settings in the sidebar",
          "Click 'Export Data' in App Settings section",
          "A JSON file will download — this is your backup",
          "To restore, use the 'Import Data' button",
        ])}`,
      };

    case "help_settings":
      return {
        text: `⚙️ How to open Settings:\n${steps([
          "Click 'App Settings' at the bottom of the sidebar",
          "Find: Units, Dead Stock, Feature Toggles, Dashboard Customization",
          "Change any setting using the toggle or dropdown",
          "Click 'Save' — setting updates immediately",
          "Disabling a feature only hides it — data is never deleted",
        ])}`,
      };

    // ── Customer analytics ──
    case "inactive_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return {
          text: "🔒 This feature requires Pro mode + Customer Tracking ON.\n\n1. Select Pro mode in the header\n2. Go to Settings → turn ON Customer Tracking",
        };
      }
      const inactive = store.customers.filter(
        (c) => daysSince(c.lastVisit) >= 180,
      );
      if (!inactive.length)
        return { text: "✅ No inactive customers found (180+ days)." };
      const preview = inactive
        .sort((a, b) => daysSince(b.lastVisit) - daysSince(a.lastVisit))
        .slice(0, 3)
        .map((c) => {
          const d = daysSince(c.lastVisit);
          return `• ${c.name} (${d === Number.POSITIVE_INFINITY ? "never visited" : `${d} days ago`})`;
        })
        .join("\n");
      return {
        text: `🔕 ${inactive.length} inactive customer(s) (180+ days):\n${preview}${inactive.length > 3 ? `\n...and ${inactive.length - 3} more` : ""}`,
      };
    }

    case "lost_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return {
          text: "🔒 This feature requires Pro mode + Customer Tracking ON.",
        };
      }
      const lost = store.customers.filter((c) => daysSince(c.lastVisit) >= 365);
      if (!lost.length)
        return {
          text: "✅ No lost customers found (365+ days category is empty).",
        };
      const preview = lost
        .sort((a, b) => daysSince(b.lastVisit) - daysSince(a.lastVisit))
        .slice(0, 3)
        .map((c) => {
          const d = daysSince(c.lastVisit);
          return `• ${c.name} (${d === Number.POSITIVE_INFINITY ? "never visited" : `${d} days ago`})`;
        })
        .join("\n");
      return {
        text: `❌ ${lost.length} lost customer(s) (365+ days):\n${preview}${lost.length > 3 ? `\n...and ${lost.length - 3} more` : ""}`,
      };
    }

    case "top_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return {
          text: "🔒 This feature requires Pro mode + Customer Tracking ON.",
        };
      }
      const sorted = [...store.customers]
        .filter((c) => (c.totalPurchase || 0) > 0)
        .sort((a, b) => (b.totalPurchase || 0) - (a.totalPurchase || 0))
        .slice(0, 5);
      if (!sorted.length)
        return {
          text: "📊 No customer purchase data yet. Link mobile numbers during billing to start tracking.",
        };
      const list = sorted
        .map(
          (c, i) =>
            `${i + 1}. ${c.name} — ${tierLabel(c.totalPurchase || 0)} — ${formatCurrency(c.totalPurchase || 0)}`,
        )
        .join("\n");
      return {
        text: `⭐ Top ${sorted.length} customers (by purchase):\n${list}`,
      };
    }

    case "pending_customers": {
      const withPending = store.customers
        .filter((c) => (c.pendingBalance || c.creditBalance || 0) > 0)
        .sort(
          (a, b) =>
            (b.pendingBalance || b.creditBalance || 0) -
            (a.pendingBalance || a.creditBalance || 0),
        )
        .slice(0, 5);
      if (!withPending.length)
        return { text: "✅ No pending payments from any customer. All clear!" };
      const list = withPending
        .map((c) => {
          const amt = c.pendingBalance || c.creditBalance || 0;
          return `• ${c.name}${c.mobile ? ` (${c.mobile})` : ""} — ${formatCurrency(amt)}`;
        })
        .join("\n");
      const totalPending = withPending.reduce(
        (s, c) => s + (c.pendingBalance || c.creditBalance || 0),
        0,
      );
      return {
        text: `💰 ${withPending.length} customer(s) have pending payments:\n${list}\n\nTop 5 total: ${formatCurrency(totalPending)}`,
      };
    }

    default: {
      // Fuzzy suggestions for unknown
      const suggestions = getFuzzySuggestions(_lang === "hi" ? _lang : "");
      if (suggestions.length > 0) {
        return {
          text: "I didn't quite understand that. 🤔 Did you mean one of these?",
          chips: suggestions,
        };
      }
      return {
        text: 'I didn\'t understand that. 🤔\n\nTry asking:\n• "Today\'s sales"\n• "Low stock"\n• "New job card"\n• "Customer due"\n• "How to add stock"\n\nOr tap one of the quick chips below!',
        chips: DEFAULT_CHIPS,
      };
    }
  }
}

// ── ChatBot Panel ────────────────────────────────────────────────────────────
interface ChatBotPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (page: NavPage) => void;
  onAction?: (action: string, params?: Record<string, unknown>) => void;
  currentPage?: NavPage;
}

export function ChatBotPanel({
  open,
  onClose,
  onNavigate,
  onAction,
  currentPage,
}: ChatBotPanelProps) {
  const { language } = useLanguage();
  const store = useStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Welcome message on first open
  const hasWelcomed = useRef(false);
  useEffect(() => {
    if (open && !hasWelcomed.current) {
      hasWelcomed.current = true;
      const result = generateResponse("greeting", language, {
        products: store.products,
        invoices: store.invoices,
        customers: store.customers,
        appConfig: store.appConfig,
        autoMode: store.autoMode,
        getProductStock: store.getProductStock,
        getTotalStockValue: store.getTotalStockValue,
        getLastSoldDate: store.getLastSoldDate,
      });
      setMessages([
        {
          id: "welcome",
          from: "bot",
          text: result.text,
          time: getTime(),
          chips: result.chips,
        },
      ]);
    }
  }, [open, language, store]);

  const storeSnapshot = useMemo(
    () => ({
      products: store.products,
      invoices: store.invoices,
      customers: store.customers,
      appConfig: store.appConfig,
      autoMode: store.autoMode,
      getProductStock: store.getProductStock,
      getTotalStockValue: store.getTotalStockValue,
      getLastSoldDate: store.getLastSoldDate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      store.products,
      store.invoices,
      store.customers,
      store.appConfig,
      store.autoMode,
      store.getProductStock,
      store.getTotalStockValue,
      store.getLastSoldDate,
    ],
  );

  const dispatchQuery = useCallback(
    (text: string) => {
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        from: "user",
        text,
        time: getTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);

      setTimeout(() => {
        const type = detectQuery(text);
        const result = generateResponse(
          type,
          language,
          storeSnapshot,
          onNavigate,
          onAction,
        );
        const botMsg: Message = {
          id: `b-${Date.now()}`,
          from: "bot",
          text: result.text,
          time: getTime(),
          chips: result.chips,
        };
        setMessages((prev) => [...prev, botMsg]);
        setThinking(false);
      }, 320);
    },
    [language, storeSnapshot, onNavigate, onAction],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    dispatchQuery(text);
  }, [input, thinking, dispatchQuery]);

  const handleChipClick = useCallback(
    (chip: string) => {
      // Map chip label to a recognisable query string
      const chipQuery: Record<string, string> = {
        "New Job Card": "new job card",
        "Vehicle Search": "search vehicle",
        "Pending Jobs": "service repair",
        "Job History": "service repair",
        "Today Sales": "today sales",
        "Draft Bills": "drafts",
        "New Sale": "new sale",
        "Low Stock": "low stock",
        "Today Summary": "today sales",
        "Customer Due": "customer due",
        "Expiry Alerts": "expiry alert",
        "Low Stock Alert": "low stock",
        "Expiry Alert": "expiry alert",
        "Add Product": "add product",
        "Dead Stock": "dead stock",
        "Birthday Alerts": "aaj birthday",
        "VIP Customers": "top customers",
        "Add Customer": "add new customer",
        "Vendor Due": "vendor due",
        "Reorder Alert": "low stock",
        "Add Vendor": "add new vendor",
        "Daily Report": "reports",
        "Profit Report": "reports",
        "Staff Report": "staff performance",
        "Credit Report": "customer due",
        "Table Status": "table management",
        "New Order": "new restaurant order",
        "Pending KOT": "kitchen display",
        "Kitchen Display": "kitchen display",
        "Add Stock": "add new stock",
        "Out of Stock": "out of stock",
        "Add Staff": "add new staff",
        "Staff Performance": "staff performance",
        Attendance: "attendance",
        "Return Item": "returns",
        "Return History": "returns",
        "Today Returns": "returns",
        "GST Settings": "gst setting",
        "Feature Toggle": "settings",
        "Shop Profile": "settings",
        "Backup Data": "backup",
        "Add Menu Item": "add menu item",
        "Restaurant Order": "restaurant order",
        Help: "greeting",
        "Service / Repair": "service repair",
        Billing: "billing",
        Inventory: "inventory",
        Reports: "reports",
        Settings: "settings",
        Customers: "customers",
        Vendors: "vendors",
        "How to Job Card?": "job card kaise",
        "How to Sell?": "billing kaise",
        "How to Add Stock?": "add stock kaise",
      };
      dispatchQuery(chipQuery[chip] ?? chip);
    },
    [dispatchQuery],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // Active quick chips: last bot message chips OR page chips
  const lastBotMsg = [...messages].reverse().find((m) => m.from === "bot");
  const activeChips = lastBotMsg?.chips ?? getChipsForPage(currentPage);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes chatbot-panel-in {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .chatbot-panel { animation: chatbot-panel-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        @media (min-width: 768px) {
          .chatbot-panel-positioned {
            position: fixed;
            left: calc(224px + 8px);
            top: 12px;
            width: min(320px, calc(100vw - 248px));
            height: min(500px, calc(100vh - 24px));
          }
        }
        @media (max-width: 767px) {
          .chatbot-panel-positioned {
            position: fixed;
            left: 8px;
            right: 8px;
            top: 60px;
            bottom: 60px;
            width: auto;
            max-width: 100%;
            height: auto;
            max-height: none;
            overflow-x: hidden;
          }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        .dot-1 { animation: dot-bounce 1.2s infinite 0s; }
        .dot-2 { animation: dot-bounce 1.2s infinite 0.2s; }
        .dot-3 { animation: dot-bounce 1.2s infinite 0.4s; }
      `}</style>

      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-[9998] md:hidden bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close chat"
      />

      <div
        data-ocid="chatbot.dialog"
        className="chatbot-panel chatbot-panel-positioned z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/chatbot-robot.jpg"
              alt="Shop Assistant"
              style={{
                width: 32,
                height: 32,
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Shop Assistant
              </p>
              <p className="text-purple-200 text-xs leading-tight">
                Navigate · Data · Guides
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            data-ocid="chatbot.close_button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20"
          style={{ minHeight: 0, overscrollBehavior: "contain" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.from === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1 ${msg.from === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground text-right"}`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="dot-1 w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                <span className="dot-2 w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                <span className="dot-3 w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        <div
          className="flex gap-1.5 px-3 py-2 border-t border-border bg-card flex-shrink-0"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            minWidth: 0,
          }}
        >
          {activeChips.map((chip) => (
            <button
              key={chip}
              type="button"
              data-ocid={`chatbot.${chip
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "")}_chip`}
              onClick={() => handleChipClick(chip)}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-colors duration-150 whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card flex-shrink-0"
          style={{
            paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Hindi/English/Hinglish)"
            data-ocid="chatbot.input"
            disabled={thinking}
            className="flex-1 min-w-0 text-sm bg-muted/40 border border-input rounded-full px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground text-foreground disabled:opacity-50 transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            data-ocid="chatbot.submit_button"
            aria-label="Send message"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 active:scale-90 transition-all duration-150 flex-shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// Keep legacy export as no-op
export function ChatBot() {
  return null;
}
