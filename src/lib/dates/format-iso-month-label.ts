export function formatIsoMonthLabel(value: string) {
  const match = value.match(/^(\d{4})-(0[1-9]|1[0-2])$/);

  if (!match) {
    return value;
  }

  const [, year, month] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
