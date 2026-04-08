import { format } from "date-fns";

export default function DayCell({ day, onClick, startDate, endDate }: any) {
  const isStart = startDate && day.toDateString() === startDate.toDateString();
  const isEnd = endDate && day.toDateString() === endDate.toDateString();
  const isInRange =
    startDate && endDate && day >= startDate && day <= endDate;

  return (
    <div
      onClick={() => onClick(day)}
      className={`p-3 text-center cursor-pointer rounded-lg border
        ${isStart || isEnd ? "bg-blue-600 text-white" : ""}
        ${isInRange ? "bg-blue-200" : ""}
        hover:bg-blue-100`}
    >
      {format(day, "d")}
    </div>
  );
}