// ─── Vehicle Service & Repair Types ─────────────────────────────────────────

export type JobCardStatus = "Open" | "InProgress" | "Completed" | "OnHold";
export type ReminderType = "fixed" | "manual";
export type ReminderStatus = "pending" | "sent" | "snoozed" | "dismissed";
export type VehicleType =
  | "Car"
  | "Bike"
  | "Truck"
  | "Scooter"
  | "Auto"
  | "Other";

export interface BatchUsed {
  batchId: string;
  qty: number;
}

export interface PartUsed {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  batchesUsed: BatchUsed[];
  lineTotal: number;
}

export interface VehicleRecord {
  id: string;
  shopId: string;
  vehicleNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  firstServiceDate: string;
  lastServiceDate: string;
  nextDueDate: string;
  totalServiceCount: number;
  nextServiceIntervalDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobCard {
  id: string;
  shopId: string;
  vehicleId: string;
  vehicleNumber: string;
  date: string;
  problemDescription: string;
  workDone: string;
  status: JobCardStatus;
  partsUsed: PartUsed[];
  labourHours: number;
  labourRate: number;
  labourCost: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  invoiceId?: string;
  completedAt?: string;
  manualNextServiceDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReminder {
  id: string;
  shopId: string;
  vehicleId: string;
  vehicleNumber: string;
  customerName: string;
  customerPhone: string;
  dueDate: string;
  reminderType: ReminderType;
  snoozedUntil?: string;
  lastReminderSentAt?: string;
  status: ReminderStatus;
  createdAt: string;
}
