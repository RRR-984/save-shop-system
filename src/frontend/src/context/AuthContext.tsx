import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppUser, MobileSession, Shop, UserRole } from "../types/store";

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
  ) => { success: boolean; error?: string };

  // PIN flow (Manager / Staff login via mobile + PIN)
  loginWithPin: (
    mobile: string,
    pin: string,
  ) => { success: boolean; error?: string };

  logout: () => void;

  // Derived
  currentShop: Shop | null;
  currentUser: CurrentUser | null;

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

  // Ref to latest users list — injected by StoreContext after it loads
  // This is set via a special setter exposed by useAuth()
  const usersRef = useRef<AppUser[]>([]);

  // Called by StoreContext once users are loaded from backend, so AuthContext
  // can resolve the correct role for the current session.
  // We also persist users to localStorage so loginWithPin can read them
  // at login time, before StoreContext mounts.
  const syncUsers = useCallback((users: AppUser[]) => {
    usersRef.current = users;
    try {
      localStorage.setItem("auth_users_cache", JSON.stringify(users));
    } catch {}
  }, []);

  // Build CurrentUser from a MobileSession + users list
  const buildCurrentUser = useCallback(
    (sess: MobileSession, users: AppUser[]): CurrentUser => {
      const shopId = sess.shopId;
      const mobile = sess.mobile;

      // If userId is stored in session, look up by id first
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

      // Fallback: look up by mobile
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

      // No AppUser record yet (first-time owner login) — treat as owner
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

  useEffect(() => {
    // Restore saved session
    const saved = lsGet<MobileSession>("mobile_auth_session");
    if (saved?.mobile && saved?.shopId) {
      setSession(saved);
      // Build user from what's in session (full resolution happens after StoreContext loads users)
      const userId = saved.userId ?? `user_${saved.mobile}`;
      setCurrentUser({
        id: userId,
        name: saved.shopName || saved.mobile,
        role: saved.userRole ?? "owner",
        mobile: saved.mobile,
        isOwner: (saved.userRole ?? "owner") === "owner",
      });
    }
    setIsInitializing(false);
  }, []);

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

  // Send OTP — generates and stores OTP for 10 minutes (Owner login)
  const sendOtp = useCallback(
    (mobile: string): { success: boolean; error?: string; otp?: string } => {
      const cleaned = mobile.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        return {
          success: false,
          error: "Valid 10-digit mobile number daalein",
        };
      }
      const otp = generateOtp();
      const pending: PendingOtp = {
        mobile: cleaned,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
      };
      setPendingOtp(pending);
      // Store in localStorage so page refresh doesn't break OTP (dev convenience)
      lsSet("pending_otp", pending);
      console.log(`[Auth] OTP for ${cleaned}: ${otp}`);
      return { success: true, otp };
    },
    [],
  );

  // Verify OTP and create/restore session (Owner login flow)
  const verifyOtp = useCallback(
    (
      mobile: string,
      enteredOtp: string,
      shopName: string,
    ): { success: boolean; error?: string } => {
      const cleaned = mobile.replace(/\D/g, "");

      // Get pending OTP (from state or localStorage fallback)
      let pending = pendingOtp;
      if (!pending) {
        pending = lsGet<PendingOtp>("pending_otp");
      }

      if (!pending || pending.mobile !== cleaned) {
        return { success: false, error: "Pehle OTP bhejein" };
      }
      if (Date.now() > pending.expiresAt) {
        setPendingOtp(null);
        localStorage.removeItem("pending_otp");
        return { success: false, error: "OTP expire ho gaya, dobara bhejein" };
      }
      if (pending.otp !== enteredOtp.trim()) {
        return { success: false, error: "OTP galat hai" };
      }

      // OTP verified — create session
      const shopId = `shop_${cleaned}`;

      // Auto-create shop record if first time
      const existingShops = lsGet<Shop[]>("store_shops") ?? [];
      const shopExists = existingShops.find((s) => s.id === shopId);
      if (!shopExists) {
        const newShop: Shop = {
          id: shopId,
          name: shopName.trim() || `Shop ${cleaned}`,
          createdAt: new Date().toISOString(),
          mobile: cleaned,
        };
        lsSet("store_shops", [...existingShops, newShop]);
      }

      const shopRecord =
        shopExists ??
        lsGet<Shop[]>("store_shops")?.find((s) => s.id === shopId);
      const resolvedShopName =
        shopRecord?.name ?? (shopName.trim() || `Shop ${cleaned}`);

      // Determine role from existing users list
      const existingUsers = usersRef.current.filter(
        (u) => u.shopId === shopId && !u.deleted,
      );
      const matchedUser = existingUsers.find(
        (u) => u.mobile?.replace(/\D/g, "") === cleaned,
      );

      // If no users exist yet → this is the first owner login
      const userId = matchedUser?.id ?? `user_${cleaned}`;
      const userRole: UserRole = matchedUser?.role ?? "owner";

      const newSession: MobileSession = {
        mobile: cleaned,
        shopId,
        shopName: resolvedShopName,
        loginAt: new Date().toISOString(),
        userId,
        userRole,
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

      return { success: true };
    },
    [pendingOtp],
  );

  // PIN login — Manager / Staff login via mobile + PIN
  const loginWithPin = useCallback(
    (mobile: string, pin: string): { success: boolean; error?: string } => {
      const cleaned = mobile.replace(/\D/g, "");
      if (!cleaned || cleaned.length < 10) {
        return { success: false, error: "Valid mobile number daalein" };
      }
      if (!pin || pin.trim().length === 0) {
        return { success: false, error: "PIN daalein" };
      }

      // Look for shop based on mobile prefix pattern.
      // StoreContext mounts only after login, so usersRef.current is empty at
      // login time — fall back to the localStorage cache written by syncUsers.
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
        return { success: false, error: "Mobile ya PIN galat hai" };
      }

      // Owner PIN login: only owner can use PIN login for overrides
      // (Owners also use OTP, but PIN login is valid for manager/staff)
      const shopId = matched.shopId;

      // Get shop name
      const allShops = lsGet<Shop[]>("store_shops") ?? [];
      const shop = allShops.find((s) => s.id === shopId);
      const resolvedShopName = shop?.name ?? `Shop ${cleaned}`;

      const newSession: MobileSession = {
        mobile: cleaned,
        shopId,
        shopName: resolvedShopName,
        loginAt: new Date().toISOString(),
        userId: matched.id,
        userRole: matched.role,
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
    setPendingOtp(null);
    localStorage.removeItem("mobile_auth_session");
    localStorage.removeItem("pending_otp");
  }, []);

  // Derived values for compatibility
  const currentShop: Shop | null = session
    ? {
        id: session.shopId,
        name: session.shopName,
        createdAt: session.loginAt,
        mobile: session.mobile,
      }
    : null;

  // Legacy compat stubs (used by AdminPage, keep them functional)
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
      if (!session) return { success: false, error: "Login karein pehle" };
      const allShops = lsGet<Shop[]>("store_shops") ?? [];
      const updated = allShops.map((s) =>
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
