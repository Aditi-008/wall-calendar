"use client";
import { useState } from "react";
import { generateCalendar } from "../utils/calendar";
import DayCell from "./DayCell";

export default function CalendarGrid() {
  const [currentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const days = generateCalendar(currentDate);

  const handleClick = (day: Date) => {
    if (!startDate || endDate) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  return (
    <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl shadow">
      {days.map((day, i) => (
        <DayCell
          key={i}
          day={day}
          onClick={handleClick}
          startDate={startDate}
          endDate={endDate}
        />
      ))}
    </div>
  );
}