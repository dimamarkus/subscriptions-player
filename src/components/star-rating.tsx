"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  maxStars?: number;
  size?: number;
  className?: string;
};

const STAR_PATH =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

export function StarRating({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  maxStars = 5,
  size = 26,
  className,
}: StarRatingProps) {
  const [hoveredHalfSteps, setHoveredHalfSteps] = useState<number | null>(null);
  const displayHalfSteps = hoveredHalfSteps ?? value ?? 0;
  const isPreviewing = hoveredHalfSteps !== null;

  function commit(nextHalfSteps: number) {
    if (disabled) {
      return;
    }

    onChange(value === nextHalfSteps ? null : nextHalfSteps);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-0.5", className)}
      onPointerLeave={() => setHoveredHalfSteps(null)}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starIndex = index + 1;
        const leftHalfSteps = starIndex * 2 - 1;
        const rightHalfSteps = starIndex * 2;
        const starFill = Math.max(
          0,
          Math.min(2, displayHalfSteps - (starIndex - 1) * 2),
        );
        const fillPercent = (starFill / 2) * 100;
        const isStarHovered =
          hoveredHalfSteps !== null &&
          hoveredHalfSteps >= leftHalfSteps;
        const isExactHover =
          hoveredHalfSteps === leftHalfSteps ||
          hoveredHalfSteps === rightHalfSteps;

        return (
          <span
            key={starIndex}
            className={cn(
              "relative inline-flex transition-transform duration-150 ease-out will-change-transform",
              isExactHover && !disabled ? "scale-110" : "scale-100",
            )}
            style={{ width: size, height: size }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              className="absolute inset-0 text-zinc-700"
              aria-hidden="true"
            >
              <path
                d={STAR_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>

            <span
              className="absolute inset-0 overflow-hidden transition-[width] duration-150 ease-out"
              style={{ width: `${fillPercent}%` }}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                className={cn(
                  "block transition-colors duration-150",
                  isPreviewing ? "text-amber-300" : "text-amber-400",
                  isStarHovered && !disabled
                    ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]"
                    : "drop-shadow-none",
                )}
              >
                <path
                  d={STAR_PATH}
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <button
              type="button"
              aria-label={`Rate ${(leftHalfSteps / 2).toFixed(1)} stars`}
              disabled={disabled}
              onPointerEnter={() => setHoveredHalfSteps(leftHalfSteps)}
              onFocus={() => setHoveredHalfSteps(leftHalfSteps)}
              onBlur={() => setHoveredHalfSteps(null)}
              onClick={() => commit(leftHalfSteps)}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-wait"
            />
            <button
              type="button"
              aria-label={`Rate ${(rightHalfSteps / 2).toFixed(0)} stars`}
              disabled={disabled}
              onPointerEnter={() => setHoveredHalfSteps(rightHalfSteps)}
              onFocus={() => setHoveredHalfSteps(rightHalfSteps)}
              onBlur={() => setHoveredHalfSteps(null)}
              onClick={() => commit(rightHalfSteps)}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-wait"
            />
          </span>
        );
      })}
    </div>
  );
}
