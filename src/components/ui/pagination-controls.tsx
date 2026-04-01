"use client";

import { cn } from "@/lib/utils/cn";

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
  className?: string;
}

export function PaginationControls({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  itemLabel,
  className,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-white/8 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
          Pagination
        </p>
        <p className="text-sm text-text-secondary">
          Showing {rangeStart}-{rangeEnd} of {totalItems} {itemLabel}
          {totalItems === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NavButton
          disabled={!hasPreviousPage(currentPage)}
          label="Previous"
          onClick={() => onPageChange(currentPage - 1)}
        />

        <div className="flex flex-wrap items-center gap-2">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-sm text-text-secondary"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                  page === currentPage
                    ? "border-primary/35 bg-primary text-background"
                    : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary",
                )}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <NavButton
          disabled={!hasNextPage(currentPage, totalPages)}
          label="Next"
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
}

function NavButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
        disabled
          ? "border-white/10 bg-white/[0.03] text-text-secondary/45"
          : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}

function hasPreviousPage(currentPage: number): boolean {
  return currentPage > 1;
}

function hasNextPage(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

function buildVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}
