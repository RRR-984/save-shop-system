import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Edit,
  History,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import { useAsyncAction } from "../hooks/useAsyncAction";
import type { Vendor, VendorRateHistory } from "../types/store";

// ─── Draft persistence ────────────────────────────────────────────────────────

const VENDOR_FORM_DRAFT_KEY = "saveshop_vendor_form_draft";

function getDraftKey(shopId: string) {
  return `${VENDOR_FORM_DRAFT_KEY}_${shopId}`;
}

// ─── Vendor Form ──────────────────────────────────────────────────────────────

interface VendorFormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

const EMPTY_FORM: VendorFormData = {
  name: "",
  mobile: "",
  email: "",
  address: "",
};

interface VendorFormProps {
  initial?: VendorFormData;
  onSave: (data: VendorFormData) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  shopId?: string;
}

function VendorForm({
  initial,
  onSave,
  onCancel,
  isEditing,
  shopId,
}: VendorFormProps) {
  // Load draft only for new (non-edit) forms
  const savedDraft = useMemo<VendorFormData | null>(() => {
    if (isEditing || !shopId) return null;
    try {
      const raw = localStorage.getItem(getDraftKey(shopId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as VendorFormData;
      // Only treat as a real draft if at least one field is non-empty
      if (!parsed.name && !parsed.mobile && !parsed.email && !parsed.address)
        return null;
      return parsed;
    } catch {
      return null;
    }
  }, [isEditing, shopId]);

  const [form, setForm] = useState<VendorFormData>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<VendorFormData>>({});
  const [hasDraft, setHasDraft] = useState(!!savedDraft);

  // Persist draft on every change (add-mode only)
  useEffect(() => {
    if (isEditing || !shopId) return;
    localStorage.setItem(getDraftKey(shopId), JSON.stringify(form));
  }, [form, isEditing, shopId]);

  const set =
    (field: keyof VendorFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const clearDraft = useCallback(() => {
    if (shopId) localStorage.removeItem(getDraftKey(shopId));
  }, [shopId]);

  const handleResumeDraft = useCallback(() => {
    if (savedDraft) setForm(savedDraft);
    setHasDraft(false);
  }, [savedDraft]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setForm(EMPTY_FORM);
    setHasDraft(false);
  }, [clearDraft]);

  const { execute: handleSave, isLoading: saving } = useAsyncAction(
    useCallback(async () => {
      const newErrors: Partial<VendorFormData> = {};
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      await onSave(form);
      clearDraft();
    }, [form, onSave, clearDraft]),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <h2 className="font-bold text-foreground text-lg">
            {isEditing ? "✏️ Edit Vendor" : "➕ New Vendor"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Draft resume banner */}
        {!isEditing && hasDraft && savedDraft && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between gap-2">
            <span className="text-xs text-yellow-800 font-medium">
              📋 Unsaved vendor data from last time.
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResumeDraft}
                data-ocid="vendor_form.resume_draft_button"
                className="text-xs font-semibold text-yellow-700 underline underline-offset-2 hover:text-yellow-900"
              >
                Resume
              </button>
              <span className="text-yellow-400">·</span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                data-ocid="vendor_form.discard_draft_button"
                className="text-xs font-semibold text-yellow-600 underline underline-offset-2 hover:text-yellow-800"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label
              htmlFor="vname"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vname"
              value={form.name}
              onChange={set("name")}
              placeholder="Vendor name"
              data-ocid="vendor_form.name_input"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="vmobile"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Mobile
            </Label>
            <Input
              id="vmobile"
              type="tel"
              value={form.mobile}
              onChange={set("mobile")}
              placeholder="9876543210"
              data-ocid="vendor_form.mobile_input"
            />
          </div>

          <div>
            <Label
              htmlFor="vemail"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Email
            </Label>
            <Input
              id="vemail"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="vendor@example.com"
              data-ocid="vendor_form.email_input"
            />
          </div>

          <div>
            <Label
              htmlFor="vaddress"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Address
            </Label>
            <Textarea
              id="vaddress"
              value={form.address}
              onChange={set("address")}
              placeholder="Shop / office address"
              rows={3}
              data-ocid="vendor_form.address_input"
              className="resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex-1"
            data-ocid="vendor_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
            data-ocid="vendor_form.save_button"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Saving…
              </span>
            ) : isEditing ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  vendor: Vendor;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirm({ vendor, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-6">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-center font-bold text-foreground text-lg mb-1">
          Delete Vendor?
        </h3>
        <p className="text-center text-muted-foreground text-sm mb-6">
          <span className="font-semibold text-foreground">{vendor.name}</span>{" "}
          will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-ocid="vendor_delete.cancel_button"
          >
            No
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
            data-ocid="vendor_delete.confirm_button"
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Rate History Modal ───────────────────────────────────────────────────────

interface RateHistoryModalProps {
  vendor: Vendor;
  history: VendorRateHistory[];
  products: ReturnType<typeof useStore>["products"];
  onClose: () => void;
}

function RateHistoryModal({
  vendor,
  history,
  products,
  onClose,
}: RateHistoryModalProps) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getProductName = (pid: string) =>
    products.find((p) => p.id === pid)?.name ?? "Unknown";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Rate History
              </h3>
              <p className="text-xs text-muted-foreground">{vendor.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
              <History className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">
                No rate history found.
              </p>
              <p className="text-xs text-muted-foreground">
                Every time the rate changes, it will be recorded here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map((entry) => {
                const isIncrease = entry.newRate > entry.oldRate;
                const diff = Math.abs(entry.newRate - entry.oldRate);
                const pct =
                  entry.oldRate > 0
                    ? ((diff / entry.oldRate) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3 flex items-center gap-3"
                    data-ocid={`vendor-rate-history-row-${entry.id}`}
                  >
                    {/* Change icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isIncrease
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isIncrease ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {getProductName(entry.productId)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{entry.oldRate.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs">→</span>
                        <span
                          className={`text-xs font-semibold ${
                            isIncrease ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          ₹{entry.newRate.toLocaleString("en-IN")}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0 ${
                            isIncrease
                              ? "border-red-200 text-red-600 bg-red-50"
                              : "border-green-200 text-green-600 bg-green-50"
                          }`}
                        >
                          {isIncrease ? "+" : "-"}
                          {pct}%
                        </Badge>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(entry.changedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {entry.changedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Ledger Summary ───────────────────────────────────────────────────────────

function VendorLedgerBadge({
  vendorId,
  purchaseOrders,
}: {
  vendorId: string;
  purchaseOrders: ReturnType<typeof useStore>["purchaseOrders"];
}) {
  const orders = purchaseOrders.filter((po) => po.vendorId === vendorId);
  const total = orders.reduce(
    (s, po) => s + po.qty * po.rate + po.transportCharge + po.labourCharge,
    0,
  );
  const paid = orders
    .filter((po) => po.status === "received")
    .reduce(
      (s, po) => s + po.qty * po.rate + po.transportCharge + po.labourCharge,
      0,
    );
  const due = Math.max(0, total - paid);

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-3 pt-2 mt-2 border-t border-border/60">
      <span className="text-xs text-muted-foreground">
        Total:{" "}
        <span className="font-semibold text-foreground">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </span>
      {due > 0 && (
        <Badge
          variant="outline"
          className="text-xs border-warning/50 text-warning bg-warning-light"
        >
          Due: ₹{due.toLocaleString("en-IN")}
        </Badge>
      )}
      {due === 0 && (
        <Badge
          variant="outline"
          className="text-xs border-success/50 text-success bg-success-light"
        >
          Paid ✓
        </Badge>
      )}
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────

interface VendorCardProps {
  vendor: Vendor;
  purchaseOrders: ReturnType<typeof useStore>["purchaseOrders"];
  rateHistoryCount: number;
  onEdit: (v: Vendor) => void;
  onDelete: (v: Vendor) => void;
  onViewHistory: (v: Vendor) => void;
}

function VendorCard({
  vendor,
  purchaseOrders,
  rateHistoryCount,
  onEdit,
  onDelete,
  onViewHistory,
}: VendorCardProps) {
  const handleWhatsApp = () => {
    if (!vendor.mobile) {
      toast.error("Mobile number is not available");
      return;
    }
    const msg = encodeURIComponent(
      `Hello ${vendor.name},\nWe have a new order request. Please reply at your earliest convenience.\n\n— Save Shop System`,
    );
    window.open(
      `https://wa.me/91${vendor.mobile.replace(/\D/g, "")}?text=${msg}`,
      "_blank",
    );
  };

  const handleEmail = () => {
    if (!vendor.email) {
      toast.error("Email address is not available");
      return;
    }
    window.location.href = `mailto:${vendor.email}?subject=Order Enquiry&body=Hello ${vendor.name},%0A%0AWe have a new order request. Please reply at your earliest convenience.%0A%0A— Save Shop System`;
  };

  const createdDate = new Date(vendor.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow p-4"
      data-ocid={`vendor_card.${vendor.id}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground truncate">
              {vendor.name}
            </h3>
            <p className="text-xs text-muted-foreground">Added {createdDate}</p>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onViewHistory(vendor)}
            aria-label="Rate history"
            data-ocid={`vendor_card.history_button.${vendor.id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative"
            title="View Rate History"
          >
            <History className="w-4 h-4" />
            {rateHistoryCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {rateHistoryCount > 9 ? "9+" : rateHistoryCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onEdit(vendor)}
            aria-label="Edit vendor"
            data-ocid={`vendor_card.edit_button.${vendor.id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(vendor)}
            aria-label="Delete vendor"
            data-ocid={`vendor_card.delete_button.${vendor.id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-1.5 mb-3">
        {vendor.mobile && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">{vendor.mobile}</span>
          </div>
        )}
        {vendor.email && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate">
              {vendor.email}
            </span>
          </div>
        )}
        {vendor.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground line-clamp-2">
              {vendor.address}
            </span>
          </div>
        )}
      </div>

      {/* Ledger summary */}
      <VendorLedgerBadge vendorId={vendor.id} purchaseOrders={purchaseOrders} />

      {/* Contact action buttons */}
      <div className="flex gap-2 mt-3">
        {vendor.mobile && (
          <button
            type="button"
            onClick={handleWhatsApp}
            data-ocid={`vendor_card.whatsapp_button.${vendor.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success-light text-success text-xs font-medium hover:opacity-80 transition-opacity border border-success/20"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        )}
        {vendor.email && (
          <button
            type="button"
            onClick={handleEmail}
            data-ocid={`vendor_card.email_button.${vendor.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:opacity-80 transition-opacity border border-primary/20"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function VendorsPageInner() {
  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    purchaseOrders,
    products,
    vendorRateHistory,
    getVendorRateHistoryForVendor,
    shopId,
  } = useStore();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Vendor | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) => v.name.toLowerCase().includes(q) || v.mobile.includes(q),
    );
  }, [vendors, search]);

  const handleAdd = useCallback(
    async (data: VendorFormData) => {
      await addVendor(data);
      toast.success("Vendor added successfully! ✅");
      setShowForm(false);
    },
    [addVendor],
  );

  const handleUpdate = useCallback(
    async (data: VendorFormData) => {
      if (!editTarget) return;
      await updateVendor(editTarget.id, data);
      toast.success("Vendor updated successfully! ✅");
      setEditTarget(null);
    },
    [editTarget, updateVendor],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteVendor(deleteTarget.id);
    toast.success("Vendor deleted");
    setDeleteTarget(null);
  }, [deleteTarget, deleteVendor]);

  const historyForTarget = useMemo(
    () =>
      historyTarget ? getVendorRateHistoryForVendor(historyTarget.id) : [],
    [historyTarget, getVendorRateHistoryForVendor],
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 page-fade-in">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Vendors</h1>
            <span className="text-xs text-muted-foreground">(Vendors)</span>
            {vendors.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs"
                data-ocid="vendors.count_badge"
              >
                {vendors.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            data-ocid="vendors.add_button"
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Vendor</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
            className="pl-9 bg-muted/40"
            data-ocid="vendors.search_input"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {vendors.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center justify-center py-16 text-center gap-4"
            data-ocid="vendors.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">
                No vendors yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Click 'Add Vendor' to add your first vendor.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              data-ocid="vendors.empty_add_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Vendor
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          /* No search results */
          <div
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
            data-ocid="vendors.no_results_state"
          >
            <Search className="w-10 h-10 text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold text-foreground">
                No vendors found
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                No vendor found for "{search}". Try clearing the search.
              </p>
            </div>
            <Button variant="outline" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          /* Vendor grid */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            data-ocid="vendors.list"
          >
            {filtered.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                purchaseOrders={purchaseOrders}
                rateHistoryCount={
                  vendorRateHistory.filter((r) => r.vendorId === vendor.id)
                    .length
                }
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onViewHistory={setHistoryTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <VendorForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          isEditing={false}
          shopId={shopId}
        />
      )}

      {/* Edit Form Modal */}
      {editTarget && (
        <VendorForm
          initial={{
            name: editTarget.name,
            mobile: editTarget.mobile,
            email: editTarget.email,
            address: editTarget.address,
          }}
          onSave={handleUpdate}
          onCancel={() => setEditTarget(null)}
          isEditing={true}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirm
          vendor={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Rate History Modal */}
      {historyTarget && (
        <RateHistoryModal
          vendor={historyTarget}
          history={historyForTarget}
          products={products}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}

export const VendorsPage = React.memo(VendorsPageInner);
export default VendorsPage;
