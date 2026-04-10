import Link from "next/link";

import { AutoSubmitForm } from "@/components/auto-submit-form";
import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";
import { formatIsoMonthLabel } from "@/lib/dates/format-iso-month-label";
import {
  ALL_QUEUE_MONTH_FILTER,
  ALL_QUEUE_SOURCE_FILTER,
  DEFAULT_QUEUE_LAYOUT,
  DOUBLE_QUEUE_LAYOUT,
  UNDATED_QUEUE_MONTH_FILTER,
  buildQueueSearchParams,
  type QueueLayout,
  type QueueMonthFilter,
  type QueueSourceFilter,
} from "@/lib/releases/queue-filters";
import {
  DEFAULT_QUEUE_STATUS_FILTER,
  QUEUE_STATUS_FILTER_OPTIONS,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";
import { cn } from "@/lib/utils";

type QueueFiltersProps = {
  selectedStatus: QueueStatusFilter;
  selectedMonth: QueueMonthFilter;
  selectedSource: QueueSourceFilter;
  selectedLayout: QueueLayout;
  availableMonths: string[];
  availableSources: string[];
};

function getQueueHref({
  status = DEFAULT_QUEUE_STATUS_FILTER,
  month = ALL_QUEUE_MONTH_FILTER,
  source = ALL_QUEUE_SOURCE_FILTER,
  layout = DEFAULT_QUEUE_LAYOUT,
  page = 1,
}: {
  status?: QueueStatusFilter;
  month?: QueueMonthFilter;
  source?: QueueSourceFilter;
  layout?: QueueLayout;
  page?: number;
}) {
  const query = buildQueueSearchParams({
    status,
    month,
    source,
    layout,
    page,
  }).toString();

  return query ? `/app?${query}` : "/app";
}

export function QueueFilters({
  selectedStatus,
  selectedMonth,
  selectedSource,
  selectedLayout,
  availableMonths,
  availableSources,
}: QueueFiltersProps) {
  const monthOptions = availableMonths.includes(selectedMonth)
    ? availableMonths
    : selectedMonth === ALL_QUEUE_MONTH_FILTER
      ? availableMonths
      : [selectedMonth, ...availableMonths];
  const sourceOptions = availableSources.includes(selectedSource)
    ? availableSources
    : selectedSource === ALL_QUEUE_SOURCE_FILTER
      ? availableSources
      : [selectedSource, ...availableSources];
  const hasActiveSecondaryFilters =
    selectedMonth !== ALL_QUEUE_MONTH_FILTER ||
    selectedSource !== ALL_QUEUE_SOURCE_FILTER;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 lg:min-w-0 lg:flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Status
          </span>
          <div className="flex flex-wrap gap-2">
            {QUEUE_STATUS_FILTER_OPTIONS.map((option) => {
              const isActive = option.value === selectedStatus;

              return (
                <Link
                  key={option.value}
                  href={getQueueHref({
                    status: option.value,
                    month: selectedMonth,
                    source: selectedSource,
                    layout: selectedLayout,
                  })}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>

        <AutoSubmitForm
          key={`${selectedStatus}:${selectedMonth}:${selectedSource}:${selectedLayout}`}
          action="/app"
          className="grid gap-3 sm:grid-cols-2 lg:min-w-[40rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          {selectedStatus !== DEFAULT_QUEUE_STATUS_FILTER ? (
            <input type="hidden" name="status" value={selectedStatus} />
          ) : null}
          <input type="hidden" name="layout" value={selectedLayout} />

          <label className="space-y-2">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Month
            </span>
            <select
              name="month"
              defaultValue={selectedMonth}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
            >
              <option value={ALL_QUEUE_MONTH_FILTER}>All months</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month === UNDATED_QUEUE_MONTH_FILTER
                    ? "Undated"
                    : formatIsoMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Source
            </span>
            <select
              name="source"
              defaultValue={selectedSource}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
            >
              <option value={ALL_QUEUE_SOURCE_FILTER}>All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {getBandcampDomainLabel(source)}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 lg:self-end">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Layout
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={getQueueHref({
                  status: selectedStatus,
                  month: selectedMonth,
                  source: selectedSource,
                  layout: DEFAULT_QUEUE_LAYOUT,
                })}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                  selectedLayout === DEFAULT_QUEUE_LAYOUT
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
                )}
              >
                Single
              </Link>
              <Link
                href={getQueueHref({
                  status: selectedStatus,
                  month: selectedMonth,
                  source: selectedSource,
                  layout: DOUBLE_QUEUE_LAYOUT,
                })}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                  selectedLayout === DOUBLE_QUEUE_LAYOUT
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
                )}
              >
                2 columns
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
            {hasActiveSecondaryFilters ? (
              <Link
                href={getQueueHref({
                  status: selectedStatus,
                  layout: selectedLayout,
                })}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </AutoSubmitForm>
      </div>
    </section>
  );
}
