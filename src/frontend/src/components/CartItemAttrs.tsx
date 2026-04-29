/**
 * CartItemAttrs — compact category-specific attribute selector for billing cart rows.
 * Shows relevant fields (Size, Color, Shade, Batch, IMEI, Weight, Part No, etc.)
 * based on the active shop category. Renders as a slim second row under the product name.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockBatch } from "../types/store";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SelectedAttrs {
  size?: string;
  color?: string;
  shade?: string;
  batchNo?: string;
  imeiSerialNo?: string;
  weight?: string;
  weightUnit?: string;
  partNo?: string;
  srNo?: string;
  /** Unit selected for grocery-like categories (distinct from notes to avoid collision) */
  unit?: string;
  notes?: string;
}

interface CartItemAttrsProps {
  shopCategory: string;
  productId: string;
  batches: StockBatch[];
  attrs: SelectedAttrs;
  onChange: (attrs: SelectedAttrs) => void;
  /** ocid prefix, e.g. "billing.cart" */
  ocidPrefix: string;
  /** Index for ocid (1-based) */
  idx: number;
}

// ── Category classification helpers ──────────────────────────────────────────

function isClothingCategory(cat: string): boolean {
  return /clothing/i.test(cat);
}

function isFootwearCategory(cat: string): boolean {
  return /footwear|shoe/i.test(cat);
}

function isMedicalCategory(cat: string): boolean {
  return /medical|pharma/i.test(cat);
}

function isCosmeticsCategory(cat: string): boolean {
  return /cosmetic|beauty/i.test(cat);
}

function isMobileElectronicsCategory(cat: string): boolean {
  return /mobile|electronic/i.test(cat);
}

function isSweetsCategory(cat: string): boolean {
  return /sweet|bakery|food/i.test(cat);
}

function isAutoPartsCategory(cat: string): boolean {
  return /auto part/i.test(cat);
}

function isGroceryLikeCategory(cat: string): boolean {
  return /grocery|hardware|building|tile|sanitary|stationery|electrical|oil|general|dairy|beverage|fruit|vegetable/i.test(
    cat,
  );
}

// Clothing sizes
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
// Footwear sizes
const FOOTWEAR_SIZES = ["4", "5", "6", "7", "8", "9", "10", "11", "12"];
// Weight units
const WEIGHT_UNITS = ["kg", "gm", "liter", "ml", "piece"];
// Unit options for grocery-like
const GROCERY_UNITS = [
  "kg",
  "liter",
  "piece",
  "meter",
  "box",
  "bag",
  "ton",
  "nos",
  "set",
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SizePills({
  options,
  value,
  onChange,
  ocid,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  ocid: string;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          data-ocid={`${ocid}.size.${s}`}
          onClick={() => onChange(s === value ? "" : s)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
            value === s
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:border-primary"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CartItemAttrs({
  shopCategory,
  batches,
  attrs,
  onChange,
  ocidPrefix,
  idx,
}: CartItemAttrsProps) {
  const cat = shopCategory || "";

  function update(patch: Partial<SelectedAttrs>) {
    onChange({ ...attrs, ...patch });
  }

  // ── Medical: Batch selector (FIFO sorted, oldest first) ──────────────────
  if (isMedicalCategory(cat)) {
    const sortedBatches = [...batches].sort(
      (a, b) =>
        new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
    );
    // Show a placeholder when no batches exist so the cart row is never silently blank
    if (sortedBatches.length === 0) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground italic">
            No batches available — add stock first
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Batch No:
        </span>
        <Select
          value={attrs.batchNo ?? ""}
          onValueChange={(v) => update({ batchNo: v })}
        >
          <SelectTrigger
            data-ocid={`${ocidPrefix}.attrs.batch.${idx}`}
            className="h-6 text-[11px] w-48 min-w-0"
          >
            <SelectValue placeholder="Select batch (FIFO)" />
          </SelectTrigger>
          <SelectContent>
            {sortedBatches.map((b, bi) => (
              <SelectItem key={b.id} value={b.id}>
                <span className="text-[11px]">
                  {bi === 0 ? "★ " : ""}B
                  {String(b.batchNumber ?? bi + 1).padStart(3, "0")} —{" "}
                  {b.quantity} units
                  {b.expiryDate
                    ? ` · Exp: ${new Date(b.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}`
                    : ""}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {attrs.batchNo && (
          <span className="text-[10px] text-blue-600 font-medium">
            {(() => {
              const b = batches.find((x) => x.id === attrs.batchNo);
              return b ? `Avail: ${b.quantity}` : "";
            })()}
          </span>
        )}
      </div>
    );
  }

  // ── Clothing: Size pills + Color input ───────────────────────────────────
  if (isClothingCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Size:
        </span>
        <SizePills
          options={CLOTHING_SIZES}
          value={attrs.size ?? ""}
          onChange={(v) => update({ size: v })}
          ocid={`${ocidPrefix}.attrs.${idx}`}
        />
        <span className="text-[10px] text-muted-foreground font-medium">
          Color:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.color.${idx}`}
          placeholder="Color"
          value={attrs.color ?? ""}
          onChange={(e) => update({ color: e.target.value })}
          className="h-6 text-[11px] w-20"
        />
      </div>
    );
  }

  // ── Footwear: Size pills + Color input ───────────────────────────────────
  if (isFootwearCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Size:
        </span>
        <SizePills
          options={FOOTWEAR_SIZES}
          value={attrs.size ?? ""}
          onChange={(v) => update({ size: v })}
          ocid={`${ocidPrefix}.attrs.${idx}`}
        />
        <span className="text-[10px] text-muted-foreground font-medium">
          Color:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.color.${idx}`}
          placeholder="Color"
          value={attrs.color ?? ""}
          onChange={(e) => update({ color: e.target.value })}
          className="h-6 text-[11px] w-20"
        />
      </div>
    );
  }

  // ── Cosmetics: Shade + notes ──────────────────────────────────────────────
  if (isCosmeticsCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Shade:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.shade.${idx}`}
          placeholder="e.g. Rose Gold"
          value={attrs.shade ?? ""}
          onChange={(e) => update({ shade: e.target.value })}
          className="h-6 text-[11px] w-28"
        />
        <span className="text-[10px] text-muted-foreground font-medium">
          Type:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.notes.${idx}`}
          placeholder="e.g. Matte"
          value={attrs.notes ?? ""}
          onChange={(e) => update({ notes: e.target.value })}
          className="h-6 text-[11px] w-20"
        />
      </div>
    );
  }

  // ── Mobile / Electronics: IMEI / Serial No ───────────────────────────────
  if (isMobileElectronicsCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
          IMEI / Serial:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.imei.${idx}`}
          placeholder="IMEI or Serial No"
          value={attrs.imeiSerialNo ?? ""}
          onChange={(e) => update({ imeiSerialNo: e.target.value })}
          className="h-6 text-[11px] w-40"
        />
      </div>
    );
  }

  // ── Sweets / Food: Weight + unit ────────────────────────────────────────
  if (isSweetsCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Weight:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.weight.${idx}`}
          type="number"
          placeholder="e.g. 0.5"
          value={attrs.weight ?? ""}
          onChange={(e) => update({ weight: e.target.value })}
          className="h-6 text-[11px] w-20"
        />
        <Select
          value={attrs.weightUnit ?? "kg"}
          onValueChange={(v) => update({ weightUnit: v })}
        >
          <SelectTrigger
            data-ocid={`${ocidPrefix}.attrs.weight_unit.${idx}`}
            className="h-6 text-[11px] w-16"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEIGHT_UNITS.map((u) => (
              <SelectItem key={u} value={u} className="text-[11px]">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // ── Auto Parts: Part No + SR No ─────────────────────────────────────────
  if (isAutoPartsCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Part No:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.partno.${idx}`}
          placeholder="Part No"
          value={attrs.partNo ?? ""}
          onChange={(e) => update({ partNo: e.target.value })}
          className="h-6 text-[11px] w-24"
        />
        <span className="text-[10px] text-muted-foreground font-medium">
          SR No:
        </span>
        <Input
          data-ocid={`${ocidPrefix}.attrs.srno.${idx}`}
          placeholder="SR No"
          value={attrs.srNo ?? ""}
          onChange={(e) => update({ srNo: e.target.value })}
          className="h-6 text-[11px] w-20"
        />
      </div>
    );
  }

  // ── Grocery-like: Unit selector ─────────────────────────────────────────
  // Uses attrs.unit (dedicated field) — NOT attrs.notes, to avoid value
  // collision if the user switches category and notes already has a value.
  if (isGroceryLikeCategory(cat)) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          Unit:
        </span>
        <Select
          value={attrs.unit ?? ""}
          onValueChange={(v) => update({ unit: v })}
        >
          <SelectTrigger
            data-ocid={`${ocidPrefix}.attrs.unit.${idx}`}
            className="h-6 text-[11px] w-24"
          >
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {GROCERY_UNITS.map((u) => (
              <SelectItem key={u} value={u} className="text-[11px]">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // ── Default fallback: compact Notes input (Furniture, Tiles, Sanitary, Stationery) ──
  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <span className="text-[10px] text-muted-foreground font-medium">
        Notes:
      </span>
      <Input
        data-ocid={`${ocidPrefix}.attrs.notes.${idx}`}
        placeholder="Details / notes"
        value={attrs.notes ?? ""}
        onChange={(e) => update({ notes: e.target.value })}
        className="h-6 text-[11px] w-40"
      />
    </div>
  );
}

/**
 * Render selected attrs as a compact chip row for invoice/receipt display.
 * Returns null if no attrs are set.
 */
export function AttrsDisplay({ attrs }: { attrs: SelectedAttrs }) {
  const chips: string[] = [];
  if (attrs.size) chips.push(`Size: ${attrs.size}`);
  if (attrs.color) chips.push(`Color: ${attrs.color}`);
  if (attrs.shade) chips.push(`Shade: ${attrs.shade}`);
  if (attrs.batchNo) chips.push(`Batch: ${attrs.batchNo}`);
  if (attrs.imeiSerialNo) chips.push(`IMEI/Serial: ${attrs.imeiSerialNo}`);
  if (attrs.weight)
    chips.push(
      `Weight: ${attrs.weight}${attrs.weightUnit ? ` ${attrs.weightUnit}` : ""}`,
    );
  if (attrs.partNo) chips.push(`Part No: ${attrs.partNo}`);
  if (attrs.srNo) chips.push(`SR No: ${attrs.srNo}`);
  if (attrs.unit) chips.push(`Unit: ${attrs.unit}`);
  if (attrs.notes) chips.push(attrs.notes);

  if (chips.length === 0) return null;
  return (
    <span className="text-[10px] text-muted-foreground leading-tight">
      {chips.join(" · ")}
    </span>
  );
}
