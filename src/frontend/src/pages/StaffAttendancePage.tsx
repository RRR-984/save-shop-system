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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  History,
  LogIn,
  LogOut,
  Pencil,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import type { AttendanceRecord, UserRole } from "../types/store";
import { formatHoursWorked, getAttendanceStatus } from "../types/store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  status,
}: {
  status: "present" | "absent" | "half-day" | "not-clocked-in";
}) {
  const map = {
    present: {
      label: "Present",
      cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    absent: {
      label: "Absent",
      cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
    "half-day": {
      label: "Half Day",
      cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    "not-clocked-in": {
      label: "Not Clocked In",
      cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "owner")
    return (
      <Badge variant="default" className="text-xs">
        Owner
      </Badge>
    );
  if (role === "manager")
    return (
      <Badge variant="secondary" className="text-xs">
        Manager
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs">
      Staff
    </Badge>
  );
}

// ─── Edit Record Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<AttendanceRecord>) => void;
}

function EditRecordModal({ record, onClose, onSave }: EditModalProps) {
  const [clockIn, setClockIn] = useState(
    record?.clockIn ? new Date(record.clockIn).toTimeString().slice(0, 5) : "",
  );
  const [clockOut, setClockOut] = useState(
    record?.clockOut
      ? new Date(record.clockOut).toTimeString().slice(0, 5)
      : "",
  );
  const [status, setStatus] = useState<"present" | "absent" | "half-day">(
    record?.status ?? "present",
  );
  const [notes, setNotes] = useState(record?.notes ?? "");

  if (!record) return null;

  function buildISOFromTime(timeStr: string, dateStr: string): string | null {
    if (!timeStr) return null;
    return `${dateStr}T${timeStr}:00`;
  }

  function handleSave() {
    if (!record) return;
    const ciISO = buildISOFromTime(clockIn, record.date);
    const coISO = buildISOFromTime(clockOut, record.date);
    let hoursWorked = 0;
    if (ciISO && coISO) {
      hoursWorked =
        (new Date(coISO).getTime() - new Date(ciISO).getTime()) / 3600000;
      if (hoursWorked < 0) hoursWorked = 0;
    }
    onSave(record.id, {
      clockIn: ciISO,
      clockOut: coISO,
      status,
      hoursWorked,
      notes,
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Edit Attendance — {record.staffName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {formatDate(record.date)}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Clock In</Label>
              <Input
                type="time"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Clock Out</Label>
              <Input
                type="time"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <div className="flex gap-2">
              {(["present", "absent", "half-day"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors capitalize",
                    status === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {s === "half-day"
                    ? "Half Day"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add note..."
              className="h-9 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Today Tab ────────────────────────────────────────────────────────────────

interface StaffCardProps {
  staffId: string;
  staffName: string;
  staffRole: UserRole;
  record: AttendanceRecord | null;
  isOwner: boolean;
  onClockIn: (id: string, name: string, role: UserRole) => void;
  onClockOut: (id: string) => void;
  onMarkAbsent: (id: string, name: string, role: UserRole) => void;
}

function StaffTodayCard({
  staffId,
  staffName,
  staffRole,
  record,
  isOwner,
  onClockIn,
  onClockOut,
  onMarkAbsent,
}: StaffCardProps) {
  const status = record ? getAttendanceStatus(record) : "not-clocked-in";

  return (
    <div
      className="rounded-2xl bg-card border border-border shadow-sm p-4 flex flex-col gap-3"
      data-ocid={`attendance.staff_card.${staffId}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {staffName}
          </p>
          <div className="mt-0.5">
            <RoleBadge role={staffRole} />
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Time row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-0.5">Clock In</span>
          <span className="font-medium text-foreground">
            {record?.clockIn ? toLocalDate(record.clockIn) : "—"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-0.5">Clock Out</span>
          <span className="font-medium text-foreground">
            {record?.clockOut ? toLocalDate(record.clockOut) : "—"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-0.5">Hours</span>
          <span className="font-medium text-foreground">
            {record ? formatHoursWorked(record.hoursWorked) : "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {status === "not-clocked-in" && (
          <>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onClockIn(staffId, staffName, staffRole)}
              data-ocid={`attendance.clock_in.${staffId}`}
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />
              Clock In
            </Button>
            {isOwner && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => onMarkAbsent(staffId, staffName, staffRole)}
                data-ocid={`attendance.mark_absent.${staffId}`}
              >
                <UserX className="w-3.5 h-3.5 mr-1" />
                Mark Absent
              </Button>
            )}
          </>
        )}
        {status === "present" && !record?.clockOut && (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => onClockOut(staffId)}
            data-ocid={`attendance.clock_out.${staffId}`}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Clock Out
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Monthly Summary Tab ──────────────────────────────────────────────────────

interface MonthlySummaryProps {
  staffList: Array<{ id: string; name: string; role: UserRole }>;
  getAttendanceForStaff: (staffId: string, month: string) => AttendanceRecord[];
}

function MonthlySummaryTab({
  staffList,
  getAttendanceForStaff,
}: MonthlySummaryProps) {
  const month = currentMonthKey();

  const rows = staffList.map((s) => {
    const records = getAttendanceForStaff(s.id, month);
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const halfDay = records.filter((r) => r.status === "half-day").length;
    const total = present + absent + halfDay;
    const pct =
      total > 0 ? Math.round(((present + halfDay * 0.5) / total) * 100) : 0;
    return { ...s, present, absent, halfDay, total, pct };
  });

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground text-sm"
          data-ocid="attendance.monthly_empty"
        >
          No staff members found.
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl bg-card border border-border shadow-sm p-4"
          data-ocid={`attendance.monthly_row.${row.id}`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-semibold text-sm truncate">{row.name}</p>
              <RoleBadge role={row.role} />
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                row.pct >= 80
                  ? "text-green-600 dark:text-green-400"
                  : row.pct >= 50
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400",
              )}
            >
              {row.pct}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 py-2">
              <p className="font-bold text-green-700 dark:text-green-400 text-base">
                {row.present}
              </p>
              <p className="text-green-600 dark:text-green-500 mt-0.5">
                Present
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 py-2">
              <p className="font-bold text-red-700 dark:text-red-400 text-base">
                {row.absent}
              </p>
              <p className="text-red-600 dark:text-red-500 mt-0.5">Absent</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 py-2">
              <p className="font-bold text-yellow-700 dark:text-yellow-400 text-base">
                {row.halfDay}
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 mt-0.5">
                Half Day
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                row.pct >= 80
                  ? "bg-green-500"
                  : row.pct >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500",
              )}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

interface HistoryTabProps {
  records: AttendanceRecord[];
  isOwner: boolean;
  onEdit: (record: AttendanceRecord) => void;
}

function HistoryTab({ records, isOwner, onEdit }: HistoryTabProps) {
  const sorted = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );

  if (sorted.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground text-sm"
        data-ocid="attendance.history_empty"
      >
        No attendance records yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((r) => {
        const status = getAttendanceStatus(r);
        return (
          <div
            key={r.id}
            className="rounded-xl bg-card border border-border shadow-sm px-4 py-3 flex items-center gap-3"
            data-ocid={`attendance.history_row.${r.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-foreground truncate">
                  {r.staffName}
                </span>
                <StatusBadge status={status} />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(r.date)}
                </span>
                {r.clockIn && (
                  <span className="flex items-center gap-1">
                    <LogIn className="w-3 h-3" />
                    {toLocalDate(r.clockIn)}
                  </span>
                )}
                {r.clockOut && (
                  <span className="flex items-center gap-1">
                    <LogOut className="w-3 h-3" />
                    {toLocalDate(r.clockOut)}
                  </span>
                )}
                {r.hoursWorked > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatHoursWorked(r.hoursWorked)}
                  </span>
                )}
              </div>
              {r.notes && (
                <p className="mt-0.5 text-xs text-muted-foreground italic truncate">
                  {r.notes}
                </p>
              )}
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => onEdit(r)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit record"
                data-ocid={`attendance.edit_history.${r.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function StaffAttendancePage() {
  const { currentUser } = useAuth();
  const {
    users,
    shopId,
    attendanceRecords,
    clockIn,
    clockOut,
    getAttendanceForDate,
    getAttendanceForStaff,
    updateAttendance,
  } = useStore();

  const isOwner = currentUser?.role === "owner";
  const today = todayISO();

  // Staff list — exclude owner, include active staff and managers
  const staffList = users.filter(
    (u) =>
      u.shopId === shopId &&
      !u.deleted &&
      !u.isOwner &&
      (u.role === "staff" || u.role === "manager"),
  );

  // Today's attendance records keyed by staffId
  const todayRecords = useMemo<Record<string, AttendanceRecord>>(() => {
    const map: Record<string, AttendanceRecord> = {};
    for (const r of attendanceRecords) {
      if (r.date === today) map[r.staffId] = r;
    }
    return map;
  }, [attendanceRecords, today]);

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null,
  );

  // Today summary counts
  const presentCount = Object.values(todayRecords).filter(
    (r) => r.status === "present" || r.status === "half-day",
  ).length;
  const absentCount = Object.values(todayRecords).filter(
    (r) => r.status === "absent",
  ).length;
  const notClockedIn = staffList.filter((s) => !todayRecords[s.id]).length;

  function handleClockIn(staffId: string, staffName: string, role: UserRole) {
    clockIn(staffId, staffName, role);
    toast.success(
      `${staffName} clocked in at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`,
    );
  }

  function handleClockOut(staffId: string) {
    const staff = staffList.find((s) => s.id === staffId);
    clockOut(staffId);
    toast.success(`${staff?.name ?? "Staff"} clocked out`);
  }

  function handleMarkAbsent(
    staffId: string,
    staffName: string,
    role: UserRole,
  ) {
    // Create a record with absent status, then update after state settles
    clockIn(staffId, staffName, role); // creates the record
    setTimeout(() => {
      const recs = getAttendanceForDate(today);
      const rec = recs.find((r) => r.staffId === staffId);
      if (rec) {
        updateAttendance(rec.id, { status: "absent", clockIn: null });
      }
    }, 100);
    toast.info(`${staffName} marked as absent`);
  }

  function handleSaveEdit(id: string, updates: Partial<AttendanceRecord>) {
    updateAttendance(id, updates);
    toast.success("Attendance record updated");
  }

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="flex-1 flex flex-col bg-background"
      data-ocid="attendance.page"
    >
      {/* Page header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Staff Attendance
              </h1>
              <p className="text-xs text-muted-foreground">{todayFormatted}</p>
            </div>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <UserCheck className="w-3.5 h-3.5" />
            {presentCount} Present
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
            <UserX className="w-3.5 h-3.5" />
            {absentCount} Absent
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            {notClockedIn} Pending
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="today" className="flex flex-col h-full">
          <div className="px-4 pt-3 bg-background sticky top-0 z-10 border-b border-border">
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger
                value="today"
                className="text-xs"
                data-ocid="attendance.tab_today"
              >
                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                Today
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="text-xs"
                data-ocid="attendance.tab_month"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                This Month
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs"
                data-ocid="attendance.tab_history"
              >
                <History className="w-3.5 h-3.5 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Today */}
          <TabsContent value="today" className="px-4 pt-4 pb-6 flex-1">
            {staffList.length === 0 ? (
              <Card>
                <CardContent
                  className="py-12 text-center"
                  data-ocid="attendance.today_empty"
                >
                  <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    No staff members
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add staff members in Staff Management to track attendance.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffList.map((s) => (
                  <StaffTodayCard
                    key={s.id}
                    staffId={s.id}
                    staffName={s.name}
                    staffRole={s.role}
                    record={todayRecords[s.id] ?? null}
                    isOwner={isOwner}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    onMarkAbsent={handleMarkAbsent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* This Month */}
          <TabsContent value="month" className="px-4 pt-4 pb-6 flex-1">
            <Card className="mb-4">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {new Date().toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  Summary
                </CardTitle>
              </CardHeader>
            </Card>
            <MonthlySummaryTab
              staffList={staffList.map((s) => ({
                id: s.id,
                name: s.name,
                role: s.role,
              }))}
              getAttendanceForStaff={getAttendanceForStaff}
            />
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="px-4 pt-4 pb-6 flex-1">
            <HistoryTab
              records={attendanceRecords.filter((r) =>
                staffList.some((s) => s.id === r.staffId),
              )}
              isOwner={isOwner}
              onEdit={setEditingRecord}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit modal */}
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
