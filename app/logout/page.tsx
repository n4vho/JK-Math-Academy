// DEV ONLY: Simple logout page
// This will be replaced with proper authentication later
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await fetch("/api/logout", {
          method: "POST",
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        router.push("/login");
        router.refresh();
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Logging out...</p>
    </div>
  );
}

