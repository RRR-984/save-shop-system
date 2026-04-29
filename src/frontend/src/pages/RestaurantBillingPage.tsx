import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChevronLeft,
  Printer,
  Receipt,
  Search,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useRestaurantData } from "../hooks/useRestaurantData";
import type { RestaurantBill, RestaurantOrder } from "../types/restaurant";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateBillId() {
  return `bill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

type PaymentMode = "cash" | "upi" | "online" | "credit";
type DiscountType = "percent" | "flat";

const PAYMENT_MODES: { value: PaymentMode; label: string; emoji: string }[] = [
  { value: "cash", label: "Cash", emoji: "💵" },
  { value: "upi", label: "UPI", emoji: "📱" },
  { value: "online", label: "Online", emoji: "🌐" },
  { value: "credit", label: "Credit", emoji: "💳" },
];

const GST_RATES = [5, 12, 18, 28];

// ─── Order type badge ──────────────────────────────────────────────────────────

function OrderTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    "dine-in": "bg-blue-500/10 text-blue-700 border-blue-200",
    takeaway: "bg-amber-500/10 text-amber-700 border-amber-200",
    online: "bg-green-500/10 text-green-700 border-green-200",
  };
  const cls = map[type] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        cls,
      )}
    >
      {type.replace("-", " ")}
    </span>
  );
}

// ─── Printable Invoice ─────────────────────────────────────────────────────────

interface InvoiceViewProps {
  bill: RestaurantBill;
  restaurantName: string;
  order: RestaurantOrder | undefined;
  onBack: () => void;
}

function InvoiceView({
  bill,
  restaurantName,
  order,
  onBack,
}: InvoiceViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const message = [
      `🧾 *${restaurantName}*`,
      `Bill #${bill.orderNumber}`,
      `Date: ${fmtDate(bill.createdAt)}`,
      order?.tableNumber ? `Table: ${order.tableNumber}` : "",
      "---",
      ...bill.items.map(
        (it) =>
          `${it.menuItemName}${it.portion !== "single" ? ` (${it.portion})` : ""} x${it.quantity} = ${fmtCurrency(it.totalPrice)}`,
      ),
      "---",
      `Subtotal: ${fmtCurrency(bill.subtotal)}`,
      bill.serviceChargeEnabled
        ? `Service Charge (${bill.serviceChargeRate}%): ${fmtCurrency(bill.serviceChargeAmount)}`
        : "",
      bill.gstEnabled
        ? `CGST (${bill.cgstRate}%): ${fmtCurrency(bill.cgstAmount)}`
        : "",
      bill.gstEnabled
        ? `SGST (${bill.sgstRate}%): ${fmtCurrency(bill.sgstAmount)}`
        : "",
      `Grand Total: ${fmtCurrency(bill.totalAmount)}`,
      `Payment: ${bill.paymentMode.toUpperCase()}`,
      bill.dueAmount > 0 ? `Due: ${fmtCurrency(bill.dueAmount)}` : "",
      "Thank you for dining with us!",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="max-w-2xl mx-auto space-y-4"
      data-ocid="restaurant.billing.invoice.page"
    >
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="restaurant.billing.invoice.back_button"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Billing
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsApp}
            data-ocid="restaurant.billing.invoice.whatsapp_button"
            className="gap-2"
          >
            <Share2 size={15} />
            WhatsApp
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            data-ocid="restaurant.billing.invoice.print_button"
            className="gap-2"
          >
            <Printer size={15} />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice card */}
      <Card
        ref={invoiceRef}
        className="border-2 shadow-lg"
        data-ocid="restaurant.billing.invoice.card"
      >
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {restaurantName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tax Invoice / Bill of Supply
            </p>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Bill No:</span>
              <span className="font-semibold ml-1">{bill.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-1">{fmtDate(bill.createdAt)}</span>
            </div>
            {order?.tableNumber && (
              <div>
                <span className="text-muted-foreground">Table:</span>
                <span className="font-semibold ml-1">{order.tableNumber}</span>
              </div>
            )}
            {bill.customerName && (
              <div className={order?.tableNumber ? "text-right" : ""}>
                <span className="text-muted-foreground">Customer:</span>
                <span className="ml-1">{bill.customerName}</span>
              </div>
            )}
            {order?.orderType && (
              <div>
                <span className="text-muted-foreground">Order Type:</span>
                <span className="ml-1 capitalize">
                  {order.orderType.replace("-", " ")}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Items table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Item</TableHead>
                <TableHead className="text-xs font-semibold text-center">
                  Qty
                </TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  Rate
                </TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.items.map((item, i) => (
                <TableRow key={`${item.menuItemId}-${i}`}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm">
                      {item.menuItemName}
                    </div>
                    {item.portion !== "single" && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {item.portion}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-center text-sm">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-2 text-right text-sm">
                    {fmtCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">
                    {fmtCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          {/* Bill breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">
                {fmtCurrency(bill.subtotal)}
              </span>
            </div>

            {bill.serviceChargeEnabled && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service Charge ({bill.serviceChargeRate}%)</span>
                <span className="text-foreground">
                  {fmtCurrency(bill.serviceChargeAmount)}
                </span>
              </div>
            )}

            {bill.gstEnabled && (
              <>
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>CGST ({bill.cgstRate}%)</span>
                  <span>{fmtCurrency(bill.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>SGST ({bill.sgstRate}%)</span>
                  <span>{fmtCurrency(bill.sgstAmount)}</span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between font-bold text-base text-foreground">
              <span>Grand Total</span>
              <span className="text-primary">
                {fmtCurrency(bill.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Payment Mode</span>
              <span className="font-medium text-foreground uppercase">
                {bill.paymentMode}
              </span>
            </div>

            {bill.dueAmount > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Amount Due</span>
                <span>{fmtCurrency(bill.dueAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Thank you for dining with us! 🙏
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This is a computer-generated invoice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function RestaurantBillingPage() {
  const { shopId, addStockOut } = useStore();
  const { currentShop } = useAuth();
  const {
    activeOrders,
    setActiveOrders,
    bills,
    setBills,
    restaurantConfig,
    setTables,
    tables,
    menuItems,
  } = useRestaurantData(shopId);

  const restaurantName =
    restaurantConfig.restaurantName ?? currentShop?.name ?? "Restaurant";

  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [gstEnabled, setGstEnabled] = useState(restaurantConfig.gstEnabled);
  const [gstRate, setGstRate] = useState(restaurantConfig.gstRate || 5);
  const [serviceEnabled, setServiceEnabled] = useState(
    restaurantConfig.serviceChargeEnabled,
  );
  const [serviceRate, setServiceRate] = useState(
    restaurantConfig.serviceChargeRate || 5,
  );
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [paidAmountStr, setPaidAmountStr] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<RestaurantBill | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync GST defaults when config loads
  useEffect(() => {
    setGstEnabled(restaurantConfig.gstEnabled);
    setGstRate(restaurantConfig.gstRate || 5);
    setServiceEnabled(restaurantConfig.serviceChargeEnabled);
    setServiceRate(restaurantConfig.serviceChargeRate || 5);
  }, [restaurantConfig]);

  // Only show orders that are confirmed/preparing/ready (KOT sent) and not yet settled
  const pendingOrders = useMemo(
    () =>
      activeOrders.filter(
        (o) => o.status !== "served" && o.status !== "cancelled",
      ),
    [activeOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pendingOrders;
    return pendingOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        String(o.tableNumber ?? "").includes(q),
    );
  }, [pendingOrders, search]);

  const selectedOrder = useMemo(
    () => activeOrders.find((o) => o.id === selectedOrderId),
    [activeOrders, selectedOrderId],
  );

  // ── Bill calculations ───────────────────────────────────────────────────────
  const subtotal = selectedOrder?.subtotal ?? 0;
  const serviceChargeAmount = serviceEnabled
    ? Math.round(((subtotal * serviceRate) / 100) * 100) / 100
    : 0;
  const gstBase = subtotal + serviceChargeAmount;

  // Discount calculation
  const discountValNum = Number.parseFloat(discountValue) || 0;
  const discountAmount = discountEnabled
    ? discountType === "percent"
      ? Math.round(((gstBase * discountValNum) / 100) * 100) / 100
      : Math.min(discountValNum, gstBase)
    : 0;
  const afterDiscount = gstBase - discountAmount;

  const gstAmount = gstEnabled
    ? Math.round(((afterDiscount * gstRate) / 100) * 100) / 100
    : 0;
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const totalAmount = afterDiscount + gstAmount;
  const paidAmount = isPartial
    ? Math.min(Number.parseFloat(paidAmountStr) || 0, totalAmount)
    : totalAmount;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  // ── Reset bill state when order changes ─────────────────────────────────────
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setPaidAmountStr("");
    setIsPartial(false);
    setDiscountEnabled(false);
    setDiscountValue("");
    setGeneratedBill(null);
  };

  // ── Generate bill ─────────────────────────────────────────────────────────
  const handleGenerateBill = () => {
    if (!selectedOrder) return;
    setIsGenerating(true);

    try {
      const now = new Date().toISOString();
      const bill: RestaurantBill = {
        id: generateBillId(),
        shopId,
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.orderNumber,
        tableNumber: selectedOrder.tableNumber,
        customerName: selectedOrder.customerName,
        customerMobile: selectedOrder.customerMobile,
        items: selectedOrder.items,
        subtotal,
        gstEnabled,
        gstRate,
        cgstRate,
        sgstRate,
        gstAmount,
        cgstAmount,
        sgstAmount,
        serviceChargeEnabled: serviceEnabled,
        serviceChargeRate: serviceRate,
        serviceChargeAmount,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentMode,
        createdAt: now,
      };

      // Mark order as served
      setActiveOrders(
        activeOrders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: "served",
                paidAmount,
                paymentMode,
                totalAmount,
                gstEnabled,
                gstRate,
                cgstRate,
                sgstRate,
                cgstAmount,
                sgstAmount,
                serviceChargeRate: serviceRate,
                serviceChargeAmount,
                updatedAt: now,
              }
            : o,
        ),
      );

      // Free the table if dine-in
      if (selectedOrder.tableId) {
        setTables(
          tables.map((t) =>
            t.id === selectedOrder.tableId
              ? {
                  ...t,
                  status: "free",
                  currentOrderId: undefined,
                  updatedAt: now,
                }
              : t,
          ),
        );
      }

      // ── Auto-deduct inventory for linked menu items ──────────────────────
      // Stock quantities are always whole numbers in addStockOut.
      // A "half" portion is treated as 1 unit deduction (Math.ceil) so we
      // never pass a fractional value (e.g. 0.5) which would silently fail
      // or produce negative stock. Quarter = 1, Half = 1, Full = 1 per item qty.
      let deductedCount = 0;
      for (const orderItem of selectedOrder.items) {
        const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
        if (!menuItem?.inventoryProductId) continue;
        // Use Math.ceil so fractional portion multipliers always round up to
        // a whole unit — prevents addStockOut receiving a non-integer value.
        const portionMultiplier = orderItem.portion === "half" ? 0.5 : 1;
        const totalDeduct = Math.ceil(portionMultiplier * orderItem.quantity);
        if (totalDeduct > 0) {
          addStockOut(
            menuItem.inventoryProductId,
            totalDeduct,
            `Restaurant order ${selectedOrder.orderNumber}`,
          );
          deductedCount++;
        }
      }

      setBills([...bills, bill]);
      setGeneratedBill(bill);
      setSelectedOrderId(null);

      toast.success(`Bill generated — ${selectedOrder.orderNumber}`, {
        description: `${fmtCurrency(totalAmount)} · ${paymentMode.toUpperCase()}${deductedCount > 0 ? ` · ${deductedCount} inventory item(s) updated` : ""}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Show invoice if one was just generated ─────────────────────────────────
  if (generatedBill) {
    const matchedOrder = activeOrders.find(
      (o) => o.id === generatedBill.orderId,
    );
    return (
      <div className="p-4 md:p-6">
        <InvoiceView
          bill={generatedBill}
          restaurantName={restaurantName}
          order={matchedOrder}
          onBack={() => setGeneratedBill(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4" data-ocid="restaurant.billing.page">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="text-primary" size={22} />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Restaurant Billing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select an order and generate bill with GST breakdown
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left: Order list ──────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Pending Orders ({filteredOrders.length})
            </Label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                data-ocid="restaurant.billing.search_input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order #, table, name..."
                className="pl-9"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div
              className="text-center py-14 text-muted-foreground border-2 border-dashed rounded-xl"
              data-ocid="restaurant.billing.empty_state"
            >
              <Receipt size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No pending orders</p>
              <p className="text-xs mt-1 opacity-70">
                Orders will appear here once placed
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-0.5">
              {filteredOrders.map((order, idx) => (
                <button
                  key={order.id}
                  type="button"
                  data-ocid={`restaurant.billing.order.${idx + 1}`}
                  onClick={() => handleSelectOrder(order.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all duration-150 hover:shadow-sm",
                    selectedOrderId === order.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/30",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {order.orderNumber}
                    </span>
                    <OrderTypeBadge type={order.orderType} />
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                    {order.tableNumber && (
                      <span>Table {order.tableNumber}</span>
                    )}
                    {order.customerName && <span>· {order.customerName}</span>}
                    <span>· {order.items.length} item(s)</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-bold text-foreground">
                      {fmtCurrency(order.subtotal)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Bill detail ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedOrder ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
              <div className="text-center">
                <Receipt size={40} className="mx-auto mb-3 opacity-15" />
                <p className="font-medium">Select an order to generate bill</p>
                <p className="text-xs mt-1 opacity-60">
                  Choose from the pending orders on the left
                </p>
              </div>
            </div>
          ) : (
            <Card
              data-ocid="restaurant.billing.bill.card"
              className="border-2 shadow-sm"
            >
              <CardHeader className="pb-3 bg-muted/30 rounded-t-xl">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-primary" />
                    <span>Bill — {selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOrder.tableNumber && (
                      <Badge variant="outline">
                        Table {selectedOrder.tableNumber}
                      </Badge>
                    )}
                    <OrderTypeBadge type={selectedOrder.orderType} />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Items list */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Order Items
                  </Label>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs py-2">Item</TableHead>
                        <TableHead className="text-xs py-2 text-center">
                          Qty
                        </TableHead>
                        <TableHead className="text-xs py-2 text-right">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-xs py-2 text-right">
                          Subtotal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, i) => (
                        <TableRow key={`${item.menuItemId}-${i}`}>
                          <TableCell className="py-2">
                            <div className="font-medium text-sm">
                              {item.menuItemName}
                            </div>
                            {item.portion !== "single" && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {item.portion}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-center text-sm">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm">
                            {fmtCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm font-medium">
                            {fmtCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {fmtCurrency(subtotal)}
                  </span>
                </div>

                {/* Service Charge */}
                <div className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        data-ocid="restaurant.billing.service_charge.switch"
                        id="service-charge"
                        checked={serviceEnabled}
                        onCheckedChange={setServiceEnabled}
                      />
                      <label
                        htmlFor="service-charge"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Service Charge
                      </label>
                    </div>
                    {serviceEnabled && (
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-semibold">
                        + {fmtCurrency(serviceChargeAmount)}
                      </span>
                    )}
                  </div>
                  {serviceEnabled && (
                    <div className="flex items-center gap-2 pl-8">
                      <Label className="text-xs text-muted-foreground">
                        Rate %
                      </Label>
                      <Input
                        data-ocid="restaurant.billing.service_rate.input"
                        type="number"
                        min={0}
                        max={30}
                        value={serviceRate}
                        onChange={(e) =>
                          setServiceRate(Number.parseFloat(e.target.value) || 0)
                        }
                        className="w-20 h-7 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">
                        on ₹{subtotal.toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        data-ocid="restaurant.billing.discount.switch"
                        id="discount"
                        checked={discountEnabled}
                        onCheckedChange={(v) => {
                          setDiscountEnabled(v);
                          if (!v) setDiscountValue("");
                        }}
                      />
                      <label
                        htmlFor="discount"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Discount
                      </label>
                    </div>
                    {discountEnabled && discountAmount > 0 && (
                      <span className="text-sm text-destructive font-semibold">
                        − {fmtCurrency(discountAmount)}
                      </span>
                    )}
                  </div>
                  {discountEnabled && (
                    <div className="flex items-center gap-2 pl-8">
                      <Select
                        value={discountType}
                        onValueChange={(v) =>
                          setDiscountType(v as DiscountType)
                        }
                      >
                        <SelectTrigger
                          data-ocid="restaurant.billing.discount_type.select"
                          className="w-28 h-7 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percent (%)</SelectItem>
                          <SelectItem value="flat">Flat (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        data-ocid="restaurant.billing.discount_value.input"
                        type="number"
                        min={0}
                        placeholder={discountType === "percent" ? "0" : "0.00"}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-24 h-7 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">
                        {discountType === "percent" ? "%" : "₹"}
                      </span>
                    </div>
                  )}
                </div>

                {/* GST — matches BillingPage CGST/SGST pattern exactly */}
                <div className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        data-ocid="restaurant.billing.gst.switch"
                        id="gst"
                        checked={gstEnabled}
                        onCheckedChange={setGstEnabled}
                      />
                      <label
                        htmlFor="gst"
                        className="text-sm font-medium cursor-pointer"
                      >
                        GST
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {gstEnabled && (
                        <Select
                          value={String(gstRate)}
                          onValueChange={(v) => setGstRate(Number(v))}
                        >
                          <SelectTrigger
                            data-ocid="restaurant.billing.gst_rate.select"
                            className="w-24 h-7 text-xs"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map((r) => (
                              <SelectItem key={r} value={String(r)}>
                                {r}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {gstEnabled && gstAmount > 0 && (
                        <span className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
                          + {fmtCurrency(gstAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CGST / SGST split — exactly as BillingPage pattern */}
                  {gstEnabled && gstAmount > 0 && (
                    <div className="pl-8 space-y-1 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded-md p-2">
                      <div className="flex justify-between text-amber-700 dark:text-amber-400">
                        <span>CGST ({cgstRate}%)</span>
                        <span className="font-medium">
                          {fmtCurrency(cgstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-700 dark:text-amber-400">
                        <span>SGST ({sgstRate}%)</span>
                        <span className="font-medium">
                          {fmtCurrency(sgstAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Grand total */}
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    {fmtCurrency(totalAmount)}
                  </span>
                </div>

                {/* Payment mode */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Payment Mode
                  </Label>
                  <div
                    className="flex gap-2 flex-wrap"
                    data-ocid="restaurant.billing.payment_mode.toggle"
                  >
                    {PAYMENT_MODES.map((pm) => (
                      <button
                        key={pm.value}
                        type="button"
                        data-ocid={`restaurant.billing.payment.${pm.value}`}
                        onClick={() => {
                          setPaymentMode(pm.value);
                          if (pm.value !== "credit") setIsPartial(false);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 flex items-center gap-1.5",
                          paymentMode === pm.value
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        <span>{pm.emoji}</span>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Partial payment */}
                <div className="flex items-center gap-3">
                  <Switch
                    data-ocid="restaurant.billing.partial.switch"
                    id="partial"
                    checked={isPartial}
                    onCheckedChange={(v) => {
                      setIsPartial(v);
                      if (!v) setPaidAmountStr("");
                    }}
                  />
                  <label htmlFor="partial" className="text-sm cursor-pointer">
                    Partial Payment
                  </label>
                  {isPartial && (
                    <Input
                      data-ocid="restaurant.billing.paid_amount.input"
                      type="number"
                      placeholder="Amount paid"
                      value={paidAmountStr}
                      onChange={(e) => setPaidAmountStr(e.target.value)}
                      className="w-36 h-8 text-sm"
                      min={0}
                      max={totalAmount}
                    />
                  )}
                </div>

                {dueAmount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold text-sm bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                    <span>Amount Due</span>
                    <span>{fmtCurrency(dueAmount)}</span>
                  </div>
                )}

                {/* Generate bill button */}
                <Button
                  data-ocid="restaurant.billing.generate_button"
                  className="w-full gap-2 h-11 text-base font-semibold"
                  onClick={handleGenerateBill}
                  disabled={isGenerating || !selectedOrder}
                >
                  <CheckCircle size={18} />
                  Generate Bill — {fmtCurrency(paidAmount)}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
