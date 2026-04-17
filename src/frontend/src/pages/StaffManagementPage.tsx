import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Pencil,
  Plus,
  RotateCcw,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AppUser, UserRole } from "../types/store";

// ─── Role badge helper ────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  if (role === "owner") return <span className="badge-owner">Owner</span>;
  if (role === "manager") return <span className="badge-manager">Manager</span>;
  return <span className="badge-staff">Staff</span>;
}

// ─── Form state ───────────────────────────────────────────────────────────────
interface StaffFormState {
  name: string;
  mobile: string;
  role: "manager" | "staff";
  pin: string;
  active: boolean;
}

const EMPTY_FORM: StaffFormState = {
  name: "",
  mobile: "",
  role: "staff",
  pin: "",
  active: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export function StaffManagementPage() {
  const { currentUser } = useAuth();
  const { users, shopId, addUser, updateUser, addAuditLog } = useStore();

  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<StaffFormState>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Redirect guard — only Owner can access
  const isOwner = currentUser?.role === "owner";

  // Scope to this shop, exclude owner (owner cannot be managed here)
  const shopUsers = users.filter(
    (u) => u.shopId === shopId && !u.isOwner && u.role !== "owner",
  );
  const activeStaff = shopUsers.filter((u) => !u.deleted);
  const deletedStaff = shopUsers.filter((u) => u.deleted);

  // Focus name field when modal opens
  useEffect(() => {
    if (showForm) setTimeout(() => nameRef.current?.focus(), 50);
  }, [showForm]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Partial<StaffFormState> = {};
    if (!form.name.trim()) errs.name = "Name required";
    if (!/^\d{10}$/.test(form.mobile.trim()))
      errs.mobile = "10-digit mobile required";
    if (!editingId && form.pin.trim().length !== 6)
      errs.pin = "6-digit PIN required";
    if (editingId && form.pin.trim().length > 0 && form.pin.trim().length !== 6)
      errs.pin = "PIN must be exactly 6 digits";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Open Add Form ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  }

  // ── Open Edit Form ───────────────────────────────────────────────────────────
  function openEdit(user: AppUser) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      mobile: user.mobile ?? "",
      role: user.role === "manager" ? "manager" : "staff",
      pin: "",
      active: user.active !== false,
    });
    setFormErrors({});
    setShowForm(true);
  }

  // ── Save (Add / Edit) ────────────────────────────────────────────────────────
  function handleSave() {
    if (!validate()) return;
    const now = new Date().toISOString();

    if (editingId) {
      const updates: Partial<AppUser> = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        role: form.role,
        active: form.active,
        ...(form.pin.trim().length === 6 ? { pin: form.pin.trim() } : {}),
      };
      updateUser(editingId, updates);
      addAuditLog(
        "staff_edited",
        `Staff edited: ${form.name.trim()} (${form.role})`,
        editingId,
      );
      toast.success(`${form.name}'s details updated`);
    } else {
      // Check duplicate mobile
      const dup = users.find(
        (u) =>
          u.shopId === shopId &&
          u.mobile?.replace(/\D/g, "") === form.mobile.trim() &&
          !u.deleted,
      );
      if (dup) {
        setFormErrors({ mobile: "This mobile number is already registered" });
        return;
      }
      const newUser: Omit<AppUser, "id"> = {
        name: form.name.trim(),
        username: form.mobile.trim(),
        password: "",
        role: form.role,
        shopId,
        mobile: form.mobile.trim(),
        pin: form.pin.trim(),
        active: form.active,
        deleted: false,
        isOwner: false,
        createdAt: now,
      };
      addUser(newUser);
      addAuditLog(
        "staff_added",
        `New staff added: ${form.name.trim()} (${form.role})`,
      );
      toast.success(`${form.name} added to staff list`);
    }

    setShowForm(false);
  }

  // ── Toggle Active ────────────────────────────────────────────────────────────
  function toggleActive(user: AppUser) {
    const newActive = !(user.active !== false);
    updateUser(user.id, { active: newActive });
    addAuditLog(
      "staff_status_changed",
      `${user.name} marked as ${newActive ? "active" : "inactive"}`,
      user.id,
    );
    toast.success(`${user.name} is now ${newActive ? "Active" : "Inactive"}`);
  }

  // ── Soft Delete ──────────────────────────────────────────────────────────────
  function confirmDelete(user: AppUser) {
    setDeleteTarget(user);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    updateUser(deleteTarget.id, { deleted: true, active: false });
    addAuditLog(
      "staff_deleted",
      `Staff soft-deleted: ${deleteTarget.name}`,
      deleteTarget.id,
    );
    toast.success(`${deleteTarget.name} removed (record preserved)`);
    setDeleteTarget(null);
  }

  // ── Restore ──────────────────────────────────────────────────────────────────
  function handleRestore(user: AppUser) {
    updateUser(user.id, { deleted: false, active: false });
    addAuditLog("staff_restored", `Staff restored: ${user.name}`, user.id);
    toast.success(`${user.name} restored (set to inactive)`);
  }

  // ── Access guard ─────────────────────────────────────────────────────────────
  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Shield className="mx-auto w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            Only the Owner can view this page
          </p>
        </div>
      </div>
    );
  }

  // ── Summary counts ───────────────────────────────────────────────────────────
  const totalActive = activeStaff.filter((u) => u.active !== false).length;
  const totalInactive = activeStaff.filter((u) => u.active === false).length;
  const managers = activeStaff.filter((u) => u.role === "manager").length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Header ── */}
      <div className="bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground leading-tight truncate">
                Staff Management
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeStaff.length} staff members
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={openAdd}
            data-ocid="staff.add.button"
            className="flex-shrink-0 gap-1.5"
          >
            <Plus size={15} />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 py-5 space-y-5 overflow-auto">
        {/* ── Summary Row ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <div className="text-lg font-bold text-foreground">
              {totalActive}
            </div>
            <div className="text-xs text-success flex items-center justify-center gap-1 mt-0.5">
              <UserCheck size={11} /> Active
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <div className="text-lg font-bold text-foreground">{managers}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
              <Users size={11} /> Managers
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <div className="text-lg font-bold text-foreground">
              {totalInactive}
            </div>
            <div className="text-xs text-warning flex items-center justify-center gap-1 mt-0.5">
              <UserX size={11} /> Inactive
            </div>
          </div>
        </div>

        {/* ── Active Staff Table / Cards ── */}
        <Card className="shadow-card">
          <CardHeader className="px-4 py-3 border-b border-border">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserCheck size={15} className="text-success" />
              Staff List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeStaff.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground"
                data-ocid="staff.empty_state"
              >
                <Users className="w-10 h-10 opacity-30" />
                <p className="text-sm">
                  No staff yet. Click "Add Staff" to get started.
                </p>
                <Button size="sm" variant="outline" onClick={openAdd}>
                  <Plus size={14} className="mr-1" /> Add Staff
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Mobile
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Role
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeStaff.map((user) => (
                        <tr
                          key={user.id}
                          data-ocid={`staff.row.${user.id}`}
                          className={cn(
                            "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                            user.active === false && "opacity-60",
                          )}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium text-foreground">
                              {user.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {user.mobile ? `+91 ${user.mobile}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch
                              checked={user.active !== false}
                              onCheckedChange={() => toggleActive(user)}
                              data-ocid={`staff.toggle.${user.id}`}
                              aria-label={`Toggle active status for ${user.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEdit(user)}
                                data-ocid={`staff.edit.${user.id}`}
                                title={`Edit ${user.name}`}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDelete(user)}
                                data-ocid={`staff.delete.${user.id}`}
                                title={`Delete ${user.name}`}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {activeStaff.map((user) => (
                    <div
                      key={user.id}
                      data-ocid={`staff.card.${user.id}`}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3",
                        user.active === false && "opacity-60",
                      )}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {user.name}
                          </span>
                          <RoleBadge role={user.role} />
                        </div>
                        {user.mobile && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            +91 {user.mobile}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Switch
                            checked={user.active !== false}
                            onCheckedChange={() => toggleActive(user)}
                            data-ocid={`staff.toggle_mobile.${user.id}`}
                            aria-label={`Toggle active status for ${user.name}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {user.active !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          data-ocid={`staff.edit_mobile.${user.id}`}
                          title="Edit"
                          className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(user)}
                          data-ocid={`staff.delete_mobile.${user.id}`}
                          title="Delete"
                          className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Deleted Staff ── */}
        {deletedStaff.length > 0 && (
          <Card className="shadow-card border-dashed border-muted-foreground/30">
            <CardHeader className="px-4 py-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <UserX size={15} />
                Deleted Staff ({deletedStaff.length})
                <Badge
                  variant="outline"
                  className="text-xs ml-auto font-normal"
                >
                  Audit preserved
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {deletedStaff.map((user) => (
                  <div
                    key={user.id}
                    data-ocid={`staff.deleted.${user.id}`}
                    className="px-4 py-3 flex items-center gap-3 opacity-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground line-through">
                          {user.name}
                        </span>
                        <RoleBadge role={user.role} />
                      </div>
                      {user.mobile && (
                        <p className="text-xs text-muted-foreground">
                          +91 {user.mobile}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(user)}
                      data-ocid={`staff.restore.${user.id}`}
                      title={`Restore ${user.name}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border flex-shrink-0"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => !open && setShowForm(false)}
      >
        <DialogContent
          className="max-w-md w-full mx-4"
          data-ocid="staff.form.modal"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-name"
                ref={nameRef}
                placeholder="Staff member's name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="staff.form.name"
                className={cn(formErrors.name && "border-destructive")}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label htmlFor="staff-mobile">
                Mobile <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={form.mobile}
                maxLength={10}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mobile: e.target.value.replace(/\D/g, ""),
                  }))
                }
                data-ocid="staff.form.mobile"
                className={cn(formErrors.mobile && "border-destructive")}
              />
              {formErrors.mobile && (
                <p className="text-xs text-destructive">{formErrors.mobile}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="flex gap-2" data-ocid="staff.form.role_selector">
                {(["manager", "staff"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all",
                      form.role === r
                        ? r === "manager"
                          ? "bg-[oklch(var(--role-manager-bg)/0.15)] border-[oklch(var(--role-manager-bg)/0.4)] text-[oklch(var(--role-manager-bg))]"
                          : "bg-muted border-border text-muted-foreground"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {r === "manager" ? "Manager" : "Staff"}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN */}
            <div className="space-y-1.5">
              <Label htmlFor="staff-pin">
                PIN (6 digits)
                {editingId && (
                  <span className="text-xs text-muted-foreground ml-1">
                    — blank = keep existing
                  </span>
                )}
                {!editingId && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                id="staff-pin"
                type="password"
                inputMode="numeric"
                placeholder={editingId ? "••••••" : "6-digit PIN"}
                value={form.pin}
                maxLength={6}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pin: e.target.value.replace(/\D/g, ""),
                  }))
                }
                data-ocid="staff.form.pin"
                className={cn(formErrors.pin && "border-destructive")}
              />
              {formErrors.pin && (
                <p className="text-xs text-destructive">{formErrors.pin}</p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-1 px-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Active Status
                </p>
                <p className="text-xs text-muted-foreground">
                  Inactive staff cannot log in
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                data-ocid="staff.form.active_toggle"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
                data-ocid="staff.form.cancel"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                data-ocid="staff.form.save"
              >
                <CheckCircle size={15} className="mr-1.5" />
                {editingId ? "Save Changes" : "Add Staff"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          className="max-w-sm mx-4"
          data-ocid="staff.delete.confirm_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} />
              Delete Staff?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Staff data will be kept in audit logs with deleted mark. Continue?
          </p>
          {deleteTarget && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {deleteTarget.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {deleteTarget.name}
                </p>
                <RoleBadge role={deleteTarget.role} />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              data-ocid="staff.delete.cancel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              data-ocid="staff.delete.confirm"
            >
              <Trash2 size={14} className="mr-1.5" />
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
