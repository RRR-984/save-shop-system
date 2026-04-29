import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useStore } from "../context/StoreContext";
import type { StockBatch } from "../types/store";
import type {
  BatchUsed,
  JobCard,
  PartUsed,
  ServiceReminder,
  VehicleRecord,
} from "../types/vehicleService";

const STORAGE_KEY_VEHICLES = (shopId: string) => `vehicle_records_${shopId}`;
const STORAGE_KEY_JOB_CARDS = (shopId: string) => `job_cards_${shopId}`;
const STORAGE_KEY_REMINDERS = (shopId: string) => `service_reminders_${shopId}`;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

// ─── FIFO batch deduction helper ─────────────────────────────────────────────
function deductFIFO(
  batches: StockBatch[],
  productId: string,
  qty: number,
): {
  batchesUsed: BatchUsed[];
  updatedBatches: StockBatch[];
  success: boolean;
} {
  const productBatches = batches
    .filter((b) => b.productId === productId && b.quantity > 0)
    .sort(
      (a, b) =>
        new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
    );

  let remaining = qty;
  const batchesUsed: BatchUsed[] = [];
  const updatedBatches = batches.map((b) => ({ ...b }));

  for (const batch of productBatches) {
    if (remaining <= 0) break;
    const deduct = Math.min(remaining, batch.quantity);
    batchesUsed.push({ batchId: batch.id, qty: deduct });
    const idx = updatedBatches.findIndex((b) => b.id === batch.id);
    if (idx !== -1) updatedBatches[idx].quantity -= deduct;
    remaining -= deduct;
  }

  return { batchesUsed, updatedBatches, success: remaining === 0 };
}

// ─── Date arithmetic ─────────────────────────────────────────────────────────
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useVehicleService(shopId: string) {
  const { batches, addStockOut, triggerRefresh } = useStore();

  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [serviceReminders, setServiceReminders] = useState<ServiceReminder[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const actorRef = useRef<Awaited<
    ReturnType<typeof createActorWithConfig>
  > | null>(null);

  // ── Load from backend + localStorage ──────────────────────────────────────
  useEffect(() => {
    if (!shopId) return;

    const init = async () => {
      setIsLoading(true);
      try {
        const actor = await createActorWithConfig();
        actorRef.current = actor;

        const [vRaw, jRaw, rRaw] = await Promise.allSettled([
          (
            actor as unknown as {
              getVehicleRecords: (s: string) => Promise<string>;
            }
          ).getVehicleRecords(shopId),
          (
            actor as unknown as { getJobCards: (s: string) => Promise<string> }
          ).getJobCards(shopId),
          (
            actor as unknown as {
              getServiceReminders: (s: string) => Promise<string>;
            }
          ).getServiceReminders(shopId),
        ]);

        if (vRaw.status === "fulfilled" && vRaw.value) {
          const parsed = JSON.parse(vRaw.value) as VehicleRecord[];
          setVehicleRecords(parsed);
          saveToStorage(STORAGE_KEY_VEHICLES(shopId), parsed);
        } else {
          setVehicleRecords(
            loadFromStorage<VehicleRecord>(STORAGE_KEY_VEHICLES(shopId)),
          );
        }

        if (jRaw.status === "fulfilled" && jRaw.value) {
          const parsed = JSON.parse(jRaw.value) as JobCard[];
          setJobCards(parsed);
          saveToStorage(STORAGE_KEY_JOB_CARDS(shopId), parsed);
        } else {
          setJobCards(loadFromStorage<JobCard>(STORAGE_KEY_JOB_CARDS(shopId)));
        }

        if (rRaw.status === "fulfilled" && rRaw.value) {
          const parsed = JSON.parse(rRaw.value) as ServiceReminder[];
          setServiceReminders(parsed);
          saveToStorage(STORAGE_KEY_REMINDERS(shopId), parsed);
        } else {
          setServiceReminders(
            loadFromStorage<ServiceReminder>(STORAGE_KEY_REMINDERS(shopId)),
          );
        }
      } catch {
        // Backend unavailable — fall back to localStorage
        setVehicleRecords(
          loadFromStorage<VehicleRecord>(STORAGE_KEY_VEHICLES(shopId)),
        );
        setJobCards(loadFromStorage<JobCard>(STORAGE_KEY_JOB_CARDS(shopId)));
        setServiceReminders(
          loadFromStorage<ServiceReminder>(STORAGE_KEY_REMINDERS(shopId)),
        );
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [shopId]);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const persistVehicles = useCallback(
    async (records: VehicleRecord[]) => {
      saveToStorage(STORAGE_KEY_VEHICLES(shopId), records);
      try {
        const actor = actorRef.current;
        if (actor) {
          await (
            actor as unknown as {
              saveVehicleRecords: (s: string, d: string) => Promise<void>;
            }
          ).saveVehicleRecords(shopId, JSON.stringify(records));
        }
      } catch {
        // offline — already saved to localStorage
      }
    },
    [shopId],
  );

  const persistJobCards = useCallback(
    async (cards: JobCard[]) => {
      saveToStorage(STORAGE_KEY_JOB_CARDS(shopId), cards);
      try {
        const actor = actorRef.current;
        if (actor) {
          await (
            actor as unknown as {
              saveJobCards: (s: string, d: string) => Promise<void>;
            }
          ).saveJobCards(shopId, JSON.stringify(cards));
        }
      } catch {
        // offline
      }
    },
    [shopId],
  );

  const persistReminders = useCallback(
    async (reminders: ServiceReminder[]) => {
      saveToStorage(STORAGE_KEY_REMINDERS(shopId), reminders);
      try {
        const actor = actorRef.current;
        if (actor) {
          await (
            actor as unknown as {
              saveServiceReminders: (s: string, d: string) => Promise<void>;
            }
          ).saveServiceReminders(shopId, JSON.stringify(reminders));
        }
      } catch {
        // offline
      }
    },
    [shopId],
  );

  // ── saveVehicleRecord ──────────────────────────────────────────────────────
  const saveVehicleRecord = useCallback(
    async (record: Partial<VehicleRecord> & { vehicleNumber: string }) => {
      const now = new Date().toISOString();
      let updated: VehicleRecord[];

      if (record.id) {
        // update
        updated = vehicleRecords.map((v) =>
          v.id === record.id ? { ...v, ...record, updatedAt: now } : v,
        );
      } else {
        // check duplicate vehicleNumber
        const exists = vehicleRecords.find(
          (v) =>
            v.vehicleNumber.toUpperCase() ===
            record.vehicleNumber.toUpperCase(),
        );
        if (exists) {
          toast.error(`Vehicle ${record.vehicleNumber} is already registered.`);
          return null;
        }
        const newRecord: VehicleRecord = {
          id: generateId(),
          shopId,
          vehicleNumber: record.vehicleNumber.toUpperCase(),
          customerName: record.customerName ?? "",
          customerPhone: record.customerPhone ?? "",
          vehicleModel: record.vehicleModel ?? "",
          vehicleType: record.vehicleType,
          firstServiceDate: todayStr(),
          lastServiceDate: todayStr(),
          nextDueDate: addDays(
            todayStr(),
            record.nextServiceIntervalDays ?? 90,
          ),
          totalServiceCount: 0,
          nextServiceIntervalDays: record.nextServiceIntervalDays ?? 90,
          createdAt: now,
          updatedAt: now,
        };
        updated = [...vehicleRecords, newRecord];
      }

      setVehicleRecords(updated);
      await persistVehicles(updated);
      return (
        updated.find(
          (v) => v.vehicleNumber === record.vehicleNumber.toUpperCase(),
        ) ?? null
      );
    },
    [vehicleRecords, shopId, persistVehicles],
  );

  // ── saveJobCard ────────────────────────────────────────────────────────────
  const saveJobCard = useCallback(
    async (
      card: Partial<JobCard> & { vehicleId: string; vehicleNumber: string },
    ) => {
      const now = new Date().toISOString();
      let updated: JobCard[];

      if (card.id) {
        updated = jobCards.map((j) =>
          j.id === card.id ? { ...j, ...card, updatedAt: now } : j,
        );
      } else {
        const newCard: JobCard = {
          id: generateId(),
          shopId,
          vehicleId: card.vehicleId,
          vehicleNumber: card.vehicleNumber.toUpperCase(),
          date: card.date ?? todayStr(),
          problemDescription: card.problemDescription ?? "",
          workDone: card.workDone ?? "",
          status: card.status ?? "Open",
          partsUsed: card.partsUsed ?? [],
          labourHours: card.labourHours ?? 0,
          labourRate: card.labourRate ?? 0,
          labourCost: card.labourCost ?? 0,
          subtotal: card.subtotal ?? 0,
          gstAmount: card.gstAmount ?? 0,
          grandTotal: card.grandTotal ?? 0,
          notes: card.notes ?? "",
          createdAt: now,
          updatedAt: now,
        };
        updated = [...jobCards, newCard];
      }

      setJobCards(updated);
      await persistJobCards(updated);
      return (
        updated.find(
          (j) => j.id === (card.id ?? updated[updated.length - 1].id),
        ) ?? null
      );
    },
    [jobCards, shopId, persistJobCards],
  );

  // ── completeJobCard ────────────────────────────────────────────────────────
  const completeJobCard = useCallback(
    async (jobCardId: string, manualNextDate?: string) => {
      const card = jobCards.find((j) => j.id === jobCardId);
      if (!card) return;

      const now = new Date().toISOString();
      let currentBatches = [...batches];

      // FIFO deduction for each part
      const updatedParts: PartUsed[] = [];
      for (const part of card.partsUsed) {
        const { batchesUsed, updatedBatches, success } = deductFIFO(
          currentBatches,
          part.productId,
          part.quantity,
        );
        if (!success) {
          toast.error(`Insufficient stock for ${part.productName}`);
          return;
        }
        currentBatches = updatedBatches;
        updatedParts.push({ ...part, batchesUsed });

        // Use StoreContext's addStockOut to properly record the deduction
        await addStockOut(
          part.productId,
          part.quantity,
          `Service Job Card #${card.id}`,
        );
      }

      // Update job card status
      const updatedCards = jobCards.map((j) =>
        j.id === jobCardId
          ? {
              ...j,
              status: "Completed" as const,
              completedAt: now,
              updatedAt: now,
              partsUsed: updatedParts,
              manualNextServiceDate: manualNextDate,
            }
          : j,
      );
      setJobCards(updatedCards);
      await persistJobCards(updatedCards);

      // Update vehicle record
      const vehicle = vehicleRecords.find((v) => v.id === card.vehicleId);
      if (vehicle) {
        const nextDate =
          manualNextDate ??
          addDays(todayStr(), vehicle.nextServiceIntervalDays);
        const updatedVehicles = vehicleRecords.map((v) =>
          v.id === card.vehicleId
            ? {
                ...v,
                lastServiceDate: todayStr(),
                nextDueDate: nextDate,
                totalServiceCount: v.totalServiceCount + 1,
                updatedAt: now,
              }
            : v,
        );
        setVehicleRecords(updatedVehicles);
        await persistVehicles(updatedVehicles);

        // Create/update service reminder
        const nextDueDate =
          manualNextDate ??
          addDays(todayStr(), vehicle.nextServiceIntervalDays);
        const existingReminder = serviceReminders.find(
          (r) => r.vehicleId === card.vehicleId && r.status === "pending",
        );
        const updatedReminders = existingReminder
          ? serviceReminders.map((r) =>
              r.id === existingReminder.id
                ? {
                    ...r,
                    dueDate: nextDueDate,
                    status: "pending" as const,
                    snoozedUntil: undefined,
                  }
                : r,
            )
          : [
              ...serviceReminders,
              {
                id: generateId(),
                shopId,
                vehicleId: card.vehicleId,
                vehicleNumber: card.vehicleNumber,
                customerName: vehicle.customerName,
                customerPhone: vehicle.customerPhone,
                dueDate: nextDueDate,
                reminderType: manualNextDate
                  ? ("manual" as const)
                  : ("fixed" as const),
                status: "pending" as const,
                createdAt: now,
              } satisfies ServiceReminder,
            ];
        setServiceReminders(updatedReminders);
        await persistReminders(updatedReminders);
      }

      triggerRefresh();
      toast.success("Job card completed & stock updated!");
    },
    [
      jobCards,
      vehicleRecords,
      serviceReminders,
      batches,
      shopId,
      addStockOut,
      persistJobCards,
      persistVehicles,
      persistReminders,
      triggerRefresh,
    ],
  );

  // ── saveServiceReminder ────────────────────────────────────────────────────
  const saveServiceReminder = useCallback(
    async (reminder: Partial<ServiceReminder> & { vehicleId: string }) => {
      const now = new Date().toISOString();
      let updated: ServiceReminder[];

      if (reminder.id) {
        updated = serviceReminders.map((r) =>
          r.id === reminder.id ? { ...r, ...reminder } : r,
        );
      } else {
        const vehicle = vehicleRecords.find((v) => v.id === reminder.vehicleId);
        const newReminder: ServiceReminder = {
          id: generateId(),
          shopId,
          vehicleId: reminder.vehicleId,
          vehicleNumber: reminder.vehicleNumber ?? vehicle?.vehicleNumber ?? "",
          customerName: reminder.customerName ?? vehicle?.customerName ?? "",
          customerPhone: reminder.customerPhone ?? vehicle?.customerPhone ?? "",
          dueDate: reminder.dueDate ?? todayStr(),
          reminderType: reminder.reminderType ?? "fixed",
          status: "pending",
          createdAt: now,
        };
        updated = [...serviceReminders, newReminder];
      }

      setServiceReminders(updated);
      await persistReminders(updated);
    },
    [serviceReminders, vehicleRecords, shopId, persistReminders],
  );

  // ── snoozeReminder ─────────────────────────────────────────────────────────
  const snoozeReminder = useCallback(
    async (reminderId: string, days: number) => {
      const snoozedUntil = addDays(todayStr(), days);
      const updated = serviceReminders.map((r) =>
        r.id === reminderId
          ? { ...r, status: "snoozed" as const, snoozedUntil }
          : r,
      );
      setServiceReminders(updated);
      await persistReminders(updated);
    },
    [serviceReminders, persistReminders],
  );

  // ── dismissReminder ────────────────────────────────────────────────────────
  const dismissReminder = useCallback(
    async (reminderId: string) => {
      const updated = serviceReminders.map((r) =>
        r.id === reminderId ? { ...r, status: "dismissed" as const } : r,
      );
      setServiceReminders(updated);
      await persistReminders(updated);
    },
    [serviceReminders, persistReminders],
  );

  // ── getVehicleHistory ──────────────────────────────────────────────────────
  const getVehicleHistory = useCallback(
    (vehicleNumber: string): JobCard[] =>
      jobCards
        .filter(
          (j) => j.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase(),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [jobCards],
  );

  // ── getDueReminders ────────────────────────────────────────────────────────
  const getDueReminders = useCallback((): ServiceReminder[] => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const cutoff = twoDaysFromNow.toISOString().slice(0, 10);

    return serviceReminders.filter((r) => {
      if (r.status === "dismissed") return false;
      if (
        r.status === "snoozed" &&
        r.snoozedUntil &&
        r.snoozedUntil > todayStr()
      )
        return false;
      return r.dueDate <= cutoff;
    });
  }, [serviceReminders]);

  return {
    vehicleRecords,
    jobCards,
    serviceReminders,
    isLoading,
    saveVehicleRecord,
    saveJobCard,
    completeJobCard,
    saveServiceReminder,
    snoozeReminder,
    dismissReminder,
    getVehicleHistory,
    getDueReminders,
  };
}
