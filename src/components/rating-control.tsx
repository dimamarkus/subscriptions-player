"use client";

import { cn } from "@/lib/utils";

export type RatingControlOption<TValue extends number = number> = {
  value: TValue;
  label: string;
  shortLabel?: string;
};

type RatingControlProps<TValue extends number> = {
  value: TValue | null;
  options: readonly RatingControlOption<TValue>[];
  onChange: (value: TValue | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  clearLabel?: string;
  className?: string;
};

export function RatingControl<TValue extends number>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  clearLabel = "Clear rating",
  className,
}: RatingControlProps<TValue>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              aria-label={option.label}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-w-8 rounded-full border px-2 py-1 text-xs font-medium transition disabled:cursor-wait disabled:opacity-60",
                isActive
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-100",
              )}
            >
              {option.shortLabel ?? option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled || value === null}
        onClick={() => onChange(null)}
        className="rounded-full border border-white/10 px-2 py-1 text-xs font-medium text-zinc-500 transition hover:border-white/25 hover:text-zinc-200 disabled:cursor-default disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-zinc-500"
      >
        {clearLabel}
      </button>
    </div>
  );
}
