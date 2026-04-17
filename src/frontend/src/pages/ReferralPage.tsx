import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Gem,
  Gift,
  Link,
  Share2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

// ─── Step card for "How It Works" ───────────────────────────────────────────
interface HowItWorksStep {
  step: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: 1,
    icon: <Share2 size={16} className="text-primary" />,
    title: "Share Your Code",
    desc: "Send your unique referral code to a friend via WhatsApp, link, or any channel.",
  },
  {
    step: 2,
    icon: (
      <UserPlus size={16} className="text-purple-600 dark:text-purple-400" />
    ),
    title: "Friend Signs Up",
    desc: "Your friend creates an account and enters your referral code during sign-up.",
  },
  {
    step: 3,
    icon: <Gem size={16} className="text-amber-500" />,
    title: "Both Earn 10 💎",
    desc: "After their first successful transaction, you both automatically receive 10 diamonds.",
  },
];

export function ReferralPage() {
  const {
    getOrCreateReferralCode,
    referralCodes,
    referralSignups,
    diamondRewards,
  } = useStore();
  const { currentUser } = useAuth();

  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const userId = currentUser?.id ?? "";

  // ── Ensure user always has a referral code on mount ──────────────────────
  useEffect(() => {
    getOrCreateReferralCode();
  }, [getOrCreateReferralCode]);

  const referralCode =
    referralCodes.find((rc) => rc.userId === userId) ??
    getOrCreateReferralCode();

  const referralLink = `${window.location.origin}?ref=${referralCode.code}`;

  // ── Copy handlers ─────────────────────────────────────────────────────────
  function handleCopyCode() {
    navigator.clipboard.writeText(referralCode.code).then(() => {
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setLinkCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  function handleWhatsApp() {
    const msg = `Join FIFO Bridge with my referral code ${referralCode.code} and earn 10 💎 diamonds as a welcome bonus! Download at: https://shopopretingsystem.com`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener",
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const mySignups = referralSignups.filter((s) => s.referrerUserId === userId);

  const referralDiamonds = diamondRewards
    .filter((r) => r.userId === userId && r.rewardType === "referral")
    .reduce((sum, r) => sum + r.diamondCount, 0);

  // ── Mobile masking: show name + last 4 digits ─────────────────────────────
  function maskMobile(mobile: string): string {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 4) return "••••";
    return `••••${digits.slice(-4)}`;
  }

  return (
    <div
      className="flex flex-col gap-4 px-3 pt-4 pb-28 max-w-2xl mx-auto w-full page-fade-in"
      data-ocid="referral.page"
    >
      {/* ── Hero: referral code card ─────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #2563EB 100%)",
        }}
        data-ocid="referral.hero.section"
      >
        {/* decorative circles */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
          style={{ background: "white" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-5"
          style={{
            background: "white",
            transform: "translateX(-50%) translateY(50%)",
          }}
          aria-hidden="true"
        />

        <div className="relative px-4 pt-5 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={18} className="text-white/90" />
            <span className="text-sm font-bold text-white/90 uppercase tracking-wide">
              Refer &amp; Earn
            </span>
          </div>
          <p className="text-white text-lg font-extrabold leading-snug mb-1">
            Invite friends, earn diamonds!
          </p>
          <p className="text-white/75 text-xs mb-4 leading-relaxed">
            Share your code. When a friend signs up and completes their first
            transaction, you both receive{" "}
            <strong className="text-white">10 💎 diamonds</strong>.
          </p>

          {/* Code display */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <span className="text-white font-mono font-bold text-xl tracking-[0.2em]">
                {referralCode.code}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyCode}
              data-ocid="referral.copy_code.button"
              className="gap-1.5 h-9 rounded-xl font-semibold tap-scale"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="referral.stats.section"
      >
        <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-1 card-interactive">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-1">
            <UserPlus
              size={16}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Successful Signups
          </span>
          <span className="text-2xl font-extrabold text-foreground">
            {referralCode.successfulSignups}
          </span>
          <span className="text-[10px] text-muted-foreground">
            friends joined
          </span>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-1 card-interactive">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-1">
            <Gem size={16} className="text-amber-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Diamonds Earned
          </span>
          <span className="text-2xl font-extrabold text-foreground">
            {referralDiamonds} 💎
          </span>
          <span className="text-[10px] text-muted-foreground">
            from referrals
          </span>
        </div>
      </div>

      {/* ── Share section ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-3"
        data-ocid="referral.share.section"
      >
        <div className="flex items-center gap-2">
          <Share2 size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Share Your Code
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleWhatsApp}
            data-ocid="referral.share_whatsapp.button"
            className="w-full justify-start gap-2.5 h-10 rounded-xl font-semibold tap-scale"
            style={{ background: "#25D366" }}
          >
            <Share2 size={15} />
            Share via WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            data-ocid="referral.copy_link.button"
            className="w-full justify-start gap-2.5 h-10 rounded-xl font-semibold tap-scale"
          >
            <Link size={15} />
            {linkCopied ? "Link Copied!" : "Copy Referral Link"}
          </Button>
        </div>
        {/* Hint for new users */}
        <div className="flex items-start gap-2 bg-accent/50 rounded-xl px-3 py-2.5">
          <ShieldCheck
            size={13}
            className="text-primary flex-shrink-0 mt-0.5"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">New users</strong> can enter
            your referral code during sign-up to claim their 10 💎 welcome
            bonus.
          </p>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl bg-muted/40 border border-border p-4"
        data-ocid="referral.how_it_works.section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Gift size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            How It Works
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className="flex-1 flex flex-row sm:flex-col gap-3 items-start"
            >
              {/* step number + connector */}
              <div className="flex flex-col sm:flex-row items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-extrabold text-primary">
                    {step.step}
                  </span>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight
                    size={12}
                    className="text-muted-foreground hidden sm:block"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {step.icon}
                  <span className="text-xs font-bold text-foreground">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Fraud prevention note */}
        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3">
          <ShieldCheck
            size={12}
            className="text-muted-foreground flex-shrink-0 mt-0.5"
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Same device cannot use multiple referral codes. Reward is given only
            after the first successful transaction. Duplicate signups are not
            rewarded.
          </p>
        </div>
      </div>

      {/* ── Referral History ─────────────────────────────────────────────── */}
      <div data-ocid="referral.history.section">
        <div className="flex items-center justify-between px-0.5 mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-muted-foreground" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Referral History
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {mySignups.length}
          </span>
        </div>

        {mySignups.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <div
            data-ocid="referral.history.empty_state"
            className="flex flex-col items-center gap-4 py-10 px-6 text-center rounded-2xl bg-card border border-border shadow-card"
          >
            <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <Gift size={26} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1">
                No referrals yet
              </p>
              <p className="text-xs text-muted-foreground">
                Share your code and start earning diamonds!
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                onClick={handleWhatsApp}
                className="w-full gap-2 rounded-xl font-semibold tap-scale"
                style={{ background: "#25D366" }}
                data-ocid="referral.empty_whatsapp.button"
              >
                <Share2 size={14} />
                Share via WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="w-full gap-2 rounded-xl font-semibold tap-scale"
                data-ocid="referral.empty_copy.button"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>
        ) : (
          /* ── History list ──────────────────────────────────────────────── */
          <div className="flex flex-col gap-2">
            {mySignups.map((signup) => (
              <div
                key={signup.id}
                data-ocid={`referral.history.item.${signup.id}`}
                className="rounded-2xl bg-card border border-border shadow-card p-3.5 flex items-center gap-3 card-interactive"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-extrabold text-primary">
                    {signup.newUserName.slice(0, 1).toUpperCase()}
                  </span>
                </div>

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {signup.newUserName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {maskMobile(signup.newUserMobile)}
                    </span>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(signup.signupAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Status + reward badges */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {signup.rewardAwardedToReferrer ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                      <Gem size={9} /> +10 💎
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                      Pending
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-medium ${
                      signup.firstTransactionCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {signup.firstTransactionCompleted
                      ? "✓ Tx complete"
                      : "Awaiting tx"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
