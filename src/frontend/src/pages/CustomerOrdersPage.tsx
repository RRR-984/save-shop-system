import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  MessageCircle,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { CustomerOrder, Product } from "../types/store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  key: string;
  productId: string;
  qty: number;
  price: number;
}

type FilterTab = "all" | "pending" | "accepted" | "rejected";
type SortOrder = "newest" | "oldest" | "customer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CustomerOrder["status"] }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning">
        ⏳ Pending
      </span>
    );
  if (status === "accepted")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success">
        ✅ Accepted
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger">
      ❌ Rejected
    </span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: CustomerOrder;
  customerName: string;
  customerMobile: string;
  products: Product[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onWhatsApp: (order: CustomerOrder) => void;
}

function OrderCard({
  order,
  customerName,
  customerMobile,
  products,
  onAccept,
  onReject,
  onWhatsApp,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const itemSummary =
    order.items.length === 1
      ? (() => {
          const p = products.find((x) => x.id === order.items[0].productId);
          return `${p?.name ?? "Item"} (${order.items[0].qty})`;
        })()
      : `${order.items.length} items: ${order.items
          .slice(0, 2)
          .map((i) => {
            const p = products.find((x) => x.id === i.productId);
            return `${p?.name ?? "?"}(${i.qty})`;
          })
          .join(", ")}${order.items.length > 2 ? "..." : ""}`;

  return (
    <Card className="p-4 shadow-card border border-border bg-card">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground truncate">
              {customerName}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {itemSummary}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-foreground">{fmt(order.totalAmount)}</p>
          <p className="text-xs text-muted-foreground">
            {fmtDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Created by */}
      <p className="text-xs text-muted-foreground mb-2">
        बनाया: {order.createdBy}
      </p>

      {/* Rejection reason */}
      {order.status === "rejected" && order.rejectionReason && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 mb-2">
          कारण: {order.rejectionReason}
        </p>
      )}

      {/* Accepted info */}
      {order.status === "accepted" && (
        <p className="text-xs text-success bg-success-light rounded-md px-3 py-1.5 mb-2">
          ✅ यह order sale में convert हो गया है
        </p>
      )}

      {/* Expanded item breakdown */}
      {expanded && (
        <div className="border-t border-border pt-2 mt-2 mb-2 space-y-1">
          {order.items.map((item) => {
            const p = products.find((x) => x.id === item.productId);
            return (
              <div
                key={item.productId}
                className="flex justify-between text-xs text-foreground"
              >
                <span className="truncate max-w-[60%]">
                  {p?.name ?? item.productId} × {item.qty}
                </span>
                <span className="font-medium shrink-0">
                  {fmt(item.price * item.qty)}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between text-xs font-bold text-foreground border-t border-border pt-1 mt-1">
            <span>Total</span>
            <span>{fmt(order.totalAmount)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-2">
        {order.status === "pending" && (
          <>
            <Button
              size="sm"
              className="bg-success-light text-success hover:bg-success-light/80 border border-success/20 h-8 text-xs"
              onClick={() => onAccept(order.id)}
              data-ocid="order-accept-btn"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-danger border-danger/30 hover:bg-danger-light h-8 text-xs"
              onClick={() => onReject(order.id)}
              data-ocid="order-reject-btn"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
          </>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => onWhatsApp(order)}
          data-ocid="order-whatsapp-btn"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1" />
          WhatsApp
          {customerMobile ? ` (${customerMobile.slice(-4)})` : ""}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs ml-auto"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse items" : "Expand items"}
          data-ocid="order-expand-btn"
        >
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </Card>
  );
}

// ─── Create Order Modal ───────────────────────────────────────────────────────

interface CreateOrderModalProps {
  products: Product[];
  customers: { id: string; name: string; mobile: string }[];
  createdBy: string;
  onSave: (order: Omit<CustomerOrder, "id" | "shopId" | "createdAt">) => void;
  onClose: () => void;
}

function CreateOrderModal({
  products,
  customers,
  createdBy,
  onSave,
  onClose,
}: CreateOrderModalProps) {
  const keyCounter = useRef(0);
  const nextKey = () => {
    keyCounter.current += 1;
    return `item-${keyCounter.current}`;
  };

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { key: "item-0", productId: "", qty: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: nextKey(), productId: "", qty: 1, price: 0 },
    ]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(
    key: string,
    field: keyof Omit<OrderItem, "key">,
    value: string | number,
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (field === "productId") {
          const p = products.find((x) => x.id === value);
          return {
            ...item,
            productId: value as string,
            price: p?.sellingPrice ?? 0,
          };
        }
        return { ...item, [field]: Number(value) };
      }),
    );
  }

  function handleSave() {
    if (!customerId) {
      toast.error("Customer select karein");
      return;
    }
    const validItems = items.filter(
      (i) => i.productId && i.qty > 0 && i.price >= 0,
    );
    if (validItems.length === 0) {
      toast.error("Kam se kam ek product add karein");
      return;
    }
    onSave({
      customerId,
      items: validItems.map(({ productId, qty, price }) => ({
        productId,
        qty,
        price,
      })),
      totalAmount: validItems.reduce((s, i) => s + i.qty * i.price, 0),
      status: "pending",
      createdBy: notes ? `${createdBy} — ${notes}` : createdBy,
    });
  }

  function handleBackdropKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleBackdropKeyDown}
      role="presentation"
    >
      <dialog
        open
        aria-label="New customer order"
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto shadow-xl border border-border m-0 p-0 sm:m-auto"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">New Customer Order</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Customer select */}
          <div>
            <label
              htmlFor="order-customer-select"
              className="text-xs font-semibold text-muted-foreground mb-1 block"
            >
              Customer चुनें *
            </label>
            <select
              id="order-customer-select"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              data-ocid="order-customer-select"
            >
              <option value="">— Customer select करें —</option>
              <option value="walk-in">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.mobile ? `(${c.mobile})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Products
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex gap-2 items-start">
                  <label
                    htmlFor={`product-select-${item.key}`}
                    className="sr-only"
                  >
                    Product
                  </label>
                  <select
                    id={`product-select-${item.key}`}
                    className="flex-1 min-w-0 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(item.key, "productId", e.target.value)
                    }
                    data-ocid={`order-product-select-${item.key}`}
                  >
                    <option value="">— Product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`qty-${item.key}`} className="sr-only">
                    Qty
                  </label>
                  <input
                    id={`qty-${item.key}`}
                    type="number"
                    min={1}
                    className="w-16 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(item.key, "qty", e.target.value)
                    }
                    placeholder="Qty"
                    data-ocid={`order-qty-${item.key}`}
                  />
                  <label htmlFor={`price-${item.key}`} className="sr-only">
                    Price
                  </label>
                  <input
                    id={`price-${item.key}`}
                    type="number"
                    min={0}
                    className="w-24 border border-input rounded-lg px-2 py-2 text-sm bg-background text-foreground text-right focus:outline-none focus:ring-1 focus:ring-ring"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(item.key, "price", e.target.value)
                    }
                    placeholder="₹ Price"
                    data-ocid={`order-price-${item.key}`}
                  />
                  {items.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-danger shrink-0"
                      onClick={() => removeItem(item.key)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full h-8 text-xs border-dashed"
              onClick={addItem}
              data-ocid="order-add-item-btn"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              और Item जोड़ें
            </Button>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="order-notes"
              className="text-xs font-semibold text-muted-foreground mb-1 block"
            >
              Notes (optional)
            </label>
            <Textarea
              id="order-notes"
              className="text-sm resize-none"
              rows={2}
              placeholder="कोई विशेष निर्देश..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-ocid="order-notes"
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/40 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">
              कुल राशि
            </span>
            <span className="text-lg font-bold text-primary">{fmt(total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <Button
            variant="outline"
            className="flex-1 h-10"
            onClick={onClose}
            data-ocid="order-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 bg-primary text-primary-foreground"
            onClick={handleSave}
            data-ocid="order-save-btn"
          >
            Order Save करें
          </Button>
        </div>
      </dialog>
    </div>
  );
}

// ─── Accept Confirmation ──────────────────────────────────────────────────────

function AcceptDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <dialog
        open
        aria-label="Accept order"
        className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl border border-border m-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <h3 className="font-bold text-foreground">Order Accept करें?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          यह order sale में convert हो जाएगा और stock automatically deduct होगा।
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-10" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 bg-success-light text-success hover:bg-success-light/80 border border-success/30"
            onClick={onConfirm}
            data-ocid="order-accept-confirm-btn"
          >
            हाँ, Accept करें
          </Button>
        </div>
      </dialog>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

const QUICK_REASONS = [
  "Out of Stock",
  "Price Issue",
  "Customer Cancelled",
  "Other",
];

function RejectModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (!reason.trim()) {
      toast.error("Rejection reason जरूरी है");
      return;
    }
    onConfirm(reason.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <dialog
        open
        aria-label="Reject order"
        className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl border border-border m-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-danger-light flex items-center justify-center">
            <XCircle className="w-5 h-5 text-danger" />
          </div>
          <h3 className="font-bold text-foreground">Order Reject करें?</h3>
        </div>

        {/* Quick reason chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                reason === r
                  ? "bg-danger-light text-danger border-danger/30"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              }`}
              onClick={() => setReason(r)}
              data-ocid={`reject-reason-chip-${r.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {r}
            </button>
          ))}
        </div>

        <label htmlFor="reject-reason-textarea" className="sr-only">
          Rejection reason
        </label>
        <Textarea
          id="reject-reason-textarea"
          className="text-sm resize-none mb-4"
          rows={2}
          placeholder="Rejection reason लिखें (जरूरी है)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-ocid="reject-reason-input"
        />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-10" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 border border-danger/30 bg-danger-light text-danger hover:bg-danger-light/80"
            onClick={handleConfirm}
            data-ocid="order-reject-confirm-btn"
          >
            Reject करें
          </Button>
        </div>
      </dialog>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CustomerOrdersPage() {
  const {
    customers,
    products,
    customerOrders,
    addCustomerOrder,
    acceptCustomerOrder,
    rejectCustomerOrder,
  } = useStore();
  const { currentUser, currentShop } = useAuth();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [showCreate, setShowCreate] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const shopName = currentShop?.name ?? "Save Shop System";

  // Filtered + sorted orders
  const filtered = customerOrders
    .filter((o) => filter === "all" || o.status === filter)
    .sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "oldest") return a.createdAt - b.createdAt;
      const na = customers.find((c) => c.id === a.customerId)?.name ?? "";
      const nb = customers.find((c) => c.id === b.customerId)?.name ?? "";
      return na.localeCompare(nb);
    });

  const pendingCount = customerOrders.filter(
    (o) => o.status === "pending",
  ).length;

  function getCustomer(id: string) {
    if (id === "walk-in") return { name: "Walk-in Customer", mobile: "" };
    const c = customers.find((x) => x.id === id);
    return { name: c?.name ?? "Customer", mobile: c?.mobile ?? "" };
  }

  function buildWhatsAppMessage(order: CustomerOrder) {
    const { name } = getCustomer(order.customerId);
    const lines = order.items.map((item) => {
      const p = products.find((x) => x.id === item.productId);
      return `  ${p?.name ?? item.productId}: ${item.qty} × ${fmt(item.price)} = ${fmt(item.qty * item.price)}`;
    });
    const statusLabel =
      order.status === "pending"
        ? "Pending (Under Review)"
        : order.status === "accepted"
          ? "Accepted ✅"
          : `Rejected ❌ — ${order.rejectionReason ?? ""}`;
    return `Namaste ${name},\nAapka order:\n${lines.join("\n")}\nTotal: ${fmt(order.totalAmount)}\nStatus: ${statusLabel}\n\n- ${shopName}`;
  }

  function handleWhatsApp(order: CustomerOrder) {
    const { mobile } = getCustomer(order.customerId);
    const message = buildWhatsAppMessage(order);
    if (!mobile) {
      toast.error("Customer ka mobile number nahi hai");
      return;
    }
    window.open(
      `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  }

  async function handleAcceptConfirm() {
    if (!acceptingId) return;
    await acceptCustomerOrder(acceptingId);
    setAcceptingId(null);
    toast.success("Order accepted aur sale mein convert ho gayi! ✅");
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectingId) return;
    await rejectCustomerOrder(rejectingId, reason);
    setRejectingId(null);
    toast.success("Order reject ho gaya");
  }

  async function handleCreateOrder(
    co: Omit<CustomerOrder, "id" | "shopId" | "createdAt">,
  ) {
    await addCustomerOrder(co);
    setShowCreate(false);
    toast.success("Customer order save ho gaya! 📦");
  }

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "सभी" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background page-fade-in">
      {/* ── Page Header ─────────────────────────── */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-20 shadow-card">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground leading-tight truncate">
                Customer Orders
              </h1>
              <p className="text-xs text-muted-foreground">ग्राहक ऑर्डर</p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-warning-light text-warning border border-warning/20 shrink-0">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            className="h-9 shrink-0 bg-primary text-primary-foreground"
            onClick={() => setShowCreate(true)}
            data-ocid="new-order-btn"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Order
          </Button>
        </div>

        {/* Filter + Sort row */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex gap-1 overflow-x-auto pb-0.5"
            role="tablist"
            aria-label="Order filter"
            data-ocid="order-filter-tabs"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setFilter(tab.key)}
                data-ocid={`filter-${tab.key}`}
              >
                {tab.label}
                {tab.key !== "all" && (
                  <span className="ml-1 opacity-70">
                    ({customerOrders.filter((o) => o.status === tab.key).length}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>

          <label htmlFor="order-sort" className="sr-only">
            Sort orders
          </label>
          <select
            id="order-sort"
            className="text-xs border border-input bg-background text-foreground rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            data-ocid="order-sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="customer">By Customer</option>
          </select>
        </div>
      </div>

      {/* ── Order List ───────────────────────────── */}
      <div className="flex-1 p-4 space-y-3">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-4"
            data-ocid="orders-empty-state"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {filter === "all"
                  ? "Koi customer order nahi hai."
                  : `कोई ${filter} order नहीं है।`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                "New Order" button se pehla order banayein
              </p>
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground h-9"
              onClick={() => setShowCreate(true)}
              data-ocid="empty-new-order-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Order
            </Button>
          </div>
        ) : (
          filtered.map((order) => {
            const { name, mobile } = getCustomer(order.customerId);
            return (
              <OrderCard
                key={order.id}
                order={order}
                customerName={name}
                customerMobile={mobile}
                products={products}
                onAccept={(id) => setAcceptingId(id)}
                onReject={(id) => setRejectingId(id)}
                onWhatsApp={handleWhatsApp}
              />
            );
          })
        )}
      </div>

      {/* ── Modals ───────────────────────────────── */}
      {showCreate && (
        <CreateOrderModal
          products={products}
          customers={customers}
          createdBy={currentUser?.name ?? "Owner"}
          onSave={handleCreateOrder}
          onClose={() => setShowCreate(false)}
        />
      )}

      {acceptingId && (
        <AcceptDialog
          onConfirm={handleAcceptConfirm}
          onClose={() => setAcceptingId(null)}
        />
      )}

      {rejectingId && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectingId(null)}
        />
      )}
    </div>
  );
}
