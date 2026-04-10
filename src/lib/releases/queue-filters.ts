import {
  DEFAULT_QUEUE_STATUS_FILTER,
  parseQueuePage,
  parseQueueStatusFilter,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";

export const ALL_QUEUE_MONTH_FILTER = "all";
export const UNDATED_QUEUE_MONTH_FILTER = "undated";
export const ALL_QUEUE_SOURCE_FILTER = "all";

export type QueueMonthValue = `${number}${number}${number}${number}-${number}${number}`;
export type QueueMonthFilter =
  | typeof ALL_QUEUE_MONTH_FILTER
  | typeof UNDATED_QUEUE_MONTH_FILTER
  | QueueMonthValue;
export type QueueSourceFilter = typeof ALL_QUEUE_SOURCE_FILTER | string;

type QueueFiltersSearchParams = {
  page?: string | string[];
  q?: string | string[];
  status?: string | string[];
  month?: string | string[];
  source?: string | string[];
};

type BuildQueueSearchParamsInput = {
  page?: number;
  query?: string;
  status?: QueueStatusFilter;
  month?: QueueMonthFilter;
  source?: QueueSourceFilter;
};

const MAX_QUEUE_QUERY_LENGTH = 120;

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

export function normalizeQueueSearchQuery(input: string | undefined) {
  if (!input) {
    return "";
  }

  return input.trim().replace(/\s+/g, " ").slice(0, MAX_QUEUE_QUERY_LENGTH);
}

export function parseQueueSearchQuery(input: string | string[] | undefined) {
  return normalizeQueueSearchQuery(getFirstSearchParamValue(input));
}

export function parseQueueFilters(
  input: QueueFiltersSearchParams,
): {
  page: number;
  query: string;
  status: QueueStatusFilter;
  month: QueueMonthFilter;
  source: QueueSourceFilter;
} {
  return {
    page: parseQueuePage(input.page),
    query: parseQueueSearchQuery(input.q),
    status: parseQueueStatusFilter(input.status),
    month: parseQueueMonthFilter(input.month),
    source: parseQueueSourceFilter(input.source),
  };
}

export function buildQueueSearchParams({
  page = 1,
  query = "",
  status = DEFAULT_QUEUE_STATUS_FILTER,
  month = ALL_QUEUE_MONTH_FILTER,
  source = ALL_QUEUE_SOURCE_FILTER,
}: BuildQueueSearchParamsInput) {
  const params = new URLSearchParams();
  const normalizedQuery = normalizeQueueSearchQuery(query);

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  if (status !== DEFAULT_QUEUE_STATUS_FILTER) {
    params.set("status", status);
  }

  if (month !== ALL_QUEUE_MONTH_FILTER) {
    params.set("month", month);
  }

  if (source !== ALL_QUEUE_SOURCE_FILTER) {
    params.set("source", source);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}
