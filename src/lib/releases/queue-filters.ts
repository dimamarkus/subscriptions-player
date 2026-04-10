import {
  DEFAULT_QUEUE_STATUS_FILTER,
  parseQueuePage,
  parseQueueStatusFilter,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";

export const ALL_QUEUE_MONTH_FILTER = "all";
export const UNDATED_QUEUE_MONTH_FILTER = "undated";
export const ALL_QUEUE_SOURCE_FILTER = "all";
export const DEFAULT_QUEUE_LAYOUT = "single";
export const DOUBLE_QUEUE_LAYOUT = "double";

export type QueueMonthValue = `${number}${number}${number}${number}-${number}${number}`;
export type QueueMonthFilter =
  | typeof ALL_QUEUE_MONTH_FILTER
  | typeof UNDATED_QUEUE_MONTH_FILTER
  | QueueMonthValue;
export type QueueSourceFilter = typeof ALL_QUEUE_SOURCE_FILTER | string;
export type QueueLayout =
  | typeof DEFAULT_QUEUE_LAYOUT
  | typeof DOUBLE_QUEUE_LAYOUT;

type QueueFiltersSearchParams = {
  page?: string | string[];
  status?: string | string[];
  month?: string | string[];
  source?: string | string[];
  layout?: string | string[];
};

type BuildQueueSearchParamsInput = {
  page?: number;
  status?: QueueStatusFilter;
  month?: QueueMonthFilter;
  source?: QueueSourceFilter;
  layout?: QueueLayout;
};

function getFirstSearchParamValue(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function isQueueMonthValue(value: string): value is QueueMonthValue {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function isBandcampSourceValue(value: string) {
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.bandcamp\.com$/i.test(value);
}

export function parseQueueMonthFilter(
  input: string | string[] | undefined,
): QueueMonthFilter {
  const value = getFirstSearchParamValue(input);

  if (!value) {
    return ALL_QUEUE_MONTH_FILTER;
  }

  if (value === ALL_QUEUE_MONTH_FILTER || value === UNDATED_QUEUE_MONTH_FILTER) {
    return value;
  }

  return isQueueMonthValue(value) ? value : ALL_QUEUE_MONTH_FILTER;
}

export function parseQueueSourceFilter(
  input: string | string[] | undefined,
): QueueSourceFilter {
  const value = getFirstSearchParamValue(input);

  if (!value) {
    return ALL_QUEUE_SOURCE_FILTER;
  }

  if (value === ALL_QUEUE_SOURCE_FILTER) {
    return value;
  }

  return isBandcampSourceValue(value) ? value.toLowerCase() : ALL_QUEUE_SOURCE_FILTER;
}

export function parseQueueLayout(
  input: string | string[] | undefined,
): QueueLayout {
  const value = getFirstSearchParamValue(input);

  if (!value) {
    return DEFAULT_QUEUE_LAYOUT;
  }

  return value === DOUBLE_QUEUE_LAYOUT ? DOUBLE_QUEUE_LAYOUT : DEFAULT_QUEUE_LAYOUT;
}

export function parseQueueFilters(
  input: QueueFiltersSearchParams,
): {
  page: number;
  status: QueueStatusFilter;
  month: QueueMonthFilter;
  source: QueueSourceFilter;
  layout: QueueLayout;
} {
  return {
    page: parseQueuePage(input.page),
    status: parseQueueStatusFilter(input.status),
    month: parseQueueMonthFilter(input.month),
    source: parseQueueSourceFilter(input.source),
    layout: parseQueueLayout(input.layout),
  };
}

export function buildQueueSearchParams({
  page = 1,
  status = DEFAULT_QUEUE_STATUS_FILTER,
  month = ALL_QUEUE_MONTH_FILTER,
  source = ALL_QUEUE_SOURCE_FILTER,
  layout = DEFAULT_QUEUE_LAYOUT,
}: BuildQueueSearchParamsInput) {
  const params = new URLSearchParams();

  if (status !== DEFAULT_QUEUE_STATUS_FILTER) {
    params.set("status", status);
  }

  if (month !== ALL_QUEUE_MONTH_FILTER) {
    params.set("month", month);
  }

  if (source !== ALL_QUEUE_SOURCE_FILTER) {
    params.set("source", source);
  }

  if (layout !== DEFAULT_QUEUE_LAYOUT) {
    params.set("layout", layout);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}
