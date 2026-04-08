import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  ChevronDown,
  ChevronUp,
  Clock,
  Receipt,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { useStore } from "../context/StoreContext";
import type { DraftSnapshot, Invoice, QAChange } from "../types/store";

function fmt(n: number) {
  return `\u20b9${n.toLocaleString("en-IN")}`;
}

type SalesFilter = "all" | "due" | "paid";
type HistoryTab = "sales" | "drafts";

// ── Payment Mode Badge ──────────────────────────────────────────────────────────────
function PaymentModeBadge({ mode }: { mode: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    cash: {
      label: "Cash",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    upi: {
      label: "UPI",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    online: {
      label: "Online",
      className: "bg-purple-100 text-purple-700 border-purple-300",
    },
    credit: {
      label: "Credit",
      className: "bg-amber-100 text-amber-700 border-amber-300",
    },
  };
  const cfg = configs[mode] ?? {
    label: mode,
    className: "bg-secondary text-foreground",
  };
  return (
    <Badge
      variant="outline"
      className={`text-[10px] capitalize font-medium ${cfg.className}`}
    >
      {cfg.label}
    </Badge>
  );
}

// ── Sales History Section ──────────────────────────────────────────────────────────
function SalesHistorySection() {
  const { invoices } = useStore();
  const [filter, setFilter] = useState<SalesFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = invoices
    .filter((inv) => {
      const due = inv.dueAmount ?? 0;
      if (filter === "due") return due > 0;
      if (filter === "paid") return due === 0;
      return true;
    })
    .filter((inv) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        inv.customerName.toLowerCase().includes(s) ||
        (inv.customerMobile ?? "").includes(s) ||
        inv.invoiceNumber.toLowerCase().includes(s)
      );
    });

  const dueCount = invoices.filter((i) => (i.dueAmount ?? 0) > 0).length;
  const paidCount = invoices.filter((i) => (i.dueAmount ?? 0) === 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as SalesFilter)}>
          <TabsList className="h-8">
            <TabsTrigger
              data-ocid="history.sales.all.tab"
              value="all"
              className="text-xs h-7 px-3"
            >
              All ({invoices.length})
            </TabsTrigger>
            <TabsTrigger
              data-ocid="history.sales.due.tab"
              value="due"
              className="text-xs h-7 px-3"
            >
              Credit/Due ({dueCount})
            </TabsTrigger>
            <TabsTrigger
              data-ocid="history.sales.paid.tab"
              value="paid"
              className="text-xs h-7 px-3"
            >
              Paid ({paidCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          data-ocid="history.sales.search_input"
          placeholder="Search customer, invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm w-full sm:w-56"
        />
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs">Invoice</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Mobile</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Paid</TableHead>
                  <TableHead className="text-xs">Due</TableHead>
                  <TableHead className="text-xs">Mode</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      data-ocid="history.sales.empty_state"
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Receipt className="mx-auto mb-2" size={24} />
                      {filter === "due"
                        ? "Koi due invoice nahi hai"
                        : filter === "paid"
                          ? "Koi fully paid invoice nahi hai"
                          : "Koi invoice nahi mila"}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((inv, idx) => {
                  const due = inv.dueAmount ?? 0;
                  const isPaid = due === 0;
                  return (
                    <TableRow
                      key={inv.id}
                      data-ocid={`history.sales.item.${idx + 1}`}
                      className={`${
                        isPaid
                          ? "bg-green-50 dark:bg-green-950/20"
                          : "bg-red-50 dark:bg-red-950/20"
                      }`}
                    >
                      <TableCell className="text-xs font-medium">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {inv.customerName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.customerMobile || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {fmt(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-green-700 font-medium">
                        {fmt(inv.paidAmount)}
                      </TableCell>
                      <TableCell>
                        {due > 0 ? (
                          <span className="text-sm font-bold text-red-600">
                            {fmt(due)}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">
                            \u2713 Paid
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PaymentModeBadge mode={inv.paymentMode} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inv.date).toLocaleDateString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── QA Change type icon and color ─────────────────────────────────────────────────────────────
function qaIcon(type: QAChange["type"]) {
  switch (type) {
    case "product_added":
      return { emoji: "\u2795", color: "text-green-600" };
    case "product_edited":
      return { emoji: "\u270f\ufe0f", color: "text-blue-600" };
    case "product_deleted":
      return { emoji: "\ud83d\uddd1\ufe0f", color: "text-red-500" };
    case "stock_in":
      return { emoji: "\ud83d\udce6", color: "text-green-600" };
    case "stock_out":
      return { emoji: "\ud83d\udce4", color: "text-orange-500" };
    case "invoice_created":
      return { emoji: "\ud83e\uddfe", color: "text-blue-600" };
    default:
      return { emoji: "\ud83d\udd35", color: "text-muted-foreground" };
  }
}

function formatTs(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// ── Single Draft Row ───────────────────────────────────────────────────────────────────────
function DraftRow({
  snap,
  index,
  onRestore,
}: {
  snap: DraftSnapshot;
  index: number;
  onRestore: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card
      data-ocid={`history.item.${index + 1}`}
      className="border-border shadow-sm"
    >
      <CardContent className="p-3">
        {/* Row header */}
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{snap.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatTs(snap.timestamp)}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {snap.qaChanges.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {snap.qaChanges.length} change
                  {snap.qaChanges.length !== 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                {snap.products.length} products
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              data-ocid={`history.item.toggle.${index + 1}`}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setExpanded((v) => !v)}
            >
              Kya Badla?{" "}
              {expanded ? (
                <ChevronUp size={12} className="ml-1" />
              ) : (
                <ChevronDown size={12} className="ml-1" />
              )}
            </Button>

            <Button
              data-ocid={`history.item.open_modal_button.${index + 1}`}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs text-primary border-primary/40 hover:bg-primary/10"
              onClick={() => setConfirmOpen(true)}
            >
              <RotateCcw size={12} className="mr-1" />
              Wapas Jao
            </Button>
          </div>
        </div>

        {/* Expanded QA changes */}
        {expanded && (
          <div className="mt-3 pl-11 space-y-1.5">
            {snap.qaChanges.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Koi change details nahi hain.
              </p>
            ) : (
              snap.qaChanges.map((change) => {
                const { emoji, color } = qaIcon(change.type);
                const changeKey = `${change.type}-${change.description}`;
                return (
                  <div
                    key={changeKey}
                    className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-secondary/50"
                  >
                    <span
                      role="img"
                      aria-label={change.type}
                      className="text-sm"
                    >
                      {emoji}
                    </span>
                    <span className={`${color} font-medium`}>
                      {change.description}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid={`history.item.dialog.${index + 1}`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Data Restore Karein?</AlertDialogTitle>
            <AlertDialogDescription>
              Kya aap is snapshot se wapas jaana chahte hain?{" "}
              <strong className="text-foreground">
                Abhi ke saare product, stock aur invoice data overwrite ho
                jaayenge.
              </strong>{" "}
              Yeh action undo nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid={`history.item.cancel_button.${index + 1}`}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid={`history.item.confirm_button.${index + 1}`}
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                onRestore(snap.id);
                setConfirmOpen(false);
              }}
            >
              Haan, Restore Karein
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ── Draft History Section ──────────────────────────────────────────────────────────────
function DraftHistorySection() {
  const { getDrafts, saveDraftNow, restoreDraft } = useStore();
  const [drafts, setDrafts] = useState<DraftSnapshot[]>([]);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState("");

  const refreshDrafts = () => {
    getDrafts().then(setDrafts).catch(console.error);
  };

  useEffect(() => {
    getDrafts().then(setDrafts).catch(console.error);
  }, [getDrafts]);

  const handleTakeSnapshot = () => {
    saveDraftNow(snapshotLabel)
      .then(() => {
        setSnapshotLabel("");
        setSnapshotDialogOpen(false);
        refreshDrafts();
        toast.success("Snapshot save ho gaya! \u2713");
      })
      .catch(console.error);
  };

  const handleRestore = (id: string) => {
    restoreDraft(id)
      .then(() => {
        refreshDrafts();
        toast.success("Data restore ho gaya! \u2713");
      })
      .catch(console.error);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex-1">
          <Clock size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Har product add/edit/delete aur stock change se pehle{" "}
            <strong>automatic snapshot</strong> save hota hai. Last 10 snapshots
            store hote hain.
          </span>
        </div>
        <Button
          data-ocid="history.open_modal_button"
          size="sm"
          onClick={() => setSnapshotDialogOpen(true)}
          className="flex-shrink-0"
        >
          <Save size={14} className="mr-1.5" />
          Abhi Snapshot Lo
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock size={28} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            Koi draft nahi mila.
          </p>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Koi bhi change karo — product add, stock in/out — snapshot
            automatically save ho jaayega.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {drafts.map((snap, idx) => (
            <DraftRow
              key={snap.id}
              snap={snap}
              index={idx}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}

      <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
        <DialogContent data-ocid="history.snapshot.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abhi Snapshot Lo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm text-muted-foreground">
              Is snapshot ka ek naam likho (optional).
            </p>
            <Input
              data-ocid="history.snapshot.input"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="e.g. Before sale day, Before bulk import..."
              onKeyDown={(e) => e.key === "Enter" && handleTakeSnapshot()}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="history.snapshot.cancel_button"
              variant="outline"
              onClick={() => setSnapshotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="history.snapshot.submit_button"
              onClick={handleTakeSnapshot}
            >
              <Save size={14} className="mr-1.5" />
              Save Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main History Page ───────────────────────────────────────────────────────────────────────
export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>("sales");

  return (
    <div className="flex flex-col gap-6">
      <TopBar title="History" />

      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">History</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Sales history aur draft snapshots
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as HistoryTab)}
        >
          <TabsList>
            <TabsTrigger data-ocid="history.sales_tab.tab" value="sales">
              \ud83e\uddfe Sales History
            </TabsTrigger>
            <TabsTrigger data-ocid="history.drafts_tab.tab" value="drafts">
              \ud83d\udcbe Draft History
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "sales" && <SalesHistorySection />}
        {activeTab === "drafts" && <DraftHistorySection />}
      </div>
    </div>
  );
}
