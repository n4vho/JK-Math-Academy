"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/student/logout", {
        method: "POST",
      });
      router.push("/student/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even on error
      router.push("/student/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
