import { type ReactNode } from "react";
import { toast } from "sonner";
import { soundManager } from "@/services/sound";
import { SystemToast } from "@/components/ui/notifications/SystemToast";

type NotificationType = "success" | "warning" | "error";

export const notify = {
  system: (
    type: NotificationType,
    source: string,
    message: ReactNode,
    subtitle?: string,
    appId?: string,
    onOpenApp?: (appId: string) => void
  ) => {
    // Play sound
    soundManager.play(type);

    // Show toast
    toast.custom(
      () => (
        <SystemToast
          type={type}
          source={source}
          message={message}
          subtitle={subtitle}
          appId={appId}
          onOpenApp={onOpenApp}
        />
      ),
      {
        position: "bottom-right",
        duration: 4000,
      }
    );
  },
  app: (
    appId: string,
    owner: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) => {
    const detail = { appId, owner, title, message, data };
    window.dispatchEvent(
      new CustomEvent("aurora-app-notification", { detail })
    );
  },
};
