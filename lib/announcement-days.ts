export const WEEK_DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export type WeekDayKey = (typeof WEEK_DAYS)[number]['key'];
export type AnnouncementType = 'special' | 'weekly';

export type AnnouncementDayInput = {
  day: WeekDayKey;
  text: string;
  startsAt?: string | null;
  location?: string | null;
};

export function emptyWeekDays(): Record<WeekDayKey, { text: string; startsAt: string; location: string }> {
  return {
    monday: { text: '', startsAt: '', location: '' },
    tuesday: { text: '', startsAt: '', location: '' },
    wednesday: { text: '', startsAt: '', location: '' },
    thursday: { text: '', startsAt: '', location: '' },
    friday: { text: '', startsAt: '', location: '' },
    saturday: { text: '', startsAt: '', location: '' },
    sunday: { text: '', startsAt: '', location: '' },
  };
}

/** Snap any date to the Monday of that ISO week (local). */
export function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function collectFilledDays(
  week: Record<WeekDayKey, { text: string; startsAt: string; location: string }>
): AnnouncementDayInput[] {
  const days: AnnouncementDayInput[] = [];
  for (const { key } of WEEK_DAYS) {
    const entry = week[key];
    const text = entry.text.trim();
    if (!text) continue;
    days.push({
      day: key,
      text,
      startsAt: entry.startsAt.trim() ? new Date(entry.startsAt).toISOString() : null,
      location: entry.location.trim() || null,
    });
  }
  return days;
}

export function daysToWeekForm(
  days: AnnouncementDayInput[] | null | undefined
): Record<WeekDayKey, { text: string; startsAt: string; location: string }> {
  const week = emptyWeekDays();
  for (const item of days || []) {
    if (!week[item.day]) continue;
    let startsAt = '';
    if (item.startsAt) {
      const d = new Date(item.startsAt);
      if (!Number.isNaN(d.getTime())) {
        const offset = d.getTimezoneOffset();
        startsAt = new Date(d.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
      }
    }
    week[item.day] = {
      text: item.text || '',
      startsAt,
      location: item.location || '',
    };
  }
  return week;
}

export function buildWeeklyBody(days: AnnouncementDayInput[]): string {
  return days
    .map((d) => {
      const label = WEEK_DAYS.find((w) => w.key === d.day)?.label || d.day;
      const when = d.startsAt
        ? new Date(d.startsAt).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : null;
      const loc = d.location ? ` · ${d.location}` : '';
      return when ? `${label} (${when})${loc}\n${d.text}` : `${label}${loc}\n${d.text}`;
    })
    .join('\n\n');
}

export function dayLabel(day: string): string {
  return WEEK_DAYS.find((w) => w.key === day)?.label || day;
}
