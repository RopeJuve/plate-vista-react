import { WEEKDAYS, type OpeningHours, type OpeningRange, type Weekday } from "./types";

export const MAX_RANGES_PER_DAY = 3;
const DAY_MINUTES = 24 * 60;

const DAY_NAMES: Record<Weekday, { long: string; short: string }> = {
  mon: { long: "Monday", short: "Mon" },
  tue: { long: "Tuesday", short: "Tue" },
  wed: { long: "Wednesday", short: "Wed" },
  thu: { long: "Thursday", short: "Thu" },
  fri: { long: "Friday", short: "Fri" },
  sat: { long: "Saturday", short: "Sat" },
  sun: { long: "Sunday", short: "Sun" },
};

export const dayLabel = (day: Weekday) => DAY_NAMES[day].long;

export const emptyHours = (): OpeningHours =>
  Object.fromEntries(WEEKDAYS.map((day) => [day, []])) as unknown as OpeningHours;

export const hasOpeningHours = (hours: OpeningHours) => WEEKDAYS.some((day) => hours[day].length > 0);

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const runsPastMidnight = ({ open, close }: OpeningRange) => minutes(close) < minutes(open);
const dayAt = (index: number) => WEEKDAYS[(index + WEEKDAYS.length) % WEEKDAYS.length];

const SHORT_TO_DAY: Record<string, Weekday> = Object.fromEntries(
  WEEKDAYS.map((day) => [DAY_NAMES[day].short, day])
);

/** The restaurant's weekday and minute of the day, whatever the guest's phone is set to. */
export const localClock = (now: Date, timezone: string): { day: Weekday; minutes: number } => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return { day: SHORT_TO_DAY[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
};

export type OpenStatus = { open: boolean; label: "Open" | "Closed"; detail: string };

/** "Open · until 19:00" or "Closed · opens 11:00 tomorrow"; null when no hours are set. */
export const openStatus = (hours: OpeningHours, timezone: string, now: Date): OpenStatus | null => {
  if (!hasOpeningHours(hours)) {
    return null;
  }
  const clock = localClock(now, timezone);
  const today = WEEKDAYS.indexOf(clock.day);

  const spill = hours[dayAt(today - 1)].find((range) => runsPastMidnight(range) && clock.minutes < minutes(range.close));
  const current = hours[clock.day].find(
    (range) =>
      clock.minutes >= minutes(range.open) && (runsPastMidnight(range) || clock.minutes < minutes(range.close))
  );
  const openRange = current ?? spill;
  if (openRange) {
    return { open: true, label: "Open", detail: `until ${openRange.close}` };
  }

  for (let ahead = 0; ahead <= 7; ahead += 1) {
    const day = dayAt(today + ahead);
    const next = [...hours[day]]
      .sort((a, b) => minutes(a.open) - minutes(b.open))
      .find((range) => ahead > 0 || minutes(range.open) > clock.minutes);
    if (next) {
      const detail =
        ahead === 0
          ? `opens ${next.open}`
          : ahead === 1
            ? `opens ${next.open} tomorrow`
            : `opens ${DAY_NAMES[day].short} ${next.open}`;
      return { open: false, label: "Closed", detail };
    }
  }
  return null;
};

/** `times` is one "11:00–15:00" per range, or ["Closed"]. */
export type WeekRow = { day: Weekday; label: string; times: string[]; today: boolean };

/** The whole week from Monday, for the expanded opening hours. */
export const weekRows = (hours: OpeningHours, today: Weekday): WeekRow[] =>
  WEEKDAYS.map((day) => ({
    day,
    label: dayLabel(day),
    times: hours[day].length ? hours[day].map(({ open, close }) => `${open}–${close}`) : ["Closed"],
    today: day === today,
  }));

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// [start, end) minutes of the day; a range past midnight is cut at midnight
// and the rest belongs to the next day.
const ownSpans = (ranges: OpeningRange[]) =>
  ranges.map((range): [number, number] => [
    minutes(range.open),
    runsPastMidnight(range) ? DAY_MINUTES : minutes(range.close),
  ]);
const spillSpans = (ranges: OpeningRange[]) =>
  ranges.filter(runsPastMidnight).map((range): [number, number] => [0, minutes(range.close)]);

const overlaps = (spans: [number, number][]) => {
  const sorted = [...spans].sort((a, b) => a[0] - b[0]);
  return sorted.some((span, i) => i > 0 && span[0] < sorted[i - 1][1]);
};

/** The same rules the server applies, one message per day that breaks them. */
export const hoursIssues = (hours: OpeningHours): Partial<Record<Weekday, string>> => {
  const issues: Partial<Record<Weekday, string>> = {};
  WEEKDAYS.forEach((day, i) => {
    const ranges = hours[day];
    if (ranges.some((range) => !TIME.test(range.open) || !TIME.test(range.close))) {
      issues[day] = "Enter both times";
    } else if (ranges.some((range) => range.open === range.close)) {
      issues[day] = "Opening and closing time must differ";
    } else if (ranges.length > MAX_RANGES_PER_DAY) {
      issues[day] = `At most ${MAX_RANGES_PER_DAY} opening times a day`;
    } else {
      const previous = hours[dayAt(i - 1)].filter((range) => TIME.test(range.open) && TIME.test(range.close));
      if (overlaps([...spillSpans(previous), ...ownSpans(ranges)])) {
        issues[day] = "Opening times overlap";
      }
    }
  });
  return issues;
};
