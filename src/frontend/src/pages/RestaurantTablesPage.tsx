import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  LayoutGrid,
  Plus,
  RefreshCw,
  Table2,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import {
  loadRestaurantData,
  useRestaurantData,
} from "../hooks/useRestaurantData";
import type { RestaurantTable, TableStatus } from "../types/restaurant";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    icon: React.ElementType;
    cardCls: string;
    badgeCls: string;
    dotCls: string;
    textCls: string;
    countColor: string;
  }
> = {
  free: {
    label: "Free",
    icon: CheckCircle2,
    cardCls: "bg-table-free border-[oklch(var(--table-free)/0.4)]",
    badgeCls:
      "bg-[oklch(var(--table-free)/0.12)] text-[oklch(var(--table-free))]",
    dotCls: "bg-[oklch(var(--table-free))]",
    textCls: "text-table-free",
    countColor: "text-table-free",
  },
  occupied: {
    label: "Occupied",
    icon: UtensilsCrossed,
    cardCls: "bg-table-occupied border-[oklch(var(--table-occupied)/0.4)]",
    badgeCls:
      "bg-[oklch(var(--table-occupied)/0.12)] text-[oklch(var(--table-occupied))]",
    dotCls: "bg-[oklch(var(--table-occupied))]",
    textCls: "text-table-occupied",
    countColor: "text-table-occupied",
  },
  reserved: {
    label: "Reserved",
    icon: Clock,
    cardCls: "bg-table-reserved border-[oklch(var(--table-reserved)/0.4)]",
    badgeCls:
      "bg-[oklch(var(--table-reserved)/0.12)] text-[oklch(var(--table-reserved))]",
    dotCls: "bg-[oklch(var(--table-reserved))]",
    textCls: "text-table-reserved",
    countColor: "text-table-reserved",
  },
};

// Manual cycling only applies to free/reserved (occupied is order-system driven)
const MANUAL_CYCLE: Record<TableStatus, TableStatus> = {
  free: "reserved",
  reserved: "free",
  occupied: "free", // allow staff to mark occupied as free (e.g. manual clear)
};

function genTableId() {
  return `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── 15-second table auto-refresh ────────────────────────────────────────────

const BASE_INTERVAL_MS = 15_000;
const JITTER_MS = 2_000;

function nextInterval() {
  const jitter = (Math.random() * 2 - 1) * JITTER_MS;
  return Math.max(BASE_INTERVAL_MS + jitter, 5_000);
}

function useTableSync(
  shopId: string,
  onUpdate: (tables: RestaurantTable[]) => void,
) {
  const prevRef = useRef<string>("");
  const onUpdateRef = useRef(onUpdate);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const poll = useCallback(() => {
    if (!shopId || !navigator.onLine) return;
    try {
      const { tables } = loadRestaurantData(shopId);
      const snap = JSON.stringify(tables);
      if (snap !== prevRef.current) {
        prevRef.current = snap;
        onUpdateRef.current(tables);
      }
      setLastSyncAt(new Date());
    } catch {
      /* silent */
    }
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(() => {
        poll();
        schedule();
      }, nextInterval());
    }
    poll();
    schedule();
    return () => clearTimeout(timer);
  }, [shopId, poll]);

  return { lastSyncAt };
}

// ─── Table Card ───────────────────────────────────────────────────────────────

interface TableCardProps {
  table: RestaurantTable;
  index: number;
  isOwnerOrManager: boolean;
  onCycle: (table: RestaurantTable) => void;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (id: string) => void;
}

function TableCard({
  table,
  index,
  isOwnerOrManager,
  onCycle,
  onEdit,
  onDelete,
}: TableCardProps) {
  const cfg = STATUS_CONFIG[table.status];

  return (
    <Card
      data-ocid={`restaurant.tables.item.${index}`}
      className={cn(
        "border-2 transition-all duration-200 shadow-card hover:shadow-card-lift",
        cfg.cardCls,
      )}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        {/* Table number */}
        <div className="text-3xl font-black text-foreground leading-none">
          {table.tableNumber}
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
            cfg.badgeCls,
          )}
        >
          <span
            className={cn("w-1.5 h-1.5 rounded-full inline-block", cfg.dotCls)}
          />
          {cfg.label}
        </span>

        {/* Capacity */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={11} aria-hidden />
          <span>{table.capacity} seats</span>
        </div>

        {/* Actions */}
        <div className="w-full space-y-1.5 mt-1">
          <button
            type="button"
            data-ocid={`restaurant.tables.status.toggle.${index}`}
            onClick={() => onCycle(table)}
            aria-label={`Change table ${table.tableNumber} status`}
            className="w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors"
          >
            {table.status === "free"
              ? "→ Mark Reserved"
              : table.status === "reserved"
                ? "→ Mark Free"
                : "→ Mark Free"}
          </button>

          {isOwnerOrManager && (
            <div className="flex gap-1.5">
              <button
                type="button"
                data-ocid={`restaurant.tables.edit_button.${index}`}
                onClick={() => onEdit(table)}
                aria-label={`Edit table ${table.tableNumber}`}
                className="flex-1 px-2 py-1 rounded-lg text-xs bg-muted hover:bg-muted/70 text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                data-ocid={`restaurant.tables.delete_button.${index}`}
                onClick={() => onDelete(table.id)}
                aria-label={`Delete table ${table.tableNumber}`}
                className="px-2 py-1 rounded-lg text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 size={12} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RestaurantTablesPage() {
  const { shopId } = useStore();
  const { currentUser } = useAuth();
  const { tables, setTables } = useRestaurantData(shopId);

  const isOwnerOrManager =
    currentUser?.role === "owner" || currentUser?.role === "manager";

  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null,
  );
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 15s auto-refresh
  const { lastSyncAt } = useTableSync(
    shopId,
    useCallback(
      (updated) => {
        setTables(updated);
      },
      [setTables],
    ),
  );

  // ── Counts ────────────────────────────────────────────────────────────────

  const freeCount = tables.filter((t) => t.status === "free").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  const filtered =
    statusFilter === "all"
      ? tables
      : tables.filter((t) => t.status === statusFilter);

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingTable(null);
    setTableNumber("");
    setCapacity("4");
    setDialogOpen(true);
  };

  const openEdit = (t: RestaurantTable) => {
    setEditingTable(t);
    setTableNumber(String(t.tableNumber));
    setCapacity(String(t.capacity));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const num = Number(tableNumber);
    if (!num || num <= 0) {
      toast.error("A valid table number is required");
      return;
    }
    const cap = Math.max(1, Number(capacity) || 4);
    const now = new Date().toISOString();

    if (editingTable) {
      setTables(
        tables.map((t) =>
          t.id === editingTable.id
            ? { ...t, tableNumber: num, capacity: cap, updatedAt: now }
            : t,
        ),
      );
      toast.success(`Table ${num} updated`);
    } else {
      if (tables.some((t) => t.tableNumber === num)) {
        toast.error(`Table ${num} already exists`);
        return;
      }
      const newTable: RestaurantTable = {
        id: genTableId(),
        shopId,
        tableNumber: num,
        capacity: cap,
        status: "free",
        updatedAt: now,
      };
      setTables(
        [...tables, newTable].sort((a, b) => a.tableNumber - b.tableNumber),
      );
      toast.success(`Table ${num} added`);
    }
    setDialogOpen(false);
  };

  const cycleStatus = (table: RestaurantTable) => {
    const next = MANUAL_CYCLE[table.status];
    setTables(
      tables.map((t) =>
        t.id === table.id
          ? { ...t, status: next, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
    toast.success(
      `Table ${table.tableNumber} marked ${STATUS_CONFIG[next].label}`,
    );
  };

  const handleDelete = (id: string) => {
    const t = tables.find((t) => t.id === id);
    setTables(tables.filter((t) => t.id !== id));
    setDeleteId(null);
    if (t) toast.success(`Table ${t.tableNumber} removed`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-5" data-ocid="restaurant.tables.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Table2 className="text-primary" size={22} aria-hidden />
            Table Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
            {tables.length} tables total
            {lastSyncAt && (
              <span className="flex items-center gap-1 text-xs opacity-60">
                <RefreshCw size={10} aria-hidden />
                synced{" "}
                {lastSyncAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
        </div>
        {isOwnerOrManager && (
          <Button
            data-ocid="restaurant.tables.add_button"
            onClick={openAdd}
            className="gap-2"
          >
            <Plus size={16} aria-hidden /> Add Table
          </Button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { status: "free" as TableStatus, count: freeCount },
            { status: "occupied" as TableStatus, count: occupiedCount },
            { status: "reserved" as TableStatus, count: reservedCount },
          ] as const
        ).map(({ status, count }) => {
          const cfg = STATUS_CONFIG[status];
          const StatusIcon = cfg.icon;
          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === status ? "all" : status)
              }
              className={cn(
                "rounded-xl p-3 border-2 text-center transition-all",
                statusFilter === status
                  ? `${cfg.cardCls} ring-2 ring-offset-1 ring-current`
                  : "bg-card border-border hover:bg-muted/40",
              )}
              data-ocid={`restaurant.tables.summary.${status}`}
            >
              <div className={cn("text-2xl font-black", cfg.countColor)}>
                {count}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <StatusIcon size={11} className={cfg.textCls} aria-hidden />
                <span className="text-xs text-muted-foreground">
                  {cfg.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 flex-wrap"
        data-ocid="restaurant.tables.filter.tab"
      >
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          All Tables ({tables.length})
        </button>
        {(["free", "occupied", "reserved"] as TableStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5",
                statusFilter === s
                  ? `${cfg.badgeCls} ring-2 ring-offset-1 ring-current`
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotCls)} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Table grid */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="restaurant.tables.empty_state"
        >
          <LayoutGrid
            size={40}
            className="mx-auto mb-3 opacity-25"
            aria-hidden
          />
          <p className="font-semibold text-base">No tables found</p>
          <p className="text-sm mt-1">
            {statusFilter !== "all"
              ? `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} tables right now`
              : "Add tables to start managing your floor"}
          </p>
          {isOwnerOrManager && statusFilter === "all" && (
            <Button className="mt-4 gap-2" onClick={openAdd}>
              <Plus size={16} aria-hidden /> Add First Table
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((table, idx) => (
            <TableCard
              key={table.id}
              table={table}
              index={idx + 1}
              isOwnerOrManager={isOwnerOrManager}
              onCycle={cycleStatus}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="restaurant.tables.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table2 size={18} aria-hidden className="text-primary" />
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="table-num">Table Number *</Label>
              <Input
                id="table-num"
                data-ocid="restaurant.tables.number.input"
                type="number"
                min={1}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 1"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="table-cap">Seating Capacity</Label>
              <Input
                id="table-cap"
                data-ocid="restaurant.tables.capacity.input"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">
                Number of guests this table can seat
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                data-ocid="restaurant.tables.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="restaurant.tables.submit_button"
                className="flex-1"
                onClick={handleSave}
              >
                {editingTable ? "Save Changes" : "Add Table"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          data-ocid="restaurant.tables.delete.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Remove Table?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This table will be permanently removed. Any active orders on this
            table should be settled first.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              data-ocid="restaurant.tables.delete.cancel_button"
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="restaurant.tables.delete.confirm_button"
              variant="destructive"
              className="flex-1"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
