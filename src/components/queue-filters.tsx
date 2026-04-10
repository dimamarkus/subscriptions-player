import Link from "next/link";

import { AutoSubmitForm } from "@/components/auto-submit-form";
import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";
import { formatIsoMonthLabel } from "@/lib/dates/format-iso-month-label";
import {
  ALL_QUEUE_MONTH_FILTER,
  ALL_QUEUE_SOURCE_FILTER,
  UNDATED_QUEUE_MONTH_FILTER,
  buildQueueSearchParams,
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
  availableMonths: string[];
  availableSources: string[];
};

function getQueueHref({
  status = DEFAULT_QUEUE_STATUS_FILTER,
  month = ALL_QUEUE_MONTH_FILTER,
  source = ALL_QUEUE_SOURCE_FILTER,
  page = 1,
}: {
  status?: QueueStatusFilter;
  month?: QueueMonthFilter;
  source?: QueueSourceFilter;
  page?: number;
}) {
  const query = buildQueueSearchParams({
    status,
    month,
    source,
    page,
  }).toString();

  return query ? `/app?${query}` : "/app";
}

export function QueueFilters({
  selectedStatus,
  selectedMonth,
  selectedSource,
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
          key={`${selectedStatus}:${selectedMonth}:${selectedSource}`}
          action="/app"
          className="grid gap-3 sm:grid-cols-2 lg:min-w-[30rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          {selectedStatus !== DEFAULT_QUEUE_STATUS_FILTER ? (
            <input type="hidden" name="status" value={selectedStatus} />
          ) : null}

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

          <div className="flex flex-wrap items-center gap-2 lg:self-end">
            {hasActiveSecondaryFilters ? (
              <Link
                href={getQueueHref({
                  status: selectedStatus,
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
