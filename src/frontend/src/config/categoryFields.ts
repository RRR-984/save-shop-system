// Category Field Bundle Configuration
// Maps each shop category to its product input field bundle.
// Used by CategoryProductForm to render only relevant fields.

export interface FieldConfig {
  /** Fields to show in this order */
  fields: string[];
  /** Fields that must be non-empty before submit */
  required: string[];
  /** Auto-calculated fields: { fieldKey: 'formula' } */
  autoCalc?: Record<string, string>;
  /** Dropdown options for specific fields */
  unitOptions?: Record<string, string[]>;
  /** Size options for Clothing / Footwear categories */
  sizeOptions?: string[];
  /** Override display labels for specific field keys */
  labelOverrides?: Record<string, string>;
}

export const CATEGORY_FIELD_CONFIG: Record<string, FieldConfig> = {
  // ── Medical / Pharma ──────────────────────────────────────────────────────
  Medical: {
    fields: [
      "name",
      "batchNo",
      "expiryDate",
      "mrp",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["batchNo", "expiryDate"],
    labelOverrides: { name: "Medicine Name" },
  },
  "Medical / Pharma": {
    fields: [
      "name",
      "batchNo",
      "expiryDate",
      "mrp",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["batchNo", "expiryDate"],
    labelOverrides: { name: "Medicine Name" },
  },
  Pharma: {
    fields: [
      "name",
      "batchNo",
      "expiryDate",
      "mrp",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["batchNo", "expiryDate"],
    labelOverrides: { name: "Medicine Name" },
  },

  // ── Clothing ──────────────────────────────────────────────────────────────
  Clothing: {
    fields: [
      "name",
      "size",
      "color",
      "brand",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["size"],
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"],
  },

  // ── Footwear ──────────────────────────────────────────────────────────────
  Footwear: {
    fields: ["name", "size", "color", "brand", "mrp", "sellingPrice", "qty"],
    required: ["size"],
    sizeOptions: ["4", "5", "6", "7", "8", "9", "10", "11", "12"],
  },

  // ── Sweets / Food ─────────────────────────────────────────────────────────
  Sweets: {
    fields: ["name", "weight", "unit", "pricePerKg", "totalPrice", "qty"],
    required: ["weight", "unit"],
    unitOptions: {
      unit: ["kg", "gm", "liter", "ml", "piece", "plate", "portion"],
    },
    autoCalc: { totalPrice: "weight * pricePerKg" },
    labelOverrides: { pricePerKg: "Price per Unit" },
  },
  "Sweets / Food": {
    fields: ["name", "weight", "unit", "pricePerKg", "totalPrice", "qty"],
    required: ["weight", "unit"],
    unitOptions: {
      unit: ["kg", "gm", "liter", "ml", "piece", "plate", "portion"],
    },
    autoCalc: { totalPrice: "weight * pricePerKg" },
    labelOverrides: { pricePerKg: "Price per Unit" },
  },
  "Sweets & Bakery": {
    fields: ["name", "weight", "unit", "pricePerKg", "totalPrice", "qty"],
    required: ["weight", "unit"],
    unitOptions: {
      unit: ["kg", "gm", "liter", "ml", "piece", "plate", "portion"],
    },
    autoCalc: { totalPrice: "weight * pricePerKg" },
    labelOverrides: { pricePerKg: "Price per Unit" },
  },
  Bakery: {
    fields: ["name", "weight", "unit", "pricePerKg", "totalPrice", "qty"],
    required: ["weight", "unit"],
    unitOptions: {
      unit: ["kg", "gm", "liter", "ml", "piece", "plate", "portion"],
    },
    autoCalc: { totalPrice: "weight * pricePerKg" },
    labelOverrides: { pricePerKg: "Price per Unit" },
  },

  // ── Grocery ───────────────────────────────────────────────────────────────
  Grocery: {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: {
      unit: [
        "kg",
        "liter",
        "piece",
        "dozen",
        "pack",
        "box",
        "plate",
        "portion",
      ],
    },
  },
  "General Store": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: {
      unit: [
        "kg",
        "liter",
        "piece",
        "dozen",
        "pack",
        "box",
        "plate",
        "portion",
      ],
    },
  },
  "Daily Needs": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["kg", "liter", "piece", "dozen", "pack", "box"] },
  },
  "Dairy & Daily Needs": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["kg", "liter", "piece", "dozen", "pack", "box"] },
  },
  Beverages: {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: {
      unit: ["liter", "ml", "bottle", "can", "pack", "box", "piece"],
    },
  },
  "Fruits & Vegetables": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["kg", "gm", "piece", "dozen", "bunch", "box"] },
  },

  // ── Hardware / Electrical ─────────────────────────────────────────────────
  Hardware: {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["nos", "meter", "box", "roll", "set", "pair", "kg"] },
  },
  "Hardware / Electrical": {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["nos", "meter", "box", "roll", "set", "pair", "kg"] },
  },
  Electrical: {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["nos", "meter", "box", "roll", "set", "pair", "kg"] },
  },
  "Electrical Shop": {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["nos", "meter", "box", "roll", "set", "pair", "kg"] },
  },

  // ── Mobile / Electronics ──────────────────────────────────────────────────
  Mobile: {
    fields: [
      "name",
      "brand",
      "model",
      "imeiSerialNo",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["imeiSerialNo"],
    labelOverrides: { imeiSerialNo: "IMEI / Serial No" },
  },
  "Mobile / Electronics": {
    fields: [
      "name",
      "brand",
      "model",
      "imeiSerialNo",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["imeiSerialNo"],
    labelOverrides: { imeiSerialNo: "IMEI / Serial No" },
  },
  "Mobile Shop": {
    fields: [
      "name",
      "brand",
      "model",
      "imeiSerialNo",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["imeiSerialNo"],
    labelOverrides: { imeiSerialNo: "IMEI / Serial No" },
  },
  Electronics: {
    fields: [
      "name",
      "brand",
      "model",
      "imeiSerialNo",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: ["imeiSerialNo"],
    labelOverrides: { imeiSerialNo: "IMEI / Serial No" },
  },
  "Electronics (TV / Fridge / AC)": {
    fields: [
      "name",
      "brand",
      "model",
      "imeiSerialNo",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: [],
    labelOverrides: { imeiSerialNo: "Serial No" },
  },

  // ── Furniture ─────────────────────────────────────────────────────────────
  Furniture: {
    fields: [
      "name",
      "dimensions",
      "material",
      "brand",
      "purchaseRate",
      "sellingPrice",
      "qty",
    ],
    required: [],
  },

  // ── Building Material ─────────────────────────────────────────────────────
  "Building Material": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: {
      unit: ["bag", "ton", "piece", "bundle", "sq.ft", "sq.m", "cubic ft"],
    },
  },
  "Building Material Suppliers": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: {
      unit: ["bag", "ton", "piece", "bundle", "sq.ft", "sq.m", "cubic ft"],
    },
  },
  "Tiles & Marble": {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["sq.ft", "sq.m", "piece", "box", "pallet"] },
  },
  Tiles: {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["sq.ft", "sq.m", "piece", "box", "pallet"] },
  },
  Marble: {
    fields: ["name", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["sq.ft", "sq.m", "piece", "slab"] },
  },
  Sanitary: {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["piece", "set", "box"] },
  },

  // ── Stationery ────────────────────────────────────────────────────────────
  Stationery: {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["piece", "box", "dozen", "pack", "ream"] },
  },

  // ── Auto Parts ────────────────────────────────────────────────────────────
  "Auto Parts": {
    fields: [
      "name",
      "partNo",
      "srNo",
      "tnNo",
      "dd",
      "ed",
      "mrp",
      "purchaseRate",
      "sellingPrice",
    ],
    required: [],
    labelOverrides: {
      partNo: "Part Number",
      srNo: "SR No",
      tnNo: "TN No",
      dd: "DD",
      ed: "ED",
    },
  },
  "Oil & Grease": {
    fields: ["name", "brand", "unit", "purchaseRate", "sellingPrice", "qty"],
    required: [],
    unitOptions: { unit: ["liter", "kg", "piece", "can", "barrel"] },
  },

  // ── Cosmetics & Beauty ───────────────────────────────────────────────────
  "Cosmetics & Beauty": {
    fields: [
      "name",
      "brand",
      "cosmeticType",
      "shade",
      "size",
      "cosmeticFormula",
      "purchaseRate",
      "mrp",
      "sellingPrice",
      "qty",
      "unit",
      "expiryDate",
    ],
    required: ["name", "cosmeticType", "purchaseRate", "sellingPrice", "qty"],
    unitOptions: {
      unit: ["pcs"],
      cosmeticType: [
        "Makeup",
        "Skincare",
        "Hair Care",
        "Perfume",
        "Nail Care",
        "Body Care",
      ],
      cosmeticFormula: [
        "Matte",
        "Glossy",
        "Liquid",
        "Cream",
        "Powder",
        "Gel",
        "Spray",
        "Stick",
        "Serum",
        "Foam",
        "Oil",
        "Tinted",
      ],
    },
    sizeOptions: [
      "5ml",
      "10ml",
      "15ml",
      "20ml",
      "30ml",
      "50ml",
      "75ml",
      "100ml",
      "150ml",
      "200ml",
      "250ml",
      "500ml",
    ],
    labelOverrides: {
      cosmeticType: "Category Type",
      shade: "Shade / Color",
      cosmeticFormula: "Formula / Type",
    },
  },
  Cosmetics: {
    fields: [
      "name",
      "brand",
      "cosmeticType",
      "shade",
      "size",
      "cosmeticFormula",
      "purchaseRate",
      "mrp",
      "sellingPrice",
      "qty",
      "unit",
      "expiryDate",
    ],
    required: ["name", "cosmeticType", "purchaseRate", "sellingPrice", "qty"],
    unitOptions: {
      unit: ["pcs"],
      cosmeticType: [
        "Makeup",
        "Skincare",
        "Hair Care",
        "Perfume",
        "Nail Care",
        "Body Care",
      ],
      cosmeticFormula: [
        "Matte",
        "Glossy",
        "Liquid",
        "Cream",
        "Powder",
        "Gel",
        "Spray",
        "Stick",
        "Serum",
        "Foam",
        "Oil",
        "Tinted",
      ],
    },
    sizeOptions: [
      "5ml",
      "10ml",
      "15ml",
      "20ml",
      "30ml",
      "50ml",
      "75ml",
      "100ml",
      "150ml",
      "200ml",
      "250ml",
      "500ml",
    ],
    labelOverrides: {
      cosmeticType: "Category Type",
      shade: "Shade / Color",
      cosmeticFormula: "Formula / Type",
    },
  },

  // ── Hotel / Restaurant ────────────────────────────────────────────────────
  "Hotel / Restaurant": {
    fields: [
      "name",
      "unit",
      "purchaseRate",
      "sellingPrice",
      "qty",
      "expiryDate",
    ],
    required: [],
    unitOptions: {
      unit: ["kg", "liter", "piece", "plate", "portion", "dozen", "pack", "ml"],
    },
    labelOverrides: { name: "Item / Ingredient Name" },
  },
  Restaurant: {
    fields: [
      "name",
      "unit",
      "purchaseRate",
      "sellingPrice",
      "qty",
      "expiryDate",
    ],
    required: [],
    unitOptions: {
      unit: ["kg", "liter", "piece", "plate", "portion", "dozen", "pack", "ml"],
    },
    labelOverrides: { name: "Item / Ingredient Name" },
  },
  Hotel: {
    fields: [
      "name",
      "unit",
      "purchaseRate",
      "sellingPrice",
      "qty",
      "expiryDate",
    ],
    required: [],
    unitOptions: {
      unit: ["kg", "liter", "piece", "plate", "portion", "dozen", "pack", "ml"],
    },
    labelOverrides: { name: "Item / Ingredient Name" },
  },

  // ── DEFAULT fallback ──────────────────────────────────────────────────────
  DEFAULT: {
    fields: ["name", "purchaseRate", "sellingPrice", "mrp", "qty", "unit"],
    required: [],
    unitOptions: { unit: ["piece", "kg", "liter", "box", "set", "nos"] },
  },
};

/**
 * Returns field config for a category name.
 * Falls back to partial match (e.g. "Medical / Pharma" → "Medical") then DEFAULT.
 */
export function getCategoryFieldConfig(category: string): FieldConfig {
  if (!category) return CATEGORY_FIELD_CONFIG.DEFAULT;

  // Exact match
  if (CATEGORY_FIELD_CONFIG[category]) return CATEGORY_FIELD_CONFIG[category];

  // Partial match: try first segment before "/"
  const firstSegment = category.split("/")[0].trim();
  if (firstSegment && CATEGORY_FIELD_CONFIG[firstSegment]) {
    return CATEGORY_FIELD_CONFIG[firstSegment];
  }

  // Case-insensitive fallback
  const lc = category.toLowerCase();
  const key = Object.keys(CATEGORY_FIELD_CONFIG).find(
    (k) => k.toLowerCase() === lc,
  );
  if (key) return CATEGORY_FIELD_CONFIG[key];

  return CATEGORY_FIELD_CONFIG.DEFAULT;
}

/** Human-readable labels for all product field keys */
export const FIELD_LABELS: Record<string, string> = {
  name: "Product Name",
  purchaseRate: "Purchase Rate (₹)",
  sellingPrice: "Selling Price (₹)",
  mrp: "MRP (₹)",
  qty: "Quantity",
  unit: "Unit",
  batchNo: "Batch No",
  expiryDate: "Expiry Date",
  srNo: "SR No",
  partNo: "Part Number",
  tnNo: "TN No",
  dd: "DD",
  ed: "ED",
  size: "Size",
  color: "Color",
  brand: "Brand",
  model: "Model",
  imeiSerialNo: "IMEI / Serial No",
  weight: "Weight",
  pricePerKg: "Price per Unit",
  totalPrice: "Total Price (₹)",
  dimensions: "Size / Dimensions",
  material: "Material",
  cosmeticType: "Category Type",
  shade: "Shade / Color",
  cosmeticFormula: "Formula / Type",
};
