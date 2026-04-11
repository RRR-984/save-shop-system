import { createContext, useContext, useState } from "react";

const LANG_KEY = "app_language";

export type Language = "en" | "hi";

// All translation key → Hindi value mappings
const hindiTranslations: Record<string, string> = {
  "Add Stock": "स्टॉक जोड़ें",
  Sell: "बिक्री करें",
  "Collect Payment": "भुगतान प्राप्त करें",
  Reports: "रिपोर्ट",
  "Today's Summary": "आज का सारांश",
  "Total Sales": "कुल बिक्री",
  Profit: "लाभ",
  "Cash & Online": "नकद और ऑनलाइन",
  Alerts: "अलर्ट",
  "Smart Alerts": "स्मार्ट अलर्ट",
  "2 products need restocking": "2 उत्पादों को पुनः स्टॉक करें",
  "1 product out of stock": "1 उत्पाद स्टॉक में नहीं है",
  "Customer Dues": "ग्राहक बकाया",
  "No outstanding dues": "कोई बकाया नहीं",
  "Business Summary": "व्यापार सारांश",
  Today: "आज",
  Week: "सप्ताह",
  Month: "महीना",
  "All Time": "पूरा समय",
  "New Sale": "नई बिक्री",
  "Search products, customers...": "उत्पाद, ग्राहक खोजें...",
  Dashboard: "डैशबोर्ड",
  Inventory: "इन्वेंटरी",
  Billing: "बिलिंग",
  Customers: "ग्राहक",
  Vendors: "विक्रेता",
  Orders: "ऑर्डर",
  Returns: "वापसी",
  Staff: "स्टाफ",
  Settings: "सेटिंग्स",
  "Staff Performance": "स्टाफ प्रदर्शन",
  "Low Stock": "कम स्टॉक",
  "Out of Stock": "स्टॉक खत्म",
  "Stock Value": "स्टॉक मूल्य",
  "Today Sales": "आज की बिक्री",
  "Cash Today": "आज नकद",
  "UPI Today": "आज UPI",
  "Today Profit": "आज का लाभ",
  "High Due": "अधिक बकाया",
  Reminder: "अनुस्मारक",
  "No data available": "कोई डेटा नहीं",
  Save: "सहेजें",
  Cancel: "रद्द करें",
  Delete: "हटाएं",
  Edit: "संपादित करें",
  Add: "जोड़ें",
  Submit: "जमा करें",
  Back: "वापस",
  Home: "होम",
  Login: "लॉग इन",
  Logout: "लॉग आउट",
  Name: "नाम",
  Mobile: "मोबाइल",
  Amount: "राशि",
  Quantity: "मात्रा",
  Price: "मूल्य",
  Product: "उत्पाद",
  Customer: "ग्राहक",
  Vendor: "विक्रेता",
  Date: "तारीख",
  Status: "स्थिति",
  Total: "कुल",
  Paid: "भुगतान किया",
  Pending: "लंबित",
  Active: "सक्रिय",
  Inactive: "निष्क्रिय",
  Owner: "मालिक",
  Manager: "प्रबंधक",
  "View Details": "विवरण देखें",
  "Send Reminder": "अनुस्मारक भेजें",
  "Recent Activity": "हाल की गतिविधि",
  "Expiry Alerts": "एक्सपायरी अलर्ट",
  "App Settings": "ऐप सेटिंग्स",
  "Feature Control": "फीचर नियंत्रण",
  "Dark Mode": "डार्क मोड",
  "Light Mode": "लाइट मोड",
  "Stock In/Out": "स्टॉक इन/आउट",
  "Purchase Orders": "खरीद ऑर्डर",
  "Customer Orders": "ग्राहक ऑर्डर",
  "Staff Credit Report": "स्टाफ क्रेडिट रिपोर्ट",
  "Staff Management": "स्टाफ प्रबंधन",
  "Admin Panel": "एडमिन पैनल",
  "Draft History": "ड्राफ्ट इतिहास",
  "Low Price Log": "कम मूल्य लॉग",
  "Audit Log": "ऑडिट लॉग",
  "Reminder Log": "रिमाइंडर लॉग",
  "Quick Actions": "त्वरित क्रियाएं",
  "Add Staff": "स्टाफ जोड़ें",
  "Customer Due": "ग्राहक बकाया",
  "Stock Control": "स्टॉक नियंत्रण",
  "Smart Insights": "स्मार्ट अंतर्दृष्टि",
  "Inventory Health": "इन्वेंटरी स्वास्थ्य",
  "Point of Sale": "बिक्री केंद्र",
  "Payment Mode": "भुगतान मोड",
  "Generate Invoice": "बिल बनाएं",
  "Customer Details": "ग्राहक विवरण",
  "Add Items": "आइटम जोड़ें",
  Payment: "भुगतान",
  "Listening...": "सुन रहा है...",
  Stop: "रोकें",
  "Voice Input": "आवाज़ इनपुट",
  "Tap mic to speak": "माइक दबाएं",
  "Speak now...": "अभी बोलें...",
  "Not supported": "समर्थित नहीं",
  "Voice input not supported in this browser":
    "इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है",
  "Confirm Voice Input": "आवाज़ इनपुट की पुष्टि करें",
  Detected: "पहचाना गया",
  "Edit and confirm": "संपादित करें और पुष्टि करें",
  Confirm: "पुष्टि करें",
  "Voice input applied — please review and save":
    "आवाज़ इनपुट लागू हुआ — जांचें और सहेजें",
  "Detected payment amount": "भुगतान राशि",
  "Quick Filter": "त्वरित फ़िल्टर",
  All: "सभी",
  "Dead Stock": "डेड स्टॉक",
  "Payment Pending": "भुगतान बाकी",
  "Expiry Alert": "एक्सपायरी",
};

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return stored === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next: Language = prev === "en" ? "hi" : "en";
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const t = (key: string): string => {
    if (language === "hi") {
      return hindiTranslations[key] ?? key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
