/**
 * useRestaurantData — loads menu items, tables, active orders, KOTs, and
 * restaurant config from localStorage under the `restaurant-{shopId}` namespace.
 *
 * Dual-write pattern:
 *  - Read:  loadRestaurantData(shopId)
 *  - Write: saveRestaurantData(shopId, key, value)
 *
 * This hook provides the reactive React state layer on top of that storage.
 */

import { useCallback, useEffect, useState } from "react";
import type {
  KOT,
  MenuItem,
  RestaurantBill,
  RestaurantConfig,
  RestaurantOrder,
  RestaurantTable,
} from "../types/restaurant";

// ─── Storage helpers ──────────────────────────────────────────────────────────

const NS = (shopId: string) => `restaurant-${shopId}`;

export interface RestaurantStorageData {
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  activeOrders: RestaurantOrder[];
  kots: KOT[];
  bills: RestaurantBill[];
  config: RestaurantConfig | null;
}

/** Read all restaurant data for a shop from localStorage */
export function loadRestaurantData(shopId: string): RestaurantStorageData {
  const ns = NS(shopId);
  function get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`${ns}-${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  return {
    menuItems: get<MenuItem[]>("menuItems", []),
    tables: get<RestaurantTable[]>("tables", []),
    activeOrders: get<RestaurantOrder[]>("activeOrders", []),
    kots: get<KOT[]>("kots", []),
    bills: get<RestaurantBill[]>("bills", []),
    config: get<RestaurantConfig | null>("config", null),
  };
}

/** Write a single collection for a shop to localStorage */
export function saveRestaurantData<K extends keyof RestaurantStorageData>(
  shopId: string,
  key: K,
  value: RestaurantStorageData[K],
): void {
  try {
    localStorage.setItem(`${NS(shopId)}-${key}`, JSON.stringify(value));
  } catch {
    /* ignore storage quota errors */
  }
}

// ─── Default config ───────────────────────────────────────────────────────────

function defaultConfig(shopId: string): RestaurantConfig {
  return {
    shopId,
    gstEnabled: false,
    gstRate: 5,
    serviceChargeEnabled: false,
    serviceChargeRate: 5,
    quickOrderItemIds: [],
    tableCount: 10,
    currency: "INR",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface RestaurantDataState {
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  activeOrders: RestaurantOrder[];
  activeKots: KOT[];
  bills: RestaurantBill[];
  restaurantConfig: RestaurantConfig;
  restaurantLoading: boolean;

  // Mutators
  setMenuItems: (items: MenuItem[]) => void;
  setTables: (tables: RestaurantTable[]) => void;
  setActiveOrders: (orders: RestaurantOrder[]) => void;
  setActiveKots: (kots: KOT[]) => void;
  setBills: (bills: RestaurantBill[]) => void;
  setRestaurantConfig: (config: RestaurantConfig) => void;

  /** Reload all data from localStorage — used after KOT sync detects changes */
  reload: () => void;
}

export function useRestaurantData(shopId: string): RestaurantDataState {
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>([]);
  const [tables, setTablesState] = useState<RestaurantTable[]>([]);
  const [activeOrders, setActiveOrdersState] = useState<RestaurantOrder[]>([]);
  const [activeKots, setActiveKotsState] = useState<KOT[]>([]);
  const [bills, setBillsState] = useState<RestaurantBill[]>([]);
  const [restaurantConfig, setRestaurantConfigState] =
    useState<RestaurantConfig>(() => defaultConfig(shopId));

  const loadAll = useCallback(() => {
    if (!shopId) return;
    const data = loadRestaurantData(shopId);
    setMenuItemsState(data.menuItems);
    setTablesState(data.tables);
    setActiveOrdersState(data.activeOrders);
    setActiveKotsState(data.kots);
    setBillsState(data.bills);
    setRestaurantConfigState(data.config ?? defaultConfig(shopId));
    setRestaurantLoading(false);
  }, [shopId]);

  // Load on mount + when shopId changes
  useEffect(() => {
    setRestaurantLoading(true);
    loadAll();
  }, [loadAll]);

  // ── Dual-write wrappers ───────────────────────────────────────────────────

  const setMenuItems = useCallback(
    (items: MenuItem[]) => {
      setMenuItemsState(items);
      saveRestaurantData(shopId, "menuItems", items);
    },
    [shopId],
  );

  const setTables = useCallback(
    (t: RestaurantTable[]) => {
      setTablesState(t);
      saveRestaurantData(shopId, "tables", t);
    },
    [shopId],
  );

  const setActiveOrders = useCallback(
    (orders: RestaurantOrder[]) => {
      setActiveOrdersState(orders);
      saveRestaurantData(shopId, "activeOrders", orders);
    },
    [shopId],
  );

  const setActiveKots = useCallback(
    (kots: KOT[]) => {
      setActiveKotsState(kots);
      saveRestaurantData(shopId, "kots", kots);
    },
    [shopId],
  );

  const setBills = useCallback(
    (b: RestaurantBill[]) => {
      setBillsState(b);
      saveRestaurantData(shopId, "bills", b);
    },
    [shopId],
  );

  const setRestaurantConfig = useCallback(
    (config: RestaurantConfig) => {
      setRestaurantConfigState(config);
      saveRestaurantData(shopId, "config", config);
    },
    [shopId],
  );

  return {
    menuItems,
    tables,
    activeOrders,
    activeKots,
    bills,
    restaurantConfig,
    restaurantLoading,
    setMenuItems,
    setTables,
    setActiveOrders,
    setActiveKots,
    setBills,
    setRestaurantConfig,
    reload: loadAll,
  };
}
