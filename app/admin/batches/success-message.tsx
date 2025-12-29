"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function SuccessMessage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success) {
      setMessage(success);
      // Remove success param from URL after showing message
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("success");
      router.replace(`/admin/batches?${newSearchParams.toString()}`, {
        scroll: false,
      });

      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!message) return null;

  return (
    <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
      <p className="text-sm font-medium text-green-800 dark:text-green-200">
        {message}
      </p>
    </div>
  );
}

