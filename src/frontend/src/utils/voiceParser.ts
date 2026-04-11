export interface ParsedVoiceCommand {
  action: "add" | "sell" | "payment" | "unknown";
  itemName: string | null;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  customerName: string | null;
}

// Hindi number words → numeric value
const HINDI_NUMBERS: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  chaar: 4,
  paanch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  terah: 13,
  chaudah: 14,
  pandrah: 15,
  solah: 16,
  satrah: 17,
  atharah: 18,
  unnis: 19,
  bees: 20,
  tees: 30,
  chaalees: 40,
  pachaas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,
  paanch_sau: 500,
};

const UNIT_WORDS = new Set([
  "kg",
  "kilo",
  "kilogram",
  "किलो",
  "gram",
  "g",
  "gm",
  "piece",
  "pieces",
  "pcs",
  "items",
  "item",
  "unit",
  "units",
  "litre",
  "liter",
  "l",
  "ml",
  "dozen",
  "box",
  "bag",
  "packet",
  "bottle",
  "crate",
]);

const ADD_WORDS = new Set([
  "add",
  "jodo",
  "daalo",
  "lagao",
  "karo",
  "karna",
  "stock",
  "mein",
]);

const SELL_WORDS = new Set([
  "sell",
  "becho",
  "becha",
  "sold",
  "nikalo",
  "sale",
  "diya",
  "de",
]);

const PAYMENT_WORDS = new Set([
  "paid",
  "payment",
  "received",
  "mila",
  "diya",
  "liya",
  "ne",
]);

const PRICE_TRIGGER_WORDS = new Set([
  "rupees",
  "rupaye",
  "rs",
  "₹",
  "paisa",
  "rate",
  "daam",
  "keemat",
]);

const STOPWORDS = new Set([
  "add",
  "karo",
  "karna",
  "mein",
  "se",
  "ko",
  "ka",
  "ki",
  "ke",
  "hai",
  "tha",
  "is",
  "at",
  "for",
  "the",
  "a",
  "an",
  "stock",
  "daalo",
  "lagao",
  "jodo",
  "sell",
  "becho",
  "sold",
  "nikalo",
  "paid",
  "payment",
  "received",
  "mila",
  "liya",
  "diya",
  "ne",
  "or",
  "and",
  "aur",
  "bhi",
  "to",
  "toh",
  "per",
  "wala",
  "do",
  "kuch",
  "yeh",
  "woh",
]);

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function resolveHindiNumber(word: string): number | null {
  const lower = word.toLowerCase();
  if (HINDI_NUMBERS[lower] !== undefined) return HINDI_NUMBERS[lower];
  return null;
}

function resolveNumber(word: string): number | null {
  const asFloat = Number.parseFloat(word);
  if (!Number.isNaN(asFloat)) return asFloat;
  return resolveHindiNumber(word);
}

function detectAction(words: string[]): "add" | "sell" | "payment" | "unknown" {
  const wordSet = new Set(words.map((w) => w.toLowerCase()));

  // payment keywords (check before sell since "diya" can be both)
  const paymentKeywords = ["paid", "payment", "received", "mila", "liya"];
  if (paymentKeywords.some((k) => wordSet.has(k))) return "payment";

  // "ne" + price pattern → payment (e.g. "Suresh ne 200 diya")
  if (wordSet.has("ne")) return "payment";

  // add keywords
  const addKeywords = ["add", "jodo", "lagao"];
  if (addKeywords.some((k) => wordSet.has(k))) return "add";
  // "stock mein daalo" pattern
  if (wordSet.has("daalo") && wordSet.has("stock")) return "add";
  if (wordSet.has("daalo")) return "add";

  // sell keywords
  const sellKeywords = ["sell", "becho", "becha", "sold", "nikalo", "sale"];
  if (sellKeywords.some((k) => wordSet.has(k))) return "sell";

  return "unknown";
}

function extractQuantityAndUnit(words: string[]): {
  quantity: number | null;
  unit: string | null;
  usedIndices: Set<number>;
} {
  const usedIndices = new Set<number>();

  for (let i = 0; i < words.length; i++) {
    const num = resolveNumber(words[i]);
    if (num !== null) {
      // Check if next word is a unit
      if (i + 1 < words.length && UNIT_WORDS.has(words[i + 1].toLowerCase())) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        return { quantity: num, unit: words[i + 1].toLowerCase(), usedIndices };
      }
      // Check if previous word is a unit (e.g. "kg 10" - unlikely but safe)
      if (i > 0 && UNIT_WORDS.has(words[i - 1].toLowerCase())) {
        usedIndices.add(i - 1);
        usedIndices.add(i);
        return { quantity: num, unit: words[i - 1].toLowerCase(), usedIndices };
      }
    }
  }

  // Second pass: find standalone number (no unit adjacent)
  for (let i = 0; i < words.length; i++) {
    const num = resolveNumber(words[i]);
    if (num !== null) {
      // Skip numbers that look like prices (preceded or followed by price triggers)
      const prevWord = i > 0 ? words[i - 1].toLowerCase() : "";
      const nextWord = i + 1 < words.length ? words[i + 1].toLowerCase() : "";
      const isPriceContext =
        PRICE_TRIGGER_WORDS.has(prevWord) ||
        PRICE_TRIGGER_WORDS.has(nextWord) ||
        prevWord === "at" ||
        prevWord === "for";
      if (!isPriceContext) {
        usedIndices.add(i);
        return { quantity: num, unit: null, usedIndices };
      }
    }
  }

  return { quantity: null, unit: null, usedIndices };
}

function extractPrice(words: string[]): {
  price: number | null;
  usedIndices: Set<number>;
} {
  const usedIndices = new Set<number>();

  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();

    // Pattern: "at NUMBER" / "for NUMBER"
    if ((w === "at" || w === "for") && i + 1 < words.length) {
      const num = resolveNumber(words[i + 1].replace(/[₹,]/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        // Also consume trailing price word if present
        if (
          i + 2 < words.length &&
          PRICE_TRIGGER_WORDS.has(words[i + 2].toLowerCase())
        ) {
          usedIndices.add(i + 2);
        }
        return { price: num, usedIndices };
      }
    }

    // Pattern: "rate/daam/keemat NUMBER"
    if (
      (w === "rate" || w === "daam" || w === "keemat") &&
      i + 1 < words.length
    ) {
      const num = resolveNumber(words[i + 1].replace(/[₹,]/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        usedIndices.add(i + 1);
        return { price: num, usedIndices };
      }
    }

    // Pattern: NUMBER rupees/rupaye/rs/₹
    if (PRICE_TRIGGER_WORDS.has(w)) {
      if (i > 0) {
        const num = resolveNumber(words[i - 1].replace(/[₹,]/g, ""));
        if (num !== null) {
          usedIndices.add(i - 1);
          usedIndices.add(i);
          return { price: num, usedIndices };
        }
      }
    }

    // Pattern: ₹NUMBER (inline)
    if (w.startsWith("₹")) {
      const num = resolveNumber(w.slice(1).replace(/,/g, ""));
      if (num !== null) {
        usedIndices.add(i);
        return { price: num, usedIndices };
      }
    }
  }

  return { price: null, usedIndices };
}

function extractCustomerName(
  words: string[],
  action: "add" | "sell" | "payment" | "unknown",
  usedIndices: Set<number>,
): string | null {
  if (action !== "payment") return null;

  // Find the first word that's not a stopword, number, unit, or payment keyword
  for (let i = 0; i < words.length; i++) {
    if (usedIndices.has(i)) continue;
    const w = words[i];
    const lower = w.toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (PAYMENT_WORDS.has(lower)) continue;
    if (resolveNumber(lower) !== null) continue;
    if (UNIT_WORDS.has(lower)) continue;
    if (PRICE_TRIGGER_WORDS.has(lower)) continue;
    // Looks like a name
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  return null;
}

function extractItemName(
  words: string[],
  action: "add" | "sell" | "payment" | "unknown",
  usedIndices: Set<number>,
): string | null {
  if (action === "payment") return null;

  const nameWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (usedIndices.has(i)) continue;
    const lower = words[i].toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (UNIT_WORDS.has(lower)) continue;
    if (ADD_WORDS.has(lower)) continue;
    if (SELL_WORDS.has(lower)) continue;
    if (PRICE_TRIGGER_WORDS.has(lower)) continue;
    if (resolveNumber(lower) !== null) continue;
    nameWords.push(
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase(),
    );
  }

  if (nameWords.length === 0) return null;
  return nameWords.join(" ");
}

export function parseVoiceCommand(text: string): ParsedVoiceCommand {
  const normalized = normalizeText(text);
  // Split by spaces, remove empty tokens
  const words = normalized.split(/\s+/).filter(Boolean);

  const action = detectAction(words);

  const {
    quantity,
    unit,
    usedIndices: qtyIndices,
  } = extractQuantityAndUnit(words);
  const { price, usedIndices: priceIndices } = extractPrice(words);

  const allUsed = new Set([...qtyIndices, ...priceIndices]);

  const customerName = extractCustomerName(words, action, allUsed);
  const itemName = extractItemName(words, action, allUsed);

  return {
    action,
    itemName,
    quantity,
    unit,
    price,
    customerName,
  };
}
