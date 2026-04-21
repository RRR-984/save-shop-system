import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Cake,
  Calendar,
  CheckCircle,
  CreditCard,
  IndianRupee,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Receipt,
  Search,
  Send,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { type CustomerLedger, useStore } from "../context/StoreContext";
import type {
  ActivityStatus,
  AppUser,
  Customer,
  CustomerTier,
} from "../types/store";
import {
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  TIER_COLORS,
  TIER_EMOJI,
  TIER_LABELS,
  getActivityStatus,
  getCustomerTier,
} from "../utils/customerTracking";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type LedgerFilter = "all" | "due" | "paid";
type ActivityFilter = "all" | ActivityStatus;
type TierFilter = "all" | CustomerTier;

// ── Due Badge helper ────────────────────────────────────────────────────────────
function getDueBadge(due: number) {
  if (due <= 0) return null;
  const base =
    "text-[10px] px-1.5 whitespace-nowrap flex-shrink-0 inline-flex items-center";
  if (due > 5000) {
    return (
      <Badge className={`bg-red-100 text-red-700 border-red-300 ${base}`}>
        🔴 High Due
      </Badge>
    );
  }
  if (due > 500) {
    return (
      <Badge
        className={`bg-yellow-100 text-yellow-800 border-yellow-300 ${base}`}
      >
        🟡 Medium Due
      </Badge>
    );
  }
  return (
    <Badge className={`bg-green-100 text-green-700 border-green-300 ${base}`}>
      🟢 Low Due
    </Badge>
  );
}

// ── Activity Status Badge ───────────────────────────────────────────────────────
function ActivityBadge({ status }: { status: ActivityStatus }) {
  return (
    <Badge className={`text-[10px] px-1.5 border ${ACTIVITY_COLORS[status]}`}>
      {ACTIVITY_LABELS[status]}
    </Badge>
  );
}

// ── Tier Badge ─────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: CustomerTier }) {
  if (tier === "normal") return null;
  return (
    <Badge className={`text-[10px] px-1.5 border ${TIER_COLORS[tier]}`}>
      {TIER_EMOJI[tier]} {TIER_LABELS[tier]}
    </Badge>
  );
}

// ── Reminder Confirmation Dialog ────────────────────────────────────────────────
function ReminderConfirmDialog({
  ledger,
  mode,
  open,
  onClose,
  onConfirm,
  shopName,
}: {
  ledger: CustomerLedger;
  mode: "send" | "request";
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shopName: string;
}) {
  const preview = `Hello ${ledger.customerName},\nYou have an outstanding balance of ₹${Math.round(ledger.totalDue).toLocaleString("en-IN")}.\n\nKindly make the payment at your earliest convenience.\n\nThank you 🙏\n${shopName}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm"
        data-ocid="customers.reminder_confirm.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle size={18} className="text-green-600" />
            {mode === "send" ? "Send Reminder" : "Send Reminder Request"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="rounded-lg bg-secondary/60 p-3 text-sm space-y-1">
            <div className="font-semibold text-foreground">
              {ledger.customerName}
            </div>
            {ledger.customerMobile && (
              <div className="text-xs text-muted-foreground">
                📱 {ledger.customerMobile}
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Due Amount:</span>
              <span className="font-bold text-red-600">
                {fmt(ledger.totalDue)}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-xs font-medium text-green-700 mb-1">
              Message Preview:
            </p>
            <p className="text-xs text-green-800 whitespace-pre-line leading-relaxed">
              {preview}
            </p>
          </div>
          {mode === "request" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
              <p className="text-xs text-amber-700">
                ⏳ This will send an approval request to Owner/Manager. Once
                approved, the WhatsApp message will be sent.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="customers.reminder_confirm.cancel"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className={
              mode === "send"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }
            onClick={() => {
              onConfirm();
              onClose();
            }}
            data-ocid="customers.reminder_confirm.submit"
          >
            {mode === "send" ? "Yes, Send" : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Role-based reminder button ──────────────────────────────────────────────────
function ReminderButton({
  ledger,
  currentUser,
  shopName,
  index,
  compact = false,
}: {
  ledger: CustomerLedger;
  currentUser: AppUser;
  shopName: string;
  index: number;
  compact?: boolean;
}) {
  const { appConfig, sendReminder, requestReminder, getReminderCountToday } =
    useStore();
  const [confirmMode, setConfirmMode] = useState<"send" | "request" | null>(
    null,
  );

  const hasMobile = !!ledger.customerMobile?.trim();
  const role = currentUser.role;

  if (!hasMobile) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} opacity-40 cursor-not-allowed`}
        disabled
        title="Mobile number is not available"
        data-ocid={`customers.reminder.disabled.${index + 1}`}
      >
        <MessageCircle size={compact ? 10 : 12} className="mr-1" />
        Reminder
      </Button>
    );
  }

  if (role === "owner" || role === "manager") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={`${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} text-green-700 border-green-300 hover:bg-green-50`}
          onClick={() => setConfirmMode("send")}
          title="Send WhatsApp reminder"
          data-ocid={`customers.send_reminder.button.${index + 1}`}
        >
          <MessageCircle size={compact ? 10 : 12} className="mr-1" />
          Send Reminder
        </Button>
        {confirmMode && (
          <ReminderConfirmDialog
            ledger={ledger}
            mode={confirmMode}
            open={!!confirmMode}
            onClose={() => setConfirmMode(null)}
            shopName={shopName}
            onConfirm={async () => {
              await sendReminder(ledger, currentUser);
              toast.success(`🔔 Reminder sent to ${ledger.customerName}`);
            }}
          />
        )}
      </>
    );
  }

  if (!appConfig.allowStaffReminders) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} opacity-40 cursor-not-allowed`}
        disabled
        title="Reminders are disabled by Admin"
        data-ocid={`customers.reminder.staff_disabled.${index + 1}`}
      >
        <MessageCircle size={compact ? 10 : 12} className="mr-1" />
        Reminder
      </Button>
    );
  }

  if (appConfig.staffReminderMode === "simple") {
    const countToday = getReminderCountToday(
      currentUser.id,
      ledger.customerMobile,
    );
    const limitReached = countToday >= 2;
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={`${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} ${
            limitReached
              ? "opacity-40 cursor-not-allowed"
              : "text-green-700 border-green-300 hover:bg-green-50"
          }`}
          disabled={limitReached}
          onClick={() => !limitReached && setConfirmMode("send")}
          title={
            limitReached
              ? "Daily limit reached (2/day)"
              : "Send WhatsApp reminder"
          }
          data-ocid={`customers.send_reminder.staff.button.${index + 1}`}
        >
          <MessageCircle size={compact ? 10 : 12} className="mr-1" />
          {limitReached ? "Reminder (Limit Reached)" : "Send Reminder"}
        </Button>
        {confirmMode && (
          <ReminderConfirmDialog
            ledger={ledger}
            mode="send"
            open={!!confirmMode}
            onClose={() => setConfirmMode(null)}
            shopName={shopName}
            onConfirm={async () => {
              await sendReminder(ledger, currentUser);
              toast.success(`🔔 Reminder sent to ${ledger.customerName}`);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`${compact ? "h-6 text-[10px] px-2" : "h-7 text-xs px-2"} text-amber-700 border-amber-300 hover:bg-amber-50`}
        onClick={() => setConfirmMode("request")}
        title="Request approval from Owner/Manager"
        data-ocid={`customers.request_reminder.button.${index + 1}`}
      >
        <Bell size={compact ? 10 : 12} className="mr-1" />
        Request Reminder
      </Button>
      {confirmMode && (
        <ReminderConfirmDialog
          ledger={ledger}
          mode="request"
          open={!!confirmMode}
          onClose={() => setConfirmMode(null)}
          shopName={shopName}
          onConfirm={async () => {
            await requestReminder(ledger, currentUser);
            toast.success(
              "✅ Request sent — waiting for Owner/Manager approval",
            );
          }}
        />
      )}
    </>
  );
}

// ── Bulk Reminder Dialog ────────────────────────────────────────────────────────
function BulkReminderDialog({
  dueCount,
  dueCustomers: dueLedgers,
  open,
  onClose,
  onConfirm,
}: {
  dueCount: number;
  dueCustomers: CustomerLedger[];
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm"
        data-ocid="customers.bulk_reminder.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send size={18} className="text-amber-600" />
            Send Payment Reminders
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-sm text-muted-foreground">
            This will open WhatsApp for{" "}
            <span className="font-semibold text-foreground">{dueCount}</span>{" "}
            customer{dueCount !== 1 ? "s" : ""} with pending dues. Do you want
            to continue?
          </p>
          <div className="rounded-lg border border-border bg-secondary/40 max-h-52 overflow-y-auto divide-y divide-border">
            {dueLedgers.map((l) => (
              <div
                key={`${l.customerName}__${l.customerMobile}`}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground truncate block">
                    {l.customerName}
                  </span>
                  {l.customerMobile && (
                    <span className="text-xs text-muted-foreground">
                      📱 {l.customerMobile}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-red-600 ml-3 flex-shrink-0">
                  {fmt(l.totalDue)}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
            <p className="text-xs text-amber-700">
              ℹ️ Each customer's WhatsApp will open in a new tab — allow pop-ups
              if prompted by your browser.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="customers.bulk_reminder.cancel"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            data-ocid="customers.bulk_reminder.send_all"
          >
            <Send size={13} className="mr-1.5" />
            Send to All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Receive Payment Dialog ──────────────────────────────────────────────────────
type PayMode = "cash" | "upi" | "online";

function ReceivePaymentDialog({
  ledger,
  open,
  onClose,
  customerRecord,
  onPaymentReceived,
}: {
  ledger: CustomerLedger;
  open: boolean;
  onClose: () => void;
  customerRecord?: Customer;
  onPaymentReceived?: (amount: number) => void;
}) {
  const { receivePayment, updateCustomer } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [payMode, setPayMode] = useState<PayMode>("cash");

  // Effective pending: use pendingBalance from customer record if available, else totalDue
  const effectiveDue =
    customerRecord?.pendingBalance != null
      ? customerRecord.pendingBalance
      : ledger.totalDue;

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > ledger.totalDue) {
      toast.error(`Outstanding due is only ${fmt(ledger.totalDue)}`);
      return;
    }
    receivePayment(
      "",
      ledger.customerName,
      ledger.customerMobile,
      amt,
      note,
      payMode,
    );

    // Update customer PRO tracking fields
    if (customerRecord) {
      const newPending = Math.max(
        0,
        (customerRecord.pendingBalance ?? customerRecord.creditBalance) - amt,
      );
      updateCustomer(customerRecord.id, {
        pendingBalance: newPending,
        lastVisit: new Date().toISOString(),
      });
    }

    onPaymentReceived?.(amt);

    const newDue = ledger.totalDue - amt;
    if (newDue <= 0) {
      toast.success(
        `✅ ${fmt(amt)} received — ${ledger.customerName}'s account is fully cleared!`,
      );
    } else {
      toast.success(
        `✅ ${fmt(amt)} payment received — Remaining due: ${fmt(newDue)}`,
      );
    }
    setAmount("");
    setNote("");
    setPayMode("cash");
    onClose();
  };

  const payModes: {
    key: PayMode;
    label: string;
    color: string;
    activeColor: string;
  }[] = [
    {
      key: "cash",
      label: "💵 Cash",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-green-600 text-white border-green-600",
    },
    {
      key: "upi",
      label: "📱 UPI",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-purple-600 text-white border-purple-600",
    },
    {
      key: "online",
      label: "🌐 Online",
      color: "border-border text-foreground hover:bg-muted",
      activeColor: "bg-cyan-600 text-white border-cyan-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="customers.receive_payment.dialog"
        className="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee size={18} className="text-green-600" />
            Mark as Paid
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="rounded-lg bg-secondary/60 p-3 text-sm space-y-1">
            <div className="font-semibold text-foreground">
              {ledger.customerName}
            </div>
            {ledger.customerMobile && (
              <div className="text-muted-foreground text-xs">
                {ledger.customerMobile}
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Total Due:</span>
              <span className="font-bold text-red-600">
                {fmt(effectiveDue)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Payment Mode *</Label>
            <div className="flex gap-2">
              {payModes.map((pm) => (
                <button
                  key={pm.key}
                  type="button"
                  className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                    payMode === pm.key ? pm.activeColor : pm.color
                  }`}
                  onClick={() => setPayMode(pm.key)}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Amount Received (₹) *</Label>
            <Input
              data-ocid="customers.receive_payment.input"
              type="number"
              placeholder={`Max: ${fmt(ledger.totalDue)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Partial payment allowed — due will reduce accordingly
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Note (optional)</Label>
            <Input
              data-ocid="customers.receive_payment_note.input"
              placeholder="e.g. Cash received, UPI ref no..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="customers.receive_payment.cancel_button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="customers.receive_payment.confirm_button"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
          >
            <IndianRupee size={14} className="mr-1.5" />
            Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Invoice History Dialog ──────────────────────────────────────────────────────
function InvoicesDialog({
  ledger,
  open,
  onClose,
}: {
  ledger: CustomerLedger;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-ocid="customers.invoices.dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ledger.customerName}'s Invoice History</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-secondary/60 p-2">
              <div className="text-xs text-muted-foreground">
                Total Purchase
              </div>
              <div className="font-bold">{fmt(ledger.totalPurchase)}</div>
            </div>
            <div className="rounded-lg bg-green-50 p-2">
              <div className="text-xs text-muted-foreground">Total Paid</div>
              <div className="font-bold text-green-700">
                {fmt(ledger.totalPaid)}
              </div>
            </div>
            <div
              className={`rounded-lg p-2 ${ledger.totalDue > 0 ? "bg-red-50" : "bg-green-50"}`}
            >
              <div className="text-xs text-muted-foreground">Total Due</div>
              <div
                className={`font-bold ${ledger.totalDue > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {fmt(ledger.totalDue)}
              </div>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs">Invoice</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Paid</TableHead>
                  <TableHead className="text-xs">Due</TableHead>
                  <TableHead className="text-xs">Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.invoices.map((inv) => {
                  const due = inv.dueAmount ?? 0;
                  return (
                    <TableRow
                      key={inv.id}
                      className={due > 0 ? "bg-red-50/50" : "bg-green-50/50"}
                    >
                      <TableCell className="text-xs font-medium">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(inv.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {fmt(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-green-700">
                        {fmt(inv.paidAmount)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {due > 0 ? (
                          <span className="font-bold text-red-600">
                            {fmt(due)}
                          </span>
                        ) : (
                          <span className="text-green-600">✓</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {inv.paymentMode}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {ledger.invoices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground text-sm"
                    >
                      No invoices yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button
            data-ocid="customers.invoices.close_button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add / Edit Customer Dialog ──────────────────────────────────────────────────
function AddEditCustomerDialog({
  open,
  onClose,
  existing,
  isProMode,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Customer;
  isProMode?: boolean;
}) {
  const { addCustomer, updateCustomer } = useStore();
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [birthday, setBirthday] = useState(existing?.birthday ?? "");
  const [lastVisit, setLastVisit] = useState(
    existing?.lastVisit ? existing.lastVisit.slice(0, 10) : "",
  );
  const [totalPurchase, setTotalPurchase] = useState(
    existing?.totalPurchase != null ? String(existing.totalPurchase) : "",
  );
  const [visitCount, setVisitCount] = useState(
    existing?.visitCount != null ? String(existing.visitCount) : "",
  );

  const isEdit = !!existing;

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    const extra: Partial<Customer> = {
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || undefined,
      birthday: birthday.trim() || undefined,
    };
    if (isProMode) {
      if (lastVisit) extra.lastVisit = new Date(lastVisit).toISOString();
      if (totalPurchase !== "") extra.totalPurchase = Number(totalPurchase);
      if (visitCount !== "") extra.visitCount = Number(visitCount);
    }

    if (isEdit && existing) {
      updateCustomer(existing.id, extra);
      toast.success("Customer updated ✓");
    } else {
      addCustomer({
        name: extra.name!,
        mobile: extra.mobile!,
        creditBalance: 0,
        address: extra.address,
        birthday: extra.birthday,
        ...(isProMode && lastVisit ? { lastVisit: extra.lastVisit } : {}),
        ...(isProMode && totalPurchase !== ""
          ? { totalPurchase: Number(totalPurchase) }
          : {}),
        ...(isProMode && visitCount !== ""
          ? { visitCount: Number(visitCount) }
          : {}),
      });
      toast.success("Customer added ✓");
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-ocid="customers.add_edit.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            {isEdit ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-sm">Name *</Label>
            <Input
              data-ocid="customers.add_edit.name.input"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Mobile Number</Label>
            <Input
              data-ocid="customers.add_edit.mobile.input"
              placeholder="10-digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              Address{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              data-ocid="customers.add_edit.address.input"
              placeholder="e.g. 12 Main Market, Indore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <Cake size={13} className="text-pink-500" />
              Birthday / Janmdin{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              data-ocid="customers.add_edit.birthday.input"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          {/* PRO mode extra fields */}
          {isProMode && (
            <>
              <Separator />
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                PRO Tracking Fields
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Last Visit Date{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  data-ocid="customers.add_edit.last_visit.input"
                  type="date"
                  value={lastVisit}
                  onChange={(e) => setLastVisit(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Total Purchase (₹){" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  data-ocid="customers.add_edit.total_purchase.input"
                  type="number"
                  placeholder="e.g. 25000"
                  value={totalPurchase}
                  onChange={(e) => setTotalPurchase(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Visit Count{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  data-ocid="customers.add_edit.visit_count.input"
                  type="number"
                  placeholder="e.g. 8"
                  value={visitCount}
                  onChange={(e) => setVisitCount(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="customers.add_edit.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            data-ocid="customers.add_edit.save_button"
          >
            {isEdit ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Customer Ledger Card ────────────────────────────────────────────────────────
function CustomerCard({
  ledger,
  index,
  shopName,
  currentUser,
  isProMode,
}: {
  ledger: CustomerLedger;
  index: number;
  shopName: string;
  currentUser: AppUser;
  isProMode: boolean;
}) {
  const { customers } = useStore();
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const isPaid = ledger.totalDue === 0;
  const dueBadge = getDueBadge(ledger.totalDue);

  // Resolve Customer record for editing and PRO data
  const mobile = ledger.customerMobile?.replace(/\D/g, "");
  const custRecord = customers.find((c) =>
    mobile
      ? c.mobile.replace(/\D/g, "") === mobile
      : c.name.trim().toLowerCase() ===
        ledger.customerName.trim().toLowerCase(),
  );

  // Latest bill info from most recent invoice
  const latestInvoice =
    ledger.invoices.length > 0
      ? ledger.invoices
          .slice()
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0]
      : null;
  const latestBillNumber = latestInvoice?.invoiceNumber ?? null;
  const latestBillDate = latestInvoice
    ? new Date(latestInvoice.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : null;
  const lastTransactionAmount = latestInvoice?.totalAmount ?? null;

  // Resolved address
  const displayAddress = custRecord?.address || ledger.customerAddress;

  // Always compute activity and tier — badges are always visible regardless of PRO mode gate
  const activityStatus = getActivityStatus(custRecord?.lastVisit);
  const tier = getCustomerTier(
    custRecord?.totalPurchase ?? ledger.totalPurchase,
  );
  const pendingAmt =
    custRecord?.pendingBalance != null
      ? custRecord.pendingBalance
      : ledger.totalDue;

  return (
    <>
      <Card
        data-ocid={`customers.item.${index + 1}`}
        className={`shadow-sm transition-colors ${
          isPaid
            ? "border-green-200 bg-green-50/30 dark:bg-green-950/10"
            : ledger.totalDue > 5000
              ? "border-red-300 bg-red-50/30"
              : "border-orange-200 bg-orange-50/20"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Name + mobile + address + badges */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                  isPaid ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <User
                  size={18}
                  className={isPaid ? "text-green-700" : "text-red-700"}
                />
                {/* Tier glow ring — always visible */}
                {tier && tier !== "normal" && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 text-[10px] leading-none ${
                      tier === "vip"
                        ? "text-purple-600"
                        : tier === "gold"
                          ? "text-yellow-600"
                          : "text-slate-500"
                    }`}
                  >
                    {TIER_EMOJI[tier]}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">
                  {ledger.customerName}
                </div>
                {ledger.customerMobile && (
                  <div className="text-xs text-muted-foreground">
                    {ledger.customerMobile}
                  </div>
                )}
                {displayAddress && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin
                      size={10}
                      className="flex-shrink-0 text-muted-foreground/70"
                    />
                    <span className="truncate">{displayAddress}</span>
                  </div>
                )}

                {/* Last Visit row — always visible when data exists */}
                {custRecord?.lastVisit && (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar size={9} className="flex-shrink-0" />
                    <span>
                      Last visit:{" "}
                      {new Date(custRecord.lastVisit).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}

                {/* Birthday row */}
                {custRecord?.birthday && (
                  <div className="text-[10px] text-pink-500 flex items-center gap-1 mt-0.5">
                    <Cake size={9} className="flex-shrink-0" />
                    <span>
                      Birthday:{" "}
                      {new Date(
                        `${custRecord.birthday}T00:00:00`,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}

                {/* Badges row */}
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {isPaid ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                      ✓ Fully Paid
                    </Badge>
                  ) : (
                    dueBadge
                  )}
                  {activityStatus && <ActivityBadge status={activityStatus} />}
                  {tier && <TierBadge tier={tier} />}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-muted-foreground hover:bg-muted"
                onClick={() => setShowEdit(true)}
                data-ocid={`customers.edit_button.${index + 1}`}
                title="Edit customer details"
              >
                <Pencil size={12} className="mr-1" />
                Edit
              </Button>
              {!isPaid && (
                <ReminderButton
                  ledger={ledger}
                  currentUser={currentUser}
                  shopName={shopName}
                  index={index}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-blue-600 hover:bg-blue-50"
                onClick={() => setShowInvoices(true)}
                data-ocid={`customers.view_invoices.button.${index + 1}`}
              >
                <Receipt size={12} className="mr-1" />
                {ledger.invoices.length} invoices
              </Button>
              {!isPaid && (
                <Button
                  size="sm"
                  className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowPayment(true)}
                  data-ocid={`customers.receive_payment_button.${index + 1}`}
                >
                  <IndianRupee size={12} className="mr-1" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>

          {/* Bill info row */}
          {latestBillNumber && (
            <div className="mt-2 px-1 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
              <span>
                <span className="font-medium text-foreground">Bill No:</span> #
                {latestBillNumber}
              </span>
              {latestBillDate && (
                <span>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {latestBillDate}
                </span>
              )}
              {lastTransactionAmount != null && (
                <span>
                  <span className="font-medium text-foreground">Last Amt:</span>{" "}
                  {fmt(lastTransactionAmount)}
                </span>
              )}
            </div>
          )}

          {/* Stats row */}
          <Separator className="my-3" />
          {isProMode ? (
            /* PRO stats: 4-col with Visit Count + Pending Balance */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShoppingBag size={10} />
                  Total Purchase
                </div>
                <div className="text-sm font-semibold">
                  {fmt(custRecord?.totalPurchase ?? ledger.totalPurchase)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp size={10} />
                  Visits
                </div>
                <div className="text-sm font-semibold">
                  {custRecord?.visitCount ?? ledger.invoices.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Paid</div>
                <div className="text-sm font-semibold text-green-600">
                  {fmt(ledger.totalPaid)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div
                  className={`text-sm font-bold ${
                    pendingAmt > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {fmt(pendingAmt)}
                </div>
              </div>
            </div>
          ) : (
            /* Simple / Smart stats: 3-col */
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Purchase
                </div>
                <div className="text-sm font-semibold">
                  {fmt(ledger.totalPurchase)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Paid</div>
                <div className="text-sm font-semibold text-green-600">
                  {fmt(ledger.totalPaid)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Outstanding Due
                </div>
                <div
                  className={`text-sm font-bold ${
                    ledger.totalDue > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {fmt(ledger.totalDue)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showEdit && (
        <AddEditCustomerDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          existing={custRecord}
          isProMode={isProMode}
        />
      )}
      {showPayment && (
        <ReceivePaymentDialog
          ledger={ledger}
          open={showPayment}
          onClose={() => setShowPayment(false)}
          customerRecord={custRecord}
        />
      )}
      {showInvoices && (
        <InvoicesDialog
          ledger={ledger}
          open={showInvoices}
          onClose={() => setShowInvoices(false)}
        />
      )}
    </>
  );
}

// ── PRO Filter Bar ──────────────────────────────────────────────────────────────
function ProFilterBar({
  activityFilter,
  setActivityFilter,
  tierFilter,
  setTierFilter,
}: {
  activityFilter: ActivityFilter;
  setActivityFilter: (v: ActivityFilter) => void;
  tierFilter: TierFilter;
  setTierFilter: (v: TierFilter) => void;
}) {
  const activityOptions: {
    value: ActivityFilter;
    label: string;
    color: string;
  }[] = [
    {
      value: "all",
      label: "All Status",
      color: "border-border text-foreground",
    },
    { value: "active", label: "🟢 Active", color: ACTIVITY_COLORS.active },
    { value: "warm", label: "🟡 Warm", color: ACTIVITY_COLORS.warm },
    { value: "cold", label: "🔵 Cold", color: ACTIVITY_COLORS.cold },
    { value: "lost", label: "🔴 Lost", color: ACTIVITY_COLORS.lost },
  ];

  const tierOptions: { value: TierFilter; label: string }[] = [
    { value: "all", label: "All Tiers" },
    { value: "vip", label: "👑 VIP" },
    { value: "gold", label: "🥇 Gold" },
    { value: "silver", label: "🥈 Silver" },
    { value: "normal", label: "👤 Normal" },
  ];

  return (
    <div
      className="rounded-xl border border-border bg-card p-3 space-y-2.5"
      data-ocid="customers.pro_filter.panel"
    >
      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
        PRO Filters
      </p>
      {/* Activity filter */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Activity Status</p>
        <div className="flex flex-wrap gap-1.5">
          {activityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                activityFilter === opt.value
                  ? `${opt.color} ring-1 ring-offset-1 ring-primary/30`
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setActivityFilter(opt.value)}
              data-ocid={`customers.activity_filter.${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {/* Tier filter */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Customer Tier</p>
        <div className="flex flex-wrap gap-1.5">
          {tierOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                tierFilter === opt.value
                  ? opt.value === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : `${TIER_COLORS[opt.value as CustomerTier]} ring-1 ring-offset-1 ring-primary/30`
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setTierFilter(opt.value)}
              data-ocid={`customers.tier_filter.${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Customers Page ─────────────────────────────────────────────────────────
export function CustomersPage() {
  const {
    invoices,
    getAllCustomerLedgers,
    mergeDuplicateCustomers,
    sendBulkReminder,
    bulkReminderSentAt,
    customers,
    appConfig,
    autoMode,
  } = useStore();
  const { currentShop, currentUser } = useAuth();
  const shopName = currentShop?.name ?? "Save Shop System";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [bulkReminderOpen, setBulkReminderOpen] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // PRO mode is active only when autoMode === 'pro' AND customerTracking is enabled
  const isProMode =
    autoMode === "pro" && (appConfig.featureFlags?.customerTracking ?? false);

  const allLedgers = getAllCustomerLedgers();

  const filtered = allLedgers
    .filter((l) => {
      if (filter === "due") return l.totalDue > 0;
      if (filter === "paid") return l.totalDue === 0;
      return true;
    })
    .filter((l) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        l.customerName.toLowerCase().includes(s) || l.customerMobile.includes(s)
      );
    })
    .filter((l) => {
      if (!isProMode) return true;
      // Activity filter
      if (activityFilter !== "all") {
        const mobile = l.customerMobile?.replace(/\D/g, "");
        const rec = customers.find((c) =>
          mobile
            ? c.mobile.replace(/\D/g, "") === mobile
            : c.name.trim().toLowerCase() ===
              l.customerName.trim().toLowerCase(),
        );
        const status = getActivityStatus(rec?.lastVisit);
        if (status !== activityFilter) return false;
      }
      // Tier filter
      if (tierFilter !== "all") {
        const mobile = l.customerMobile?.replace(/\D/g, "");
        const rec = customers.find((c) =>
          mobile
            ? c.mobile.replace(/\D/g, "") === mobile
            : c.name.trim().toLowerCase() ===
              l.customerName.trim().toLowerCase(),
        );
        const tier = getCustomerTier(rec?.totalPurchase ?? l.totalPurchase);
        if (tier !== tierFilter) return false;
      }
      return true;
    });

  const totalCreditDue = allLedgers.reduce((s, l) => s + l.totalDue, 0);
  const dueCustomers = allLedgers.filter((l) => l.totalDue > 0);
  const paidCustomers = allLedgers.filter((l) => l.totalDue === 0);
  const highDueCustomers = dueCustomers.filter((l) => l.totalDue > 5000);

  const lastSentDate = bulkReminderSentAt ? new Date(bulkReminderSentAt) : null;
  const minutesSinceLastSent = lastSentDate
    ? Math.floor((Date.now() - lastSentDate.getTime()) / 60000)
    : null;
  const isRecentlySent =
    minutesSinceLastSent !== null && minutesSinceLastSent < 5;
  const bulkDisabled = dueCustomers.length === 0 || isRecentlySent;

  const bulkButtonTitle = isRecentlySent
    ? `Sent ${minutesSinceLastSent} min ago — wait before sending again`
    : dueCustomers.length === 0
      ? "No customers with outstanding dues"
      : `Send WhatsApp reminder to all ${dueCustomers.length} due customers`;

  const user: AppUser = (currentUser as unknown as AppUser) ?? {
    id: "unknown",
    name: "Unknown",
    username: "",
    password: "",
    role: "staff" as const,
    shopId: "",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">
              Customer Due List
              {isProMode && (
                <Badge className="ml-2 text-[10px] bg-purple-100 text-purple-700 border-purple-300">
                  👑 PRO
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isProMode
                ? "Customer ledger with tracking, tiers & activity status"
                : "Customer ledger — total purchase, paid, and outstanding dues"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              onClick={() => setShowAddCustomer(true)}
              data-ocid="customers.add_customer.button"
            >
              <Plus size={13} className="mr-1" />
              Add Customer
            </Button>
            <div className="flex flex-col items-end gap-0.5">
              <Button
                size="sm"
                className={`text-xs shrink-0 transition-colors ${
                  bulkDisabled
                    ? "opacity-50 cursor-not-allowed bg-amber-200 text-amber-700 border border-amber-300 hover:bg-amber-200"
                    : "bg-amber-500 hover:bg-amber-600 text-white border-0"
                }`}
                disabled={bulkDisabled}
                title={bulkButtonTitle}
                onClick={() => !bulkDisabled && setBulkReminderOpen(true)}
                data-ocid="customers.bulk_reminder.button"
              >
                <Send size={13} className="mr-1.5" />📱 Send Bulk Reminder (
                {dueCustomers.length} due)
              </Button>
              {isRecentlySent && minutesSinceLastSent !== null && (
                <span className="text-[10px] text-amber-600 text-right">
                  Sent {minutesSinceLastSent} min ago — wait before sending
                  again
                </span>
              )}
              {!isRecentlySent &&
                lastSentDate &&
                minutesSinceLastSent !== null && (
                  <span className="text-[10px] text-muted-foreground text-right">
                    Last sent: {minutesSinceLastSent} min ago
                  </span>
                )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-amber-400 text-amber-700 hover:bg-amber-50 shrink-0"
              onClick={() => {
                const count = mergeDuplicateCustomers();
                if (count > 0) {
                  toast.success(`✅ ${count} duplicate entries merged`);
                } else {
                  toast.info("No duplicate customers found");
                }
              }}
            >
              🔄 Merge Duplicates
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Customers
                </div>
                <div className="text-lg font-bold">{allLedgers.length}</div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`border-border shadow-sm ${totalCreditDue > 0 ? "border-red-300" : "border-green-300"}`}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${totalCreditDue > 0 ? "bg-red-50" : "bg-green-50"}`}
              >
                <CreditCard
                  size={16}
                  className={
                    totalCreditDue > 0 ? "text-red-600" : "text-green-600"
                  }
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Outstanding
                </div>
                <div
                  className={`text-base font-bold ${totalCreditDue > 0 ? "text-red-700" : "text-green-600"}`}
                >
                  {fmt(totalCreditDue)}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <Bell size={16} className="text-red-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Due Pending</div>
                <div className="text-lg font-bold text-red-600">
                  {dueCustomers.length}
                </div>
                {highDueCustomers.length > 0 && (
                  <div className="text-[10px] text-red-500">
                    {highDueCustomers.length} high due (&gt;₹5000)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Fully Paid</div>
                <div className="text-lg font-bold text-green-600">
                  {paidCustomers.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Reminders */}
        {dueCustomers.length > 0 && (
          <Card className="border-red-300 bg-red-50/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell size={16} className="text-red-600" /> 💳 Reminder List —
                Customers with Outstanding Dues
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-col gap-1.5">
                {dueCustomers.slice(0, 8).map((l, lIdx) => (
                  <div
                    key={`${l.customerName}__${l.customerMobile}`}
                    className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-card border border-red-100 max-w-full"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-foreground truncate text-sm">
                        {l.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex-shrink-0 whitespace-nowrap">
                        {getDueBadge(l.totalDue)}
                      </span>
                      <span className="text-base font-semibold text-red-600 whitespace-nowrap">
                        {fmt(l.totalDue)}
                      </span>
                      <ReminderButton
                        ledger={l}
                        currentUser={user}
                        shopName={shopName}
                        index={lIdx}
                        compact
                      />
                    </div>
                  </div>
                ))}
                {dueCustomers.length > 8 && (
                  <p className="text-xs text-muted-foreground mt-1 pl-1">
                    + {dueCustomers.length - 8} more customers have outstanding
                    dues
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col gap-3">
          <div className="relative max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            <Input
              data-ocid="customers.search.input"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as LedgerFilter)}
            >
              <TabsList className="h-8">
                <TabsTrigger
                  data-ocid="customers.all.tab"
                  value="all"
                  className="text-xs h-7 px-3"
                >
                  All ({allLedgers.length})
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="customers.due.tab"
                  value="due"
                  className="text-xs h-7 px-3"
                >
                  Has Due ({dueCustomers.length})
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="customers.paid.tab"
                  value="paid"
                  className="text-xs h-7 px-3"
                >
                  Fully Paid ({paidCustomers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* PRO mode filter bar */}
          {isProMode && (
            <ProFilterBar
              activityFilter={activityFilter}
              setActivityFilter={setActivityFilter}
              tierFilter={tierFilter}
              setTierFilter={setTierFilter}
            />
          )}
        </div>

        {/* Customer cards */}
        {filtered.length === 0 ? (
          <div
            data-ocid="customers.list.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {activityFilter !== "all" || tierFilter !== "all"
                ? "No customers match this filter"
                : filter === "due"
                  ? "No outstanding dues ✅"
                  : filter === "paid"
                    ? "No fully paid customers"
                    : invoices.length === 0
                      ? "No invoices created yet"
                      : "No customers found"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {invoices.length === 0
                ? "Go to the Billing page to make a sale first"
                : "Try changing the search filter"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((ledger, idx) => (
              <CustomerCard
                key={`${ledger.customerName}__${ledger.customerMobile}`}
                ledger={ledger}
                index={idx}
                shopName={shopName}
                currentUser={user}
                isProMode={isProMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bulk Reminder Dialog */}
      <BulkReminderDialog
        dueCount={dueCustomers.length}
        dueCustomers={dueCustomers}
        open={bulkReminderOpen}
        onClose={() => setBulkReminderOpen(false)}
        onConfirm={() => {
          const result = sendBulkReminder();
          toast.success(
            `📱 Reminders sent to ${result.sent} customer${result.sent !== 1 ? "s" : ""}`,
          );
        }}
      />

      {/* Add Customer Dialog */}
      {showAddCustomer && (
        <AddEditCustomerDialog
          open={showAddCustomer}
          onClose={() => setShowAddCustomer(false)}
          isProMode={isProMode}
        />
      )}
    </div>
  );
}
