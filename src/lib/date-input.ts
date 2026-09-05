/**
 * Formatting for `<input type="date">` and `<input type="datetime-local">`.
 *
 * Both expect a local wall-clock string with no timezone, so `toISOString()` is
 * wrong here — it would shift an evening service into the previous day for any
 * editor west of UTC. These build the string from local parts instead.
 */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateTimeInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
