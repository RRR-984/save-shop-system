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
  CheckCircle,
  CreditCard,
  IndianRupee,
  MessageCircle,
  Receipt,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { type CustomerLedger, useStore } from "../context/StoreContext";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type LedgerFilter = "all" | "due" | "paid";

// ── Due Badge helper ───────────────────────────────────────────────────────────────────────────
function getDueBadge(due: number) {
  if (due <= 0) return null;
  if (due > 5000) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px] px-1.5">
        🔴 High Due
      </Badge>
    );
  }
  if (due > 500) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-[10px] px-1.5">
        🟡 Medium Due
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] px-1.5">
      🟢 Low Due
    </Badge>
  );
}

// ── WhatsApp Reminder helper ───────────────────────────────────────────────────────────────────
function buildWhatsAppUrl(
  mobile: string,
  customerName: string,
  dueAmount: number,
  shopName: string,
) {
  const message = `Namaste ${customerName},\nAapka ₹${Math.round(dueAmount).toLocaleString("en-IN")} baki hai.\n\nKripya jaldi payment kare.\n\nDhanyavaad 🙏\n${shopName}`;
  return `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
}

// ── Receive Payment Dialog ───────────────────────────────────────────────────────────────────────────
type PayMode = "cash" | "upi" | "online";

function ReceivePaymentDialog({
  ledger,
  open,
  onClose,
}: {
  ledger: CustomerLedger;
  open: boolean;
  onClose: () => void;
}) {
  const { receivePayment } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [payMode, setPayMode] = useState<PayMode>("cash");

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalen");
      return;
    }
    if (amt > ledger.totalDue) {
      toast.error(`Due sirf ${fmt(ledger.totalDue)} hai`);
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
    const newDue = ledger.totalDue - amt;
    if (newDue <= 0) {
      toast.success(
        `✅ ${fmt(amt)} mila — ${ledger.customerName} ka account Cleared ho gaya!`,
      );
    } else {
      toast.success(
        `✅ ${fmt(amt)} payment receive hua — Remaining due: ${fmt(newDue)}`,
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
      color: "border-gray-300 text-gray-700 hover:bg-gray-50",
      activeColor: "bg-green-600 text-white border-green-600",
    },
    {
      key: "upi",
      label: "📱 UPI",
      color: "border-gray-300 text-gray-700 hover:bg-gray-50",
      activeColor: "bg-purple-600 text-white border-purple-600",
    },
    {
      key: "online",
      label: "🌐 Online",
      color: "border-gray-300 text-gray-700 hover:bg-gray-50",
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
                {fmt(ledger.totalDue)}
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

// ── Invoice History Dialog ──────────────────────────────────────────────────────────────────────────
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

// ── Customer Ledger Card ──────────────────────────────────────────────────────────────────────────────────────
function CustomerCard({
  ledger,
  index,
  shopName,
}: {
  ledger: CustomerLedger;
  index: number;
  shopName: string;
}) {
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const isPaid = ledger.totalDue === 0;
  const dueBadge = getDueBadge(ledger.totalDue);
  const hasMobile = !!ledger.customerMobile?.trim();
  const whatsappUrl = hasMobile
    ? buildWhatsAppUrl(
        ledger.customerMobile,
        ledger.customerName,
        ledger.totalDue,
        shopName,
      )
    : "";

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
            {/* Left: Name + mobile + badge */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isPaid ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <User
                  size={18}
                  className={isPaid ? "text-green-700" : "text-red-700"}
                />
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
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {isPaid ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                      ✓ Fully Paid
                    </Badge>
                  ) : (
                    dueBadge
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {/* WhatsApp Reminder button */}
              {!isPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 text-xs px-2 ${
                    hasMobile
                      ? "text-green-700 border-green-300 hover:bg-green-50"
                      : "text-muted-foreground border-border cursor-not-allowed opacity-50"
                  }`}
                  disabled={!hasMobile}
                  onClick={() => {
                    if (hasMobile) {
                      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  title={
                    hasMobile
                      ? "WhatsApp reminder bhejo"
                      : "Mobile number nahi hai"
                  }
                  data-ocid={`customers.whatsapp_reminder.button.${index + 1}`}
                >
                  <MessageCircle size={12} className="mr-1" />
                  Reminder
                </Button>
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
              <div className="text-xs text-muted-foreground">Due (Udhaar)</div>
              <div
                className={`text-sm font-bold ${
                  ledger.totalDue > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {fmt(ledger.totalDue)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPayment && (
        <ReceivePaymentDialog
          ledger={ledger}
          open={showPayment}
          onClose={() => setShowPayment(false)}
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

// ── Main Customers Page ─────────────────────────────────────────────────────────────────────────────────────
export function CustomersPage() {
  const { invoices, getAllCustomerLedgers, mergeDuplicateCustomers } =
    useStore();
  const { currentShop } = useAuth();
  const shopName = currentShop?.name ?? "Save Shop System";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LedgerFilter>("all");

  // Derive ledgers from invoices (re-derived each render to stay in sync)
  // Already sorted by highest due first from getAllCustomerLedgers
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
    });

  const totalCreditDue = allLedgers.reduce((s, l) => s + l.totalDue, 0);
  const dueCustomers = allLedgers.filter((l) => l.totalDue > 0);
  const paidCustomers = allLedgers.filter((l) => l.totalDue === 0);
  const highDueCustomers = dueCustomers.filter((l) => l.totalDue > 5000);

  return (
    <div className="flex flex-col gap-6">
      <TopBar
        title="Customer Ledger"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="px-4 md:px-6 pb-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">Customer Due List</h1>
            <p className="text-muted-foreground text-sm">
              Har customer ka alag hisaab — total purchase, paid aur udhaar
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-amber-400 text-amber-700 hover:bg-amber-50 shrink-0"
            onClick={() => {
              const count = mergeDuplicateCustomers();
              if (count > 0) {
                toast.success(`✅ ${count} duplicate entries merge ho gayi`);
              } else {
                toast.info("Koi duplicate customers nahi mile");
              }
            }}
          >
            🔄 Duplicate Merge Karein
          </Button>
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
            className={`border-border shadow-sm ${
              totalCreditDue > 0 ? "border-red-300" : "border-green-300"
            }`}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  totalCreditDue > 0 ? "bg-red-50" : "bg-green-50"
                }`}
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
                  Total Udhaar
                </div>
                <div
                  className={`text-base font-bold ${
                    totalCreditDue > 0 ? "text-red-700" : "text-green-600"
                  }`}
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

        {/* Payment Reminders with WhatsApp */}
        {dueCustomers.length > 0 && (
          <Card className="border-red-300 bg-red-50/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell size={16} className="text-red-600" />💳 Reminder List —
                Udhaar Wale Customers
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-col gap-1.5">
                {dueCustomers.slice(0, 8).map((l) => {
                  const hasMobile = !!l.customerMobile?.trim();
                  const waUrl = hasMobile
                    ? buildWhatsAppUrl(
                        l.customerMobile,
                        l.customerName,
                        l.totalDue,
                        shopName,
                      )
                    : "";
                  return (
                    <div
                      key={`${l.customerName}__${l.customerMobile}`}
                      className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-white border border-red-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-foreground truncate">
                          {l.customerName}
                        </span>
                        {getDueBadge(l.totalDue)}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-red-600 text-sm">
                          {fmt(l.totalDue)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-6 text-[10px] px-2 ${
                            hasMobile
                              ? "text-green-700 border-green-300 hover:bg-green-50"
                              : "opacity-40 cursor-not-allowed"
                          }`}
                          disabled={!hasMobile}
                          onClick={() => {
                            if (hasMobile) {
                              window.open(
                                waUrl,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            }
                          }}
                          title={
                            hasMobile
                              ? "WhatsApp reminder bhejo"
                              : "Mobile number nahi"
                          }
                        >
                          <MessageCircle size={10} className="mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {dueCustomers.length > 8 && (
                  <p className="text-xs text-muted-foreground mt-1 pl-1">
                    + {dueCustomers.length - 8} aur customers ka due hai
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter + list */}
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
              {filter === "due"
                ? "Koi udhaar nahi hai ✅"
                : filter === "paid"
                  ? "Koi fully paid customer nahi"
                  : invoices.length === 0
                    ? "Koi invoice nahi bana abhi tak"
                    : "Koi customer nahi mila"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {invoices.length === 0
                ? "Pehle Billing page par jaake sale karein"
                : "Search filter change karein"}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
