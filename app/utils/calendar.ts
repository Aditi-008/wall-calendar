import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";

export function generateCalendar(date: Date) {
  const startMonth = startOfMonth(date);
  const endMonth = endOfMonth(date);

  const startDate = startOfWeek(startMonth);
  const endDate = endOfWeek(endMonth);

  const days = [];
  let current = startDate;

  while (current <= endDate) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
}