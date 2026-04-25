import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Package,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LockBadge } from "../components/LockBadge";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useLockManager } from "../hooks/useLockManager";
import type { NavPage, Product, StockBatch } from "../types/store";
import { ROLE_PERMISSIONS } from "../types/store";

function fmtCurrency(n: number) {
  return `\u20b9${n.toLocaleString("en-IN")}`;
}

// ── Expiry helpers ────────────────────────────────────────────────────────────
function getExpiryStatus(
  expiryDate?: string,
): "expired" | "warning" | "normal" {
  if (!expiryDate?.trim()) return "normal";
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 3) return "warning";
  return "normal";
}

function getDaysLeft(expiryDate?: string): number | null {
  if (!expiryDate?.trim()) return null;
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** Format batch qty for mixed-unit products */
function formatBatchQty(product: Product, batch: StockBatch): string {
  if (
    product.unitMode === "mixed" &&
    batch.lengthQty != null &&
    batch.weightQty != null
  ) {
    return `${batch.lengthQty} ${product.lengthUnit || ""} (${batch.weightQty} ${product.weightUnit || ""})`;
  }
  if (product.unitMode === "mixed" && batch.lengthQty != null) {
    return `${batch.lengthQty} ${product.lengthUnit || ""}`;
  }
  return `${batch.quantity} ${product.unit}`;
}

/** Format total stock display for mixed-unit products */
function formatTotalStock(
  product: Product,
  batches: StockBatch[],
  totalQty: number,
): string {
  if (product.unitMode === "mixed") {
    const totalLength = batches.reduce(
      (s, b) => s + (b.lengthQty ?? b.quantity),
      0,
    );
    const totalWeight = batches.reduce((s, b) => s + (b.weightQty ?? 0), 0);
    if (totalWeight > 0) {
      return `${totalLength} ${product.lengthUnit || ""} (${totalWeight} ${product.weightUnit || ""})`;
    }
    return `${totalLength} ${product.lengthUnit || ""}`;
  }
  return `${totalQty} ${product.unit}`;
}

// ── Batch View Dialog ─────────────────────────────────────────────────────────
interface BatchViewDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  getProductBatches: (id: string) => StockBatch[];
  canViewCost: boolean;
}

function BatchViewDialog({
  product,
  open,
  onClose,
  getProductBatches,
  canViewCost,
}: BatchViewDialogProps) {
  if (!product) return null;

  const batches = getProductBatches(product.id).sort(
    (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
  );

  const totalQty = batches.reduce((s, b) => s + b.quantity, 0);
  const totalValue = batches.reduce(
    (s, b) => s + b.quantity * b.purchaseRate,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="inventory.batch_view.dialog"
        className="max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package size={18} className="text-primary" />
            {product.name} — Batches
          </DialogTitle>
        </DialogHeader>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="bg-secondary/60 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">Total Batches</div>
            <div className="text-sm font-bold">{batches.length}</div>
          </div>
          <div className="bg-secondary/60 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">Total Qty</div>
            <div className="text-sm font-bold">
              {totalQty} {product.unit}
            </div>
          </div>
          {canViewCost && (
            <div className="bg-secondary/60 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className="text-sm font-bold text-primary">
                {fmtCurrency(totalValue)}
              </div>
            </div>
          )}
        </div>

        {/* Batch Table */}
        {batches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Package className="mx-auto mb-2" size={24} />
            No batches available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs font-semibold">
                    Batch No
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Qty</TableHead>
                  {canViewCost && (
                    <TableHead className="text-xs font-semibold">
                      Rate (₹)
                    </TableHead>
                  )}
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  {canViewCost && (
                    <TableHead className="text-xs font-semibold text-right">
                      Value
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b, idx) => (
                  <TableRow
                    key={b.id}
                    data-ocid={`inventory.batch_view.item.${idx + 1}`}
                  >
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          B{String(b.batchNumber ?? idx + 1).padStart(3, "0")}
                        </Badge>
                        {idx === 0 && (
                          <Badge className="text-[9px] bg-primary/10 text-primary border-0 px-1">
                            Next FIFO
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {formatBatchQty(product, b)}
                    </TableCell>
                    {canViewCost && (
                      <TableCell className="text-xs">
                        {fmtCurrency(b.purchaseRate)}
                      </TableCell>
                    )}
                    <TableCell className="text-xs">
                      {new Date(b.dateAdded).toLocaleDateString("en-IN")}
                    </TableCell>
                    {canViewCost && (
                      <TableCell className="text-xs text-right font-medium">
                        {fmtCurrency(b.quantity * b.purchaseRate)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer Total Row — only if cost is visible */}
        {batches.length > 0 && canViewCost && (
          <div className="flex justify-between items-center border-t border-border pt-3 mt-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Total Value ({batches.length} batch
              {batches.length !== 1 ? "es" : ""})
            </span>
            <span className="text-sm font-bold text-primary">
              {fmtCurrency(totalValue)}
            </span>
          </div>
        )}

        <Button
          data-ocid="inventory.batch_view.close_button"
          variant="outline"
          className="w-full mt-2"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryPage({
  onNavigate,
  selectedProductId: initialSelectedProductId,
}: {
  onNavigate?: (page: NavPage, params?: Record<string, unknown>) => void;
  selectedProductId?: string;
}) {
  const {
    products,
    categories,
    getProductStock,
    getProductBatches,
    purchaseOrders,
    refreshCounter,
    isPhase1Loading,
    isPhase2Loading,
    phase1HasPartialError,
    phase2HasPartialError,
    appConfig,
    autoMode,
  } = useStore();
  void refreshCounter; // ensures InventoryPage re-renders whenever a mutation fires
  // Re-render when Phase2 background load finishes (purchaseOrders loaded)
  void isPhase2Loading;
  void appConfig; // ensures re-render when featureMode changes
  void autoMode; // ensures re-render when mode switcher changes
  const { currentUser } = useAuth();
  const userRole = currentUser?.role ?? "staff";
  const canViewCost = ROLE_PERMISSIONS.canViewCostPrice(userRole);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(
    initialSelectedProductId ?? null,
  );
  const [batchDialogProduct, setBatchDialogProduct] = useState<Product | null>(
    null,
  );
  const highlightedCardRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to highlighted product on mount
  useEffect(() => {
    if (!initialSelectedProductId) return;
    const timer = setTimeout(() => {
      highlightedCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [initialSelectedProductId]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
          p.name.toLowerCase().includes(q) ||
          p.partNo?.toLowerCase().includes(q) ||
          p.srNo?.toLowerCase().includes(q) ||
          p.tnNo?.toLowerCase().includes(q);
        const matchCat =
          categoryFilter === "all" || p.categoryId === categoryFilter;
        return matchSearch && matchCat;
      }),
    [products, search, categoryFilter],
  );

  const totalStockItems = products.length;
  const lowStockCount = useMemo(
    () =>
      products.filter((p) => getProductStock(p.id) < p.minStockAlert).length,
    [products, getProductStock],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Phase 1 loading skeleton (shop switch) ── */}
      {isPhase1Loading && (
        <div
          data-ocid="inventory.loading_state"
          className="px-4 md:px-6 pt-6 flex flex-col gap-4"
        >
          <div className="h-7 w-48 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-8 rounded-xl bg-muted/40 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Phase 1 error banner ── */}
      {phase1HasPartialError && !isPhase1Loading && (
        <div
          data-ocid="inventory.error_state"
          className="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-800 dark:text-red-300"
        >
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span className="text-xs font-medium flex-1">
            Some inventory data failed to load. Product or batch data may be
            incomplete.
          </span>
          <button
            type="button"
            data-ocid="inventory.phase1_error.retry_button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 text-red-700 dark:text-red-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Phase 2 error banner ── */}
      {phase2HasPartialError && !isPhase1Loading && (
        <div className="mx-4 flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300">
          <AlertTriangle size={13} className="flex-shrink-0" />
          <span className="text-xs flex-1">
            Some background data (sales, payments) could not be loaded.
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 text-amber-700 dark:text-amber-400"
          >
            Refresh
          </button>
        </div>
      )}

      {!isPhase1Loading && (
        <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground text-sm">
                FIFO batch-wise stock tracking
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onNavigate && (
                <Button
                  data-ocid="inventory.add_new_stock.button"
                  onClick={() => onNavigate("stock")}
                  size="sm"
                  className="gap-1.5 text-sm font-semibold"
                >
                  <Plus size={15} />
                  <span className="hidden sm:inline">Add New Stock</span>
                  <span className="sm:hidden">Add Stock</span>
                </Button>
              )}
              <Badge variant="outline" className="text-xs">
                {totalStockItems} Products
              </Badge>
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle size={10} className="mr-1" /> {lowStockCount}{" "}
                  Low
                </Badge>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
              />
              <Input
                data-ocid="inventory.search.input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                data-ocid="inventory.category.select"
                className="w-44 h-8 text-sm"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div
                data-ocid="inventory.list.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <Package className="mx-auto mb-3" size={32} />
                No products found
              </div>
            )}

            {filtered.map((p, idx) => {
              // Look up last purchase order for this product to pre-fill reorder
              const lastPO = purchaseOrders
                .filter((po) => po.productId === p.id)
                .sort((a, b) => b.createdAt - a.createdAt)[0];
              const isHighlighted = p.id === initialSelectedProductId;

              return (
                <div
                  key={p.id}
                  ref={isHighlighted ? highlightedCardRef : null}
                  className={
                    isHighlighted
                      ? "ring-2 ring-primary ring-offset-2 rounded-xl transition-all duration-300"
                      : ""
                  }
                >
                  <ProductCard
                    product={p}
                    idx={idx}
                    isExpanded={expandedProduct === p.id}
                    onToggle={(id) =>
                      setExpandedProduct(expandedProduct === id ? null : id)
                    }
                    getProductStock={getProductStock}
                    getProductBatches={getProductBatches}
                    onViewBatches={(prod) => setBatchDialogProduct(prod)}
                    canViewCost={canViewCost}
                    canEdit={ROLE_PERMISSIONS.canEditProduct(userRole)}
                    canDelete={ROLE_PERMISSIONS.canDeleteProducts(userRole)}
                    onReorder={
                      onNavigate
                        ? () =>
                            onNavigate("purchase-orders", {
                              reorderProductId: p.id,
                              reorderVendorId: lastPO?.vendorId,
                              reorderRate: lastPO?.rate,
                            })
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch View Dialog */}
      <BatchViewDialog
        product={batchDialogProduct}
        open={batchDialogProduct !== null}
        onClose={() => setBatchDialogProduct(null)}
        getProductBatches={getProductBatches}
        canViewCost={canViewCost}
      />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  idx: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  getProductStock: (id: string) => number;
  getProductBatches: (id: string) => StockBatch[];
  onViewBatches: (p: Product) => void;
  canViewCost: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onReorder?: () => void;
}

function ProductCard({
  product: p,
  idx,
  isExpanded,
  onToggle,
  getProductStock,
  getProductBatches,
  onViewBatches,
  canViewCost,
  canEdit,
  canDelete,
  onReorder,
}: ProductCardProps) {
  const { categories } = useStore();
  const { acquireLock, releaseLock } = useLockManager();
  const [lockStatus, setLockStatus] = useState<"idle" | "mine" | "conflict">(
    "idle",
  );
  const [conflictUser, setConflictUser] = useState("");
  const stock = getProductStock(p.id);
  const batches = getProductBatches(p.id);
  const isLow = stock < p.minStockAlert;
  const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "Unknown";

  // Check if any batch in this product is expiring/expired
  const worstStatus = batches.reduce<"expired" | "warning" | "normal">(
    (acc, b) => {
      const s = getExpiryStatus(b.expiryDate);
      if (s === "expired") return "expired";
      if (s === "warning" && acc !== "expired") return "warning";
      return acc;
    },
    "normal",
  );

  const unitLabel =
    p.unitMode === "mixed" && p.lengthUnit && p.weightUnit
      ? `${p.lengthUnit}+${p.weightUnit}`
      : p.unit;

  const totalStockDisplay = formatTotalStock(p, batches, stock);

  return (
    <Card
      data-ocid={`inventory.item.${idx + 1}`}
      className={`shadow-card border ${
        isLow
          ? "border-destructive/30"
          : worstStatus === "expired"
            ? "border-red-300"
            : worstStatus === "warning"
              ? "border-yellow-300"
              : "border-border"
      }`}
    >
      <Collapsible
        open={isExpanded}
        onOpenChange={(open) => onToggle(open ? p.id : "")}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/40 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isLow
                    ? "bg-danger-light"
                    : worstStatus === "expired"
                      ? "bg-red-100"
                      : worstStatus === "warning"
                        ? "bg-yellow-100"
                        : "bg-accent"
                }`}
              >
                <Package
                  size={18}
                  className={
                    isLow
                      ? "text-danger"
                      : worstStatus === "expired"
                        ? "text-red-600"
                        : worstStatus === "warning"
                          ? "text-yellow-600"
                          : "text-brand-blue"
                  }
                />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1">
                  {p.name}
                  {p.unitMode === "mixed" && (
                    <Badge className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700 border-0">
                      Mixed
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {cat} &middot; {unitLabel}
                  {p.vendorName && (
                    <span className="ml-1 text-muted-foreground/70">
                      &middot; {p.vendorName}
                    </span>
                  )}
                </div>
                {/* Spare Part Fields — auto-visible when any field is set */}
                {(p.partNo ||
                  p.srNo ||
                  p.tnNo ||
                  p.dd ||
                  p.ed ||
                  p.mrp != null) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.partNo && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700">
                        Part No: {p.partNo}
                      </span>
                    )}
                    {p.srNo && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700">
                        SR No: {p.srNo}
                      </span>
                    )}
                    {p.tnNo && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700">
                        TN No: {p.tnNo}
                      </span>
                    )}
                    {p.dd && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700">
                        DD: {p.dd}
                      </span>
                    )}
                    {p.ed && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700">
                        ED: {p.ed}
                      </span>
                    )}
                    {p.mrp != null && (
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700">
                        MRP: ₹{p.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-bold">{totalStockDisplay}</div>
                {/* Batch count badge + View Batches button */}
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <span className="inline-flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded-full">
                    {batches.length} batch{batches.length !== 1 ? "es" : ""}
                  </span>
                  <Button
                    data-ocid={`inventory.item.view_batches.${idx + 1}`}
                    variant="outline"
                    size="sm"
                    className="h-5 px-1.5 text-[10px] gap-0.5 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBatches(p);
                    }}
                  >
                    <Eye size={10} />
                    View
                  </Button>
                </div>
              </div>
              {isLow && (
                <Badge variant="destructive" className="text-xs hidden sm:flex">
                  Low Stock
                </Badge>
              )}
              {/* Reorder button for low-stock items */}
              {isLow && onReorder && (
                <Button
                  data-ocid={`inventory.item.reorder.${idx + 1}`}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] gap-1 border-orange-400 text-orange-600 hover:bg-orange-50 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder();
                  }}
                >
                  <ShoppingCart size={11} />
                  Reorder
                </Button>
              )}
              {/* Expiry badge on header row */}
              {worstStatus === "expired" && (
                <Badge className="ml-1 text-xs bg-red-100 text-red-700 border-red-200 border hidden sm:flex">
                  Expired ❌
                </Badge>
              )}
              {worstStatus === "warning" && (
                <Badge className="ml-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-200 border hidden sm:flex">
                  Expiring Soon ⚠️
                </Badge>
              )}
              <div className="text-muted-foreground">
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-border mt-0">
            <div className="pt-3">
              {/* Product meta info — vendor shown to all; purchase price only to owner/manager */}
              {(p.vendorName ||
                (canViewCost && p.purchasePrice != null) ||
                p.details) && (
                <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {p.vendorName && (
                    <div className="bg-secondary/60 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">
                        Vendor
                      </div>
                      <div className="text-sm font-medium truncate">
                        {p.vendorName}
                      </div>
                    </div>
                  )}
                  {canViewCost && p.purchasePrice != null && (
                    <div className="bg-secondary/60 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">
                        Purchase Price
                      </div>
                      <div className="text-sm font-medium">
                        {fmtCurrency(p.purchasePrice)}
                      </div>
                    </div>
                  )}
                  {p.details && (
                    <div className="bg-secondary/60 rounded-lg p-2 sm:col-span-1">
                      <div className="text-xs text-muted-foreground">Notes</div>
                      <div
                        className="text-sm font-medium truncate"
                        title={p.details}
                      >
                        {p.details.length > 30
                          ? `${p.details.slice(0, 30)}...`
                          : p.details}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mixed unit ratio info */}
              {p.unitMode === "mixed" && p.meterToKgRatio && (
                <div className="mb-3 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
                  💡 Smart Ratio: 1 {p.lengthUnit} = {p.meterToKgRatio}{" "}
                  {p.weightUnit}
                </div>
              )}

              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                FIFO Batch Queue (oldest first)
              </div>
              {batches.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No stock batches
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Batch #</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Expiry Date</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        {canViewCost && (
                          <>
                            <TableHead className="text-xs">Rate (₹)</TableHead>
                            <TableHead className="text-xs">Value</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((b, bi) => {
                        const expiryStatus = getExpiryStatus(b.expiryDate);
                        const daysLeft = getDaysLeft(b.expiryDate);
                        const rowBg =
                          expiryStatus === "expired"
                            ? "bg-red-50"
                            : expiryStatus === "warning"
                              ? "bg-yellow-50"
                              : "";
                        return (
                          <TableRow key={b.id} className={rowBg}>
                            <TableCell className="text-xs">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono"
                              >
                                B
                                {String(b.batchNumber ?? bi + 1).padStart(
                                  3,
                                  "0",
                                )}
                              </Badge>
                              {bi === 0 && (
                                <Badge className="ml-1 text-[10px] bg-primary/10 text-primary border-0">
                                  Next FIFO
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(b.dateAdded).toLocaleDateString(
                                "en-IN",
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {b.expiryDate ? (
                                <div className="flex flex-col gap-0.5">
                                  <span>
                                    {new Date(
                                      `${b.expiryDate}T00:00:00`,
                                    ).toLocaleDateString("en-IN")}
                                  </span>
                                  {expiryStatus === "expired" && (
                                    <span className="text-red-600 font-semibold">
                                      Expired ❌
                                      {daysLeft !== null &&
                                        ` (${Math.abs(daysLeft)}d ago)`}
                                    </span>
                                  )}
                                  {expiryStatus === "warning" && (
                                    <span className="text-yellow-600 font-semibold">
                                      Expiring Soon ⚠️
                                      {daysLeft !== null &&
                                        ` (${daysLeft}d left)`}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  &mdash;
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {formatBatchQty(p, b)}
                            </TableCell>
                            {canViewCost && (
                              <>
                                <TableCell className="text-xs">
                                  {fmtCurrency(b.purchaseRate)}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {fmtCurrency(b.quantity * b.purchaseRate)}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Summary stats row */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Min Alert</div>
                  <div className="text-sm font-bold">
                    {p.minStockAlert} {p.unit}
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    Sell Price
                  </div>
                  <div className="text-sm font-bold">
                    {fmtCurrency(p.sellingPrice)}
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Batches</div>
                  <div className="text-sm font-bold">{batches.length}</div>
                </div>
              </div>

              {/* Edit/Delete buttons — hidden for staff */}
              {(canEdit || canDelete) && (
                <div className="mt-3 flex flex-wrap gap-2 items-center justify-end">
                  {/* Lock badge — shown when another user is editing */}
                  {lockStatus === "conflict" && (
                    <LockBadge
                      recordId={p.id}
                      recordType="product"
                      onLockConflict={(user) => {
                        setConflictUser(user);
                        setLockStatus("conflict");
                      }}
                    />
                  )}
                  {lockStatus === "mine" && (
                    <LockBadge recordId={p.id} recordType="product" />
                  )}
                  {canEdit && lockStatus === "idle" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1"
                      data-ocid={`inventory.item.edit_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const result = acquireLock(p.id, "product");
                        if (result.status === "conflict") {
                          setConflictUser(result.existingLock.userName);
                          setLockStatus("conflict");
                        } else {
                          setLockStatus("mine");
                        }
                      }}
                    >
                      Edit in Admin Panel
                    </Button>
                  )}
                  {canEdit && lockStatus === "mine" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1 border-green-400 text-green-700 hover:bg-green-50"
                      data-ocid={`inventory.item.cancel_edit_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        releaseLock(p.id, "product");
                        setLockStatus("idle");
                      }}
                    >
                      Release Edit Lock
                    </Button>
                  )}
                  {canEdit && lockStatus === "conflict" && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Locked by {conflictUser}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
