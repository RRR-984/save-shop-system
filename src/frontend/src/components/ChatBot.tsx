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

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
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

// ── Pattern matcher ─────────────────────────────────────────────────────────
type QueryType =
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
  | "help_add_shop"
  | "help_dead_stock_time"
  | "help_add_stock"
  | "help_sell"
  | "help_add_vendor"
  | "help_add_customer"
  | "help_reports"
  | "help_mode"
  | "help_staff"
  | "help_invoice"
  | "help_diamonds"
  | "help_backup"
  | "help_settings"
  | "inactive_customers"
  | "lost_customers"
  | "top_customers"
  | "pending_customers"
  | "unknown";

const KEYWORD_MAP: Array<{ type: QueryType; keywords: string[] }> = [
  {
    type: "greeting",
    keywords: ["hello", "namaste", "hey", "hii", "helllo", "helo", "namaskar"],
  },
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
    type: "help_dead_stock_time",
    keywords: [
      "dead stock time",
      "dead stock period",
      "dead stock setting",
      "dead stock change",
      "ded stock time",
      "ded stock period",
      "dead stock ka time",
      "dead stock ka period",
      "dead time change",
    ],
  },
  {
    type: "dead_stock",
    keywords: [
      "dead stock",
      "ded stock",
      "deadstock",
      "dedstock",
      "डेड स्टॉक",
      "dead maal",
      "nahi bik raha",
      "nahi bika",
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
      "कम स्टॉक",
      "low stok",
      "lo stock",
      "stock khatam hone",
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
      "ख़त्म",
      "khatm stock",
      "stock nahi hai",
    ],
  },
  {
    type: "best_selling",
    keywords: [
      "best selling",
      "bestselling",
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
      "आज का लाभ",
      "आज लाभ",
      "profit kitna",
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
      "hafte ki bikri",
      "mahine ki bikri",
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
      "आज बिक्री",
      "आज की बिक्री",
      "aaj biki",
      "today's sales",
      "aaj ki bikri",
    ],
  },
  {
    type: "customer_count",
    keywords: [
      "kitne customer",
      "total customer",
      "customer count",
      "customer kitne",
      "कितने ग्राहक",
      "total customers",
      "customers kitne",
      "customers hain",
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
      "vendor ka due",
      "vendor paise",
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
      "बकाया",
      "payment pending",
      "due kitna",
      "paise lena",
      "credit lena",
      "payment baaki",
      "baaki hai kiska",
      "kitna baaki hai",
      "customer due",
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
      "staff report",
      "employee performance",
      "best staff",
      "staff ka performance",
      "staff ne kitna",
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
    ],
  },
  {
    type: "total_products",
    keywords: [
      "kitne product",
      "total product",
      "product count",
      "कितने प्रोडक्ट",
      "products kitne",
      "kitna product",
      "items count",
      "kitne item",
      "stock mein kya",
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
      "shop kaise add",
      "dusri shop",
      "dusra shop",
      "नया शॉप",
      "शॉप जोड़",
      "shop banana",
      "shop banao",
      "multi shop",
    ],
  },
  {
    type: "help_add_vendor",
    keywords: [
      "vendor add",
      "vender add",
      "add vendor",
      "add vender",
      "naya vendor",
      "naya vender",
      "new vendor",
      "new vender",
      "vendor kaise",
      "vender kaise",
      "vendor kese",
      "vender kese",
      "vendor karo",
      "vender karo",
      "vendor banao",
      "vender banao",
      "vendor banana",
      "vender banana",
      "supplier add",
      "vendor जोड़",
      "विक्रेता",
      "vendor management",
      "vender management",
    ],
  },
  {
    type: "help_add_stock",
    keywords: [
      "stock add",
      "add stock",
      "stock kaise",
      "stock kese",
      "stock karo",
      "stock banao",
      "material add",
      "material kaise",
      "material kese",
      "naya stock",
      "naya material",
      "item add",
      "item kaise",
      "maal add",
      "maal kaise",
      "maal kese",
      "stock me add",
      "stock mein add",
      "स्टॉक कैसे",
      "माल कैसे",
      "bulk stock",
      "stock in",
    ],
  },
  {
    type: "help_sell",
    keywords: [
      "billing",
      "bill banao",
      "bill banana",
      "bill kaise",
      "bill kese",
      "sell kaise",
      "sell kese",
      "sell karo",
      "selling",
      "bechna",
      "becho",
      "invoice kaise",
      "invoice kese",
      "sale kaise",
      "sale kese",
      "naya bill",
      "new bill",
      "बिलिंग",
      "बिक्री कैसे",
      "बिल कैसे",
      "payment kaise le",
      "payment kese le",
      "payment lo",
      "payment lena",
      "payment collect",
      "paise lene",
      "cash collect",
      "payment receive",
    ],
  },
  {
    type: "help_add_customer",
    keywords: [
      "customer add",
      "add customer",
      "naya customer",
      "new customer",
      "customer kaise",
      "customer kese",
      "customer karo",
      "customer banao",
      "customer banana",
      "customer management",
      "ग्राहक जोड़",
      "ग्राहक कैसे",
    ],
  },
  {
    type: "help_staff",
    keywords: [
      "staff add",
      "add staff",
      "naya staff",
      "new staff",
      "staff kaise",
      "staff kese",
      "staff karo",
      "employee add",
      "add employee",
      "worker add",
      "staff member",
      "staff banana",
      "staff banao",
      "staff management",
      "स्टाफ जोड़",
      "स्टाफ कैसे",
    ],
  },
  {
    type: "help_reports",
    keywords: [
      "report kaise",
      "report kese",
      "report dekhe",
      "report dekhna",
      "report nikale",
      "report nikalen",
      "daily report",
      "profit report",
      "sales report",
      "report chahiye",
      "रिपोर्ट कैसे",
      "रिपोर्ट देखें",
    ],
  },
  {
    type: "help_mode",
    keywords: [
      "mode kaise",
      "mode kese",
      "mode change",
      "mode badlo",
      "advance mode",
      "basic mode",
      "super mode",
      "normal mode",
      "features unlock",
      "mode switch",
      "मोड कैसे",
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
      "invoice download",
    ],
  },
  {
    type: "help_diamonds",
    keywords: [
      "diamond kaise",
      "diamond kese",
      "diamond reward",
      "diamonds earn",
      "diamond milta",
      "हीरा",
      "डायमंड",
      "diamond badge",
      "diamond level",
    ],
  },
  {
    type: "help_backup",
    keywords: [
      "backup",
      "data export",
      "export data",
      "बैकअप",
      "data save",
      "data download",
      "data copy",
    ],
  },
  {
    type: "help_settings",
    keywords: [
      "settings kaise",
      "settings kese",
      "setting change",
      "setting badle",
      "settings badlo",
      "settings kahan",
      "settings open",
      "सेटिंग कैसे",
    ],
  },
  {
    type: "top_customers",
    keywords: [
      "top customers",
      "top costumer",
      "best customers",
      "best costumer",
      "sabse zyada customer",
      "top 5",
      "vip customer",
      "high value",
      "top customer",
      "best customer",
      "sabse bada customer",
    ],
  },
  {
    type: "inactive_customers",
    keywords: [
      "inactive customers",
      "inactive costumer",
      "customers 180 days",
      "purane customer",
      "inactive customer",
      "purana customer",
      "show inactive",
      "180 din",
      "180 days customer",
      "180 dino se",
    ],
  },
  {
    type: "lost_customers",
    keywords: [
      "lost customers",
      "lost costumer",
      "customers 360 days",
      "lost customer",
      "show lost",
      "360 din",
      "gayab customer",
      "360 days customer",
      "360 dino se",
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
      "pending hai",
      "due wale",
      "credit wale",
    ],
  },
];

const GREETING_WORDS = new Set(["hi", "help"]);

function normaliseQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectQuery(text: string): QueryType {
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

function generateResponse(
  type: QueryType,
  lang: "en" | "hi",
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
): string {
  const isHi = lang === "hi";
  const todayStr = new Date().toDateString();
  const now = Date.now();

  const todayInvoices = store.invoices.filter(
    (inv) => new Date(inv.date).toDateString() === todayStr,
  );
  const todayTotal = todayInvoices.reduce((s, i) => s + i.totalAmount, 0);

  switch (type) {
    case "greeting":
      return isHi
        ? "Namaste! 🙏 Main aapka Shop Assistant hoon.\n\nAap mujhse pooch sakte hain:\n• Low stock batao\n• Aaj ki sale kitni hai\n• Aaj birthday kaun?\n• Dead stock kya hai\n• Pending due kitna hai\n• Best selling product\n• New shop kaise banaye\n• Vendor kese add kare\n• Billing kaise kare\n• Staff kese add kare"
        : "Hello! 👋 I'm your Shop Assistant.\n\nYou can ask me:\n• Low stock products\n• Today's sales\n• Today's birthdays\n• Dead stock\n• Pending due\n• Best selling products\n• How to add a new shop\n• How to add stock\n• How to do billing";

    case "birthday_today": {
      const mmdd = todayMMDD();
      const birthdays = store.customers.filter((c) => {
        if (!c.birthday) return false;
        const bmmdd = c.birthday.slice(5);
        return bmmdd === mmdd;
      });
      if (!birthdays.length) {
        return isHi
          ? "🎂 Aaj kisi bhi customer ka birthday nahi hai."
          : "🎂 No customer birthdays today.";
      }
      const list = birthdays
        .map((c) => `🎂 ${c.name}${c.mobile ? ` (${c.mobile})` : ""}`)
        .join("\n");
      return isHi
        ? `🎉 Aaj ${birthdays.length} customer(s) ka birthday hai:\n${list}\n\nWish karein aur unhe special feel karaayen!`
        : `🎉 ${birthdays.length} customer birthday(s) today:\n${list}\n\nSend them a birthday wish!`;
    }

    case "low_stock": {
      const low = store.products.filter((p) => {
        const stock = store.getProductStock(p.id);
        return stock <= (p.minStockAlert || 0) && stock > 0;
      });
      if (!low.length)
        return isHi
          ? "✅ Abhi koi bhi product low stock mein nahi hai."
          : "✅ No products are low on stock right now.";
      const list = low
        .slice(0, 8)
        .map(
          (p) =>
            `• ${p.name} (${store.getProductStock(p.id)} ${p.unit || "units"} bache)`,
        )
        .join("\n");
      return isHi
        ? `⚠️ ${low.length} product(s) low stock mein hain:\n${list}`
        : `⚠️ ${low.length} product(s) are low on stock:\n${list}`;
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
        return isHi
          ? `✅ Koi dead stock nahi hai (last ${days} din mein).`
          : `✅ No dead stock found (last ${days} days).`;
      const list = dead
        .slice(0, 8)
        .map((p) => `• ${p.name}`)
        .join("\n");
      return isHi
        ? `🗂️ ${dead.length} dead stock product(s) (${days} din se bech nahi rahe):\n${list}`
        : `🗂️ ${dead.length} dead stock product(s) (not sold in ${days} days):\n${list}`;
    }

    case "today_sales":
      if (!todayInvoices.length)
        return isHi
          ? "📊 Aaj abhi tak koi sale nahi hui hai."
          : "📊 No sales yet today.";
      return isHi
        ? `📊 Aaj ${todayInvoices.length} bill bane hain.\nTotal sale: ${formatCurrency(todayTotal)}`
        : `📊 ${todayInvoices.length} bills made today.\nTotal: ${formatCurrency(todayTotal)}`;

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
      return isHi
        ? `📈 Sales Summary:\n\n🗓️ Aaj: ${todayInvoices.length} bills — ${formatCurrency(todayTotal)}\n📅 Is hafte (7 din): ${weekInvoices.length} bills — ${formatCurrency(weekTotal)}\n🗓️ Is mahine (30 din): ${monthInvoices.length} bills — ${formatCurrency(monthTotal)}`
        : `📈 Sales Summary:\n\n🗓️ Today: ${todayInvoices.length} bills — ${formatCurrency(todayTotal)}\n📅 This week (7d): ${weekInvoices.length} bills — ${formatCurrency(weekTotal)}\n🗓️ This month (30d): ${monthInvoices.length} bills — ${formatCurrency(monthTotal)}`;
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
        return isHi
          ? "✅ Koi payment due nahi hai."
          : "✅ No payment due from any customer.";
      return isHi
        ? `💰 Total ${formatCurrency(totalDue)} ka due hai, ${dueCusts.length} customer(s) se.`
        : `💰 Total ${formatCurrency(totalDue)} pending from ${dueCusts.length} customer(s).`;
    }

    case "stock_value": {
      const val = store.getTotalStockValue();
      return isHi
        ? `📦 Aapke stock ki total value: ${formatCurrency(val)}`
        : `📦 Total stock value: ${formatCurrency(val)}`;
    }

    case "out_of_stock": {
      const oos = store.products.filter(
        (p) => store.getProductStock(p.id) <= 0,
      );
      if (!oos.length)
        return isHi
          ? "✅ Koi product out of stock nahi hai."
          : "✅ No products are out of stock.";
      const list = oos
        .slice(0, 8)
        .map((p) => `• ${p.name}`)
        .join("\n");
      return isHi
        ? `❌ ${oos.length} product(s) out of stock:\n${list}`
        : `❌ ${oos.length} product(s) out of stock:\n${list}`;
    }

    case "total_products": {
      const inStock = store.products.filter(
        (p) => store.getProductStock(p.id) > 0,
      ).length;
      return isHi
        ? `📋 Total ${store.products.length} product(s) hain, jisme ${inStock} in-stock hain.`
        : `📋 ${store.products.length} total product(s), ${inStock} currently in stock.`;
    }

    case "customer_count":
      return isHi
        ? `👥 Aapke paas total ${store.customers.length} registered customer(s) hain.`
        : `👥 You have ${store.customers.length} registered customer(s).`;

    case "today_profit": {
      let profit = 0;
      for (const inv of todayInvoices) {
        if (inv.items) {
          for (const item of inv.items) {
            profit += (item.sellingRate - item.purchaseCost) * item.quantity;
          }
        }
      }
      return isHi
        ? `💹 Aaj ka estimated profit: ${formatCurrency(Math.max(0, profit))}`
        : `💹 Estimated profit today: ${formatCurrency(Math.max(0, profit))}`;
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
      return isHi
        ? `💹 Sab invoices ka total estimated profit: ${formatCurrency(Math.max(0, totalProfit))}`
        : `💹 Total estimated profit (all invoices): ${formatCurrency(Math.max(0, totalProfit))}`;
    }

    case "best_selling": {
      if (!store.invoices.length) {
        return isHi
          ? "📊 Abhi koi bhi sale record nahi hai. Pehle kuch bill banao!"
          : "📊 No sales records yet. Create some bills first!";
      }
      const qtySold: Record<string, { name: string; qty: number }> = {};
      for (const inv of store.invoices) {
        for (const item of inv.items ?? []) {
          if (!qtySold[item.productId]) {
            qtySold[item.productId] = { name: item.productName, qty: 0 };
          }
          qtySold[item.productId].qty += item.quantity;
        }
      }
      const ranked = Object.values(qtySold)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      if (!ranked.length) {
        return isHi
          ? "📊 Product-wise sale data abhi available nahi hai."
          : "📊 Product-wise sale data not available yet.";
      }
      const list = ranked
        .map((p, i) => `${i + 1}. ${p.name} — ${p.qty} units`)
        .join("\n");
      return isHi
        ? `🏆 Top 5 Best Selling Products:\n${list}`
        : `🏆 Top 5 Best Selling Products:\n${list}`;
    }

    case "vendor_due":
      return isHi
        ? "🏭 Vendor due check karne ke liye:\n\n1. Sidebar mein 'Vendors' pe jaao\n2. 'Purchase Orders' mein dekho — pending orders mein vendor ka due milega\n3. Ya 'Reports' mein Purchase Report dekho\n\nAbhi real-time vendor outstanding data chatbot mein available nahi hai — directly Purchase Orders page check karein."
        : "🏭 To check vendor dues:\n\n1. Go to 'Vendors' in the sidebar\n2. Check 'Purchase Orders' — pending orders show vendor dues\n3. Or view Purchase Report in Reports\n\nReal-time vendor outstanding isn't available in chat yet — check the Purchase Orders page directly.";

    case "staff_performance": {
      if (!store.invoices.length) {
        return isHi
          ? "👥 Abhi koi sales record nahi hai — staff performance data available nahi hai."
          : "👥 No sales records yet — staff performance data unavailable.";
      }
      const staffSales: Record<
        string,
        { name: string; count: number; total: number }
      > = {};
      for (const inv of store.invoices) {
        if (!inv.soldByUserId || !inv.soldByName) continue;
        if (!staffSales[inv.soldByUserId]) {
          staffSales[inv.soldByUserId] = {
            name: inv.soldByName,
            count: 0,
            total: 0,
          };
        }
        staffSales[inv.soldByUserId].count += 1;
        staffSales[inv.soldByUserId].total += inv.totalAmount;
      }
      const ranked = Object.values(staffSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      if (!ranked.length) {
        return isHi
          ? "👥 Staff-wise sales data abhi available nahi hai. Staff ne bills banate waqt login kiya ho tab track hota hai."
          : "👥 No staff-wise sales data yet. Staff must be logged in when creating bills to track performance.";
      }
      const list = ranked
        .map(
          (s, i) =>
            `${i + 1}. ${s.name} — ${s.count} bills — ${formatCurrency(s.total)}`,
        )
        .join("\n");
      return isHi
        ? `🏅 Staff Performance (sale ke hisaab se):\n${list}`
        : `🏅 Staff Performance (by sales):\n${list}`;
    }

    case "help_add_shop":
      return isHi
        ? `🏪 New shop add karne ka tarika:\n${steps([
            "Header mein shop name ke paas '+' button dabao",
            "'Create New Shop' form mein shop ka naam, address, city bharo",
            "'Create Shop' button dabao",
            "Naya shop ban jaayega aur header mein switch milega",
          ])}`
        : `🏪 How to add a new shop:\n${steps([
            "Click '+' button near the shop name in the header",
            "Fill shop name, address, city in the form",
            "Click 'Create Shop'",
            "New shop is created and you can switch from the header",
          ])}`;

    case "help_dead_stock_time":
      return isHi
        ? `⏱️ Dead stock ka time kaise change karein:\n${steps([
            "Sidebar mein 'Settings' mein jaao",
            "'Dead Stock Settings' section dhundho",
            "Period select karo: 3 months, 6 months, 12 months, ya custom days",
            "'Save' dabao — setting update ho jaayegi",
          ])}`
        : `⏱️ How to change dead stock period:\n${steps([
            "Go to 'Settings' in the sidebar",
            "Find 'Dead Stock Settings' section",
            "Select period: 3 months, 6 months, 12 months, or custom days",
            "Click 'Save' — setting will update",
          ])}`;

    case "help_add_stock":
      return isHi
        ? `📦 Stock kaise add karein:\n${steps([
            "Sidebar mein 'Stock In/Out' ya dashboard pe 'Add Stock' dabao",
            "Product select karo ya naaya naam likho",
            "Quantity, Rate, Vendor naam bharo",
            "'Save Stock' dabao — ho gaya!",
          ])}`
        : `📦 How to add stock:\n${steps([
            "Click 'Stock In/Out' in sidebar or 'Add Stock' on dashboard",
            "Select product or type a new name",
            "Fill Quantity, Rate, Vendor name",
            "Click 'Save Stock' — done!",
          ])}`;

    case "help_sell":
      return isHi
        ? `🛒 Billing / Sell kaise karein:\n${steps([
            "Dashboard pe blue 'New Sale' button (bottom-right) dabao",
            "Customer ka naam/mobile add karo (optional)",
            "Product search karke cart mein add karo, qty set karo",
            "Payment mode select karo (Cash/UPI/Credit)",
            "'Complete Payment' dabao — bill ban jaayega",
          ])}`
        : `🛒 How to do billing/sell:\n${steps([
            "Click the blue 'New Sale' button (bottom-right)",
            "Add customer name/mobile (optional)",
            "Search and add products to cart, set qty",
            "Select payment mode (Cash/UPI/Credit)",
            "Click 'Complete Payment' — bill is done!",
          ])}`;

    case "help_add_vendor":
      return isHi
        ? `🏭 Vendor kaise add karein:\n${steps([
            "Sidebar mein 'Vendors' mein jaao",
            "'+ Add Vendor' button dabao",
            "Vendor ka naam, mobile, address bharo",
            "'Save' dabao — vendor add ho jaayega",
          ])}`
        : `🏭 How to add a vendor:\n${steps([
            "Go to 'Vendors' in the sidebar",
            "Click '+ Add Vendor' button",
            "Fill vendor name, mobile, address",
            "Click 'Save' — vendor added!",
          ])}`;

    case "help_add_customer":
      return isHi
        ? `👤 Customer kaise add karein:\n${steps([
            "Sidebar mein 'Customers' mein jaao",
            "'+ Add Customer' button dabao",
            "Customer ka naam, mobile bharo",
            "Birthday (optional) bhi add kar sakte hain — birthday reminders milenge",
            "'Save' dabao — customer add ho jaayega",
          ])}`
        : `👤 How to add a customer:\n${steps([
            "Go to 'Customers' in the sidebar",
            "Click '+ Add Customer' button",
            "Fill customer name and mobile",
            "Optionally add birthday — you'll get birthday reminders",
            "Click 'Save' — customer added!",
          ])}`;

    case "help_reports":
      return isHi
        ? `📈 Reports kaise dekhein:\n${steps([
            "Sidebar mein 'Reports' mein jaao",
            "Report type select karo: Daily, Profit, Returns, Staff, Credit",
            "Date range set karo",
            "Report table dikhegi",
            "Export/Print/WhatsApp se share bhi kar sakte hain",
          ])}`
        : `📈 How to view reports:\n${steps([
            "Go to 'Reports' in the sidebar",
            "Select report type: Daily, Profit, Returns, Staff, Credit",
            "Set the date range",
            "Report table will appear",
            "You can export, print, or share via WhatsApp",
          ])}`;

    case "help_mode":
      return isHi
        ? `🔧 Mode kaise change karein:\n${steps([
            "Header mein 'Basic ▾' dropdown dabao",
            "Apna mode select karo:",
            "  • Basic — beginner, sirf basics",
            "  • Normal — standard features",
            "  • Advance — reports, billing, customers",
            "  • Super — sab features unlock",
            "Mode instantly switch ho jaayega, data safe rahega",
          ])}`
        : `🔧 How to change mode:\n${steps([
            "Click the 'Basic ▾' dropdown in the header",
            "Select your mode:",
            "  • Basic — beginner, essentials only",
            "  • Normal — standard features",
            "  • Advance — reports, billing, customers",
            "  • Super — all features unlocked",
            "Mode switches instantly, data is safe",
          ])}`;

    case "help_staff":
      return isHi
        ? `👥 Staff kaise add karein:\n${steps([
            "Sidebar mein 'Staff Management' mein jaao",
            "'+ Add Staff' button dabao",
            "Naam, mobile, role (Manager/Staff), PIN bharo",
            "'Save' dabao",
            "Staff apne mobile + PIN se login kar sakta hai",
          ])}`
        : `👥 How to add staff:\n${steps([
            "Go to 'Staff Management' in the sidebar",
            "Click '+ Add Staff' button",
            "Fill name, mobile, role (Manager/Staff), PIN",
            "Click 'Save'",
            "Staff can now login with their mobile + PIN",
          ])}`;

    case "help_invoice":
      return isHi
        ? `🖨️ Invoice print/share karne ka tarika:\n${steps([
            "Billing ke baad payment complete karo",
            "Invoice popup mein 3 options milenge:",
            "  [Send WhatsApp] [Print] [Download PDF]",
            "WhatsApp: customer ka mobile already filled, send karo",
            "Print: 80mm thermal format mein khulega",
            "PDF: device mein save ho jaayega",
          ])}`
        : `🖨️ How to print/share invoice:\n${steps([
            "Complete payment after billing",
            "Invoice popup shows 3 options:",
            "  [Send WhatsApp] [Print] [Download PDF]",
            "WhatsApp: customer mobile pre-filled, just send",
            "Print: opens in 80mm thermal format",
            "PDF: saves to your device",
          ])}`;

    case "help_diamonds":
      return isHi
        ? "💎 Diamond Rewards:\n\nHar 10 transactions pe 1 diamond milta hai.\n\nLevels:\n• Bronze — 0 to 9 diamonds\n• Silver — 10 to 49 diamonds\n• Gold — 50 to 99 diamonds\n• Diamond — 100+ diamonds\n\nDashboard pe diamond card mein count dikhta hai. 30-second ad dekh ke bonus diamonds bhi mil sakte hain!"
        : "💎 Diamond Rewards:\n\nEarn 1 diamond every 10 transactions.\n\nLevels:\n• Bronze — 0 to 9 diamonds\n• Silver — 10 to 49 diamonds\n• Gold — 50 to 99 diamonds\n• Diamond — 100+ diamonds\n\nWatch a 30-second ad for bonus diamonds!";

    case "help_backup":
      return isHi
        ? `💾 Data backup kaise karein:\n${steps([
            "Sidebar mein 'Settings' mein jaao",
            "'App Settings' section mein 'Export Data' button dabao",
            "JSON file download ho jaayegi — yahi aapka backup hai",
            "Wapas import karne ke liye 'Import Data' button use karein",
          ])}`
        : `💾 How to backup your data:\n${steps([
            "Go to 'Settings' in the sidebar",
            "Click 'Export Data' in 'App Settings' section",
            "A JSON file will download — this is your backup",
            "To restore, use the 'Import Data' button",
          ])}`;

    case "help_settings":
      return isHi
        ? `⚙️ Settings kaise kholein aur change karein:\n${steps([
            "Sidebar mein sabse neeche 'Settings' par click karein",
            "Yahan aapko milega: Units, Dead Stock, Features Toggle, Dashboard Customization",
            "Jo setting change karni ho woh toggle ya dropdown se change karein",
            "'Save' button dabao — setting turant update ho jaayegi",
            "Feature disable karne se data delete nahi hota — sirf hide hota hai",
          ])}`
        : `⚙️ How to open and change Settings:\n${steps([
            "Click 'Settings' at the bottom of the sidebar",
            "You'll find: Units, Dead Stock, Feature Toggles, Dashboard Customization",
            "Change any setting using the toggle or dropdown",
            "Click 'Save' — setting updates immediately",
            "Disabling a feature hides it, data is never deleted",
          ])}`;

    case "inactive_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return isHi
          ? "🔒 Yeh feature sirf Pro mode mein available hai.\n\nEnable karne ke liye:\n1. Header mein 🔴 Pro mode select karo\n2. Settings → Customer Tracking toggle ON karo"
          : "🔒 This feature is only available in Pro mode.\n\nTo enable:\n1. Select 🔴 Pro mode in the header\n2. Go to Settings → turn ON Customer Tracking";
      }
      const inactive = store.customers.filter(
        (c) => daysSince(c.lastVisit) >= 180,
      );
      if (!inactive.length) {
        return isHi
          ? "✅ Koi inactive customer nahi hai (180+ din se koi nahi aaya waisa)."
          : "✅ No inactive customers found (180+ days without a visit).";
      }
      const preview = inactive
        .sort((a, b) => daysSince(b.lastVisit) - daysSince(a.lastVisit))
        .slice(0, 3)
        .map((c) => {
          const d = daysSince(c.lastVisit);
          const NEVER = Number.POSITIVE_INFINITY;
          return isHi
            ? `• ${c.name} (${d === NEVER ? "kabhi nahi aaye" : `${d} din pehle`})`
            : `• ${c.name} (${d === NEVER ? "never visited" : `${d} days ago`})`;
        })
        .join("\n");
      return isHi
        ? `🔕 ${inactive.length} inactive customer(s) (180+ din se nahi aaye):\n${preview}${inactive.length > 3 ? `\n...aur ${inactive.length - 3} aur` : ""}`
        : `🔕 ${inactive.length} inactive customer(s) (not visited in 180+ days):\n${preview}${inactive.length > 3 ? `\n...and ${inactive.length - 3} more` : ""}`;
    }

    case "lost_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return isHi
          ? "🔒 Yeh feature sirf Pro mode mein available hai.\n\nEnable karne ke liye:\n1. Header mein 🔴 Pro mode select karo\n2. Settings → Customer Tracking toggle ON karo"
          : "🔒 This feature is only available in Pro mode.\n\nTo enable:\n1. Select 🔴 Pro mode in the header\n2. Go to Settings → turn ON Customer Tracking";
      }
      const lost = store.customers.filter((c) => daysSince(c.lastVisit) >= 365);
      if (!lost.length) {
        return isHi
          ? "✅ Koi lost customer nahi hai (365+ din wali category mein koi nahi)."
          : "✅ No lost customers found (365+ days category is empty).";
      }
      const preview = lost
        .sort((a, b) => daysSince(b.lastVisit) - daysSince(a.lastVisit))
        .slice(0, 3)
        .map((c) => {
          const NEVER = Number.POSITIVE_INFINITY;
          const d = daysSince(c.lastVisit);
          return isHi
            ? `• ${c.name} (${d === NEVER ? "kabhi nahi aaye" : `${d} din pehle`})`
            : `• ${c.name} (${d === NEVER ? "never visited" : `${d} days ago`})`;
        })
        .join("\n");
      return isHi
        ? `❌ ${lost.length} lost customer(s) (365+ din se gayab):\n${preview}${lost.length > 3 ? `\n...aur ${lost.length - 3} aur` : ""}`
        : `❌ ${lost.length} lost customer(s) (missing for 365+ days):\n${preview}${lost.length > 3 ? `\n...and ${lost.length - 3} more` : ""}`;
    }

    case "top_customers": {
      const isProMode = store.autoMode === "pro";
      const trackingOn = store.appConfig.featureFlags?.customerTracking;
      if (!isProMode || !trackingOn) {
        return isHi
          ? "🔒 Yeh feature sirf Pro mode mein available hai.\n\nEnable karne ke liye:\n1. Header mein 🔴 Pro mode select karo\n2. Settings → Customer Tracking toggle ON karo"
          : "🔒 This feature is only available in Pro mode.\n\nTo enable:\n1. Select 🔴 Pro mode in the header\n2. Go to Settings → turn ON Customer Tracking";
      }
      const sorted = [...store.customers]
        .filter((c) => (c.totalPurchase || 0) > 0)
        .sort((a, b) => (b.totalPurchase || 0) - (a.totalPurchase || 0))
        .slice(0, 5);
      if (!sorted.length) {
        return isHi
          ? "📊 Abhi koi customer data nahi hai. Billing ke time mobile number link karo taaki tracking shuru ho."
          : "📊 No customer purchase data yet. Link mobile numbers during billing to start tracking.";
      }
      const list = sorted
        .map((c, i) => {
          const tier = tierLabel(c.totalPurchase || 0);
          return `${i + 1}. ${c.name} — ${tier} — ${formatCurrency(c.totalPurchase || 0)}`;
        })
        .join("\n");
      return isHi
        ? `⭐ Top ${sorted.length} customers (purchase ke hisaab se):\n${list}`
        : `⭐ Top ${sorted.length} customers (by total purchase):\n${list}`;
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
      if (!withPending.length) {
        return isHi
          ? "✅ Kisi bhi customer ka payment pending nahi hai. Sab clear hai!"
          : "✅ No pending payments from any customer. All clear!";
      }
      const list = withPending
        .map((c) => {
          const amt = c.pendingBalance || c.creditBalance || 0;
          const mob = c.mobile ? ` (${c.mobile})` : "";
          return `• ${c.name}${mob} — ${formatCurrency(amt)}`;
        })
        .join("\n");
      const totalPending = withPending.reduce(
        (s, c) => s + (c.pendingBalance || c.creditBalance || 0),
        0,
      );
      return isHi
        ? `💰 ${withPending.length} customer(s) ka payment pending hai:\n${list}\n\nTop 5 total: ${formatCurrency(totalPending)}`
        : `💰 ${withPending.length} customer(s) have pending payments:\n${list}\n\nTop 5 total: ${formatCurrency(totalPending)}`;
    }

    default:
      return isHi
        ? `Samajh nahi aaya. 🤔 Ye try karein:\n• "Aaj birthday kaun?"\n• "Low stock batao"\n• "Aaj ki sale kitni hai"\n• "Best selling product"\n• "Pending payment kiska"\n• "Vendor kaise add karein"\n• "Billing kaise kare"\n• "Naya shop kaise banaye"`
        : `Sorry, I didn't understand that. 🤔\n\nTry asking:\n• "Today's birthdays"\n• "Low stock products"\n• "Today's sales"\n• "Best selling product"\n• "Pending payments"\n• "How to add vendor"\n• "How to do billing"`;
  }
}

// ── ChatBot Panel component (anchor-based, no draggable) ─────────────────────
interface ChatBotPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ChatBotPanel({ open, onClose }: ChatBotPanelProps) {
  const { language } = useLanguage();
  const store = useStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHi = language === "hi";

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
      const welcome = generateResponse("greeting", language, {
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
        { id: "welcome", from: "bot", text: welcome, time: getTime() },
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

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");

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
      const reply = generateResponse(type, language, storeSnapshot);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        from: "bot",
        text: reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setThinking(false);
    }, 320);
  }, [input, thinking, language, storeSnapshot]);

  const handleChipClick = useCallback(
    (chip: string) => {
      const type = detectQuery(chip);
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        from: "user",
        text: chip,
        time: getTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);
      setTimeout(() => {
        const reply = generateResponse(type, language, storeSnapshot);
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, from: "bot", text: reply, time: getTime() },
        ]);
        setThinking(false);
      }, 320);
    },
    [language, storeSnapshot],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const hiChips = [
    "🎂 Aaj birthday?",
    "Low stock batao",
    "Aaj ki sale",
    "Best selling",
    "💰 Pending",
    "Dead stock",
    "⭐ Top Customers",
    "🔕 Inactive",
    "Vendor kese add kare",
  ];
  const enChips = [
    "🎂 Today birthday?",
    "Low stock",
    "Today sales",
    "Best selling",
    "💰 Pending",
    "Dead stock",
    "⭐ Top Customers",
    "🔕 Inactive",
    "Add vendor",
  ];

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes chatbot-panel-in {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .chatbot-panel { animation: chatbot-panel-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        /* Desktop: panel anchored right of the 224px sidebar */
        @media (min-width: 768px) {
          .chatbot-panel-positioned {
            position: fixed;
            left: calc(224px + 8px);
            top: 12px;
            width: min(320px, calc(100vw - 248px));
            height: min(480px, calc(100vh - 24px));
          }
        }
        /* Mobile: panel sits at bottom-center of screen */
        @media (max-width: 767px) {
          .chatbot-panel-positioned {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 96px;
            top: auto;
            width: auto;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
            height: min(420px, calc(100vh - 120px));
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

      {/* Backdrop for mobile — tap outside to close */}
      <div
        className="fixed inset-0 z-[9998] md:hidden"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close chat"
      />

      {/* Panel — fixed position: right of sidebar on desktop, bottom-center on mobile */}
      <div
        data-ocid="chatbot.dialog"
        className="chatbot-panel chatbot-panel-positioned z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
        style={{ overflow: "hidden" }}
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
                Data &amp; guide queries
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
                  className={`text-[10px] mt-1 ${
                    msg.from === "user"
                      ? "text-primary-foreground/60 text-right"
                      : "text-muted-foreground text-right"
                  }`}
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
          {(isHi ? hiChips : enChips).map((chip) => (
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
            placeholder={isHi ? "Kuch bhi poochho..." : "Ask anything..."}
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

// Keep the old ChatBot export as a no-op so any stale import doesn't crash
export function ChatBot() {
  return null;
}
