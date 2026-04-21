import { c as createLucideIcon, h as useAuth, l as useStore, r as reactExports, j as jsxRuntimeExports, a6 as Users, aG as History, C as Card, n as CardContent, i as CardHeader, k as CardTitle, aH as getAttendanceStatus, aI as formatHoursWorked, B as Button, aJ as LogOut, y as ue, g as cn, E as Clock, w as Pencil, L as Label, I as Input, v as Badge } from "./index-CyJThNPE.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-B5_zZfdK.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, d as TabsContent } from "./tabs-DlEasSwj.js";
import { U as UserCheck, a as UserX } from "./user-x-DODuqmIC.js";
import "./index-CsaT76ve.js";
import "./index-BPYaWAKl.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = createLucideIcon("calendar-days", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
function toLocalDate(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function currentMonthKey() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
}
function StatusBadge({
  status
}) {
  const map = {
    present: {
      label: "Present",
      cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
    },
    absent: {
      label: "Absent",
      cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    },
    "half-day": {
      label: "Half Day",
      cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    },
    "not-clocked-in": {
      label: "Not Clocked In",
      cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
    }
  };
  const { label, cls } = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cls
      ),
      children: label
    }
  );
}
function RoleBadge({ role }) {
  if (role === "owner")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: "text-xs", children: "Owner" });
  if (role === "manager")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Manager" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Staff" });
}
function EditRecordModal({ record, onClose, onSave }) {
  const [clockIn, setClockIn] = reactExports.useState(
    (record == null ? void 0 : record.clockIn) ? new Date(record.clockIn).toTimeString().slice(0, 5) : ""
  );
  const [clockOut, setClockOut] = reactExports.useState(
    (record == null ? void 0 : record.clockOut) ? new Date(record.clockOut).toTimeString().slice(0, 5) : ""
  );
  const [status, setStatus] = reactExports.useState(
    (record == null ? void 0 : record.status) ?? "present"
  );
  const [notes, setNotes] = reactExports.useState((record == null ? void 0 : record.notes) ?? "");
  if (!record) return null;
  function buildISOFromTime(timeStr, dateStr) {
    if (!timeStr) return null;
    return `${dateStr}T${timeStr}:00`;
  }
  function handleSave() {
    if (!record) return;
    const ciISO = buildISOFromTime(clockIn, record.date);
    const coISO = buildISOFromTime(clockOut, record.date);
    let hoursWorked = 0;
    if (ciISO && coISO) {
      hoursWorked = (new Date(coISO).getTime() - new Date(ciISO).getTime()) / 36e5;
      if (hoursWorked < 0) hoursWorked = 0;
    }
    onSave(record.id, {
      clockIn: ciISO,
      clockOut: coISO,
      status,
      hoursWorked,
      notes
    });
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-base font-semibold", children: [
        "Edit Attendance — ",
        record.staffName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: formatDate(record.date) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clock In" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "time",
              value: clockIn,
              onChange: (e) => setClockIn(e.target.value),
              className: "h-9 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clock Out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "time",
              value: clockOut,
              onChange: (e) => setClockOut(e.target.value),
              className: "h-9 text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["present", "absent", "half-day"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStatus(s),
            className: cn(
              "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors capitalize",
              status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"
            ),
            children: s === "half-day" ? "Half Day" : s.charAt(0).toUpperCase() + s.slice(1)
          },
          s
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            placeholder: "Add note...",
            className: "h-9 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "flex-1",
            onClick: onClose,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "flex-1", onClick: handleSave, children: "Save Changes" })
      ] })
    ] })
  ] }) });
}
function StaffTodayCard({
  staffId,
  staffName,
  staffRole,
  record,
  isOwner,
  onClockIn,
  onClockOut,
  onMarkAbsent
}) {
  const status = record ? getAttendanceStatus(record) : "not-clocked-in";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl bg-card border border-border shadow-sm p-4 flex flex-col gap-3",
      "data-ocid": `attendance.staff_card.${staffId}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground truncate", children: staffName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: staffRole }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mb-0.5", children: "Clock In" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: (record == null ? void 0 : record.clockIn) ? toLocalDate(record.clockIn) : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mb-0.5", children: "Clock Out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: (record == null ? void 0 : record.clockOut) ? toLocalDate(record.clockOut) : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mb-0.5", children: "Hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: record ? formatHoursWorked(record.hoursWorked) : "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          status === "not-clocked-in" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: "flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white",
                onClick: () => onClockIn(staffId, staffName, staffRole),
                "data-ocid": `attendance.clock_in.${staffId}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-3.5 h-3.5 mr-1" }),
                  "Clock In"
                ]
              }
            ),
            isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "flex-1 h-8 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20",
                onClick: () => onMarkAbsent(staffId, staffName, staffRole),
                "data-ocid": `attendance.mark_absent.${staffId}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-3.5 h-3.5 mr-1" }),
                  "Mark Absent"
                ]
              }
            )
          ] }),
          status === "present" && !(record == null ? void 0 : record.clockOut) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white",
              onClick: () => onClockOut(staffId),
              "data-ocid": `attendance.clock_out.${staffId}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-3.5 h-3.5 mr-1" }),
                "Clock Out"
              ]
            }
          )
        ] })
      ]
    }
  );
}
function MonthlySummaryTab({
  staffList,
  getAttendanceForStaff
}) {
  const month = currentMonthKey();
  const rows = staffList.map((s) => {
    const records = getAttendanceForStaff(s.id, month);
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const halfDay = records.filter((r) => r.status === "half-day").length;
    const total = present + absent + halfDay;
    const pct = total > 0 ? Math.round((present + halfDay * 0.5) / total * 100) : 0;
    return { ...s, present, absent, halfDay, total, pct };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-12 text-muted-foreground text-sm",
        "data-ocid": "attendance.monthly_empty",
        children: "No staff members found."
      }
    ),
    rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-2xl bg-card border border-border shadow-sm p-4",
        "data-ocid": `attendance.monthly_row.${row.id}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: row.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: row.role })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: cn(
                  "text-sm font-bold",
                  row.pct >= 80 ? "text-green-600 dark:text-green-400" : row.pct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                ),
                children: [
                  row.pct,
                  "%"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 dark:bg-green-900/20 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-green-700 dark:text-green-400 text-base", children: row.present }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600 dark:text-green-500 mt-0.5", children: "Present" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-900/20 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-red-700 dark:text-red-400 text-base", children: row.absent }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 dark:text-red-500 mt-0.5", children: "Absent" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-yellow-50 dark:bg-yellow-900/20 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-yellow-700 dark:text-yellow-400 text-base", children: row.halfDay }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-600 dark:text-yellow-500 mt-0.5", children: "Half Day" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "h-full rounded-full transition-all",
                row.pct >= 80 ? "bg-green-500" : row.pct >= 50 ? "bg-yellow-500" : "bg-red-500"
              ),
              style: { width: `${row.pct}%` }
            }
          ) })
        ]
      },
      row.id
    ))
  ] });
}
function HistoryTab({ records, isOwner, onEdit }) {
  const sorted = reactExports.useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );
  if (sorted.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-12 text-muted-foreground text-sm",
        "data-ocid": "attendance.history_empty",
        children: "No attendance records yet."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sorted.map((r) => {
    const status = getAttendanceStatus(r);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl bg-card border border-border shadow-sm px-4 py-3 flex items-center gap-3",
        "data-ocid": `attendance.history_row.${r.id}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-foreground truncate", children: r.staffName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3 h-3" }),
                formatDate(r.date)
              ] }),
              r.clockIn && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-3 h-3" }),
                toLocalDate(r.clockIn)
              ] }),
              r.clockOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-3 h-3" }),
                toLocalDate(r.clockOut)
              ] }),
              r.hoursWorked > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                formatHoursWorked(r.hoursWorked)
              ] })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground italic truncate", children: r.notes })
          ] }),
          isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onEdit(r),
              className: "p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
              "aria-label": "Edit record",
              "data-ocid": `attendance.edit_history.${r.id}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
            }
          )
        ]
      },
      r.id
    );
  }) });
}
function StaffAttendancePage() {
  const { currentUser } = useAuth();
  const {
    users,
    shopId,
    attendanceRecords,
    clockIn,
    clockOut,
    getAttendanceForDate,
    getAttendanceForStaff,
    updateAttendance
  } = useStore();
  const isOwner = (currentUser == null ? void 0 : currentUser.role) === "owner";
  const today = todayISO();
  const staffList = users.filter(
    (u) => u.shopId === shopId && !u.deleted && !u.isOwner && (u.role === "staff" || u.role === "manager")
  );
  const todayRecords = reactExports.useMemo(() => {
    const map = {};
    for (const r of attendanceRecords) {
      if (r.date === today) map[r.staffId] = r;
    }
    return map;
  }, [attendanceRecords, today]);
  const [editingRecord, setEditingRecord] = reactExports.useState(
    null
  );
  const presentCount = Object.values(todayRecords).filter(
    (r) => r.status === "present" || r.status === "half-day"
  ).length;
  const absentCount = Object.values(todayRecords).filter(
    (r) => r.status === "absent"
  ).length;
  const notClockedIn = staffList.filter((s) => !todayRecords[s.id]).length;
  function handleClockIn(staffId, staffName, role) {
    clockIn(staffId, staffName, role);
    ue.success(
      `${staffName} clocked in at ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`
    );
  }
  function handleClockOut(staffId) {
    const staff = staffList.find((s) => s.id === staffId);
    clockOut(staffId);
    ue.success(`${(staff == null ? void 0 : staff.name) ?? "Staff"} clocked out`);
  }
  function handleMarkAbsent(staffId, staffName, role) {
    clockIn(staffId, staffName, role);
    setTimeout(() => {
      const recs = getAttendanceForDate(today);
      const rec = recs.find((r) => r.staffId === staffId);
      if (rec) {
        updateAttendance(rec.id, { status: "absent", clockIn: null });
      }
    }, 100);
    ue.info(`${staffName} marked as absent`);
  }
  function handleSaveEdit(id, updates) {
    updateAttendance(id, updates);
    ue.success("Attendance record updated");
  }
  const todayFormatted = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex-1 flex flex-col bg-background",
      "data-ocid": "attendance.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 border-b border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-bold text-foreground leading-tight", children: "Staff Attendance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: todayFormatted })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5" }),
              presentCount,
              " Present"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-3.5 h-3.5" }),
              absentCount,
              " Absent"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
              notClockedIn,
              " Pending"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "today", className: "flex flex-col h-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-3 bg-background sticky top-0 z-10 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-3 h-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsTrigger,
              {
                value: "today",
                className: "text-xs",
                "data-ocid": "attendance.tab_today",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5 mr-1" }),
                  "Today"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsTrigger,
              {
                value: "month",
                className: "text-xs",
                "data-ocid": "attendance.tab_month",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5 mr-1" }),
                  "This Month"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsTrigger,
              {
                value: "history",
                className: "text-xs",
                "data-ocid": "attendance.tab_history",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5 mr-1" }),
                  "History"
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "today", className: "px-4 pt-4 pb-6 flex-1", children: staffList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            CardContent,
            {
              className: "py-12 text-center",
              "data-ocid": "attendance.today_empty",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-10 h-10 mx-auto mb-3 text-muted-foreground/50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No staff members" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Add staff members in Staff Management to track attendance." })
              ]
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            StaffTodayCard,
            {
              staffId: s.id,
              staffName: s.name,
              staffRole: s.role,
              record: todayRecords[s.id] ?? null,
              isOwner,
              onClockIn: handleClockIn,
              onClockOut: handleClockOut,
              onMarkAbsent: handleMarkAbsent
            },
            s.id
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "month", className: "px-4 pt-4 pb-6 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-primary" }),
              (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
              }),
              " ",
              "Summary"
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MonthlySummaryTab,
              {
                staffList: staffList.map((s) => ({
                  id: s.id,
                  name: s.name,
                  role: s.role
                })),
                getAttendanceForStaff
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "px-4 pt-4 pb-6 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            HistoryTab,
            {
              records: attendanceRecords.filter(
                (r) => staffList.some((s) => s.id === r.staffId)
              ),
              isOwner,
              onEdit: setEditingRecord
            }
          ) })
        ] }) }),
        editingRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditRecordModal,
          {
            record: editingRecord,
            onClose: () => setEditingRecord(null),
            onSave: handleSaveEdit
          }
        )
      ]
    }
  );
}
export {
  StaffAttendancePage
};
