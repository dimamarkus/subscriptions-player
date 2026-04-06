export const USER_RELEASE_STATUSES = [
  "new",
  "listened",
  "saved",
  "skipped",
  "archived",
] as const;

export type UserReleaseStatus = (typeof USER_RELEASE_STATUSES)[number];

export const DEFAULT_QUEUE_STATUS_FILTER = "new";
export const ALL_QUEUE_STATUS_FILTER = "all";

export type QueueStatusFilter =
  | UserReleaseStatus
  | typeof ALL_QUEUE_STATUS_FILTER;

export const QUEUE_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: QueueStatusFilter;
}> = [
  { label: "New", value: "new" },
  { label: "Listened", value: "listened" },
  { label: "Saved", value: "saved" },
  { label: "Skipped", value: "skipped" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "all" },
];

export function parseQueueStatusFilter(
  input: string | string[] | undefined,
): QueueStatusFilter {
  const value = Array.isArray(input) ? input[0] : input;

  if (!value) {
    return DEFAULT_QUEUE_STATUS_FILTER;
  }

  if (value === ALL_QUEUE_STATUS_FILTER) {
    return value;
  }

  return USER_RELEASE_STATUSES.includes(value as UserReleaseStatus)
    ? (value as UserReleaseStatus)
    : DEFAULT_QUEUE_STATUS_FILTER;
}

export function parseQueuePage(input: string | string[] | undefined): number {
  const value = Array.isArray(input) ? input[0] : input;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}
