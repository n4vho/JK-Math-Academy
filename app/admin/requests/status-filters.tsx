"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type StatusFiltersProps = {
  initialStatus: string;
};

export function StatusFilters({ initialStatus }: StatusFiltersProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    const queryString = params.toString();
    router.push(`/admin/requests${queryString ? `?${queryString}` : ""}`);
  }, [status, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const clearFilters = () => {
    setStatus("");
    router.push("/admin/requests");
  };

  const hasActiveFilters = status;

  return (
    <div className="mb-4">
      <div className="flex gap-2 items-center">
        <select
          value={status}
          onChange={handleStatusChange}
          className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
