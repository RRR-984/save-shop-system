// Reusable visual shade selection component for Cosmetics & Beauty category
// Renders a grid of color swatches + a custom text input for non-standard shades.

export const COSMETIC_SHADES: Array<{ name: string; hex: string }> = [
  { name: "Nude", hex: "#E8C4A0" },
  { name: "Beige", hex: "#D4A574" },
  { name: "Ivory", hex: "#F5E6D3" },
  { name: "Peach", hex: "#FFAE94" },
  { name: "Coral", hex: "#FF6B6B" },
  { name: "Rose", hex: "#E8A0A8" },
  { name: "Pink", hex: "#FFB6C1" },
  { name: "Red", hex: "#DC143C" },
  { name: "Berry", hex: "#8E2155" },
  { name: "Plum", hex: "#7B2D8B" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Copper", hex: "#B87333" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Warm Brown", hex: "#A0522D" },
  { name: "Deep Brown", hex: "#5C3317" },
  { name: "Mocha", hex: "#967117" },
  { name: "Espresso", hex: "#3C1810" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#F8F8F8" },
  { name: "Navy", hex: "#000080" },
  { name: "Teal", hex: "#008080" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Purple", hex: "#800080" },
  { name: "Olive", hex: "#808000" },
  { name: "Khaki", hex: "#C3B091" },
];

const DARK_SHADES = new Set([
  "Black",
  "Espresso",
  "Deep Brown",
  "Burgundy",
  "Navy",
  "Purple",
  "Berry",
  "Plum",
  "Red",
]);

interface ShadePaletteProps {
  value: string;
  onChange: (shade: string) => void;
  hasError?: boolean;
  ocidPrefix?: string;
}

export function ShadePalette({
  value,
  onChange,
  hasError,
  ocidPrefix = "shade_palette",
}: ShadePaletteProps) {
  const isPreset = COSMETIC_SHADES.some((s) => s.name === value);
  const isCustom = value.length > 0 && !isPreset;

  return (
    <div className="space-y-2">
      {/* Swatch grid */}
      <div className="flex flex-wrap gap-1.5">
        {COSMETIC_SHADES.map((s) => {
          const isSelected = value === s.name;
          const isDark = DARK_SHADES.has(s.name);
          return (
            <button
              key={s.name}
              type="button"
              title={s.name}
              data-ocid={`${ocidPrefix}.shade.${s.name.toLowerCase().replace(/\s+/g, "_")}`}
              onClick={() => onChange(isSelected ? "" : s.name)}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none ${
                isSelected
                  ? "border-foreground scale-110 ring-2 ring-primary ring-offset-1"
                  : "border-transparent hover:border-muted-foreground"
              }`}
              style={{ backgroundColor: s.hex }}
              aria-label={s.name}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span
                  className={`flex items-center justify-center w-full h-full text-[10px] font-bold leading-none ${isDark ? "text-white" : "text-foreground"}`}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected shade chip */}
      {isPreset && value && (
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border border-border flex-shrink-0"
            style={{
              backgroundColor: COSMETIC_SHADES.find((s) => s.name === value)
                ?.hex,
            }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive ml-1 leading-none"
            aria-label="Clear shade"
          >
            ×
          </button>
        </div>
      )}

      {/* Custom shade input */}
      <input
        type="text"
        data-ocid={`${ocidPrefix}.shade.custom_input`}
        placeholder="Or type custom shade name…"
        value={isCustom ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          // Deselect preset swatch when user starts typing custom
          if (isPreset && value) onChange("");
        }}
        className={`w-full h-9 rounded-md border px-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
          hasError
            ? "border-destructive ring-2 ring-destructive"
            : "border-input"
        }`}
      />
    </div>
  );
}
