import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Gift,
  KeyRound,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginMode = "select" | "otp" | "pin";
type OtpStep = "mobile" | "otp";
type PinStep = "mobile" | "pin";

// ─── ModeSelect card ──────────────────────────────────────────────────────────

function ModeSelect({
  onSelect,
}: {
  onSelect: (mode: "otp" | "pin") => void;
}) {
  return (
    <Card className="shadow-xl border-border/60">
      <CardHeader className="pb-2 pt-5 px-5">
        <h2 className="text-base font-semibold">Select Login Type</h2>
        <p className="text-xs text-muted-foreground">
          Choose your role and login
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        <button
          type="button"
          data-ocid="login.mode.owner"
          onClick={() => onSelect("otp")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Owner / New Shop Login
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Login with mobile OTP
            </p>
          </div>
          <span className="badge-owner ml-auto flex-shrink-0">Owner</span>
        </button>

        <button
          type="button"
          data-ocid="login.mode.staff"
          onClick={() => onSelect("pin")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border/60 hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Staff / Manager Login
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Login with mobile number and PIN
            </p>
          </div>
          <div className="flex flex-col gap-1 ml-auto flex-shrink-0 items-end">
            <span className="badge-manager">Manager</span>
            <span className="badge-staff">Staff</span>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

// ─── OTP Login flow ───────────────────────────────────────────────────────────

function OtpLoginFlow({
  onBack,
  initialReferralCode,
}: {
  onBack: () => void;
  initialReferralCode?: string;
}) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<OtpStep>("mobile");

  const [mobile, setMobile] = useState("");
  const [shopName, setShopName] = useState("");
  const [referralCode, setReferralCode] = useState(
    initialReferralCode?.trim().toUpperCase() ?? "",
  );
  const [referralError, setReferralError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setResendCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setMobileError("Enter your 10-digit mobile number");
      return;
    }
    // Validate referral code format if entered (basic client-side check only)
    if (referralCode.trim() && referralCode.trim().length < 4) {
      setReferralError("Invalid referral code");
      return;
    }
    setIsSending(true);
    setMobileError("");
    setReferralError("");
    await new Promise((r) => setTimeout(r, 400));
    const result = sendOtp(cleaned);
    if (!result.success) {
      setMobileError(result.error ?? "Error sending OTP");
      setIsSending(false);
      return;
    }
    setOtpHint(result.otp ?? "");
    setOtp("");
    setOtpError("");
    setStep("otp");
    startCooldown();
    setIsSending(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setOtpError("Enter your 6-digit OTP");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    await new Promise((r) => setTimeout(r, 350));
    const result = verifyOtp(mobile.replace(/\D/g, ""), otp, shopName);
    if (!result.success) {
      setOtpError(result.error ?? "Error verifying OTP");
    } else {
      toast.success("Welcome! Owner login successful 🎉");
      // Store referral code in localStorage so StoreProvider can process it
      // after mounting (post-login). This avoids calling useStore() from
      // outside StoreProvider.
      const code = referralCode.trim().toUpperCase();
      if (code) {
        const cleanMobile = mobile.replace(/\D/g, "");
        try {
          localStorage.setItem(
            "pending_referral",
            JSON.stringify({
              code,
              newUserId: `user_${cleanMobile}`,
              shopName: shopName || `User ${cleanMobile.slice(-4)}`,
              mobile: cleanMobile,
            }),
          );
        } catch {
          /* ignore storage errors */
        }
      }
    }
    setIsVerifying(false);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const cleaned = mobile.replace(/\D/g, "");
    const result = sendOtp(cleaned);
    if (result.success) {
      setOtpHint(result.otp ?? "");
      setOtpError("");
      setOtp("");
      startCooldown();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "mobile" && (
        <motion.div
          key="otp-mobile"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={15} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone size={14} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">
                    Owner / New Shop Login
                  </h2>
                </div>
                <span className="badge-owner ml-auto">Owner</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter mobile number — OTP will be sent
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="owner-mobile" className="text-sm font-medium">
                    Mobile Number *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      +91
                    </span>
                    <Input
                      id="owner-mobile"
                      data-ocid="login.owner_mobile.input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        );
                        setMobileError("");
                      }}
                      maxLength={10}
                      autoFocus
                      className="h-11 pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shop-name" className="text-sm font-medium">
                    Shop Name{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="shop-name"
                    data-ocid="login.shop_name.input"
                    type="text"
                    placeholder="e.g. Sharma General Store"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your shop will be created on first login
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="referral-code"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Gift size={13} className="text-amber-500" />
                    Referral Code{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="referral-code"
                    data-ocid="login.referral_code.input"
                    type="text"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(
                        e.target.value.toUpperCase().replace(/\s/g, ""),
                      );
                      setReferralError("");
                    }}
                    className="h-11 font-mono tracking-wider"
                  />
                  {referralCode && !referralError && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Gift size={11} /> Referral code detected — earn 10 💎
                      after your first transaction
                    </p>
                  )}
                  {referralError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
                      {referralError}
                    </p>
                  )}
                </div>

                {mobileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg"
                    data-ocid="login.owner_mobile.error_state"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {mobileError}
                  </motion.div>
                )}

                <Button
                  data-ocid="login.send_otp.button"
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isSending || mobile.length !== 10}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      Send OTP
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-accent/60 rounded-lg border border-border">
                <div className="flex items-start gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-foreground font-medium mb-0.5">
                      Data Privacy
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your data is securely linked to your mobile number.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === "otp" && (
        <motion.div
          key="otp-verify"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  data-ocid="login.otp.back.button"
                  onClick={() => {
                    setStep("mobile");
                    setOtpError("");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={15} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold">+91 {mobile}</span>
                </div>
              </div>
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-muted-foreground">Enter 6-digit OTP</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {otpHint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-warning-light rounded-lg border border-border"
                >
                  <p className="text-xs text-warning font-medium mb-1">
                    Your OTP (Demo Mode)
                  </p>
                  <p className="text-2xl font-mono font-bold text-warning tracking-[0.3em]">
                    {otpHint}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real SMS not available in app mode — copy this OTP
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    OTP Code
                  </Label>
                  <Input
                    id="otp"
                    data-ocid="login.otp.input"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setOtpError("");
                    }}
                    maxLength={6}
                    autoFocus
                    className="h-11 text-center tracking-[0.4em] text-lg font-mono"
                  />
                </div>

                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg"
                    data-ocid="login.otp.error_state"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {otpError}
                  </motion.div>
                )}

                <Button
                  data-ocid="login.verify_otp.button"
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Verify & Login
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    data-ocid="login.resend_otp.button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="flex items-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} />
                    {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "Resend OTP"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── PIN Login flow ───────────────────────────────────────────────────────────

// Minimal shape we need from the stored shop record
interface StoredShop {
  id: string;
  name?: string;
  address?: string;
  city?: string;
}

/** Look up shop info for the given mobile from localStorage store_shops + auth_users_cache */
function resolveShopForMobile(
  mobile: string,
): { name?: string; address?: string; city?: string } | null {
  try {
    const users: Array<{
      mobile?: string;
      shopId?: string;
      active?: boolean;
      deleted?: boolean;
    }> = JSON.parse(localStorage.getItem("auth_users_cache") ?? "[]");
    const cleaned = mobile.replace(/\D/g, "");
    const matched = users.find(
      (u) =>
        u.mobile?.replace(/\D/g, "") === cleaned &&
        u.active !== false &&
        !u.deleted,
    );
    if (!matched?.shopId) return null;
    const shops: StoredShop[] = JSON.parse(
      localStorage.getItem("store_shops") ?? "[]",
    );
    const shop = shops.find((s) => s.id === matched.shopId);
    if (!shop) return null;
    return { name: shop.name, address: shop.address, city: shop.city };
  } catch {
    return null;
  }
}

function PinLoginFlow({ onBack }: { onBack: () => void }) {
  const { loginWithPin } = useAuth();
  const [step, setStep] = useState<PinStep>("mobile");

  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [shopInfo, setShopInfo] = useState<{
    name?: string;
    address?: string;
    city?: string;
  } | null>(null);

  // PIN state: array of 6 chars
  const [pins, setPins] = useState<string[]>(["", "", "", "", "", ""]);
  const PIN_KEYS = ["p0", "p1", "p2", "p3", "p4", "p5"] as const;
  const [pinError, setPinError] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus first pin box when entering PIN step
  useEffect(() => {
    if (step === "pin") {
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setMobileError("Enter your 10-digit mobile number");
      return;
    }
    setMobileError("");
    setPins(["", "", "", "", "", ""]);
    setPinError("");
    setShopInfo(resolveShopForMobile(cleaned));
    setStep("pin");
  };

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...pins];
    updated[index] = digit;
    setPins(updated);
    setPinError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (pins[index]) {
        const updated = [...pins];
        updated[index] = "";
        setPins(updated);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const updated = [...pins];
        updated[index - 1] = "";
        setPins(updated);
      }
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pins.join("");
    if (pin.length !== 6) {
      setPinError("Enter your 6-digit PIN");
      return;
    }
    setIsLogging(true);
    setPinError("");
    await new Promise((r) => setTimeout(r, 350));
    const result = loginWithPin(mobile.replace(/\D/g, ""), pin);
    if (!result.success) {
      const msg = result.error ?? "Mobile number or PIN is incorrect";
      // Map specific error cases
      if (
        msg.toLowerCase().includes("inactive") ||
        msg.toLowerCase().includes("active")
      ) {
        setPinError("This account is inactive. Please contact the owner.");
      } else if (
        msg.toLowerCase().includes("deleted") ||
        msg.toLowerCase().includes("nahi mila") ||
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("no account") ||
        msg.toLowerCase().includes("account not found")
      ) {
        setPinError("Account not found.");
      } else {
        setPinError("Mobile number or PIN is incorrect");
      }
      setPins(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } else {
      toast.success("Login successful! 🎉");
    }
    setIsLogging(false);
  };

  const pinFilled = pins.every((p) => p !== "");

  return (
    <AnimatePresence mode="wait">
      {step === "mobile" && (
        <motion.div
          key="pin-mobile"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={15} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users size={14} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">
                    Staff / Manager Login
                  </h2>
                </div>
                <div className="flex gap-1 ml-auto">
                  <span className="badge-manager">Manager</span>
                  <span className="badge-staff">Staff</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your registered mobile number
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <form onSubmit={handleMobileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-mobile" className="text-sm font-medium">
                    Mobile Number *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      +91
                    </span>
                    <Input
                      id="staff-mobile"
                      data-ocid="login.staff_mobile.input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        );
                        setMobileError("");
                      }}
                      maxLength={10}
                      autoFocus
                      className="h-11 pl-12"
                    />
                  </div>
                  {mobileError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-destructive text-xs flex items-center gap-1"
                      data-ocid="login.staff_mobile.error_state"
                    >
                      <span className="w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
                      {mobileError}
                    </motion.p>
                  )}
                </div>

                <Button
                  data-ocid="login.staff_mobile.next.button"
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={mobile.length !== 10}
                >
                  <span className="flex items-center gap-2">
                    <KeyRound size={16} />
                    Enter PIN
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === "pin" && (
        <motion.div
          key="pin-entry"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  data-ocid="login.pin.back.button"
                  onClick={() => {
                    setStep("mobile");
                    setPinError("");
                    setPins(["", "", "", "", "", ""]);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={15} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold">+91 {mobile}</span>
                </div>
              </div>
              <h2 className="text-base font-semibold">Enter PIN</h2>
              <p className="text-xs text-muted-foreground">
                Enter your 6-digit PIN
              </p>
              {shopInfo?.name && (
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {shopInfo.name}
                  </p>
                  {(shopInfo.address || shopInfo.city) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin
                        size={11}
                        className="flex-shrink-0 text-muted-foreground/70"
                      />
                      <span className="truncate">
                        {[shopInfo.address, shopInfo.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <form onSubmit={handlePinSubmit} className="space-y-5">
                {/* PIN boxes */}
                <div
                  className="flex justify-center gap-2.5"
                  data-ocid="login.pin.input_group"
                >
                  {pins.map((digit, i) => (
                    <input
                      key={PIN_KEYS[i]}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className="pin-input"
                      aria-label={`PIN digit ${i + 1}`}
                      data-ocid={`login.pin.digit_${i + 1}`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {pinError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm px-3 py-2.5 rounded-lg"
                    data-ocid="login.pin.error_state"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {pinError}
                  </motion.div>
                )}

                <Button
                  data-ocid="login.pin.submit.button"
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isLogging || !pinFilled}
                >
                  {isLogging ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Login
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Forgot PIN?{" "}
                  <span className="font-medium text-foreground">
                    Please contact the store owner.
                  </span>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("select");
  const [detectedRefCode, setDetectedRefCode] = useState<string>("");

  // Detect ?ref=CODE in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const code = ref.trim().toUpperCase();
      setDetectedRefCode(code);
      // Auto-navigate to OTP flow when referral code is present
      setMode("otp");
      toast.info(`Referral code detected: ${code} — Sign up to earn 10 💎`, {
        duration: 5000,
      });
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(160deg, #ffffff 0%, #f0f4ff 55%, #ede9fe 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center mb-7"
        >
          {/* SVG animated diamond logo */}
          <div className="inline-flex items-center justify-center mb-3">
            <svg
              width="72"
              height="72"
              viewBox="0 0 96 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="FIFO Bridge Logo"
              style={{
                filter: "drop-shadow(0 6px 18px rgba(99,102,241,0.30))",
              }}
            >
              <title>FIFO Bridge Logo</title>
              <defs>
                <linearGradient
                  id="login-gem-main"
                  x1="0"
                  y1="0"
                  x2="96"
                  y2="96"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient
                  id="login-gem-top"
                  x1="48"
                  y1="8"
                  x2="48"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient
                  id="login-gem-left"
                  x1="8"
                  y1="36"
                  x2="48"
                  y2="88"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient
                  id="login-gem-right"
                  x1="88"
                  y1="36"
                  x2="48"
                  y2="88"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.9" />
                </linearGradient>
                <radialGradient id="login-sparkle" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Gem facets */}
              <polygon
                points="48,8 88,36 48,88 8,36"
                fill="url(#login-gem-main)"
              />
              <polygon
                points="48,8 88,36 48,40 8,36"
                fill="url(#login-gem-top)"
                opacity="0.9"
              />
              <polygon
                points="8,36 48,40 48,88"
                fill="url(#login-gem-left)"
                opacity="0.8"
              />
              <polygon
                points="88,36 48,40 48,88"
                fill="url(#login-gem-right)"
                opacity="0.8"
              />
              {/* Facet lines */}
              <line
                x1="8"
                y1="36"
                x2="88"
                y2="36"
                stroke="white"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
              <line
                x1="48"
                y1="8"
                x2="48"
                y2="88"
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity="0.25"
              />
              <line
                x1="48"
                y1="8"
                x2="8"
                y2="36"
                stroke="white"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />
              <line
                x1="48"
                y1="8"
                x2="88"
                y2="36"
                stroke="white"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />
              {/* Sparkle highlight */}
              <ellipse
                cx="34"
                cy="25"
                rx="7"
                ry="5"
                fill="url(#login-sparkle)"
                transform="rotate(-20, 34, 25)"
              />
              {/* FB text */}
              <text
                x="48"
                y="51"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="17"
                fontWeight="800"
                fill="white"
                opacity="0.92"
                letterSpacing="1"
              >
                FB
              </text>
            </svg>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Save Shop System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose your role and login
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ModeSelect onSelect={(m) => setMode(m)} />
            </motion.div>
          )}

          {mode === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <OtpLoginFlow
                onBack={() => setMode("select")}
                initialReferralCode={detectedRefCode}
              />
            </motion.div>
          )}

          {mode === "pin" && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PinLoginFlow onBack={() => setMode("select")} />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-5">
          &copy; {new Date().getFullYear()} Save Shop System | Powered by FIFO
          Bridge
        </p>
      </div>
    </div>
  );
}
