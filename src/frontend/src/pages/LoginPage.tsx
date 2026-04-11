import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  KeyRound,
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
        <h2 className="text-base font-semibold">Login Type Chunein</h2>
        <p className="text-xs text-muted-foreground">
          Apni role ke hisaab se login karein
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
              Mobile OTP se login karein
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
              Mobile number aur PIN se login karein
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

function OtpLoginFlow({ onBack }: { onBack: () => void }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<OtpStep>("mobile");

  const [mobile, setMobile] = useState("");
  const [shopName, setShopName] = useState("");
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
      setMobileError("10-digit mobile number daalein");
      return;
    }
    setIsSending(true);
    setMobileError("");
    await new Promise((r) => setTimeout(r, 400));
    const result = sendOtp(cleaned);
    if (!result.success) {
      setMobileError(result.error ?? "OTP bhejne mein error");
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
      setOtpError("6-digit OTP daalein");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    await new Promise((r) => setTimeout(r, 350));
    const result = verifyOtp(mobile.replace(/\D/g, ""), otp, shopName);
    if (!result.success) {
      setOtpError(result.error ?? "OTP verify karne mein error");
    } else {
      toast.success("Welcome! Owner login successful 🎉");
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
                  aria-label="Wapas jao"
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
                Mobile number daalein — OTP bheja jaayega
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
                    Dukaan Ka Naam{" "}
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
                    Pehli baar login pe dukaan banayi jaayegi
                  </p>
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
                      OTP bhej raha hoon...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      OTP Bhejo
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
                      Aapka data sirf aapke mobile number se linked rahega.
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
                  aria-label="Wapas jao"
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
              <h2 className="text-base font-semibold">OTP Verify Karein</h2>
              <p className="text-xs text-muted-foreground">
                6-digit OTP daalein
              </p>
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
                      Verify ho raha hai...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Login Karein
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
                      : "OTP Dobara Bhejo"}
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

function PinLoginFlow({ onBack }: { onBack: () => void }) {
  const { loginWithPin } = useAuth();
  const [step, setStep] = useState<PinStep>("mobile");

  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");

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
      setMobileError("10-digit mobile number daalein");
      return;
    }
    setMobileError("");
    setPins(["", "", "", "", "", ""]);
    setPinError("");
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
      setPinError("6-digit PIN daalein");
      return;
    }
    setIsLogging(true);
    setPinError("");
    await new Promise((r) => setTimeout(r, 350));
    const result = loginWithPin(mobile.replace(/\D/g, ""), pin);
    if (!result.success) {
      const msg = result.error ?? "Mobile ya PIN galat hai";
      // Map specific error cases
      if (
        msg.toLowerCase().includes("inactive") ||
        msg.toLowerCase().includes("active")
      ) {
        setPinError("Yeh account inactive hai. Owner se contact karein.");
      } else if (
        msg.toLowerCase().includes("deleted") ||
        msg.toLowerCase().includes("nahi mila")
      ) {
        setPinError("Account nahi mila.");
      } else {
        setPinError("Mobile ya PIN galat hai");
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
                  aria-label="Wapas jao"
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
                Apna registered mobile number daalein
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
                    PIN Daalein
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
                  aria-label="Wapas jao"
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
              <h2 className="text-base font-semibold">PIN Daalein</h2>
              <p className="text-xs text-muted-foreground">
                Apna 6-digit PIN enter karein
              </p>
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
                      Login ho raha hai...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Login Karein
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  PIN bhool gaye?{" "}
                  <span className="font-medium text-foreground">
                    Store owner se contact karein.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-7"
        >
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/assets/diamond-logo.jpg"
              alt="DIAMOND Logo"
              style={{
                height: "80px",
                width: "auto",
                borderRadius: "12px",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Save Shop System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Apni role chunein aur login karein
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
              <OtpLoginFlow onBack={() => setMode("select")} />
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
          &copy; {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
