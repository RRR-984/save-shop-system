/**
 * Strips leading zeros from numeric input values.
 * - "0"     → "0"       (keep solo zero)
 * - "0."    → "0."      (keep leading zero before decimal)
 * - "0100"  → "100"     (strip prefix zeros)
 * - ""      → ""        (keep empty)
 */
export function clearLeadingZeros(value: string): string {
  if (value === "" || value === "0" || value.startsWith("0.")) return value;
  return value.replace(/^0+/, "") || "0";
}
