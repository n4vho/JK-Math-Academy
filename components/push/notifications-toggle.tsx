"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

type ToastState = {
  message: string;
  type?: "success" | "error";
} | null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function NotificationsToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);

    if (!supported) {
      return;
    }

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          setIsSubscribed(false);
          return;
        }
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Failed to check subscription:", error);
      }
    })();
  }, []);

  const enableNotifications = async () => {
    if (!isSupported) {
      setToast({ message: "Push notifications are not supported.", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setToast({ message: "Notification permission denied.", type: "error" });
        return;
      }

      const registration =
        (await navigator.serviceWorker.register("/sw.js")) ||
        (await navigator.serviceWorker.getRegistration());

      if (!registration) {
        setToast({ message: "Service worker registration failed.", type: "error" });
        return;
      }

      const keyResponse = await fetch("/api/push/public-key");
      const keyData = await keyResponse.json();
      if (!keyResponse.ok || !keyData?.publicKey) {
        setToast({ message: keyData?.error || "Missing VAPID public key.", type: "error" });
        return;
      }

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      const data = await response.json();
      if (!response.ok) {
        setToast({ message: data?.error || "Failed to save subscription.", type: "error" });
        return;
      }

      setIsSubscribed(true);
      setToast({ message: "Notifications enabled.", type: "success" });
    } catch (error) {
      console.error("Enable notifications error:", error);
      setToast({ message: "Failed to enable notifications.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        setToast({ message: "No active subscription.", type: "error" });
        return;
      }

      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setIsSubscribed(false);
      setToast({ message: "Notifications disabled.", type: "success" });
    } catch (error) {
      console.error("Disable notifications error:", error);
      setToast({ message: "Failed to disable notifications.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <p className="text-xs text-muted-foreground">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Notifications</p>
      <p className="text-xs text-muted-foreground">
        Enable browser notifications for new notices.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={enableNotifications}
          disabled={isLoading || isSubscribed}
        >
          Enable notifications
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={disableNotifications}
          disabled={isLoading || !isSubscribed}
        >
          Disable notifications
        </Button>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
