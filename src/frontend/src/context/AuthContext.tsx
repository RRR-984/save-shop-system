import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import type {
  AppUser,
  MobileSession,
  Shop,
  ShopMeta,
  UserRole,
} from "../types/store";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return null;
}

function lsSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Context Types ────────────────────────────────────────────────────────────

interface PendingOtp {
  mobile: string;
  otp: string;
  expiresAt: number; // timestamp ms
}

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  mobile: string;
  isOwner: boolean;
}

interface AuthContextValue {
  session: MobileSession | null;
  isInitializing: boolean;

  // OTP flow (Owner login via mobile OTP)
  sendOtp: (mobile: string) => {
    success: boolean;
    error?: string;
    otp?: string;
  };
  verifyOtp: (
    mobile: string,
    otp: string,
    shopName: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // PIN flow (Manager / Staff login via mobile + PIN)
  loginWithPin: (
    mobile: string,
    pin: string,
  ) => { success: boolean; error?: string };

  logout: () => void;

  // Derived
  currentShop: Shop | null;
  currentUser: CurrentUser | null;

  // ── Multi-shop system ────────────────────────────────────────────────────
  /** All shops owned by the logged-in mobile number */
  allShops: ShopMeta[];
  /** The currently selected shop (may differ from the primary shop after switchShop) */
  selectedShop: ShopMeta | null;
  /** Switch active shop without logout — updates session.selectedShopId */
  switchShop: (shopId: string) => void;
  /** Create a new shop under the same owner mobile — auto-switches to it */
  createNewShop: (
    name: string,
    address: string,
    city: string,
  ) => Promise<{ success: boolean; error?: string; shopId?: string }>;
  /** Re-fetch all shops for an owner mobile from backend */
  loadOwnerShops: (mobile: string) => Promise<void>;
  /** Update shop details in backend */
  updateShopDetails: (
    shopId: string,
    name: string,
    address: string,
    city: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Soft-delete a shop from the list */
  deleteShopFromList: (
    shopId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Get combined stats for all shops owned by mobile */
  getOwnerStats: (
    mobile: string,
  ) => Promise<import("../backend").OwnerStats | null>;

  // Legacy compat (used by AdminPage for user management)
  shops: Shop[];
  selectShop: (shopId: string) => void;
  login: (username: string, password: string) => boolean;
  createShop: (
    shopName: string,
    adminUsername: string,
    adminPassword: string,
  ) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // ── Multi-shop state ──────────────────────────────────────────────────────
  const [allShops, setAllShops] = useState<ShopMeta[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopMeta | null>(null);

  // Actor for backend calls (shared, created once)
  const actorRef = useRef<backendInterface | null>(null);
  useEffect(() => {
    createActorWithConfig()
      .then((a) => {
        actorRef.current = a;
      })
      .catch((err) => {
        console.error("[AuthContext] Actor creation failed:", err);
      });
  }, []);

  // Ref to latest users list — injected by StoreContext after it loads
  const usersRef = useRef<AppUser[]>([]);

  // Called by StoreContext once users are loaded from backend
  const syncUsers = useCallback((users: AppUser[]) => {
    usersRef.current = users;
    try {
      localStorage.setItem("auth_users_cache", JSON.stringify(users));
    } catch {}
  }, []);

  // Build CurrentUser from a MobileSession + users list
  const buildCurrentUser = useCallback(
    (sess: MobileSession, users: AppUser[]): CurrentUser => {
      const shopId = sess.selectedShopId ?? sess.shopId;
      const mobile = sess.mobile;

      if (sess.userId) {
        const found = users.find(
          (u) => u.id === sess.userId && u.shopId === shopId,
        );
        if (found && !found.deleted) {
          return {
            id: found.id,
            name: found.name || mobile,
            role: found.role,
            mobile,
            isOwner: found.isOwner ?? found.role === "owner",
          };
        }
      }

      const byMobile = users.find(
        (u) =>
          u.mobile?.replace(/\D/g, "") === mobile &&
          u.shopId === shopId &&
          !u.deleted,
      );
      if (byMobile) {
        return {
          id: byMobile.id,
          name: byMobile.name || mobile,
          role: byMobile.role,
          mobile,
          isOwner: byMobile.isOwner ?? byMobile.role === "owner",
        };
      }

      const userId = sess.userId ?? `user_${mobile}`;
      return {
        id: userId,
        name: sess.shopName || mobile,
        role: sess.userRole ?? "owner",
        mobile,
        isOwner: true,
      };
    },
    [],
  );

  // ── Load shops for owner from backend ────────────────────────────────────
  const loadOwnerShops = useCallback(async (mobile: string): Promise<void> => {
    const actor = actorRef.current;
    if (!actor) return;
    try {
      const shops = await actor.listShopsForOwner(mobile);
      const active = shops.filter((s) => !s.isDeleted);
      setAllShops(active);

      // If no shops returned from backend, fall back to local store_shops for backward compat
      if (active.length === 0) {
        const localShops = lsGet<Shop[]>("store_shops") ?? [];
        const primaryShopId = `shop_${mobile}`;
        const primaryLocal = localShops.find((s) => s.id === primaryShopId);
        if (primaryLocal) {
          const converted: ShopMeta = {
            id: primaryLocal.id,
            name: primaryLocal.name,
            address: "",
            city: "",
            createdAt: primaryLocal.createdAt,
            ownerMobile: mobile,
            isDeleted: false,
          };
          setAllShops([converted]);
        }
      }
    } catch (err) {
      console.error("[AuthContext] loadOwnerShops failed:", err);
      // Fallback: use local shops
      const localShops = lsGet<Shop[]>("store_shops") ?? [];
      const primaryShopId = `shop_${mobile}`;
      const primaryLocal = localShops.find((s) => s.id === primaryShopId);
      if (primaryLocal) {
        const converted: ShopMeta = {
          id: primaryLocal.id,
          name: primaryLocal.name,
          address: "",
          city: "",
          createdAt: primaryLocal.createdAt,
          ownerMobile: mobile,
          isDeleted: false,
        };
        setAllShops([converted]);
      }
    }
  }, []);

  // ── Restore session on mount ──────────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: loadOwnerShops is stable — defined outside effect, including it would cause infinite loop
  useEffect(() => {
    const saved = lsGet<MobileSession>("mobile_auth_session");
    if (saved?.mobile && saved?.shopId) {
      setSession(saved);
      const userId = saved.userId ?? `user_${saved.mobile}`;
      setCurrentUser({
        id: userId,
        name: saved.shopName || saved.mobile,
        role: saved.userRole ?? "owner",
        mobile: saved.mobile,
        isOwner: (saved.userRole ?? "owner") === "owner",
      });
      // Populate allShops once actor is ready — defer slightly
      setTimeout(() => {
        loadOwnerShops(saved.mobile);
      }, 500);
    }
    setIsInitializing(false);
  }, []);

  // Sync selectedShop whenever allShops or session changes
  useEffect(() => {
    if (!session) {
      setSelectedShop(null);
      return;
    }
    const activeShopId = session.selectedShopId ?? session.shopId;
    const match = allShops.find((s) => s.id === activeShopId);
    if (match) {
      setSelectedShop(match);
    } else if (allShops.length > 0) {
      setSelectedShop(allShops[0]);
    } else {
      // Fallback: build a minimal ShopMeta from session
      setSelectedShop({
        id: activeShopId,
        name: session.shopName,
        address: "",
        city: "",
        createdAt: session.loginAt,
        ownerMobile: session.mobile,
        isDeleted: false,
      });
    }
  }, [allShops, session]);

  // Re-resolve currentUser whenever users list is synced (called from StoreContext)
  const resolveUserFromStore = useCallback(
    (users: AppUser[]) => {
      syncUsers(users);
      if (!session) return;
      const resolved = buildCurrentUser(session, users);
      setCurrentUser(resolved);
    },
    [session, buildCurrentUser, syncUsers],
  );

  // ── switchShop ────────────────────────────────────────────────────────────
  const switchShop = useCallback(
    (shopId: string) => {
      if (!session) return;
      const target = allShops.find((s) => s.id === shopId);
      const targetName = target?.name ?? session.shopName;

      const updatedSession: MobileSession = {
        ...session,
        selectedShopId: shopId,
        shopName: targetName,
      };
      lsSet("mobile_auth_session", updatedSession);
      setSession(updatedSession);
      if (target) setSelectedShop(target);
    },
    [session, allShops],
  );

  // ── createNewShop ─────────────────────────────────────────────────────────
  const createNewShop = useCallback(
    async (
      name: string,
      address: string,
      city: string,
    ): Promise<{ success: boolean; error?: string; shopId?: string }> => {
      if (!session) return { success: false, error: "Please login first" };
      const actor = actorRef.current;
      if (!actor) return { success: false, error: "Not connected to backend" };
      try {
        const result = await actor.addShop(
          session.mobile,
          name.trim(),
          address.trim(),
          city.trim(),
        );
        if (!result.success) {
          return {
            success: false,
            error: result.error ?? "Failed to create shop",
          };
        }
        // Reload all shops then auto-switch
        await loadOwnerShops(session.mobile);
        switchShop(result.shopId);
        return { success: true, shopId: result.shopId };
      } catch (err) {
        console.error("[AuthContext] createNewShop failed:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to create shop",
        };
      }
    },
    [session, loadOwnerShops, switchShop],
  );

  // ── updateShopDetails ────────────────────────────────────────────────────
  const updateShopDetails = useCallback(
    async (
      shopId: string,
      name: string,
      address: string,
      city: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const actor = actorRef.current;
      if (!actor) return { success: false, error: "Not connected to backend" };
      try {
        const result = await actor.updateShop(shopId, name, address, city);
        if (!result.success) {
          return {
            success: false,
            error: result.error ?? "Failed to update shop",
          };
        }
        // Optimistically update local list
        setAllShops((prev) =>
          prev.map((s) =>
            s.id === shopId ? { ...s, name, address, city } : s,
          ),
        );
        // If this was the currently selected shop, update session shopName
        if (session?.selectedShopId === shopId || session?.shopId === shopId) {
          const updatedSession: MobileSession = { ...session!, shopName: name };
          lsSet("mobile_auth_session", updatedSession);
          setSession(updatedSession);
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update shop",
        };
      }
    },
    [session],
  );

  // ── deleteShopFromList ────────────────────────────────────────────────────
  const deleteShopFromList = useCallback(
    async (shopId: string): Promise<{ success: boolean; error?: string }> => {
      const actor = actorRef.current;
      if (!actor) return { success: false, error: "Not connected to backend" };
      try {
        const result = await actor.deleteShop(shopId);
        if (!result.success) {
          return { success: false, error: "Failed to delete shop" };
        }
        setAllShops((prev) => prev.filter((s) => s.id !== shopId));
        // If the deleted shop was selected, switch to another
        if (
          session &&
          (session.selectedShopId === shopId || session.shopId === shopId)
        ) {
          const remaining = allShops.filter((s) => s.id !== shopId);
          if (remaining.length > 0) {
            switchShop(remaining[0].id);
          }
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete shop",
        };
      }
    },
    [session, allShops, switchShop],
  );

  // ── getOwnerStats ─────────────────────────────────────────────────────────
  const getOwnerStats = useCallback(async (mobile: string) => {
    const actor = actorRef.current;
    if (!actor) return null;
    try {
      return await actor.getOwnerStats(mobile);
    } catch {
      return null;
    }
  }, []);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = useCallback(
    (mobile: string): { success: boolean; error?: string; otp?: string } => {
      const cleaned = mobile.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        return {
          success: false,
          error: "Enter a valid 10-digit mobile number",
        };
      }
      const otp = generateOtp();
      const pending: PendingOtp = {
        mobile: cleaned,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      setPendingOtp(pending);
      lsSet("pending_otp", pending);
      console.log(`[Auth] OTP for ${cleaned}: ${otp}`);
      return { success: true, otp };
    },
    [],
  );

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(
    async (
      mobile: string,
      enteredOtp: string,
      shopName: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const cleaned = mobile.replace(/\D/g, "");

      let pending = pendingOtp;
      if (!pending) {
        pending = lsGet<PendingOtp>("pending_otp");
      }

      if (!pending || pending.mobile !== cleaned) {
        return { success: false, error: "Send OTP first" };
      }
      if (Date.now() > pending.expiresAt) {
        setPendingOtp(null);
        localStorage.removeItem("pending_otp");
        return { success: false, error: "OTP has expired. Send OTP again" };
      }
      if (pending.otp !== enteredOtp.trim()) {
        return { success: false, error: "OTP is incorrect" };
      }

      const shopId = `shop_${cleaned}`;

      // ── Unique user enforcement: check backend for existing shops before
      //    creating a new one. If the mobile already has shops registered,
      //    skip addShop — the user account already exists.
      let resolvedShopId = shopId;
      let resolvedShopName = shopName.trim() || `Shop ${cleaned}`;

      const actor = actorRef.current;
      if (actor) {
        try {
          const existingBackendShops = await actor.listShopsForOwner(cleaned);
          const activeBackendShops = existingBackendShops.filter(
            (s) => !s.isDeleted,
          );
          if (activeBackendShops.length > 0) {
            // Returning user — do NOT call addShop again. Use the most recent shop.
            const latest = activeBackendShops.reduce((a, b) =>
              a.createdAt > b.createdAt ? a : b,
            );
            resolvedShopId = latest.id;
            resolvedShopName = latest.name;
          } else {
            // First-time user — create the primary shop in backend
            await actor.addShop(cleaned, resolvedShopName, "", "");
          }
        } catch (err) {
          // Backend unreachable — fall through to localStorage-only path
          console.warn("[AuthContext] verifyOtp backend check failed:", err);
        }
      }

      // Auto-create shop record if first time (localStorage compat)
      const existingShops = lsGet<Shop[]>("store_shops") ?? [];
      const shopExists = existingShops.find((s) => s.id === resolvedShopId);
      if (!shopExists) {
        const newShop: Shop = {
          id: resolvedShopId,
          name: resolvedShopName,
          createdAt: new Date().toISOString(),
          mobile: cleaned,
        };
        lsSet("store_shops", [...existingShops, newShop]);
      } else {
        resolvedShopName = shopExists.name || resolvedShopName;
      }

      const existingUsers = usersRef.current.filter(
        (u) => u.shopId === resolvedShopId && !u.deleted,
      );
      const matchedUser = existingUsers.find(
        (u) => u.mobile?.replace(/\D/g, "") === cleaned,
      );

      const userId = matchedUser?.id ?? `user_${cleaned}`;
      const userRole: UserRole = matchedUser?.role ?? "owner";

      const newSession: MobileSession = {
        mobile: cleaned,
        shopId: resolvedShopId,
        shopName: resolvedShopName,
        loginAt: new Date().toISOString(),
        userId,
        userRole,
        selectedShopId: resolvedShopId,
      };

      lsSet("mobile_auth_session", newSession);
      setPendingOtp(null);
      localStorage.removeItem("pending_otp");
      setSession(newSession);

      const user: CurrentUser = matchedUser
        ? {
            id: matchedUser.id,
            name: matchedUser.name || cleaned,
            role: matchedUser.role,
            mobile: cleaned,
            isOwner: matchedUser.isOwner ?? matchedUser.role === "owner",
          }
        : {
            id: userId,
            name: resolvedShopName,
            role: "owner",
            mobile: cleaned,
            isOwner: true,
          };
      setCurrentUser(user);

      // Load all shops for this owner in the background
      setTimeout(() => loadOwnerShops(cleaned), 300);

      return { success: true };
    },
    [pendingOtp, loadOwnerShops],
  );

  // ── PIN login ─────────────────────────────────────────────────────────────
  const loginWithPin = useCallback(
    (mobile: string, pin: string): { success: boolean; error?: string } => {
      const cleaned = mobile.replace(/\D/g, "");
      if (!cleaned || cleaned.length < 10) {
        return { success: false, error: "Please enter a valid mobile number" };
      }
      if (!pin || pin.trim().length === 0) {
        return { success: false, error: "Please enter your PIN" };
      }

      let allUsers = usersRef.current;
      if (allUsers.length === 0) {
        try {
          const cached = localStorage.getItem("auth_users_cache");
          if (cached) allUsers = JSON.parse(cached) as AppUser[];
        } catch {}
      }
      const matched = allUsers.find(
        (u) =>
          u.mobile?.replace(/\D/g, "") === cleaned &&
          u.pin === pin.trim() &&
          u.active !== false &&
          !u.deleted,
      );

      if (!matched) {
        return { success: false, error: "Mobile number or PIN is incorrect" };
      }

      const shopId = matched.shopId;
      const allShopsLocal = lsGet<Shop[]>("store_shops") ?? [];
      const shop = allShopsLocal.find((s) => s.id === shopId);
      const resolvedShopName = shop?.name ?? `Shop ${cleaned}`;

      const newSession: MobileSession = {
        mobile: cleaned,
        shopId,
        shopName: resolvedShopName,
        loginAt: new Date().toISOString(),
        userId: matched.id,
        userRole: matched.role,
        selectedShopId: shopId,
      };

      lsSet("mobile_auth_session", newSession);
      setSession(newSession);

      const user: CurrentUser = {
        id: matched.id,
        name: matched.name || cleaned,
        role: matched.role,
        mobile: cleaned,
        isOwner: matched.isOwner ?? matched.role === "owner",
      };
      setCurrentUser(user);

      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setSession(null);
    setCurrentUser(null);
    setAllShops([]);
    setSelectedShop(null);
    setPendingOtp(null);
    localStorage.removeItem("mobile_auth_session");
    localStorage.removeItem("pending_otp");
  }, []);

  // currentShop uses selectedShopId for dynamic shop switching
  const currentShop: Shop | null = session
    ? {
        id: session.selectedShopId ?? session.shopId,
        name: selectedShop?.name ?? session.shopName,
        createdAt: selectedShop?.createdAt ?? session.loginAt,
        mobile: session.mobile,
      }
    : null;

  // Legacy compat stubs
  const shops: Shop[] = currentShop ? [currentShop] : [];
  const selectShop = useCallback((_shopId: string) => {}, []);

  const login = useCallback(
    (_username: string, _password: string): boolean => {
      if (session) return true;
      return false;
    },
    [session],
  );

  const createShop = useCallback(
    (
      shopName: string,
      _adminUsername: string,
      _adminPassword: string,
    ): { success: boolean; error?: string } => {
      if (!session) return { success: false, error: "Please login first" };
      const allShopsLocal = lsGet<Shop[]>("store_shops") ?? [];
      const updated = allShopsLocal.map((s) =>
        s.id === session.shopId ? { ...s, name: shopName.trim() } : s,
      );
      lsSet("store_shops", updated);
      return { success: true };
    },
    [session],
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        isInitializing,
        sendOtp,
        verifyOtp,
        loginWithPin,
        logout,
        currentShop,
        currentUser,
        allShops,
        selectedShop,
        switchShop,
        createNewShop,
        loadOwnerShops,
        updateShopDetails,
        deleteShopFromList,
        getOwnerStats,
        shops,
        selectShop,
        login,
        createShop,
      }}
    >
      {/* Expose resolveUserFromStore so StoreContext can call it */}
      <AuthUserSyncContext.Provider value={resolveUserFromStore}>
        {children}
      </AuthUserSyncContext.Provider>
    </AuthContext.Provider>
  );
}

// ─── Internal sync context — used by StoreContext to push users list ──────────
export const AuthUserSyncContext = createContext<
  ((users: AppUser[]) => void) | null
>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthUserSync() {
  return useContext(AuthUserSyncContext);
}
