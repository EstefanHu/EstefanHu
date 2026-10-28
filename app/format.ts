/** `1234` -> `1,234`. */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** `2026-09-18` -> `Sep 18, 2026`, rendered in UTC so a build never shifts the day. */
export function formatDate(date: string): string {
  return DATE_FORMAT.format(new Date(`${date}T00:00:00Z`))
}
