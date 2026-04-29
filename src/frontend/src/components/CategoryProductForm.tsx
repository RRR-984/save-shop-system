import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookmarkCheck, FolderOpen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FIELD_LABELS, getCategoryFieldConfig } from "../config/categoryFields";
import type { Product, ProductTemplate } from "../types/store";
import { ShadePalette } from "./ShadePalette";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CategoryProductFormProps {
  category: string;
  shopId: string;
  products: Product[];
  initialValues?: Partial<Product>;
  onSubmit: (product: Partial<Product>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

type FormValues = Partial<
  Record<
    | "name"
    | "purchaseRate"
    | "sellingPrice"
    | "mrp"
    | "qty"
    | "unit"
    | "batchNo"
    | "expiryDate"
    | "srNo"
    | "partNo"
    | "tnNo"
    | "dd"
    | "ed"
    | "size"
    | "color"
    | "brand"
    | "model"
    | "imeiSerialNo"
    | "weight"
    | "pricePerKg"
    | "totalPrice"
    | "dimensions"
    | "material"
    | "cosmeticType"
    | "shade"
    | "cosmeticFormula",
    string
  >
>;

// ── Helpers ────────────────────────────────────────────────────────────────────

function toTitleCase(s: string): string {
  return s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function getFieldLabel(
  fieldKey: string,
  labelOverrides?: Record<string, string>,
): string {
  if (labelOverrides?.[fieldKey]) return labelOverrides[fieldKey];
  return FIELD_LABELS[fieldKey] ?? toTitleCase(fieldKey);
}

function getTemplateKey(shopId: string, category: string): string {
  return `shop_template_${shopId}_${category.replace(/\s/g, "_")}`;
}

function isNumberField(fieldKey: string): boolean {
  return [
    "purchaseRate",
    "sellingPrice",
    "mrp",
    "qty",
    "weight",
    "pricePerKg",
    "totalPrice",
  ].includes(fieldKey);
}

function isDateField(fieldKey: string): boolean {
  return fieldKey === "expiryDate";
}

function isAutoCalcField(fieldKey: string, autoCalc?: Record<string, string>) {
  return autoCalc ? fieldKey in autoCalc : false;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CategoryProductForm({
  category,
  shopId,
  products,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Product",
}: CategoryProductFormProps) {
  const config = getCategoryFieldConfig(category);
  const {
    fields,
    required,
    autoCalc,
    unitOptions,
    sizeOptions,
    labelOverrides,
  } = config;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [values, setValues] = useState<FormValues>(() => {
    const init: FormValues = {};
    for (const f of fields) init[f as keyof FormValues] = "";
    if (initialValues) {
      for (const [k, v] of Object.entries(initialValues)) {
        if (v !== undefined && v !== null) {
          (init as Record<string, string>)[k] = String(v);
        }
      }
    }
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Smart Suggest ──────────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  // ── Template ───────────────────────────────────────────────────────────────
  const templateKey = getTemplateKey(shopId, category);

  const hasTemplate = (): boolean => {
    return localStorage.getItem(templateKey) !== null;
  };

  // Auto-load template silently on mount
  useEffect(() => {
    if (initialValues) return; // Don't override explicit initial values
    try {
      const raw = localStorage.getItem(templateKey);
      if (raw) {
        const tmpl = JSON.parse(raw) as ProductTemplate;
        if (tmpl.fields) {
          setValues((prev) => {
            const merged = { ...prev };
            for (const f of fields) {
              const k = f as keyof FormValues;
              const v = (tmpl.fields as Record<string, unknown>)[f];
              if (v !== undefined && v !== null && merged[k] === "") {
                merged[k] = String(v);
              }
            }
            return merged;
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, [templateKey, fields, initialValues]);

  // Recalculate auto-calc fields whenever values change (for weight/pricePerKg formulas)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally watching full values object for auto-calc triggers
  useEffect(() => {
    if (!autoCalc) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const [target, formula] of Object.entries(autoCalc)) {
        // Only support 'a * b' formula
        const parts = formula.split("*").map((p) => p.trim());
        if (parts.length === 2) {
          const a = Number(next[parts[0] as keyof FormValues] ?? 0);
          const b = Number(next[parts[1] as keyof FormValues] ?? 0);
          if (a > 0 && b > 0) {
            next[target as keyof FormValues] = (a * b).toFixed(2);
          }
        }
      }
      return next;
    });
  }, [values, autoCalc]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const updateField = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNameChange = (val: string) => {
    updateField("name", val);
    if (val.length >= 2) {
      const matches = products
        .filter((p) => p.name.toLowerCase().startsWith(val.toLowerCase()))
        .slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (product: Product) => {
    setValues((prev) => {
      const next = { ...prev };
      // Merge product's relevant fields into visible fields
      for (const f of fields) {
        const k = f as keyof FormValues;
        const v = (product as unknown as Record<string, unknown>)[f];
        if (v !== undefined && v !== null) {
          next[k] = String(v);
        }
      }
      next.name = product.name;
      return next;
    });
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    let firstMissing: string | null = null;

    for (const req of required) {
      const val = values[req as keyof FormValues] ?? "";
      if (!val.trim()) {
        newErrors[req] = "This field is required";
        if (!firstMissing) firstMissing = req;
      }
    }

    // name is always required
    if (!(values.name ?? "").trim()) {
      newErrors.name = "This field is required";
      if (!firstMissing) firstMissing = "name";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstMissing) {
        const label = getFieldLabel(firstMissing, labelOverrides);
        toast.error(`Please fill in ${label}`);
      }
      return;
    }

    // Build product partial from visible fields
    const result: Partial<Product> = {};
    for (const f of fields) {
      const raw = values[f as keyof FormValues];
      if (raw === undefined || raw === "") continue;
      if (isNumberField(f)) {
        const num = Number(raw);
        if (!Number.isNaN(num)) {
          (result as Record<string, unknown>)[f] = num;
        }
      } else {
        (result as Record<string, unknown>)[f] = raw;
      }
    }

    onSubmit(result);
  };

  const handleSaveTemplate = () => {
    const tmpl: ProductTemplate = {
      category,
      shopId,
      fields: {},
      savedAt: Date.now(),
    };
    for (const f of fields) {
      if (f === "name") continue; // Don't save name in template
      const val = values[f as keyof FormValues];
      if (val?.trim()) {
        (tmpl.fields as Record<string, unknown>)[f] = isNumberField(f)
          ? Number(val)
          : val;
      }
    }
    localStorage.setItem(templateKey, JSON.stringify(tmpl));
    toast.success("Template saved");
  };

  const handleLoadTemplate = () => {
    try {
      const raw = localStorage.getItem(templateKey);
      if (!raw) return;
      const tmpl = JSON.parse(raw) as ProductTemplate;
      setValues((prev) => {
        const next = { ...prev };
        for (const f of fields) {
          if (f === "name") continue;
          const k = f as keyof FormValues;
          const v = (tmpl.fields as Record<string, unknown>)[f];
          if (v !== undefined && v !== null) next[k] = String(v);
        }
        return next;
      });
      toast.success("Template loaded");
    } catch {
      toast.error("Failed to load template");
    }
  };

  const handleClearTemplate = () => {
    localStorage.removeItem(templateKey);
    toast.success("Template cleared");
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderSizeButtons = (fieldKey: string) => {
    const opts = sizeOptions ?? [];
    const current = values[fieldKey as keyof FormValues] ?? "";
    return (
      <div className="flex flex-wrap gap-1.5">
        {opts.map((s) => (
          <button
            key={s}
            type="button"
            data-ocid={`category_form.size.${s}`}
            onClick={() => updateField(fieldKey, s === current ? "" : s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              current === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    );
  };

  const renderUnitSelect = (fieldKey: string) => {
    const opts = unitOptions?.[fieldKey] ?? [];
    const val = values[fieldKey as keyof FormValues] ?? "";
    return (
      <Select value={val} onValueChange={(v) => updateField(fieldKey, v)}>
        <SelectTrigger
          data-ocid={`category_form.${fieldKey}.select`}
          className={
            errors[fieldKey] ? "ring-2 ring-destructive border-destructive" : ""
          }
        >
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          {opts.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">Other…</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderField = (fieldKey: string) => {
    const label = getFieldLabel(fieldKey, labelOverrides);
    const isReq = required.includes(fieldKey) || fieldKey === "name";
    const isAutoCalcF = isAutoCalcField(fieldKey, autoCalc);
    const hasError = !!errors[fieldKey];
    const val = values[fieldKey as keyof FormValues] ?? "";

    // Size — render as button group (size options exist AND field is "size")
    if (fieldKey === "size" && sizeOptions) {
      return (
        <div key={fieldKey} className="col-span-2 space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderSizeButtons(fieldKey)}
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Shade — visual color palette (cosmetics)
    if (fieldKey === "shade") {
      return (
        <div key={fieldKey} className="col-span-2 space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          <ShadePalette
            value={val}
            onChange={(v) => updateField(fieldKey, v)}
            hasError={hasError}
            ocidPrefix="category_form"
          />
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Dropdown fields driven by unitOptions (cosmeticType, cosmeticFormula, unit)
    if (
      (fieldKey === "cosmeticType" || fieldKey === "cosmeticFormula") &&
      unitOptions?.[fieldKey]?.length
    ) {
      const opts = unitOptions[fieldKey]!;
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select value={val} onValueChange={(v) => updateField(fieldKey, v)}>
            <SelectTrigger
              data-ocid={`category_form.${fieldKey}.select`}
              className={
                hasError ? "ring-2 ring-destructive border-destructive" : ""
              }
            >
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Unit — render as select if options available
    if (
      fieldKey === "unit" &&
      unitOptions?.[fieldKey] &&
      unitOptions[fieldKey].length > 0
    ) {
      // Check if current value matches options — if not, show input
      const opts = unitOptions[fieldKey];
      const isCustom = val && !opts.includes(val);
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          {isCustom ? (
            <Input
              data-ocid={`category_form.${fieldKey}.input`}
              placeholder="Enter unit"
              value={val}
              onChange={(e) => updateField(fieldKey, e.target.value)}
              className={
                hasError ? "ring-2 ring-destructive border-destructive" : ""
              }
            />
          ) : (
            renderUnitSelect(fieldKey)
          )}
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Auto-calc — read-only
    if (isAutoCalcF) {
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label className="text-sm font-medium text-muted-foreground">
            {label}
          </Label>
          <Input
            data-ocid={`category_form.${fieldKey}.input`}
            type="number"
            value={val}
            readOnly
            className="bg-muted/50 cursor-default text-foreground font-semibold"
            tabIndex={-1}
          />
        </div>
      );
    }

    // Date
    if (isDateField(fieldKey)) {
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            data-ocid={`category_form.${fieldKey}.input`}
            type="date"
            value={val}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            className={
              hasError ? "ring-2 ring-destructive border-destructive" : ""
            }
          />
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Number
    if (isNumberField(fieldKey)) {
      return (
        <div key={fieldKey} className="space-y-1.5">
          <Label className="text-sm font-medium">
            {label}
            {isReq && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            data-ocid={`category_form.${fieldKey}.input`}
            type="number"
            placeholder="e.g. 0"
            value={val}
            onFocus={(e) => {
              if (e.target.value === "0") e.target.select();
            }}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            className={
              hasError ? "ring-2 ring-destructive border-destructive" : ""
            }
          />
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
        </div>
      );
    }

    // Text — name has autocomplete
    if (fieldKey === "name") {
      return (
        <div key={fieldKey} className="col-span-2 space-y-1.5 relative">
          <Label className="text-sm font-medium">
            {getFieldLabel(fieldKey, labelOverrides)}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            data-ocid="category_form.name.input"
            placeholder={`e.g. ${category} Product`}
            value={val}
            autoFocus
            autoComplete="off"
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => {
              if ((val ?? "").length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSuggestions(false);
            }}
            className={
              hasError ? "ring-2 ring-destructive border-destructive" : ""
            }
          />
          {hasError && (
            <p className="text-destructive text-xs">{errors[fieldKey]}</p>
          )}
          {/* Smart suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border shadow-lg rounded-lg overflow-hidden"
            >
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-ocid={`category_form.suggest.${p.id}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(p);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left"
                >
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ₹{p.sellingPrice} · {p.unit}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default text input
    return (
      <div key={fieldKey} className="space-y-1.5">
        <Label className="text-sm font-medium">
          {label}
          {isReq && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          data-ocid={`category_form.${fieldKey}.input`}
          placeholder={label}
          value={val}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          className={
            hasError ? "ring-2 ring-destructive border-destructive" : ""
          }
        />
        {hasError && (
          <p className="text-destructive text-xs">{errors[fieldKey]}</p>
        )}
      </div>
    );
  };

  // Separate "name" (full-width) from rest (grid)
  const nameField = fields.includes("name") ? "name" : null;
  const sizeField = fields.find((f) => f === "size" && sizeOptions) ?? null;
  // shade also needs full width (col-span-2) — rendered in the grid section but spans 2 cols
  const otherFields = fields.filter(
    (f) => f !== "name" && !(f === "size" && sizeOptions),
  );

  return (
    <div className="space-y-4">
      {/* Category badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-medium">
          {category || "Product"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {category ? `${category} Product` : "Add Product"}
        </span>
      </div>

      {/* Name field — always full width */}
      {nameField && renderField(nameField)}

      {/* Size — full width button group */}
      {sizeField && renderField(sizeField)}

      {/* Remaining fields — 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {otherFields.map((f) => renderField(f))}
      </div>

      {/* Template actions */}
      <div className="flex items-center gap-3 pt-1 flex-wrap">
        <button
          type="button"
          data-ocid="category_form.save_template.button"
          onClick={handleSaveTemplate}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookmarkCheck size={13} />
          Save as Template
        </button>
        {hasTemplate() && (
          <>
            <button
              type="button"
              data-ocid="category_form.load_template.button"
              onClick={handleLoadTemplate}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderOpen size={13} />
              Load Template
            </button>
            <button
              type="button"
              data-ocid="category_form.clear_template.button"
              onClick={handleClearTemplate}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          data-ocid="category_form.cancel_button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          data-ocid="category_form.submit_button"
          className="flex-1"
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
