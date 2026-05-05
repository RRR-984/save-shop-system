import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Bell,
  Car,
  ChevronRight,
  FileText,
  Loader2,
  Package,
  Phone,
  Plus,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useVehicleService } from "../hooks/useVehicleService";
import type {
  JobCard,
  JobCardStatus,
  PartUsed,
  VehicleRecord,
} from "../types/vehicleService";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: JobCardStatus }) {
  const map: Record<JobCardStatus, { label: string; className: string }> = {
    Open: {
      label: "Open",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    InProgress: {
      label: "In Progress",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    Completed: {
      label: "Completed",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    OnHold: { label: "On Hold", className: "bg-muted text-muted-foreground" },
  };
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Job Card Modal ───────────────────────────────────────────────────────────
interface JobCardModalProps {
  vehicle: VehicleRecord;
  existingCard?: JobCard;
  shopId: string;
  onClose: () => void;
  onSaved: () => void;
}

function JobCardModal({
  vehicle,
  existingCard,
  shopId,
  onClose,
  onSaved,
}: JobCardModalProps) {
  const { products, getProductStock } = useStore();
  const { saveJobCard, completeJobCard } = useVehicleService(shopId);

  const [date, setDate] = useState(
    existingCard?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [problem, setProblem] = useState(
    existingCard?.problemDescription ?? "",
  );
  const [workDone, setWorkDone] = useState(existingCard?.workDone ?? "");
  const [status, setStatus] = useState<JobCardStatus>(
    existingCard?.status ?? "Open",
  );
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>(
    existingCard?.partsUsed ?? [],
  );
  const [labourHours, setLabourHours] = useState(
    existingCard?.labourHours ?? 0,
  );
  const [labourRate, setLabourRate] = useState<number>(() => {
    const saved = localStorage.getItem(`labour_rate_${shopId}`);
    return existingCard?.labourRate ?? (saved ? Number(saved) : 200);
  });
  const [notes, setNotes] = useState(existingCard?.notes ?? "");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [manualNextDate, setManualNextDate] = useState(
    existingCard?.manualNextServiceDate ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [showPartDropdown, setShowPartDropdown] = useState(false);

  useEffect(() => {
    if (labourRate > 0)
      localStorage.setItem(`labour_rate_${shopId}`, String(labourRate));
  }, [labourRate, shopId]);

  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    draftTimer.current = setTimeout(() => {
      const draft = {
        date,
        problem,
        workDone,
        partsUsed,
        labourHours,
        labourRate,
        notes,
      };
      localStorage.setItem(
        `job_card_draft_${vehicle.id}`,
        JSON.stringify(draft),
      );
    }, 30000);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [
    date,
    problem,
    workDone,
    partsUsed,
    labourHours,
    labourRate,
    notes,
    vehicle.id,
  ]);

  const labourCost = labourHours * labourRate;
  const partSubtotal = partsUsed.reduce((s, p) => s + p.lineTotal, 0);
  const subtotal = partSubtotal + labourCost;
  const gstAmount = gstEnabled ? (subtotal * gstRate) / 100 : 0;
  const grandTotal = subtotal + gstAmount;

  const filteredProducts = useMemo(() => {
    const q = partSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [products, partSearch]);

  function addPart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (partsUsed.find((p) => p.productId === productId)) {
      toast.error("Part already added. Change quantity below.");
      return;
    }
    const unitCost = product.sellingPrice;
    setPartsUsed((prev) => [
      ...prev,
      {
        productId,
        productName: product.name,
        quantity: 1,
        unitCost,
        batchesUsed: [],
        lineTotal: unitCost,
      },
    ]);
    setPartSearch("");
    setShowPartDropdown(false);
  }

  function updatePartQty(idx: number, qty: number) {
    setPartsUsed((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, quantity: qty, lineTotal: qty * p.unitCost } : p,
      ),
    );
  }

  function removePart(idx: number) {
    setPartsUsed((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!problem.trim()) {
      toast.error("Problem description is required");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveJobCard({
        id: existingCard?.id,
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        date,
        problemDescription: problem,
        workDone,
        status,
        partsUsed,
        labourHours,
        labourRate,
        labourCost,
        subtotal,
        gstAmount,
        grandTotal,
        notes,
        manualNextServiceDate: manualNextDate || undefined,
      });
      if (!saved) {
        setSaving(false);
        return;
      }
      if (status === "Completed") {
        await completeJobCard(saved.id, manualNextDate || undefined);
      }
      localStorage.removeItem(`job_card_draft_${vehicle.id}`);
      onSaved();
    } catch {
      toast.error("Failed to save job card");
    } finally {
      setSaving(false);
    }
  }

  function handleWhatsAppInvoice() {
    const partLines = partsUsed.map(
      (p) => `\u2022 ${p.productName} x${p.quantity} = ${fmt(p.lineTotal)}`,
    );
    const gstLine = gstEnabled ? `GST (${gstRate}%): ${fmt(gstAmount)}` : null;
    const lines = [
      `*Service Invoice \u2014 ${vehicle.vehicleNumber}*`,
      `Customer: ${vehicle.customerName}`,
      `Phone: ${vehicle.customerPhone}`,
      `Date: ${fmtDate(date)}`,
      "",
      `*Problem:* ${problem}`,
      `*Work Done:* ${workDone || "\u2014"}`,
      "",
      "*Parts Used:*",
      ...partLines,
      "",
      `Labour: ${fmt(labourCost)}`,
      ...(gstLine ? [gstLine] : []),
      `*Grand Total: ${fmt(grandTotal)}*`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const phone = vehicle.customerPhone.replace(/\D/g, "");
    const waUrl = phone
      ? `https://wa.me/91${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(waUrl, "_blank");
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 m-0 w-full h-full max-w-none max-h-none border-0 bg-black/50"
      data-ocid="service.job_card.dialog"
      aria-label="Job Card"
    >
      <div className="w-full sm:max-w-2xl bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="font-bold text-foreground text-base">
              {existingCard ? "Edit Job Card" : "New Job Card"}
            </p>
            <p className="text-xs text-muted-foreground">
              {vehicle.vehicleNumber} · {vehicle.customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            data-ocid="service.job_card.close_button"
            aria-label="Close job card"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="jc-date"
                className="text-xs font-semibold text-muted-foreground block mb-1.5"
              >
                Date
              </label>
              <Input
                id="jc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="service.job_card.date.input"
              />
            </div>
            <div>
              <label
                htmlFor="jc-status"
                className="text-xs font-semibold text-muted-foreground block mb-1.5"
              >
                Status
              </label>
              <select
                id="jc-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobCardStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-ocid="service.job_card.status.select"
              >
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="OnHold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Problem */}
          <div>
            <label
              htmlFor="jc-problem"
              className="text-xs font-semibold text-muted-foreground block mb-1.5"
            >
              Problem Description *
            </label>
            <textarea
              id="jc-problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={2}
              placeholder="Describe the issue..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              data-ocid="service.job_card.problem.textarea"
            />
          </div>

          {/* Work Done */}
          <div>
            <label
              htmlFor="jc-work"
              className="text-xs font-semibold text-muted-foreground block mb-1.5"
            >
              Work Done
            </label>
            <textarea
              id="jc-work"
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows={2}
              placeholder="Describe work performed..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              data-ocid="service.job_card.work_done.textarea"
            />
          </div>

          {/* Parts Used */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Parts Used
            </p>
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search parts from inventory..."
                value={partSearch}
                onChange={(e) => {
                  setPartSearch(e.target.value);
                  setShowPartDropdown(true);
                }}
                onFocus={() => setShowPartDropdown(true)}
                className="pl-9"
                data-ocid="service.job_card.part_search.input"
                aria-label="Search parts"
              />
              {showPartDropdown && partSearch && (
                <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto mt-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 text-center">
                      No products found
                    </p>
                  ) : (
                    filteredProducts.map((p) => {
                      const stock = getProductStock(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addPart(p.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {stock} {p.unit}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-foreground ml-2 flex-shrink-0">
                            {fmt(p.sellingPrice)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {partsUsed.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">
                        Part
                      </th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-muted-foreground w-20">
                        Qty
                      </th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">
                        Total
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {partsUsed.map((part, idx) => (
                      <tr
                        key={part.productId}
                        data-ocid={`service.job_card.part.${idx + 1}`}
                      >
                        <td className="px-3 py-2 text-foreground font-medium truncate max-w-[140px]">
                          {part.productName}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={1}
                            value={part.quantity}
                            onChange={(e) =>
                              updatePartQty(
                                idx,
                                Math.max(1, Number(e.target.value)),
                              )
                            }
                            className="h-7 text-center text-xs w-full"
                            aria-label={`Quantity for ${part.productName}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-foreground font-semibold">
                          {fmt(part.lineTotal)}
                        </td>
                        <td className="px-1 py-2">
                          <button
                            type="button"
                            onClick={() => removePart(idx)}
                            className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                            data-ocid={`service.job_card.remove_part.${idx + 1}`}
                            aria-label={`Remove ${part.productName}`}
                          >
                            <X size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground"
                data-ocid="service.parts.empty_state"
              >
                <Package size={20} className="mx-auto mb-1 opacity-30" />
                No parts added yet
              </div>
            )}
          </div>

          {/* Labour */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Labour
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="jc-labour-hrs"
                  className="text-xs text-muted-foreground block mb-1"
                >
                  Hours
                </label>
                <Input
                  id="jc-labour-hrs"
                  type="number"
                  min={0}
                  step={0.5}
                  value={labourHours}
                  onChange={(e) => setLabourHours(Number(e.target.value))}
                  data-ocid="service.job_card.labour_hours.input"
                />
              </div>
              <div>
                <label
                  htmlFor="jc-labour-rate"
                  className="text-xs text-muted-foreground block mb-1"
                >
                  Rate / hr (₹)
                </label>
                <Input
                  id="jc-labour-rate"
                  type="number"
                  min={0}
                  value={labourRate}
                  onChange={(e) => setLabourRate(Number(e.target.value))}
                  data-ocid="service.job_card.labour_rate.input"
                />
              </div>
            </div>
            {labourCost > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Labour cost:{" "}
                <span className="font-bold text-foreground">
                  {fmt(labourCost)}
                </span>
              </p>
            )}
          </div>

          {/* GST Toggle */}
          <div className="flex items-center justify-between py-2 border-y border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">GST</p>
              <p className="text-xs text-muted-foreground">
                {gstEnabled
                  ? `CGST ${gstRate / 2}% + SGST ${gstRate / 2}%`
                  : "GST not applied"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {gstEnabled && (
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="h-7 rounded border border-input bg-background px-2 text-xs"
                  data-ocid="service.job_card.gst_rate.select"
                  aria-label="GST rate"
                >
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={gstEnabled}
                onClick={() => setGstEnabled((v) => !v)}
                data-ocid="service.job_card.gst.toggle"
                aria-label="Toggle GST"
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${gstEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${gstEnabled ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Parts Subtotal</span>
              <span className="font-medium">{fmt(partSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Labour</span>
              <span className="font-medium">{fmt(labourCost)}</span>
            </div>
            {gstEnabled && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    CGST ({gstRate / 2}%)
                  </span>
                  <span className="font-medium">{fmt(gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    SGST ({gstRate / 2}%)
                  </span>
                  <span className="font-medium">{fmt(gstAmount / 2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-base font-bold border-t border-border pt-1.5 mt-1.5">
              <span>Grand Total</span>
              <span className="text-primary">{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="jc-notes"
              className="text-xs font-semibold text-muted-foreground block mb-1.5"
            >
              Notes (optional)
            </label>
            <Input
              id="jc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              data-ocid="service.job_card.notes.input"
            />
          </div>

          {/* Next service date */}
          {status === "Completed" && (
            <div>
              <label
                htmlFor="jc-next-date"
                className="text-xs font-semibold text-muted-foreground block mb-1.5"
              >
                Next Service Date (leave blank to use{" "}
                {vehicle.nextServiceIntervalDays}-day interval)
              </label>
              <Input
                id="jc-next-date"
                type="date"
                value={manualNextDate}
                onChange={(e) => setManualNextDate(e.target.value)}
                data-ocid="service.job_card.next_date.input"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="service.job_card.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsAppInvoice}
              className="px-3"
              data-ocid="service.job_card.whatsapp_button"
              aria-label="Share via WhatsApp"
            >
              📱
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              data-ocid="service.job_card.save_button"
            >
              {saving && <Loader2 size={15} className="animate-spin mr-1" />}
              {status === "Completed" ? "Complete & Save" : "Save Job Card"}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

// ─── Register Vehicle Form ────────────────────────────────────────────────────
interface RegisterVehicleFormProps {
  prefillNumber: string;
  shopId: string;
  onRegistered: (vehicle: VehicleRecord) => void;
  onCancel: () => void;
}

function RegisterVehicleForm({
  prefillNumber,
  shopId,
  onRegistered,
  onCancel,
}: RegisterVehicleFormProps) {
  const { saveVehicleRecord } = useVehicleService(shopId);
  const [vehicleNumber, setVehicleNumber] = useState(
    prefillNumber.toUpperCase(),
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [intervalDays, setIntervalDays] = useState(90);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleNumber.trim() || !customerName.trim()) {
      toast.error("Vehicle number and customer name are required");
      return;
    }
    setSaving(true);
    const result = await saveVehicleRecord({
      vehicleNumber: vehicleNumber.toUpperCase(),
      customerName,
      customerPhone,
      vehicleModel,
      vehicleType: vehicleType as VehicleRecord["vehicleType"],
      nextServiceIntervalDays: intervalDays,
    });
    setSaving(false);
    if (result) onRegistered(result);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-card border border-border rounded-2xl"
      data-ocid="service.register_vehicle.panel"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
          <Car size={15} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            Register New Vehicle
          </p>
          <p className="text-xs text-muted-foreground">
            Vehicle not found — create a record
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="reg-vnum"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Vehicle Number *
          </label>
          <Input
            id="reg-vnum"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="RJ14 AB 1234"
            required
            data-ocid="service.register.vehicle_number.input"
          />
        </div>
        <div>
          <label
            htmlFor="reg-vtype"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Vehicle Type
          </label>
          <select
            id="reg-vtype"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-ocid="service.register.vehicle_type.select"
          >
            {["Car", "Bike", "Truck", "Scooter", "Auto", "Other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="reg-cname"
          className="text-xs font-semibold text-muted-foreground block mb-1"
        >
          Customer Name *
        </label>
        <Input
          id="reg-cname"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Owner name"
          required
          data-ocid="service.register.customer_name.input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="reg-phone"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Phone
          </label>
          <Input
            id="reg-phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Mobile number"
            type="tel"
            data-ocid="service.register.customer_phone.input"
          />
        </div>
        <div>
          <label
            htmlFor="reg-model"
            className="text-xs font-semibold text-muted-foreground block mb-1"
          >
            Vehicle Model
          </label>
          <Input
            id="reg-model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="e.g. Pulsar 150"
            data-ocid="service.register.vehicle_model.input"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
          Service Interval (days)
        </p>
        <div className="flex gap-2">
          {[30, 60, 90, 180, 365].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setIntervalDays(d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${intervalDays === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted/50"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-ocid="service.register.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1"
          data-ocid="service.register.submit_button"
        >
          {saving && <Loader2 size={14} className="animate-spin mr-1" />}
          Register Vehicle
        </Button>
      </div>
    </form>
  );
}

// ─── Vehicle History Timeline ─────────────────────────────────────────────────
function VehicleHistoryTimeline({
  jobCards,
  onOpenCard,
}: {
  jobCards: JobCard[];
  onOpenCard: (card: JobCard) => void;
}) {
  if (jobCards.length === 0) {
    return (
      <div
        className="text-center py-8 text-muted-foreground"
        data-ocid="service.history.empty_state"
      >
        <Wrench size={28} className="mx-auto mb-2 opacity-20" />
        <p className="text-sm">No service history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="service.history.list">
      {jobCards.map((card, idx) => (
        <button
          key={card.id}
          type="button"
          data-ocid={`service.history.item.${idx + 1}`}
          onClick={() => onOpenCard(card)}
          className="w-full flex items-start gap-3 p-3.5 bg-card border border-border rounded-xl hover:bg-muted/40 transition-colors text-left active:scale-[0.99]"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Wrench size={14} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <StatusBadge status={card.status} />
              <span className="text-xs text-muted-foreground">
                {fmtDate(card.date)}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">
              {card.problemDescription || "No description"}
            </p>
            {card.partsUsed.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.partsUsed.length} part
                {card.partsUsed.length !== 1 ? "s" : ""} used
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold text-foreground">
              {fmt(card.grandTotal)}
            </p>
            <ChevronRight
              size={13}
              className="text-muted-foreground ml-auto mt-0.5"
            />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Quick New Job Card Modal ─────────────────────────────────────────────────
// Opens from the header button — user enters vehicle number first, then
// either existing vehicle is loaded or a new one is registered, then
// JobCardModal opens normally.
interface QuickJobCardModalProps {
  shopId: string;
  vehicleRecords: VehicleRecord[];
  onClose: () => void;
  onVehicleReady: (vehicle: VehicleRecord) => void;
}

function QuickJobCardModal({
  shopId,
  vehicleRecords,
  onClose,
  onVehicleReady,
}: QuickJobCardModalProps) {
  const [vehicleInput, setVehicleInput] = useState("");
  const [step, setStep] = useState<"enter" | "register">("enter");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleLookup() {
    const q = vehicleInput.trim().toUpperCase();
    if (!q) {
      toast.error("Please enter a vehicle number");
      return;
    }
    const found = vehicleRecords.find((v) => v.vehicleNumber === q);
    if (found) {
      onVehicleReady(found);
    } else {
      setStep("register");
    }
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 m-0 w-full h-full max-w-none max-h-none border-0"
      data-ocid="service.quick_job_card.dialog"
      aria-label="Quick New Job Card"
    >
      <div className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">New Job Card</p>
              <p className="text-xs text-muted-foreground">
                {step === "enter"
                  ? "Enter vehicle number to continue"
                  : "Register vehicle to continue"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            data-ocid="service.quick_job_card.close_button"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {step === "enter" ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quick-vnum"
                  className="text-xs font-semibold text-muted-foreground block mb-1.5"
                >
                  Vehicle Number *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Car
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      id="quick-vnum"
                      ref={inputRef}
                      value={vehicleInput}
                      onChange={(e) =>
                        setVehicleInput(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                      placeholder="e.g. RJ14AB1234"
                      className="pl-9 uppercase font-mono tracking-wider"
                      data-ocid="service.quick_job_card.vehicle_number.input"
                    />
                  </div>
                  <Button
                    onClick={handleLookup}
                    data-ocid="service.quick_job_card.lookup_button"
                    aria-label="Look up vehicle"
                  >
                    <Search size={15} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  If the vehicle exists, its record will be loaded
                  automatically. If new, you'll register it first.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  data-ocid="service.quick_job_card.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLookup}
                  className="flex-1"
                  data-ocid="service.quick_job_card.continue_button"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-sm">
                <AlertTriangle
                  size={15}
                  className="text-amber-500 flex-shrink-0"
                />
                <span className="text-muted-foreground">
                  Vehicle{" "}
                  <span className="font-bold text-foreground">
                    {vehicleInput}
                  </span>{" "}
                  not found — register it first
                </span>
              </div>
              <RegisterVehicleForm
                prefillNumber={vehicleInput}
                shopId={shopId}
                onRegistered={(v) => onVehicleReady(v)}
                onCancel={() => setStep("enter")}
              />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ServiceRepairPage() {
  const { session } = useAuth();
  const shopId = session?.shopId ?? "";
  const {
    vehicleRecords,
    isLoading,
    snoozeReminder,
    dismissReminder,
    getVehicleHistory,
    getDueReminders,
  } = useVehicleService(shopId);

  const [activeTab, setActiveTab] = useState<"search" | "all">("search");
  const [searchInput, setSearchInput] = useState("");
  const [searchedVehicle, setSearchedVehicle] = useState<
    VehicleRecord | null | undefined
  >(undefined);
  const [showRegister, setShowRegister] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(
    null,
  );
  const [editingCard, setEditingCard] = useState<JobCard | undefined>(
    undefined,
  );
  const [allVehicleSearch, setAllVehicleSearch] = useState("");

  const dueReminders = useMemo(() => getDueReminders(), [getDueReminders]);

  function handleSearch() {
    const q = searchInput.trim().toUpperCase();
    if (!q) {
      toast.error("Enter a vehicle number");
      return;
    }
    const found = vehicleRecords.find((v) => v.vehicleNumber === q);
    if (found) {
      setSearchedVehicle(found);
      setShowRegister(false);
    } else {
      setSearchedVehicle(null);
      setShowRegister(true);
    }
  }

  function openNewJobCard(vehicle: VehicleRecord) {
    setSelectedVehicle(vehicle);
    setEditingCard(undefined);
    setShowJobModal(true);
  }

  function openEditJobCard(vehicle: VehicleRecord, card: JobCard) {
    setSelectedVehicle(vehicle);
    setEditingCard(card);
    setShowJobModal(true);
  }

  const filteredAllVehicles = useMemo(() => {
    const q = allVehicleSearch.trim().toLowerCase();
    if (!q) return vehicleRecords;
    return vehicleRecords.filter(
      (v) =>
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.customerName.toLowerCase().includes(q),
    );
  }, [vehicleRecords, allVehicleSearch]);

  const vehicleHistory = searchedVehicle
    ? getVehicleHistory(searchedVehicle.vehicleNumber)
    : [];

  return (
    <div
      className="flex flex-col flex-1 bg-background"
      data-ocid="service.page"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
            <Wrench size={17} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-foreground">
              Service &amp; Repair
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Vehicle job cards &amp; service history
            </p>
          </div>
          {dueReminders.length > 0 && (
            <Badge
              variant="destructive"
              className="flex-shrink-0 hidden sm:flex"
            >
              {dueReminders.length} Due
            </Badge>
          )}
          {/* Prominent New Job Card button — always visible */}
          <Button
            size="sm"
            onClick={() => setShowQuickModal(true)}
            className="flex-shrink-0 gap-1.5 font-semibold shadow-sm"
            data-ocid="service.header.new_job_card.primary_button"
          >
            <Plus size={15} />
            <span className="hidden xs:inline">New Job Card</span>
            <span className="xs:hidden">Job Card</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-muted/50 rounded-xl p-1">
          {(["search", "all"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              data-ocid={`service.tab.${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "search"
                ? "🔍 Vehicle Search"
                : `🚗 All Vehicles (${vehicleRecords.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Due Reminders */}
        {dueReminders.length > 0 && (
          <div
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4"
            data-ocid="service.due_reminders.section"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell size={15} className="text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Service Due ({dueReminders.length})
              </p>
            </div>
            <div className="space-y-2">
              {dueReminders.map((r, idx) => {
                const days = daysUntil(r.dueDate);
                return (
                  <div
                    key={r.id}
                    data-ocid={`service.reminder.item.${idx + 1}`}
                    className="flex items-center justify-between gap-3 bg-card/70 rounded-xl p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {r.vehicleNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.customerName} ·{" "}
                        {days <= 0 ? (
                          <span className="text-red-600 font-semibold">
                            Overdue by {Math.abs(days)}d
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">
                            Due in {days}d
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {r.customerPhone && (
                        <button
                          type="button"
                          data-ocid={`service.reminder.whatsapp.${idx + 1}`}
                          onClick={() => {
                            const msg = encodeURIComponent(
                              `Hi ${r.customerName}, your vehicle ${r.vehicleNumber} is due for service. Please visit us.`,
                            );
                            window.open(
                              `https://wa.me/91${r.customerPhone.replace(/\D/g, "")}?text=${msg}`,
                              "_blank",
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                          WhatsApp
                        </button>
                      )}
                      <button
                        type="button"
                        data-ocid={`service.reminder.snooze.${idx + 1}`}
                        onClick={() => snoozeReminder(r.id, 7)}
                        className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                      >
                        Snooze 7d
                      </button>
                      <button
                        type="button"
                        data-ocid={`service.reminder.dismiss.${idx + 1}`}
                        onClick={() => dismissReminder(r.id)}
                        aria-label="Dismiss reminder"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Vehicle Search Tab ── */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Car
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  placeholder="Enter vehicle number e.g. RJ14AB1234"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 uppercase"
                  data-ocid="service.vehicle_search.input"
                  aria-label="Vehicle number search"
                />
              </div>
              <Button
                onClick={handleSearch}
                data-ocid="service.vehicle_search.button"
                aria-label="Search vehicle"
              >
                <Search size={15} />
              </Button>
            </div>

            {isLoading && (
              <div
                className="flex items-center justify-center py-10"
                data-ocid="service.loading_state"
              >
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
            )}

            {/* Vehicle found */}
            {searchedVehicle && !showRegister && (
              <div className="space-y-4">
                <div
                  className="bg-card border border-border rounded-2xl p-4"
                  data-ocid="service.vehicle_info.card"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                        <Car
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg leading-tight">
                          {searchedVehicle.vehicleNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchedVehicle.vehicleModel ||
                            searchedVehicle.vehicleType ||
                            "Vehicle"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openNewJobCard(searchedVehicle)}
                      data-ocid="service.new_job_card.button"
                    >
                      <Plus size={13} className="mr-1" /> New Job Card
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-semibold text-foreground">
                        {searchedVehicle.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Phone size={12} />
                        {searchedVehicle.customerPhone || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Service
                      </p>
                      <p className="font-semibold text-foreground">
                        {fmtDate(searchedVehicle.lastServiceDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p
                        className={`font-semibold ${daysUntil(searchedVehicle.nextDueDate) <= 0 ? "text-red-600" : daysUntil(searchedVehicle.nextDueDate) <= 7 ? "text-amber-600" : "text-foreground"}`}
                      >
                        {fmtDate(searchedVehicle.nextDueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Services
                      </p>
                      <p className="font-semibold text-foreground">
                        {searchedVehicle.totalServiceCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Service Interval
                      </p>
                      <p className="font-semibold text-foreground">
                        {searchedVehicle.nextServiceIntervalDays} days
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Service History
                  </p>
                  <VehicleHistoryTimeline
                    jobCards={vehicleHistory}
                    onOpenCard={(card) =>
                      openEditJobCard(searchedVehicle, card)
                    }
                  />
                </div>
              </div>
            )}

            {/* Not found */}
            {searchedVehicle === null && showRegister && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl text-sm text-muted-foreground">
                  <AlertTriangle
                    size={15}
                    className="text-amber-500 flex-shrink-0"
                  />
                  Vehicle{" "}
                  <span className="font-bold text-foreground mx-1">
                    {searchInput}
                  </span>{" "}
                  not found — register below
                </div>
                <RegisterVehicleForm
                  prefillNumber={searchInput}
                  shopId={shopId}
                  onRegistered={(v) => {
                    setSearchedVehicle(v);
                    setShowRegister(false);
                    openNewJobCard(v);
                  }}
                  onCancel={() => {
                    setShowRegister(false);
                    setSearchedVehicle(undefined);
                  }}
                />
              </div>
            )}

            {searchedVehicle === undefined && !isLoading && (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="service.search.empty_state"
              >
                <Car size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  Enter a vehicle number to search
                </p>
                <p className="text-xs mt-1">
                  Search by vehicle number to view history or create a new job
                  card
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── All Vehicles Tab ── */}
        {activeTab === "all" && (
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search by vehicle number or customer..."
                value={allVehicleSearch}
                onChange={(e) => setAllVehicleSearch(e.target.value)}
                className="pl-9"
                data-ocid="service.all_vehicles.search_input"
                aria-label="Search vehicles"
              />
            </div>

            {filteredAllVehicles.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="service.all_vehicles.empty_state"
              >
                <Car size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  {vehicleRecords.length === 0
                    ? "No vehicles registered yet"
                    : "No vehicles match your search"}
                </p>
                {vehicleRecords.length === 0 && (
                  <p className="text-xs mt-1">
                    Use Vehicle Search tab to add your first vehicle
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2" data-ocid="service.all_vehicles.list">
                {filteredAllVehicles.map((vehicle, idx) => {
                  const due = daysUntil(vehicle.nextDueDate);
                  const isOverdue = due <= 0;
                  const isDueSoon = due > 0 && due <= 7;
                  return (
                    <div
                      key={vehicle.id}
                      data-ocid={`service.vehicle.item.${idx + 1}`}
                      className={`bg-card border rounded-2xl p-4 ${isOverdue ? "border-red-300 dark:border-red-800/50" : isDueSoon ? "border-amber-300 dark:border-amber-800/50" : "border-border"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? "bg-red-100 dark:bg-red-950/40" : isDueSoon ? "bg-amber-100 dark:bg-amber-950/40" : "bg-muted"}`}
                          >
                            <Car
                              size={16}
                              className={
                                isOverdue
                                  ? "text-red-600"
                                  : isDueSoon
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                              }
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground">
                              {vehicle.vehicleNumber}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {vehicle.customerName} ·{" "}
                              {vehicle.vehicleModel ||
                                vehicle.vehicleType ||
                                "Vehicle"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSearchInput(vehicle.vehicleNumber);
                              setSearchedVehicle(vehicle);
                              setActiveTab("search");
                            }}
                            data-ocid={`service.vehicle.history.${idx + 1}`}
                            className="text-xs"
                          >
                            <FileText size={12} className="mr-1" /> History
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openNewJobCard(vehicle)}
                            data-ocid={`service.vehicle.new_job.${idx + 1}`}
                            className="text-xs"
                          >
                            <Plus size={12} className="mr-1" /> Job
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3 pt-2 border-t border-border/50 text-xs">
                        <div>
                          <span className="text-muted-foreground">Last: </span>
                          <span className="font-medium text-foreground">
                            {fmtDate(vehicle.lastServiceDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next: </span>
                          <span
                            className={`font-semibold ${isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-foreground"}`}
                          >
                            {isOverdue
                              ? `⚠️ Overdue (${Math.abs(due)}d)`
                              : isDueSoon
                                ? `⏰ In ${due}d`
                                : fmtDate(vehicle.nextDueDate)}
                          </span>
                        </div>
                        <div className="ml-auto">
                          <span className="text-muted-foreground">
                            Services:{" "}
                          </span>
                          <span className="font-semibold text-foreground">
                            {vehicle.totalServiceCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Card Modal */}
      {showJobModal && selectedVehicle && (
        <JobCardModal
          vehicle={selectedVehicle}
          existingCard={editingCard}
          shopId={shopId}
          onClose={() => setShowJobModal(false)}
          onSaved={() => {
            setShowJobModal(false);
            toast.success("Job card saved!");
            const updated = vehicleRecords.find(
              (v) => v.id === selectedVehicle.id,
            );
            if (updated) setSearchedVehicle(updated);
          }}
        />
      )}

      {/* Quick New Job Card Modal — opened from header button */}
      {showQuickModal && (
        <QuickJobCardModal
          shopId={shopId}
          vehicleRecords={vehicleRecords}
          onClose={() => setShowQuickModal(false)}
          onVehicleReady={(vehicle) => {
            setShowQuickModal(false);
            openNewJobCard(vehicle);
          }}
        />
      )}
    </div>
  );
}
