import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useStore } from "../context/StoreContext";
import type { AppConfig, Customer, Invoice, Product } from "../types/store";

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
  | "pending_due"
  | "stock_value"
  | "out_of_stock"
  | "total_products"
  | "today_profit"
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
  | "unknown";

// Keyword map: each topic has an array of keywords (English + Hinglish).
// If ANY keyword from the array appears as a substring in the cleaned query,
// that topic is matched. Order matters — more specific topics are checked first.
const KEYWORD_MAP: Array<{ type: QueryType; keywords: string[] }> = [
  // Greetings — checked first so "hi" alone doesn't match "history" topics
  {
    type: "greeting",
    keywords: ["hello", "namaste", "hey", "hii", "helllo", "helo", "namaskar"],
  },

  // Dead stock time/settings — more specific, must come before generic "dead stock"
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

  // Dead stock data query
  {
    type: "dead_stock",
    keywords: [
      "dead stock",
      "ded stock",
      "deadstock",
      "dedstock",
      "डेड स्टॉक",
      "dead maal",
    ],
  },

  // Low stock
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
    ],
  },

  // Out of stock
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
    ],
  },

  // Today profit
  {
    type: "today_profit",
    keywords: [
      "aaj ka profit",
      "today profit",
      "kitna profit",
      "aaj profit",
      "profit aaj",
      "आज का लाभ",
      "आज लाभ",
      "profit kitna",
    ],
  },

  // Today sales
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
    ],
  },

  // Pending due / credit
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
    ],
  },

  // Stock value
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

  // Total products
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
    ],
  },

  // Help: add shop — more specific before generic shop queries
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

  // Help: add vendor — must match vender/vendor variations
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

  // Help: add stock / material
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

  // Help: sell / billing
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
    ],
  },

  // Help: payment collect
  {
    type: "help_sell",
    keywords: [
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

  // Help: add customer
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

  // Help: staff
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

  // Help: reports
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

  // Help: mode change
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

  // Help: invoice print/share
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

  // Help: diamonds
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

  // Help: backup
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

  // Help: settings
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
];

// Standalone greeting words that must match at word start/boundary to avoid
// false positives (e.g. "hi" inside "history")
const GREETING_WORDS = new Set(["hi", "help"]);

function normaliseQuery(text: string): string {
  // Lowercase, strip punctuation, collapse whitespace
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectQuery(text: string): QueryType {
  const norm = normaliseQuery(text);

  // Single-word greeting check with word-boundary awareness
  const firstWord = norm.split(" ")[0];
  if (GREETING_WORDS.has(firstWord)) return "greeting";

  // Iterate keyword map in order — first match wins
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (norm.includes(kw)) return entry.type;
    }
  }

  return "unknown";
}

// ── Bullet list helper ──────────────────────────────────────────────────────
function steps(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

// ── Response generator ──────────────────────────────────────────────────────
function generateResponse(
  type: QueryType,
  lang: "en" | "hi",
  store: {
    products: Product[];
    invoices: Invoice[];
    customers: Customer[];
    appConfig: AppConfig;
    getProductStock: (id: string) => number;
    getTotalStockValue: () => number;
    getLastSoldDate: (id: string) => string | null;
  },
): string {
  const isHi = lang === "hi";

  const todayStr = new Date().toDateString();
  const todayInvoices = store.invoices.filter(
    (inv) => new Date(inv.date).toDateString() === todayStr,
  );
  const todayTotal = todayInvoices.reduce((s, i) => s + i.totalAmount, 0);

  switch (type) {
    case "greeting":
      return isHi
        ? "Namaste! 🙏 Main aapka Shop Assistant hoon.\n\nAap mujhse pooch sakte hain:\n• Low stock batao\n• Aaj ki sale kitni hai\n• Dead stock kya hai\n• Pending due kitna hai\n• New shop kaise banaye\n• Vendor kese add kare\n• Product kese add kare\n• Billing kaise kare\n• Staff kese add kare\n• Payment kaise le"
        : "Hello! 👋 I'm your Shop Assistant.\n\nYou can ask me:\n• Low stock products\n• Today's sales\n• Dead stock\n• Pending due\n• How to add a new shop\n• How to add stock\n• How to do billing";

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
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
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

    case "total_products":
      return isHi
        ? `📋 Aapke paas total ${store.products.length} product(s) hain.`
        : `📋 You have ${store.products.length} product(s) in total.`;

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

    // ── Help guides ───────────────────────────────────────────────────────────
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
            "'Save' dabao — customer add ho jaayega",
            "Billing mein bhi auto-add hota hai jab mobile fill karo",
          ])}`
        : `👤 How to add a customer:\n${steps([
            "Go to 'Customers' in the sidebar",
            "Click '+ Add Customer' button",
            "Fill customer name and mobile",
            "Click 'Save' — customer added!",
            "Also auto-added during billing when mobile is filled",
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

    default: {
      return isHi
        ? `Samajh nahi aaya. 🤔 Ye try karein:\n• "Low stock batao"\n• "Vendor kaise add karein"\n• "Aaj ki sale kitni hai"\n• "Dead stock kya hai"\n• "Billing kaise kare"\n• "Staff kese add kare"\n• "Naya shop kaise banaye"\n• "Payment kaise le"`
        : `Sorry, I didn't understand that. 🤔\n\nTry asking:\n• "Low stock products"\n• "Today's sales"\n• "How to add vendor"\n• "How to do billing"\n• "How to add staff"`;
    }
  }
}

// ── Draggable panel hook ─────────────────────────────────────────────────────
interface PanelPos {
  x: number;
  y: number;
}

const PANEL_W = 320;
const PANEL_H = 420;

function getDefaultPos(): PanelPos {
  // Bottom-left, mirroring the bubble position (left: 16px, above bubble)
  const vh = typeof window !== "undefined" ? window.innerHeight : 700;
  return {
    x: 16,
    y: Math.max(8, vh - PANEL_H - 144), // ~same as bottom-36 from bottom
  };
}

function clampPos(x: number, y: number): PanelPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const panelW = Math.min(PANEL_W, vw * 0.9);
  return {
    x: Math.max(0, Math.min(x, vw - panelW)),
    y: Math.max(0, Math.min(y, vh - 60)), // keep header always visible
  };
}

// ── Component ───────────────────────────────────────────────────────────────
export function ChatBot() {
  const { language } = useLanguage();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Drag state ──────────────────────────────────────────────────────────
  const [panelPos, setPanelPos] = useState<PanelPos>(getDefaultPos);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
      store.getProductStock,
      store.getTotalStockValue,
      store.getLastSoldDate,
    ],
  );

  const handleSend = () => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // ── Drag handlers ────────────────────────────────────────────────────────
  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      dragging.current = true;
      setIsDragging(true);
      dragOffset.current = {
        x: clientX - panelPos.x,
        y: clientY - panelPos.y,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [panelPos.x, panelPos.y],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only drag from header, ignore close button clicks
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    },
    [startDrag],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [startDrag],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const newPos = clampPos(
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y,
      );
      setPanelPos(newPos);
    };

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        setIsDragging(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newPos = clampPos(
        touch.clientX - dragOffset.current.x,
        touch.clientY - dragOffset.current.y,
      );
      setPanelPos(newPos);
    };

    const onTouchEnd = () => {
      if (dragging.current) {
        dragging.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Pulse glow animation */}
      <style>{`
        @keyframes chatbot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5), 0 4px 16px rgba(124,58,237,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0), 0 4px 24px rgba(124,58,237,0.5); }
        }
        .chatbot-bubble { animation: chatbot-pulse 2.4s ease-in-out infinite; }
        .chatbot-bubble:hover { animation: none; }
        @keyframes chatbot-panel-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chatbot-panel { animation: chatbot-panel-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        .dot-1 { animation: dot-bounce 1.2s infinite 0s; }
        .dot-2 { animation: dot-bounce 1.2s infinite 0.2s; }
        .dot-3 { animation: dot-bounce 1.2s infinite 0.4s; }
      `}</style>

      {/* Floating bubble — stays fixed, never moves */}
      <button
        type="button"
        aria-label="Open Shop Assistant"
        data-ocid="chatbot.open_modal_button"
        onClick={() => setOpen((v) => !v)}
        className="chatbot-bubble fixed bottom-20 left-4 z-[9998] w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white select-none transition-transform duration-150 active:scale-90 md:bottom-6"
        style={{
          background:
            "linear-gradient(135deg, #7c3aed 0%, #4f46e5 55%, #6d28d9 100%)",
        }}
      >
        🤖
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
        )}
      </button>

      {/* Chat panel — draggable, position controlled by state */}
      {open && (
        <div
          data-ocid="chatbot.dialog"
          className="chatbot-panel z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
          style={{
            position: "fixed",
            left: panelPos.x,
            top: panelPos.y,
            width: `min(${PANEL_W}px, 90vw)`,
            maxHeight: PANEL_H,
            userSelect: isDragging ? "none" : undefined,
          }}
        >
          {/* Drag handle header */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="flex items-center justify-between px-4 py-3 border-b border-border"
            style={{
              background: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)",
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Shop Assistant
                </p>
                <p className="text-purple-200 text-xs leading-tight">
                  {isHi ? "Data aur guide dono" : "Data & guide queries"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              data-ocid="chatbot.close_button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              style={{ cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20"
            style={{ minHeight: 0 }}
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

            {/* Thinking indicator */}
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
            className="flex gap-1.5 px-3 py-2 overflow-x-auto border-t border-border bg-card scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {(isHi
              ? [
                  "Low stock batao",
                  "Aaj ki sale",
                  "Dead stock",
                  "Vendor kese add kare",
                  "Billing kaise kare",
                  "Staff kese add kare",
                ]
              : [
                  "Low stock",
                  "Today sales",
                  "Dead stock",
                  "Add vendor",
                  "Billing help",
                  "Pending due",
                ]
            ).map((chip) => (
              <button
                key={chip}
                type="button"
                data-ocid={`chatbot.${chip.toLowerCase().replace(/\s+/g, "_")}_chip`}
                onClick={() => {
                  setInput(chip);
                  setTimeout(() => {
                    setInput("");
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
                      const reply = generateResponse(
                        type,
                        language,
                        storeSnapshot,
                      );
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `b-${Date.now()}`,
                          from: "bot",
                          text: reply,
                          time: getTime(),
                        },
                      ]);
                      setThinking(false);
                    }, 320);
                  }, 0);
                }}
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-colors duration-150 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHi ? "Kuch bhi poochho..." : "Ask anything..."}
              data-ocid="chatbot.input"
              disabled={thinking}
              className="flex-1 text-sm bg-muted/40 border border-input rounded-full px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground text-foreground disabled:opacity-50 transition-colors"
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
      )}
    </>
  );
}
