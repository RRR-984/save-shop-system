/**
 * SessionExpiredToast — modal shown when idle session expires.
 * Blocks interaction. Redirects to login on dismiss.
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LogIn, Timer } from "lucide-react";

interface SessionExpiredToastProps {
  open: boolean;
  onLogin: () => void;
}

export function SessionExpiredToast({
  open,
  onLogin,
}: SessionExpiredToastProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        data-ocid="session_expired.dialog"
        className="max-w-sm text-center"
        // Disable close via Escape or overlay click — force explicit action
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Timer size={28} className="text-amber-600 dark:text-amber-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">
              Session Expired
            </h2>
            <p className="text-sm text-muted-foreground">
              Your session has expired. Please log in again to continue.
            </p>
          </div>

          <Button
            data-ocid="session_expired.login_button"
            className="w-full gap-2"
            onClick={onLogin}
          >
            <LogIn size={16} />
            Log In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
