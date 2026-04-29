import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  FileText,
  Key,
  Loader2,
  Package,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import type { RentalRateType, RentalRecord } from "../types/store";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function calcDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.ceil((e - s) / 86400000));
}

function calcAmount(
  rateType: RentalRateType,
  rateAmount: number,
  startDate: string,
  endDate: string,
): number {
  if (!startDate || !endDate || rateAmount <= 0) return 0;
  const days = calcDays(startDate, endDate);
  if (rateType === "daily") return days * rateAmount;
  if (rateType === "weekly") return Math.ceil(days / 7) * rateAmount;
  return Math.ceil(days / 30) * rateAmount;
}

function overduedays(endDate: string): number {
  const today = new Date().setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((today - end) / 86400000));
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RentalRecord["status"] }) {
  if (status === "Active")
    return (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0 text-xs">
        Active
      </Badge>
    );
  if (status === "Overdue")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0 text-xs">
        Overdue
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-xs">
      Returned
    </Badge>
  );
}

// ─── Return Modal ─────────────────────────────────────────────────────────────
interface ReturnModalProps {
  rental: RentalRecord;
  onClose: () => void;
  onConfirm: (
    id: string,
    returnedDate: string,
    damageNotes?: string,
    extraCharge?: number,
  ) => void;
}

function ReturnModal({ rental, onClose, onConfirm }: ReturnModalProps) {
  const [returnedDate, setReturnedDate] = useState(todayStr());
  const [damageNotes, setDamageNotes] = useState("");
  const [extraCharge, setExtraCharge] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handle = () => {
    setSaving(true);
    setTimeout(() => {
      onConfirm(
        rental.id,
        returnedDate,
        damageNotes || undefined,
        extraCharge ? Number(extraCharge) : undefined,
      );
      setSaving(false);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
      data-ocid="rental.return_modal.dialog"
    >
      <div className="bg-card rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-base">
            Mark as Returned
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="rental.return_modal.close_button"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
          <div className="font-medium text-foreground">{rental.itemName}</div>
          <div className="text-muted-foreground">
            {rental.customerName} · {rental.customerPhone}
          </div>
          <div className="text-muted-foreground">
            {fmtDate(rental.startDate)} → {fmtDate(rental.endDate)}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="return-date" className="text-xs font-medium">
              Return Date
            </Label>
            <Input
              id="return-date"
              type="date"
              value={returnedDate}
              onChange={(e) => setReturnedDate(e.target.value)}
              className="mt-1"
              data-ocid="rental.return_date.input"
            />
          </div>
          <div>
            <Label htmlFor="damage-notes" className="text-xs font-medium">
              Damage Notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="damage-notes"
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              placeholder="e.g. Minor scratch on surface"
              className="mt-1"
              data-ocid="rental.damage_notes.input"
            />
          </div>
          <div>
            <Label htmlFor="extra-charge" className="text-xs font-medium">
              Extra Charge{" "}
              <span className="text-muted-foreground">(optional, ₹)</span>
            </Label>
            <Input
              id="extra-charge"
              type="number"
              min="0"
              value={extraCharge}
              onChange={(e) => setExtraCharge(e.target.value)}
              placeholder="0"
              className="mt-1"
              data-ocid="rental.extra_charge.input"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClose}
            data-ocid="rental.return_modal.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handle}
            disabled={saving}
            data-ocid="rental.return_modal.confirm_button"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            <span className="ml-1">Confirm Return</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Rental Form ────────────────────────────────────────────────────────
interface CreateRentalFormProps {
  onCreated: () => void;
}

function CreateRentalForm({ onCreated }: CreateRentalFormProps) {
  const { products, getProductStock, addRental } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [rateType, setRateType] = useState<RentalRateType>("daily");
  const [rateAmount, setRateAmount] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [productDropdown, setProductDropdown] = useState(false);

  const filteredProducts = useMemo(
    () =>
      itemSearch.trim().length >= 1
        ? products.filter((p) =>
            p.name.toLowerCase().includes(itemSearch.toLowerCase()),
          )
        : [],
    [products, itemSearch],
  );

  const totalAmount = useMemo(
    () => calcAmount(rateType, Number(rateAmount) || 0, startDate, endDate),
    [rateType, rateAmount, startDate, endDate],
  );

  const days = useMemo(
    () => (startDate && endDate ? calcDays(startDate, endDate) : 0),
    [startDate, endDate],
  );

  const handleSelectProduct = (p: { id: string; name: string }) => {
    setSelectedProductId(p.id);
    setItemName(p.name);
    setItemSearch(p.name);
    setProductDropdown(false);
  };

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!itemName.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!rateAmount || Number(rateAmount) <= 0) {
      toast.error("Enter a valid rate amount");
      return;
    }
    if (!startDate || !endDate || endDate <= startDate) {
      toast.error("Return date must be after start date");
      return;
    }
    if (selectedProductId) {
      const available = getProductStock(selectedProductId);
      if (available < quantity) {
        toast.error(`Only ${available} units in stock`);
        return;
      }
    }

    setSaving(true);
    try {
      addRental({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        itemName: itemName.trim(),
        productId: selectedProductId || undefined,
        quantity,
        startDate,
        endDate,
        rateType,
        rateAmount: Number(rateAmount),
        depositAmount: Number(depositAmount) || 0,
        totalAmount,
        notes: notes.trim() || undefined,
      });
      toast.success("Rental created successfully");
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 p-1" data-ocid="rental.create_form">
      {/* Customer */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <User size={14} className="text-primary" />
          Customer Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="c-name" className="text-xs font-medium">
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="c-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="mt-1"
              data-ocid="rental.customer_name.input"
            />
          </div>
          <div>
            <Label htmlFor="c-phone" className="text-xs font-medium">
              Phone Number
            </Label>
            <Input
              id="c-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="9876543210"
              type="tel"
              className="mt-1"
              data-ocid="rental.customer_phone.input"
            />
          </div>
        </div>
      </div>

      {/* Item */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package size={14} className="text-primary" />
          Item Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Label htmlFor="item-search" className="text-xs font-medium">
              Item Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="item-search"
                value={itemSearch}
                onChange={(e) => {
                  setItemSearch(e.target.value);
                  setItemName(e.target.value);
                  setSelectedProductId("");
                  setProductDropdown(true);
                }}
                onFocus={() => setProductDropdown(true)}
                placeholder="Search or type item name"
                className="pl-8"
                data-ocid="rental.item_name.input"
              />
            </div>
            {productDropdown && filteredProducts.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
                    onClick={() => handleSelectProduct(p)}
                  >
                    <span className="font-medium truncate">{p.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      Stock: {getProductStock(p.id)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="qty" className="text-xs font-medium">
              Quantity
            </Label>
            <Input
              id="qty"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="mt-1"
              data-ocid="rental.quantity.input"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          Rental Period
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="start-date" className="text-xs font-medium">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
              data-ocid="rental.start_date.input"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-xs font-medium">
              Expected Return <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
              data-ocid="rental.end_date.input"
            />
          </div>
        </div>
        {days > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Duration: {days} day{days !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Rate */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText size={14} className="text-primary" />
          Pricing
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium">Rate Type</Label>
            <div className="flex gap-2 mt-1">
              {(["daily", "weekly", "monthly"] as RentalRateType[]).map(
                (rt) => (
                  <button
                    type="button"
                    key={rt}
                    onClick={() => setRateType(rt)}
                    data-ocid={`rental.rate_type.${rt}`}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      rateType === rt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {rt.charAt(0).toUpperCase() + rt.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rate-amount" className="text-xs font-medium">
                Rate Amount (₹/{rateType}){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rate-amount"
                type="number"
                min="0"
                value={rateAmount}
                onChange={(e) => setRateAmount(e.target.value)}
                placeholder="0"
                className="mt-1"
                data-ocid="rental.rate_amount.input"
              />
            </div>
            <div>
              <Label htmlFor="deposit" className="text-xs font-medium">
                Deposit Amount (₹)
              </Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="mt-1"
                data-ocid="rental.deposit_amount.input"
              />
            </div>
          </div>
          {totalAmount > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-foreground font-medium">
                Estimated Total
              </span>
              <span className="text-base font-bold text-primary">
                {fmt(totalAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-xs font-medium">
          Notes <span className="text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          data-ocid="rental.notes.textarea"
        />
      </div>

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={saving}
        data-ocid="rental.create_submit_button"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )}
        <span className="ml-1.5">Create Rental</span>
      </Button>
    </div>
  );
}

// ─── Rental Card (mobile) ─────────────────────────────────────────────────────
interface RentalCardProps {
  rental: RentalRecord;
  onReturn: (r: RentalRecord) => void;
  onDelete: (id: string) => void;
  onInvoice: (r: RentalRecord) => void;
}

function RentalCard({
  rental,
  onReturn,
  onDelete,
  onInvoice,
}: RentalCardProps) {
  const today = todayStr();
  const isOverdue = rental.status !== "Returned" && rental.endDate < today;
  const od = isOverdue ? overduedays(rental.endDate) : 0;

  return (
    <div
      className={`rounded-xl border bg-card p-4 space-y-3 ${isOverdue ? "border-red-400/60 bg-red-50/20 dark:bg-red-950/10" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm truncate">
            {rental.itemName}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-xs">
            <User size={10} />
            <span className="truncate">{rental.customerName}</span>
            {rental.customerPhone && (
              <>
                <Phone size={10} className="ml-1" />
                <span>{rental.customerPhone}</span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={isOverdue ? "Overdue" : rental.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <div className="text-muted-foreground mb-0.5">Start</div>
          <div className="font-medium text-foreground">
            {fmtDate(rental.startDate)}
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <div className="text-muted-foreground mb-0.5">Due</div>
          <div
            className={`font-medium ${isOverdue ? "text-red-600 dark:text-red-400" : "text-foreground"}`}
          >
            {fmtDate(rental.endDate)}
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <div className="text-muted-foreground mb-0.5">Amount</div>
          <div className="font-semibold text-primary">
            {fmt(rental.totalAmount)}
          </div>
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
          <AlertTriangle size={12} />
          {od} day{od !== 1 ? "s" : ""} overdue
        </div>
      )}

      {rental.status === "Returned" && rental.returnedDate && (
        <div className="text-xs text-muted-foreground">
          Returned: {fmtDate(rental.returnedDate)}
          {rental.extraCharge ? ` · Extra: ${fmt(rental.extraCharge)}` : ""}
          {rental.damageNotes ? ` · ${rental.damageNotes}` : ""}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {rental.status !== "Returned" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onReturn(rental)}
            data-ocid={`rental.return_button.${rental.id}`}
          >
            <ArrowDownLeft size={12} className="mr-1" />
            Return
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={() => onInvoice(rental)}
          data-ocid={`rental.invoice_button.${rental.id}`}
        >
          <FileText size={12} className="mr-1" />
          Invoice
        </Button>
        <button
          type="button"
          onClick={() => onDelete(rental.id)}
          data-ocid={`rental.delete_button.${rental.id}`}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({
  rental,
  onClose,
}: {
  rental: RentalRecord;
  onClose: () => void;
}) {
  const today = todayStr();
  const days = calcDays(rental.startDate, rental.endDate);
  const extra = rental.extraCharge ?? 0;
  const total = rental.totalAmount + extra;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `*Rental Invoice*\n\nItem: ${rental.itemName}\nQty: ${rental.quantity}\nCustomer: ${rental.customerName}\nPhone: ${rental.customerPhone || "—"}\n\nStart: ${fmtDate(rental.startDate)}\nDue: ${fmtDate(rental.endDate)}\nDuration: ${days} day(s)\n\nRate: ₹${rental.rateAmount}/${rental.rateType}\nRental Amount: ₹${rental.totalAmount}${extra ? `\nExtra Charge: ₹${extra}` : ""}\nDeposit: ₹${rental.depositAmount}\n*Total: ₹${total}*\n\nStatus: ${rental.status}${rental.returnedDate ? `\nReturned: ${fmtDate(rental.returnedDate)}` : ""}`,
    );
    window.open(`https://wa.me/${rental.customerPhone}?text=${msg}`, "_blank");
  };

  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
      data-ocid="rental.invoice.dialog"
    >
      <div className="bg-card rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Rental Invoice</h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="rental.invoice.close_button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 print-area">
          <div className="text-center pb-2 border-b border-border">
            <div className="font-bold text-lg text-foreground">
              Rental Invoice
            </div>
            <div className="text-xs text-muted-foreground">{today}</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">Customer</div>
            <div className="font-medium text-right">{rental.customerName}</div>
            <div className="text-muted-foreground">Phone</div>
            <div className="font-medium text-right">
              {rental.customerPhone || "—"}
            </div>
            <div className="text-muted-foreground">Item</div>
            <div className="font-medium text-right">{rental.itemName}</div>
            <div className="text-muted-foreground">Quantity</div>
            <div className="font-medium text-right">{rental.quantity}</div>
            <div className="text-muted-foreground">Start Date</div>
            <div className="font-medium text-right">
              {fmtDate(rental.startDate)}
            </div>
            <div className="text-muted-foreground">Return Date</div>
            <div className="font-medium text-right">
              {fmtDate(rental.endDate)}
            </div>
            <div className="text-muted-foreground">Duration</div>
            <div className="font-medium text-right">
              {days} day{days !== 1 ? "s" : ""}
            </div>
            <div className="text-muted-foreground">Rate</div>
            <div className="font-medium text-right">
              ₹{rental.rateAmount}/{rental.rateType}
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rental Amount</span>
              <span>{fmt(rental.totalAmount)}</span>
            </div>
            {extra > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Extra Charge</span>
                <span>{fmt(extra)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit</span>
              <span>{fmt(rental.depositAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary">{fmt(total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <StatusBadge status={rental.status} />
            {rental.returnedDate && (
              <span className="text-xs text-muted-foreground">
                Returned {fmtDate(rental.returnedDate)}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
            data-ocid="rental.invoice.print_button"
          >
            Print
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleWhatsApp}
            data-ocid="rental.invoice.whatsapp_button"
          >
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabType = "active" | "create" | "history" | "ledger";

export function RentalPage() {
  const { rentals, returnRental, deleteRental, getActiveRentals } = useStore();

  const [tab, setTab] = useState<TabType>("active");
  const [returnTarget, setReturnTarget] = useState<RentalRecord | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<RentalRecord | null>(null);
  const [search, setSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");

  const activeRentals = useMemo(() => getActiveRentals(), [getActiveRentals]);

  const today = todayStr();
  const historyRentals = useMemo(
    () => rentals.filter((r) => r.status === "Returned"),
    [rentals],
  );

  const overdueCount = useMemo(
    () => activeRentals.filter((r) => r.endDate < today).length,
    [activeRentals, today],
  );

  const filteredActive = useMemo(() => {
    if (!search.trim()) return activeRentals;
    const q = search.toLowerCase();
    return activeRentals.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q),
    );
  }, [activeRentals, search]);

  // Per-customer ledger
  const customerLedger = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        phone: string;
        rentals: RentalRecord[];
        totalPaid: number;
        totalOutstanding: number;
      }
    > = {};
    for (const r of rentals) {
      const key = r.customerPhone || r.customerName;
      if (!map[key]) {
        map[key] = {
          name: r.customerName,
          phone: r.customerPhone,
          rentals: [],
          totalPaid: 0,
          totalOutstanding: 0,
        };
      }
      map[key].rentals.push(r);
      if (r.status === "Returned") {
        map[key].totalPaid += r.totalAmount + (r.extraCharge ?? 0);
      } else {
        map[key].totalOutstanding +=
          r.totalAmount + (r.extraCharge ?? 0) - r.depositAmount;
      }
    }
    return Object.values(map);
  }, [rentals]);

  const filteredLedger = useMemo(() => {
    if (!ledgerSearch.trim()) return customerLedger;
    const q = ledgerSearch.toLowerCase();
    return customerLedger.filter(
      (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q),
    );
  }, [customerLedger, ledgerSearch]);

  const handleReturn = (r: RentalRecord) => setReturnTarget(r);
  const handleInvoice = (r: RentalRecord) => setInvoiceTarget(r);
  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this rental record?")) return;
    deleteRental(id);
    toast.success("Rental deleted");
  };

  const confirmReturn = (
    id: string,
    returnedDate: string,
    damageNotes?: string,
    extraCharge?: number,
  ) => {
    returnRental(id, returnedDate, damageNotes, extraCharge);
    setReturnTarget(null);
    toast.success("Item marked as returned");
  };

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    {
      id: "active",
      label: "Active Rentals",
      badge: activeRentals.length || undefined,
    },
    { id: "create", label: "New Rental" },
    {
      id: "history",
      label: "History",
      badge: historyRentals.length || undefined,
    },
    { id: "ledger", label: "Ledger" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Key size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Rental / Lending
          </h1>
          <p className="text-xs text-muted-foreground">
            Track rental items and lending transactions
          </p>
        </div>
        {overdueCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold">
            <AlertTriangle size={13} />
            {overdueCount} overdue
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            data-ocid={`rental.tab.${t.id}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span
                className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                  tab === t.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Rentals Tab */}
      {tab === "active" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, item, or phone..."
              className="pl-9"
              data-ocid="rental.active_search.input"
            />
          </div>

          {filteredActive.length === 0 ? (
            <div
              className="text-center py-16 space-y-3"
              data-ocid="rental.active.empty_state"
            >
              <div className="text-4xl">🔑</div>
              <p className="font-medium text-foreground">No active rentals</p>
              <p className="text-sm text-muted-foreground">
                Create a new rental to get started
              </p>
              <Button
                size="sm"
                onClick={() => setTab("create")}
                data-ocid="rental.empty_create_button"
              >
                <Plus size={13} className="mr-1" /> New Rental
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Item
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Start
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Due Date
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActive.map((r, i) => {
                      const isOverdue = r.endDate < today;
                      const od = isOverdue ? overduedays(r.endDate) : 0;
                      return (
                        <tr
                          key={r.id}
                          data-ocid={`rental.active.item.${i + 1}`}
                          className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${isOverdue ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div>{r.itemName}</div>
                            <div className="text-xs text-muted-foreground">
                              Qty: {r.quantity}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            <div>{r.customerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {r.customerPhone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {fmtDate(r.startDate)}
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={
                                isOverdue
                                  ? "text-red-600 dark:text-red-400 font-medium"
                                  : "text-foreground"
                              }
                            >
                              {fmtDate(r.endDate)}
                            </div>
                            {isOverdue && (
                              <div className="text-xs text-red-500">
                                {od}d overdue
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">
                            {fmt(r.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge
                              status={isOverdue ? "Overdue" : r.status}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2"
                                onClick={() => handleReturn(r)}
                                data-ocid={`rental.return_button.${i + 1}`}
                              >
                                Return
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2"
                                onClick={() => handleInvoice(r)}
                                data-ocid={`rental.invoice_button.${i + 1}`}
                              >
                                Invoice
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r.id)}
                                data-ocid={`rental.delete_button.${i + 1}`}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredActive.map((r, i) => (
                  <div key={r.id} data-ocid={`rental.active.item.${i + 1}`}>
                    <RentalCard
                      rental={r}
                      onReturn={handleReturn}
                      onDelete={handleDelete}
                      onInvoice={handleInvoice}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Create Rental Tab */}
      {tab === "create" && (
        <div className="bg-card rounded-xl border border-border p-5">
          <CreateRentalForm onCreated={() => setTab("active")} />
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="space-y-3">
          {historyRentals.length === 0 ? (
            <div
              className="text-center py-16 space-y-2"
              data-ocid="rental.history.empty_state"
            >
              <div className="text-4xl">📋</div>
              <p className="font-medium text-foreground">No rental history</p>
              <p className="text-sm text-muted-foreground">
                Completed rentals will appear here
              </p>
            </div>
          ) : (
            historyRentals.map((r, i) => (
              <div
                key={r.id}
                data-ocid={`rental.history.item.${i + 1}`}
                className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">
                    {r.itemName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r.customerName} · {r.customerPhone || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {fmtDate(r.startDate)} → {fmtDate(r.endDate)} ·{" "}
                    {calcDays(r.startDate, r.endDate)} days
                  </div>
                  {r.damageNotes && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Damage: {r.damageNotes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {fmt(r.totalAmount + (r.extraCharge ?? 0))}
                    </div>
                    {r.returnedDate && (
                      <div className="text-xs text-muted-foreground">
                        {fmtDate(r.returnedDate)}
                      </div>
                    )}
                  </div>
                  <StatusBadge status="Returned" />
                  <button
                    type="button"
                    onClick={() => handleInvoice(r)}
                    data-ocid={`rental.history.invoice_button.${i + 1}`}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <FileText size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {tab === "ledger" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              placeholder="Search customer..."
              className="pl-9"
              data-ocid="rental.ledger_search.input"
            />
          </div>

          {filteredLedger.length === 0 ? (
            <div
              className="text-center py-16 space-y-2"
              data-ocid="rental.ledger.empty_state"
            >
              <div className="text-4xl">📒</div>
              <p className="font-medium text-foreground">No rental records</p>
              <p className="text-sm text-muted-foreground">
                Customer ledger will appear once you create rentals
              </p>
            </div>
          ) : (
            filteredLedger.map((l, i) => (
              <div
                key={l.phone || l.name}
                data-ocid={`rental.ledger.item.${i + 1}`}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div>
                    <div className="font-semibold text-foreground">
                      {l.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.phone || "—"}
                    </div>
                  </div>
                  <div className="flex gap-4 text-right text-xs">
                    <div>
                      <div className="text-muted-foreground">Total Paid</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {fmt(l.totalPaid)}
                      </div>
                    </div>
                    {l.totalOutstanding > 0 && (
                      <div>
                        <div className="text-muted-foreground">Outstanding</div>
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          {fmt(l.totalOutstanding)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {l.rentals.map((r, j) => (
                    <div
                      key={r.id}
                      data-ocid={`rental.ledger.item.${i + 1}.rental.${j + 1}`}
                      className="px-4 py-2.5 flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {r.itemName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-primary">
                          {fmt(r.totalAmount + (r.extraCharge ?? 0))}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Return Modal */}
      {returnTarget && (
        <ReturnModal
          rental={returnTarget}
          onClose={() => setReturnTarget(null)}
          onConfirm={confirmReturn}
        />
      )}

      {/* Invoice Modal */}
      {invoiceTarget && (
        <InvoiceModal
          rental={invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
        />
      )}
    </div>
  );
}
