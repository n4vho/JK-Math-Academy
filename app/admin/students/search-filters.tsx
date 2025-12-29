"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Batch = {
  id: string;
  name: string;
};

type SearchFiltersProps = {
  initialQuery: string;
  initialStatus: string;
  initialBatch: string;
  batches: Batch[];
};

export function SearchFilters({
  initialQuery,
  initialStatus,
  initialBatch,
  batches,
}: SearchFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [batch, setBatch] = useState(initialBatch);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (status) {
      params.set("status", status);
    }
    if (batch) {
      params.set("batch", batch);
    }
    
    // Reset to page 1 when filters change
    params.delete("page");

    const queryString = params.toString();
    router.push(`/admin/students${queryString ? `?${queryString}` : ""}`);
  }, [query, status, batch, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300);

    return () => clearTimeout(timer);
  }, [updateURL]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBatch(e.target.value);
  };

  const clearFilters = () => {
    setQuery("");
    setStatus("");
    setBatch("");
    router.push("/admin/students");
  };

  const hasActiveFilters = query.trim() || status || batch;

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name, registration number, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={handleStatusChange}
            className="flex h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="GRADUATED">GRADUATED</option>
            <option value="DROPPED">DROPPED</option>
          </select>
          {batches.length > 0 && (
            <select
              value={batch}
              onChange={handleBatchChange}
              className="flex h-9 w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
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
    </div>
  );
}

