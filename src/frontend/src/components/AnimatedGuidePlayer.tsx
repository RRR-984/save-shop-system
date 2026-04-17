import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface GuideStep {
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  /** Array of colored block config: [bg, text, label, active?] */
  uiBlocks: Array<{
    bg: string;
    label: string;
    active?: boolean;
    highlight?: boolean;
    arrow?: "down" | "right" | "left";
    emoji?: string;
  }>;
}

export interface Guide {
  id: string;
  icon: string;
  title: string;
  titleHi: string;
  steps: GuideStep[];
}

/* ── Guide data ─────────────────────────────────────────────────────── */
export const GUIDES: Guide[] = [
  {
    id: "full-overview",
    icon: "🏠",
    title: "Full App Overview",
    titleHi: "पूरी ऐप की जानकारी",
    steps: [
      {
        title: "Login with Mobile OTP",
        titleHi: "मोबाइल OTP से लॉगिन करें",
        desc: "Enter your mobile number and tap Send OTP. Enter the 6-digit code to sign in.",
        descHi: "मोबाइल नंबर डालें और Send OTP दबाएं। 6 अंक का कोड डालकर लॉगिन करें।",
        uiBlocks: [
          {
            bg: "#EEF2FF",
            label: "📱 Mobile Number",
            active: true,
            arrow: "down",
          },
          { bg: "#6366F1", label: "Send OTP", highlight: true, emoji: "✉️" },
          { bg: "#F1F5F9", label: "OTP: ● ● ● ● ● ●" },
        ],
      },
      {
        title: "Dashboard — Today's Summary",
        titleHi: "डैशबोर्ड — आज का सारांश",
        desc: "After login you see Today's Sales, Profit, and Cash. Numbers update in real-time.",
        descHi:
          "लॉगिन के बाद आज की बिक्री, लाभ और नकद दिखता है। संख्याएं रियल-टाइम अपडेट होती हैं।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "₹ Total Sales",
            highlight: true,
            emoji: "💰",
          },
          { bg: "#FEF9C3", label: "₹ Profit", active: true, emoji: "📈" },
          { bg: "#EDE9FE", label: "Cash & UPI", emoji: "🏦" },
        ],
      },
      {
        title: "Quick Actions — Fast Access",
        titleHi: "त्वरित क्रियाएं — जल्दी पहुंच",
        desc: "Use the colored Quick Action chips to jump to Add Stock, Sell, Collect Payment, and Reports instantly.",
        descHi: "रंगीन चिप्स से Add Stock, Sell, Payment और Reports पर तुरंत जाएं।",
        uiBlocks: [
          { bg: "#F3E8FF", label: "📦 Add Stock", active: true, arrow: "down" },
          { bg: "#FEF3C7", label: "🛒 Sell", highlight: true },
          { bg: "#DCFCE7", label: "💰 Payment" },
          { bg: "#DBEAFE", label: "📊 Reports" },
        ],
      },
      {
        title: "Inventory — Track Stock",
        titleHi: "इन्वेंटरी — स्टॉक ट्रैक करें",
        desc: "Go to Inventory in the sidebar to see all products, stock levels, and batch details.",
        descHi: "साइडबार में Inventory खोलें — सभी उत्पाद, स्टॉक स्तर और बैच देखें।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "≡ Sidebar", arrow: "right", active: true },
          { bg: "#EEF2FF", label: "📦 Inventory", highlight: true },
          { bg: "#F8FAFC", label: "Product cards list..." },
        ],
      },
      {
        title: "Settings — Customize",
        titleHi: "सेटिंग्स — कस्टमाइज़ करें",
        desc: "Toggle features ON/OFF in Settings: Expiry tracking, Dead Stock, Staff roles, and Dashboard sections.",
        descHi:
          "Settings में फीचर ON/OFF करें: Expiry, Dead Stock, Staff, Dashboard sections।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "⚙️ Settings", active: true },
          { bg: "#DCFCE7", label: "Features: ON ●", highlight: true },
          { bg: "#FEF3C7", label: "Dashboard sections", emoji: "🎛️" },
        ],
      },
      {
        title: "Diamond Rewards 💎",
        titleHi: "डायमंड रिवार्ड्स 💎",
        desc: "Every 10 transactions earns 1 Diamond. Level up from Bronze → Silver → Gold → Diamond!",
        descHi:
          "हर 10 लेनदेन पर 1 💎 Diamond मिलता है। Bronze → Silver → Gold → Diamond!",
        uiBlocks: [
          {
            bg: "#FDF4FF",
            label: "💎 Diamonds: 12",
            highlight: true,
            arrow: "down",
          },
          { bg: "#EDE9FE", label: "Progress: ██░░ Silver", active: true },
          { bg: "#DCFCE7", label: "Next level: 3 more" },
        ],
      },
    ],
  },
  {
    id: "add-stock",
    icon: "📦",
    title: "How to Add Stock",
    titleHi: "स्टॉक कैसे जोड़ें",
    steps: [
      {
        title: "Open Inventory",
        titleHi: "Inventory खोलें",
        desc: "From the sidebar tap Inventory, or use the Add Stock Quick Action on the Dashboard.",
        descHi:
          "साइडबार से Inventory खोलें या Dashboard के Add Stock बटन पर टैप करें।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "≡ Sidebar menu", arrow: "right" },
          {
            bg: "#EEF2FF",
            label: "📦 Inventory",
            highlight: true,
            active: true,
          },
        ],
      },
      {
        title: "Tap Add Stock",
        titleHi: "Add Stock दबाएं",
        desc: "On the Inventory page tap the '+ Add Stock' button in the top area.",
        descHi: "Inventory पेज पर '+ Add Stock' बटन दबाएं।",
        uiBlocks: [
          {
            bg: "#DBEAFE",
            label: "+ Add Stock",
            highlight: true,
            active: true,
            arrow: "down",
            emoji: "📦",
          },
          { bg: "#F8FAFC", label: "Product list..." },
        ],
      },
      {
        title: "Enter Product Name",
        titleHi: "उत्पाद का नाम डालें",
        desc: "Type the product name in the field — or select an existing product from the dropdown.",
        descHi: "उत्पाद का नाम लिखें — या मौजूदा उत्पाद ड्रॉपडाउन से चुनें।",
        uiBlocks: [
          {
            bg: "#EEF2FF",
            label: "Product Name",
            active: true,
            arrow: "down",
            highlight: true,
          },
          { bg: "#F8FAFC", label: "e.g. Rice 5kg" },
          { bg: "#F1F5F9", label: "Quantity & Unit" },
        ],
      },
      {
        title: "Enter Quantity & Rate",
        titleHi: "मात्रा और दर डालें",
        desc: "Enter how many items you received and the purchase rate per unit.",
        descHi: "कितना माल आया और प्रति यूनिट खरीद दर डालें।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "Quantity: 50",
            active: true,
            highlight: true,
          },
          { bg: "#FEF9C3", label: "Rate: ₹120", arrow: "down" },
          { bg: "#EDE9FE", label: "Unit: kg / piece" },
        ],
      },
      {
        title: "Select or Create Vendor",
        titleHi: "Vendor चुनें या बनाएं",
        desc: "Pick the vendor who supplied this stock, or type a new vendor name to create one.",
        descHi: "जिस vendor से माल आया उसे चुनें, या नया नाम लिखकर बनाएं।",
        uiBlocks: [
          {
            bg: "#FEF3C7",
            label: "🏭 Vendor Name",
            active: true,
            arrow: "down",
          },
          { bg: "#DCFCE7", label: "Raju Traders ✓", highlight: true },
          { bg: "#F8FAFC", label: "+ New Vendor" },
        ],
      },
      {
        title: "Tap Save — Stock Added!",
        titleHi: "Save दबाएं — स्टॉक जुड़ गया!",
        desc: "Tap Save. The batch is created and inventory count updates instantly. ✅",
        descHi: "Save दबाएं। बैच बन जाता है और इन्वेंटरी तुरंत अपडेट होती है। ✅",
        uiBlocks: [
          {
            bg: "#6366F1",
            label: "💾 Save Stock",
            highlight: true,
            active: true,
            emoji: "✅",
          },
          { bg: "#DCFCE7", label: "Stock Added! Batch B003", arrow: "down" },
        ],
      },
    ],
  },
  {
    id: "sell-billing",
    icon: "🛒",
    title: "How to Sell (Billing)",
    titleHi: "बिक्री कैसे करें (बिलिंग)",
    steps: [
      {
        title: "Tap New Sale Button",
        titleHi: "New Sale बटन दबाएं",
        desc: "Tap the blue 🛒 New Sale floating button at bottom-right, or go to Billing in the sidebar.",
        descHi:
          "नीचे दाईं ओर नीला 🛒 New Sale बटन दबाएं या साइडबार में Billing खोलें।",
        uiBlocks: [
          {
            bg: "#2563EB",
            label: "🛒 New Sale",
            highlight: true,
            active: true,
            arrow: "left",
            emoji: "↙️",
          },
          { bg: "#F8FAFC", label: "Dashboard content..." },
        ],
      },
      {
        title: "Enter Customer Details",
        titleHi: "ग्राहक की जानकारी भरें",
        desc: "Type the customer name and mobile number, or search an existing customer.",
        descHi: "ग्राहक का नाम और मोबाइल नंबर भरें, या मौजूदा ग्राहक खोजें।",
        uiBlocks: [
          {
            bg: "#EEF2FF",
            label: "👤 Customer Name",
            active: true,
            highlight: true,
            arrow: "down",
          },
          { bg: "#F1F5F9", label: "📞 Mobile Number" },
          { bg: "#F8FAFC", label: "Search existing..." },
        ],
      },
      {
        title: "Search & Add Products",
        titleHi: "उत्पाद खोजें और जोड़ें",
        desc: "In the Add Items section, search for a product by name and tap + to add it to the bill.",
        descHi: "Add Items में उत्पाद का नाम खोजें और + दबाकर बिल में जोड़ें।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "🔍 Search product",
            active: true,
            arrow: "down",
          },
          { bg: "#FEF9C3", label: "Rice 5kg — Stock: 50", highlight: true },
          { bg: "#6366F1", label: "+ Add to bill", emoji: "✅" },
        ],
      },
      {
        title: "Set Quantity & Price",
        titleHi: "मात्रा और मूल्य सेट करें",
        desc: "Enter how many items the customer wants. The selling price fills automatically — you can change it.",
        descHi:
          "ग्राहक को कितनी मात्रा चाहिए डालें। बिक्री मूल्य अपने आप आता है — बदल भी सकते हैं।",
        uiBlocks: [
          { bg: "#EDE9FE", label: "Qty: 2", active: true, highlight: true },
          { bg: "#DCFCE7", label: "Sell Price: ₹150", arrow: "down" },
          { bg: "#FEF9C3", label: "Total: ₹300" },
        ],
      },
      {
        title: "Choose Payment Mode",
        titleHi: "भुगतान का तरीका चुनें",
        desc: "Select Cash, UPI, or Credit (Udhaar). You can split between cash and UPI too.",
        descHi: "Cash, UPI या Credit (उधार) चुनें। Cash और UPI में बांट भी सकते हैं।",
        uiBlocks: [
          { bg: "#DCFCE7", label: "💵 Cash", active: true, highlight: true },
          { bg: "#DBEAFE", label: "📲 UPI" },
          { bg: "#FEF9C3", label: "📝 Credit/Udhaar" },
        ],
      },
      {
        title: "Confirm Payment — Done!",
        titleHi: "Payment Confirm करें — हो गया!",
        desc: "Tap Confirm Payment. Invoice is ready — share via WhatsApp, print, or download PDF.",
        descHi:
          "Confirm Payment दबाएं। बिल तैयार — WhatsApp, Print, या PDF डाउनलोड करें।",
        uiBlocks: [
          {
            bg: "#16A34A",
            label: "✅ Confirm Payment",
            highlight: true,
            active: true,
            emoji: "🎉",
          },
          { bg: "#F0FDF4", label: "Invoice #INV-007 Ready", arrow: "down" },
          { bg: "#DCFCE7", label: "📲 WhatsApp  🖨️ Print" },
        ],
      },
    ],
  },
  {
    id: "vendor-add",
    icon: "🏭",
    title: "Add & Edit Vendor",
    titleHi: "Vendor कैसे जोड़ें और बदलें",
    steps: [
      {
        title: "Open Sidebar → Vendors",
        titleHi: "साइडबार → Vendors खोलें",
        desc: "Tap the menu icon to open the sidebar, then tap Vendors.",
        descHi: "मेन्यू आइकन दबाकर साइडबार खोलें, फिर Vendors दबाएं।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "≡ Menu", arrow: "right", active: true },
          { bg: "#FEF3C7", label: "🏭 Vendors", highlight: true },
        ],
      },
      {
        title: "Tap Add Vendor",
        titleHi: "Add Vendor दबाएं",
        desc: "On the Vendors page tap '+ Add Vendor' button.",
        descHi: "Vendors पेज पर '+ Add Vendor' बटन दबाएं।",
        uiBlocks: [
          {
            bg: "#FEF3C7",
            label: "+ Add Vendor",
            highlight: true,
            active: true,
            arrow: "down",
            emoji: "🏭",
          },
          { bg: "#F8FAFC", label: "Vendor list..." },
        ],
      },
      {
        title: "Fill Vendor Details",
        titleHi: "Vendor की जानकारी भरें",
        desc: "Enter vendor name, mobile number. GST number and address are optional.",
        descHi: "Vendor का नाम और मोबाइल नंबर भरें। GST और पता वैकल्पिक है।",
        uiBlocks: [
          {
            bg: "#EEF2FF",
            label: "Vendor Name *",
            active: true,
            highlight: true,
            arrow: "down",
          },
          { bg: "#F1F5F9", label: "Mobile Number *" },
          { bg: "#F8FAFC", label: "GST Number (optional)" },
        ],
      },
      {
        title: "Save — Vendor Added!",
        titleHi: "Save करें — Vendor जुड़ गया!",
        desc: "Tap Save. Vendor is now linked to your shop and appears in stock entry dropdowns.",
        descHi: "Save दबाएं। Vendor आपकी दुकान से जुड़ गया और stock entry में दिखेगा।",
        uiBlocks: [
          {
            bg: "#6366F1",
            label: "💾 Save Vendor",
            highlight: true,
            active: true,
            emoji: "✅",
          },
          { bg: "#DCFCE7", label: "Raju Traders added!", arrow: "down" },
        ],
      },
      {
        title: "Edit Vendor",
        titleHi: "Vendor बदलें",
        desc: "Tap the Edit ✏️ icon on any vendor card to update name, mobile, GST, or address.",
        descHi: "किसी भी vendor card पर ✏️ दबाएं — नाम, मोबाइल, GST बदलें।",
        uiBlocks: [
          { bg: "#FEF3C7", label: "Raju Traders", emoji: "🏭" },
          {
            bg: "#DBEAFE",
            label: "✏️ Edit",
            active: true,
            highlight: true,
            arrow: "down",
          },
          { bg: "#DCFCE7", label: "Update & Save" },
        ],
      },
    ],
  },
  {
    id: "collect-payment",
    icon: "💰",
    title: "Collect Customer Payment",
    titleHi: "ग्राहक से भुगतान लें",
    steps: [
      {
        title: "Go to Customers",
        titleHi: "Customers खोलें",
        desc: "Open the Customers page from the sidebar or Quick Actions on the Dashboard.",
        descHi: "साइडबार या Dashboard Quick Actions से Customers खोलें।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "≡ Sidebar", arrow: "right" },
          {
            bg: "#EDE9FE",
            label: "👥 Customers",
            highlight: true,
            active: true,
          },
        ],
      },
      {
        title: "Find Customer with Due",
        titleHi: "बकाया वाला ग्राहक खोजें",
        desc: "Customers with outstanding dues show a red badge. Find the one you want to collect from.",
        descHi: "बकाया वाले ग्राहकों पर लाल बैज दिखता है। जिससे लेना है उसे खोजें।",
        uiBlocks: [
          {
            bg: "#FEE2E2",
            label: "Ramesh — Due: ₹500 🔴",
            highlight: true,
            active: true,
            arrow: "down",
          },
          { bg: "#F8FAFC", label: "Suresh — No due ✅" },
        ],
      },
      {
        title: "Tap Collect Payment",
        titleHi: "Collect Payment दबाएं",
        desc: "On the customer card or detail page, tap the 'Collect Payment' button.",
        descHi: "Customer card पर 'Collect Payment' बटन दबाएं।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "💰 Collect Payment",
            highlight: true,
            active: true,
            arrow: "down",
            emoji: "💸",
          },
          { bg: "#FEE2E2", label: "Due: ₹500" },
        ],
      },
      {
        title: "Enter Amount & Mode",
        titleHi: "राशि और तरीका चुनें",
        desc: "Type the amount received. Select Cash or UPI. Partial payment is allowed.",
        descHi: "प्राप्त राशि डालें। Cash या UPI चुनें। आंशिक भुगतान भी हो सकता है।",
        uiBlocks: [
          {
            bg: "#EEF2FF",
            label: "Amount: ₹500",
            active: true,
            highlight: true,
            arrow: "down",
          },
          { bg: "#DCFCE7", label: "💵 Cash", highlight: true },
          { bg: "#DBEAFE", label: "📲 UPI" },
        ],
      },
      {
        title: "Confirm — Due Updated!",
        titleHi: "Confirm करें — बकाया अपडेट!",
        desc: "Tap Confirm. The due balance reduces instantly. Send a WhatsApp receipt if needed.",
        descHi:
          "Confirm दबाएं। बकाया तुरंत कम हो जाता है। WhatsApp रसीद भी भेज सकते हैं।",
        uiBlocks: [
          {
            bg: "#16A34A",
            label: "✅ Confirm Payment",
            highlight: true,
            active: true,
            emoji: "🎉",
          },
          { bg: "#DCFCE7", label: "Due: ₹0 — Cleared!", arrow: "down" },
          { bg: "#F0FDF4", label: "📲 WhatsApp Receipt" },
        ],
      },
    ],
  },
  {
    id: "reports",
    icon: "📊",
    title: "View Reports",
    titleHi: "रिपोर्ट कैसे देखें",
    steps: [
      {
        title: "Open Reports",
        titleHi: "Reports खोलें",
        desc: "Tap Reports in the sidebar, or from the Dashboard Quick Actions.",
        descHi: "साइडबार में Reports दबाएं या Dashboard Quick Actions से जाएं।",
        uiBlocks: [
          { bg: "#F1F5F9", label: "≡ Sidebar", arrow: "right" },
          { bg: "#DBEAFE", label: "📊 Reports", highlight: true, active: true },
        ],
      },
      {
        title: "Choose Report Type",
        titleHi: "रिपोर्ट का प्रकार चुनें",
        desc: "Select from Daily Sales, Profit Report, Staff Report, Customer Credit, or Returns.",
        descHi:
          "Daily Sales, Profit, Staff, Customer Credit या Returns में से चुनें।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "📅 Daily Sales",
            active: true,
            highlight: true,
            arrow: "down",
          },
          { bg: "#FEF9C3", label: "💹 Profit Report" },
          { bg: "#EDE9FE", label: "👤 Staff Report" },
        ],
      },
      {
        title: "Select Date Range",
        titleHi: "तारीख सीमा चुनें",
        desc: "Use Today / Week / Month / All Time tabs, or pick a custom date range.",
        descHi: "Today, Week, Month, All Time में से चुनें या कस्टम तारीख सेट करें।",
        uiBlocks: [
          { bg: "#EEF2FF", label: "Today | Week | Month", active: true },
          { bg: "#6366F1", label: "📅 Today", highlight: true, arrow: "down" },
          { bg: "#F1F5F9", label: "Custom Range..." },
        ],
      },
      {
        title: "View Report Data",
        titleHi: "रिपोर्ट डेटा देखें",
        desc: "See totals, individual transactions, profit breakdown, and charts.",
        descHi: "कुल राशि, अलग-अलग लेनदेन, लाभ और चार्ट देखें।",
        uiBlocks: [
          {
            bg: "#DCFCE7",
            label: "Total Sales: ₹12,400",
            highlight: true,
            emoji: "💰",
          },
          { bg: "#FEF9C3", label: "Profit: ₹3,200", active: true, emoji: "📈" },
          { bg: "#F1F5F9", label: "Items list..." },
        ],
      },
      {
        title: "Share via WhatsApp",
        titleHi: "WhatsApp पर भेजें",
        desc: "Tap the Share button to send the report summary via WhatsApp to anyone.",
        descHi: "Share बटन दबाएं और रिपोर्ट का सारांश WhatsApp पर भेजें।",
        uiBlocks: [
          {
            bg: "#25D366",
            label: "📲 Share WhatsApp",
            highlight: true,
            active: true,
            arrow: "down",
            emoji: "💬",
          },
          { bg: "#F0FDF4", label: "Report sent!" },
        ],
      },
    ],
  },
];

/* ── Phone Mockup Illustration ──────────────────────────────────────── */
function PhoneMockup({ step }: { step: GuideStep }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Phone outline */}
      <div
        className="relative flex flex-col rounded-[28px] border-[3px] border-slate-700 shadow-2xl overflow-hidden"
        style={{
          width: "clamp(140px, 36vw, 220px)",
          height: "clamp(240px, 55vw, 380px)",
          background: "#F8FAFC",
        }}
      >
        {/* Status bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-slate-800 text-white text-[9px]">
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <span>▮▮▮</span>
            <span>WiFi</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="flex-1 flex flex-col gap-2 p-2.5 overflow-hidden">
          {step.uiBlocks.map((block, i) => (
            <div key={`${block.label}-${i}`} className="relative">
              {/* Arrow indicator */}
              {block.arrow === "down" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-tutorial-arrow z-10">
                  <span className="text-base">👇</span>
                </div>
              )}
              {block.arrow === "right" && (
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 animate-tutorial-arrow z-10">
                  <span className="text-base">👉</span>
                </div>
              )}
              {block.arrow === "left" && (
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 animate-tutorial-arrow z-10">
                  <span className="text-base">👈</span>
                </div>
              )}

              <div
                className="relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[10px] font-semibold transition-all"
                style={{
                  background: block.bg,
                  color: isLightColor(block.bg) ? "#1e293b" : "#fff",
                  outline: block.highlight
                    ? "2px solid rgba(99,102,241,0.7)"
                    : block.active
                      ? "1.5px dashed rgba(99,102,241,0.4)"
                      : "none",
                  transform: block.active ? "scale(1.03)" : "scale(1)",
                }}
              >
                {block.emoji && <span className="text-sm">{block.emoji}</span>}
                <span className="truncate">{block.label}</span>
                {/* Pulsing ring on highlight */}
                {block.highlight && (
                  <span className="absolute -inset-0.5 rounded-xl border-2 border-indigo-400 animate-tutorial-highlight pointer-events-none" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Home indicator */}
        <div className="flex-shrink-0 flex justify-center pb-2 pt-1 bg-white">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/* ── Main Player Component ─────────────────────────────────────────── */
interface AnimatedGuidePlayerProps {
  guide: Guide;
  onClose: () => void;
}

export function AnimatedGuidePlayer({
  guide,
  onClose,
}: AnimatedGuidePlayerProps) {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSteps = guide.steps.length;
  const step = guide.steps[stepIndex];

  const goNext = () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0));

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i < totalSteps - 1) return i + 1;
        setPlaying(false);
        return i;
      });
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, totalSteps]);

  // Reset timer when user manually navigates
  const handleManualNav = (fn: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    fn();
    if (playing) setPlaying(false);
  };

  // Trap Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleManualNav(goNext);
      if (e.key === "ArrowLeft") handleManualNav(goPrev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const title = language === "hi" ? step.titleHi : step.title;
  const desc = language === "hi" ? step.descHi : step.desc;
  const guideTitle = language === "hi" ? guide.titleHi : guide.title;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      data-ocid="animated-guide-player.overlay"
      aria-label={guideTitle}
    >
      <dialog
        open
        className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-bounce-in p-0 border-0"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{guide.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {language === "hi" ? "ट्यूटोरियल" : "Tutorial"}
              </p>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                {guideTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close tutorial"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-ocid="animated-guide-player.close"
          >
            ✕
          </button>
        </div>

        {/* Phone illustration area */}
        <div
          className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20"
          style={{ minHeight: "clamp(220px, 42vw, 300px)" }}
        >
          <PhoneMockup step={step} />
        </div>

        {/* Step info */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex-shrink-0">
              {stepIndex + 1}
            </span>
            <h3 className="text-sm font-bold text-foreground leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {guide.steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => handleManualNav(() => setStepIndex(i))}
              className="transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                width: i === stepIndex ? 20 : 8,
                height: 8,
                background:
                  i === stepIndex
                    ? "oklch(var(--primary))"
                    : "oklch(var(--border))",
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 px-5 pb-5 pt-1">
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => handleManualNav(goPrev)}
            disabled={stepIndex === 0}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            data-ocid="animated-guide-player.prev"
          >
            ← {language === "hi" ? "पिछला" : "Prev"}
          </button>

          <button
            type="button"
            aria-label={playing ? "Pause auto-advance" : "Resume auto-advance"}
            onClick={() => setPlaying((p) => !p)}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-ocid="animated-guide-player.play-pause"
          >
            {playing ? "⏸" : "▶️"}
          </button>

          {stepIndex < totalSteps - 1 ? (
            <button
              type="button"
              aria-label="Next step"
              onClick={() => handleManualNav(goNext)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ background: "oklch(var(--primary))" }}
              data-ocid="animated-guide-player.next"
            >
              {language === "hi" ? "अगला" : "Next"} →
            </button>
          ) : (
            <button
              type="button"
              aria-label="Close and finish tutorial"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ background: "oklch(var(--success))" }}
              data-ocid="animated-guide-player.done"
            >
              ✅ {language === "hi" ? "हो गया!" : "Done!"}
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
