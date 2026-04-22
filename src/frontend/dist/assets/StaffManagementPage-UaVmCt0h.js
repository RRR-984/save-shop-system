import { h as useAuth, l as useStore, r as reactExports, j as jsxRuntimeExports, aK as UserCog, B as Button, m as Plus, a6 as Users, C as Card, i as CardHeader, k as CardTitle, n as CardContent, w as Pencil, x as Trash2, g as cn, v as Badge, ae as RotateCcw, L as Label, I as Input, D as CircleCheckBig, N as TriangleAlert, y as ue } from "./index-Bt77HP0S.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-NQ0wylTN.js";
import { S as Switch } from "./switch-USsqFl0-.js";
import { S as Shield } from "./shield-DFIEddNp.js";
import { U as UserCheck, a as UserX } from "./user-x-BoOwG5SK.js";
import "./index-Dc2wOXFM.js";
import "./index-Bc1JMXzj.js";
function RoleBadge({ role }) {
  if (role === "owner") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-owner", children: "Owner" });
  if (role === "manager") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-manager", children: "Manager" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-staff", children: "Staff" });
}
const EMPTY_FORM = {
  name: "",
  mobile: "",
  role: "staff",
  pin: "",
  active: true
};
function StaffManagementPage() {
  const { currentUser, session } = useAuth();
  const { users, shopId, addUser, updateUser, addAuditLog } = useStore();
  const ownerMobile = (session == null ? void 0 : session.mobile) ?? "";
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [formErrors, setFormErrors] = reactExports.useState({});
  const nameRef = reactExports.useRef(null);
  const isOwner = (currentUser == null ? void 0 : currentUser.role) === "owner";
  const shopUsers = users.filter(
    (u) => u.shopId === shopId && !u.isOwner && u.role !== "owner"
  );
  const activeStaff = shopUsers.filter((u) => !u.deleted);
  const deletedStaff = shopUsers.filter((u) => u.deleted);
  reactExports.useEffect(() => {
    if (showForm) setTimeout(() => {
      var _a;
      return (_a = nameRef.current) == null ? void 0 : _a.focus();
    }, 50);
  }, [showForm]);
  function validate() {
    const errs = {};
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
  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  }
  function openEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      mobile: user.mobile ?? "",
      role: user.role === "manager" ? "manager" : "staff",
      pin: "",
      active: user.active !== false
    });
    setFormErrors({});
    setShowForm(true);
  }
  function handleSave() {
    if (!validate()) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (editingId) {
      const updates = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        role: form.role,
        active: form.active,
        ...form.pin.trim().length === 6 ? { pin: form.pin.trim() } : {}
      };
      updateUser(editingId, updates);
      addAuditLog(
        "staff_edited",
        `Staff edited: ${form.name.trim()} (${form.role})`,
        editingId
      );
      ue.success(`${form.name}'s details updated`);
    } else {
      if (ownerMobile && form.mobile.trim() === ownerMobile.replace(/\D/g, "")) {
        setFormErrors({
          mobile: "This mobile number belongs to the shop owner and cannot be added as staff."
        });
        return;
      }
      const dup = users.find(
        (u) => {
          var _a;
          return u.shopId === shopId && ((_a = u.mobile) == null ? void 0 : _a.replace(/\D/g, "")) === form.mobile.trim() && !u.deleted;
        }
      );
      if (dup) {
        setFormErrors({
          mobile: "This mobile number is already registered in this shop."
        });
        return;
      }
      const newUser = {
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
        createdAt: now
      };
      addUser(newUser);
      addAuditLog(
        "staff_added",
        `New staff added: ${form.name.trim()} (${form.role})`
      );
      ue.success(`${form.name} added to staff list`);
    }
    setShowForm(false);
  }
  function toggleActive(user) {
    const newActive = !(user.active !== false);
    updateUser(user.id, { active: newActive });
    addAuditLog(
      "staff_status_changed",
      `${user.name} marked as ${newActive ? "active" : "inactive"}`,
      user.id
    );
    ue.success(`${user.name} is now ${newActive ? "Active" : "Inactive"}`);
  }
  function confirmDelete(user) {
    setDeleteTarget(user);
  }
  function handleDelete() {
    if (!deleteTarget) return;
    updateUser(deleteTarget.id, { deleted: true, active: false });
    addAuditLog(
      "staff_deleted",
      `Staff soft-deleted: ${deleteTarget.name}`,
      deleteTarget.id
    );
    ue.success(`${deleteTarget.name} removed (record preserved)`);
    setDeleteTarget(null);
  }
  function handleRestore(user) {
    updateUser(user.id, { deleted: false, active: false });
    addAuditLog("staff_restored", `Staff restored: ${user.name}`, user.id);
    ue.success(`${user.name} restored (set to inactive)`);
  }
  if (!isOwner) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "mx-auto w-12 h-12 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: "Only the Owner can view this page" })
    ] }) });
  }
  const totalActive = activeStaff.filter((u) => u.active !== false).length;
  const totalInactive = activeStaff.filter((u) => u.active === false).length;
  const managers = activeStaff.filter((u) => u.role === "manager").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-foreground leading-tight truncate", children: "Staff Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            activeStaff.length,
            " staff members"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          onClick: openAdd,
          "data-ocid": "staff.add.button",
          className: "flex-shrink-0 gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
            "Add Staff"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 px-4 md:px-6 py-5 space-y-5 overflow-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-3 text-center shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-foreground", children: totalActive }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-success flex items-center justify-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 11 }),
            " Active"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-3 text-center shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-foreground", children: managers }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 11 }),
            " Managers"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-3 text-center shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-foreground", children: totalInactive }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-warning flex items-center justify-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 11 }),
            " Inactive"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "px-4 py-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 15, className: "text-success" }),
          "Staff List"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: activeStaff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground",
            "data-ocid": "staff.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-10 h-10 opacity-30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: 'No staff yet. Click "Add Staff" to get started.' }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
                " Add Staff"
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Mobile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: activeStaff.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                "data-ocid": `staff.row.${user.id}`,
                className: cn(
                  "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  user.active === false && "opacity-60"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: user.name }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: user.mobile ? `+91 ${user.mobile}` : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: user.role }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: user.active !== false,
                      onCheckedChange: () => toggleActive(user),
                      "data-ocid": `staff.toggle.${user.id}`,
                      "aria-label": `Toggle active status for ${user.name}`
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => openEdit(user),
                        "data-ocid": `staff.edit.${user.id}`,
                        title: `Edit ${user.name}`,
                        className: "p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => confirmDelete(user),
                        "data-ocid": `staff.delete.${user.id}`,
                        title: `Delete ${user.name}`,
                        className: "p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                      }
                    )
                  ] }) })
                ]
              },
              user.id
            )) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden divide-y divide-border", children: activeStaff.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `staff.card.${user.id}`,
              className: cn(
                "px-4 py-3 flex items-start gap-3",
                user.active === false && "opacity-60"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm", children: user.name.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: user.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: user.role })
                  ] }),
                  user.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                    "+91 ",
                    user.mobile
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: user.active !== false,
                        onCheckedChange: () => toggleActive(user),
                        "data-ocid": `staff.toggle_mobile.${user.id}`,
                        "aria-label": `Toggle active status for ${user.name}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: user.active !== false ? "Active" : "Inactive" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 flex-shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => openEdit(user),
                      "data-ocid": `staff.edit_mobile.${user.id}`,
                      title: "Edit",
                      className: "p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 15 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => confirmDelete(user),
                      "data-ocid": `staff.delete_mobile.${user.id}`,
                      title: "Delete",
                      className: "p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 15 })
                    }
                  )
                ] })
              ]
            },
            user.id
          )) })
        ] }) })
      ] }),
      deletedStaff.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-dashed border-muted-foreground/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "px-4 py-3 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 15 }),
          "Deleted Staff (",
          deletedStaff.length,
          ")",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-xs ml-auto font-normal",
              children: "Audit preserved"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: deletedStaff.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": `staff.deleted.${user.id}`,
            className: "px-4 py-3 flex items-center gap-3 opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground font-bold text-sm", children: user.name.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground line-through", children: user.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: user.role })
                ] }),
                user.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "+91 ",
                  user.mobile
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleRestore(user),
                  "data-ocid": `staff.restore.${user.id}`,
                  title: `Restore ${user.name}`,
                  className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border flex-shrink-0",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12 }),
                    "Restore"
                  ]
                }
              )
            ]
          },
          user.id
        )) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showForm,
        onOpenChange: (open) => !open && setShowForm(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-md w-full mx-4",
            "data-ocid": "staff.form.modal",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
                editingId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
                editingId ? "Edit Staff" : "Add New Staff"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "staff-name", children: [
                    "Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "staff-name",
                      ref: nameRef,
                      placeholder: "Staff member's name",
                      value: form.name,
                      onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                      "data-ocid": "staff.form.name",
                      className: cn(formErrors.name && "border-destructive")
                    }
                  ),
                  formErrors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: formErrors.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "staff-mobile", children: [
                    "Mobile ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "staff-mobile",
                      type: "tel",
                      inputMode: "numeric",
                      placeholder: "10-digit mobile number",
                      value: form.mobile,
                      maxLength: 10,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        mobile: e.target.value.replace(/\D/g, "")
                      })),
                      "data-ocid": "staff.form.mobile",
                      className: cn(formErrors.mobile && "border-destructive")
                    }
                  ),
                  formErrors.mobile && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: formErrors.mobile })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", "data-ocid": "staff.form.role_selector", children: ["manager", "staff"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setForm((f) => ({ ...f, role: r })),
                      className: cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all",
                        form.role === r ? r === "manager" ? "bg-[oklch(var(--role-manager-bg)/0.15)] border-[oklch(var(--role-manager-bg)/0.4)] text-[oklch(var(--role-manager-bg))]" : "bg-muted border-border text-muted-foreground" : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                      ),
                      children: r === "manager" ? "Manager" : "Staff"
                    },
                    r
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "staff-pin", children: [
                    "PIN (6 digits)",
                    editingId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-1", children: "— blank = keep existing" }),
                    !editingId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "staff-pin",
                      type: "password",
                      inputMode: "numeric",
                      placeholder: editingId ? "••••••" : "6-digit PIN",
                      value: form.pin,
                      maxLength: 6,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        pin: e.target.value.replace(/\D/g, "")
                      })),
                      "data-ocid": "staff.form.pin",
                      className: cn(formErrors.pin && "border-destructive")
                    }
                  ),
                  formErrors.pin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: formErrors.pin })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1 px-3 rounded-lg bg-muted/40 border border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Active Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Inactive staff cannot log in" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: form.active,
                      onCheckedChange: (v) => setForm((f) => ({ ...f, active: v })),
                      "data-ocid": "staff.form.active_toggle"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      className: "flex-1",
                      onClick: () => setShowForm(false),
                      "data-ocid": "staff.form.cancel",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      className: "flex-1",
                      onClick: handleSave,
                      "data-ocid": "staff.form.save",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 15, className: "mr-1.5" }),
                        editingId ? "Save Changes" : "Add Staff"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!deleteTarget,
        onOpenChange: (open) => !open && setDeleteTarget(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-sm mx-4",
            "data-ocid": "staff.delete.confirm_dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
                "Delete Staff?"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "Staff data will be kept in audit logs with deleted mark. Continue?" }),
              deleteTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0", children: deleteTarget.name.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground", children: deleteTarget.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: deleteTarget.role })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    className: "flex-1",
                    onClick: () => setDeleteTarget(null),
                    "data-ocid": "staff.delete.cancel",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "destructive",
                    className: "flex-1",
                    onClick: handleDelete,
                    "data-ocid": "staff.delete.confirm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "mr-1.5" }),
                      "Yes, Delete"
                    ]
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
export {
  StaffManagementPage
};
