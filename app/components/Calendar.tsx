"use client";
import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MONTH_THEMES = [
  { gradient: "from-[#b8d4e8] to-[#dce8f0]", accent: "#3b7ea6", hero: "❄️", label: "Winter Calm", bg: "#eaf4fb" },
  { gradient: "from-[#f9d6d6] to-[#fce8e8]", accent: "#c0504d", hero: "🌸", label: "First Bloom", bg: "#fff5f5" },
  { gradient: "from-[#d4e8d4] to-[#e8f4e8]", accent: "#4a7c4e", hero: "🌱", label: "Fresh Starts", bg: "#f2fbf2" },
  { gradient: "from-[#ffe8b0] to-[#fff3d6]", accent: "#c07020", hero: "🌼", label: "April Light", bg: "#fffbf0" },
  { gradient: "from-[#e8d4f0] to-[#f4e8fc]", accent: "#8060a0", hero: "🌺", label: "May Bloom", bg: "#faf5ff" },
  { gradient: "from-[#d4f0e8] to-[#e8fcf4]", accent: "#2a7a5a", hero: "☀️", label: "Summer Opens", bg: "#f0fff8" },
  { gradient: "from-[#ffe0b0] to-[#fff0d4]", accent: "#c06010", hero: "🏖️", label: "Golden Days", bg: "#fff8f0" },
  { gradient: "from-[#ffd4b0] to-[#ffe8d4]", accent: "#b05010", hero: "🌻", label: "Late Summer", bg: "#fff5ed" },
  { gradient: "from-[#f0e0c8] to-[#f8f0e0]", accent: "#8a5a2a", hero: "🍂", label: "Harvest Gold", bg: "#fdf6ed" },
  { gradient: "from-[#e0d4c8] to-[#f0e8e0]", accent: "#6a4a2a", hero: "🍁", label: "Autumn Peak", bg: "#faf5f0" },
  { gradient: "from-[#c8d8e8] to-[#e0ecf4]", accent: "#3a5a7a", hero: "🌫️", label: "November Mist", bg: "#f0f5fa" },
  { gradient: "from-[#c8d4e4] to-[#e0e8f4]", accent: "#2a4a7a", hero: "🎄", label: "Winter Fest", bg: "#f0f4fa" },
];

const HOLIDAYS = {
  "1-14": { name: "Makar Sankranti 🪁", type: "festival" },
  "1-26": { name: "Republic Day 🇮🇳", type: "national" },

  "2-15": { name: "Maha Shivratri 🔱", type: "festival" },

  "3-4": { name: "Holi 🎨", type: "festival" },

  "4-10": { name: "Ram Navami 🚩", type: "festival" },
  "4-14": { name: "Ambedkar Jayanti 📘", type: "national" },

  "5-1": { name: "Labour Day ⚒️", type: "national" },

  "6-7": { name: "Eid al-Adha 🌙", type: "festival" },

  "8-15": { name: "Independence Day 🇮🇳", type: "national" },
  "8-28": { name: "Raksha Bandhan 🎁", type: "festival" },

  "10-2": { name: "Gandhi Jayanti ☮️", type: "national" },
  "10-20": { name: "Dussehra 🏹", type: "festival" },

  "11-1": { name: "Diwali 🪔", type: "festival" },

  "12-25": { name: "Christmas 🎄", type: "festival" }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

function toKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function holidayKey(month, day) {
  return `${month + 1}-${day}`;
}

function isSameDay(a, b) {
  return a && b && a.y === b.y && a.m === b.m && a.d === b.d;
}

function isBetween(cell, start, end) {
  if (!start || !end) return false;
  const ts = new Date(start.y, start.m, start.d);
  const te = new Date(end.y, end.m, end.d);
  const tc = new Date(cell.y, cell.m, cell.d);
  const [lo, hi] = ts <= te ? [ts, te] : [te, ts];
  return tc > lo && tc < hi;
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  const fmt = ({ y, m, d }) =>
    `${MONTHS[m].slice(0, 3)} ${d}, ${y}`;
  if (!end || isSameDay(start, end)) return fmt(start);
  return `${fmt(start)} → ${fmt(end)}`;
}

// ─── MonthGrid ────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, rangeStart, rangeEnd, hoveredDay, onDayClick, onDayHover, notes, theme }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const endForHover = rangeStart && !rangeEnd ? hoveredDay : rangeEnd;

  return (
    <div className="grid grid-cols-7 gap-[3px]">
      {DAYS.map((d) => (
        <div
          key={d}
          className="text-center text-[10px] font-bold tracking-widest py-1"
          style={{ color: theme.accent, opacity: 0.7, fontFamily: "'Playfair Display', serif" }}
        >
          {d}
        </div>
      ))}
      {cells.map((day, idx) => {
        if (!day) return <div key={`e-${idx}`} />;
        const cell = { y: year, m: month, d: day };
        const isStart = isSameDay(rangeStart, cell);
        const isEnd = rangeEnd && isSameDay(rangeEnd, cell);
        const inRange = isBetween(cell, rangeStart, endForHover);
        const isToday =
          today.getFullYear() === year &&
          today.getMonth() === month &&
          today.getDate() === day;
        const hKey = holidayKey(month, day);
        const isHoliday = !!HOLIDAYS[hKey];
        const hasNote = !!notes[toKey(year, month, day)];

        let bg = "transparent";
        let color = "#333";
        let borderStyle = "none";
        if (isStart || isEnd) {
          bg = theme.accent;
          color = "#fff";
        } else if (inRange) {
          bg = theme.accent + "22";
          color = theme.accent;
        }

        return (
          <div
            key={day}
            title={isHoliday ? HOLIDAYS[hKey] : ""}
            onClick={() => onDayClick(cell)}
            onMouseEnter={() => onDayHover(cell)}
            onMouseLeave={() => onDayHover(null)}
            style={{
              background: bg,
              color: color,
              border: isToday ? `2px solid ${theme.accent}` : inRange ? `1px solid ${theme.accent}44` : "2px solid transparent",
              borderRadius: isStart ? "10px 4px 4px 10px" : isEnd ? "4px 10px 10px 4px" : "4px",
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              transition: "all 0.12s",
              position: "relative",
            }}
            className="flex flex-col items-center justify-center aspect-square text-[13px] font-medium select-none hover:scale-105"
          >
            <span>{day}</span>
            <div className="flex gap-[2px] mt-[1px]">
              {isHoliday && <span style={{ fontSize: 5, lineHeight: 1 }}>●</span>}
              {hasNote && <span style={{ fontSize: 5, lineHeight: 1, color: "#f59e0b" }}>●</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HeroPanel ────────────────────────────────────────────────────────────────

function HeroPanel({ year, month, theme }) {
  const [flipped, setFlipped] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Curated Unsplash landscape images per month (landscape/nature themed)
  const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800", // Jan
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800", // Feb
    "https://images.unsplash.com/photo-1490750967868-88df5691cc4a?w=800", // Mar
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800", // Apr ✅ FIXED
    "https://images.unsplash.com/photo-1526045478516-99145907023c?w=800", // May ✅ FIXED
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800", // Jun
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", // Jul
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", // Aug
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800", // Sep
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800", // Oct
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", // Nov
    "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800", // Dec
  ];


  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ minHeight: 220 }}
    >
      {/* Flip trigger */}
      <button
        onClick={() => setFlipped(!flipped)}
        className="absolute top-3 right-3 z-10 text-xs px-2 py-1 rounded-full backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.55)", color: theme.accent, fontFamily: "'DM Mono', monospace", border: `1px solid ${theme.accent}44` }}
        title="Flip card"
      >
        {flipped ? "← back" : "flip →"}
      </button>

      <div
        style={{
          perspective: 1000,
          width: "100%",
          height: "100%",
          minHeight: 220,
        }}
      >
        <div
          style={{
            transition: "transform 0.65s cubic-bezier(0.4,0.2,0.2,1)",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            width: "100%",
            minHeight: 220,
          }}
        >
          {/* Front: hero image */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              minHeight: 220,
            }}
            className="rounded-2xl overflow-hidden"
          >
            <img
              src={HERO_IMAGES[month]}
              alt={`${MONTHS[month]} scenery`}
              className="w-full h-full object-cover"
              style={{ minHeight: 220, maxHeight: 260, display: "block" }}
              onLoad={() => setImgLoaded(true)}
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-4"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
            >
              <div className="text-white">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: -0.5 }}>
                  {MONTHS[month]}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, opacity: 0.8 }}>
                  {year} · {theme.label}
                </div>
              </div>
            </div>
          </div>

          {/* Back: month artwork */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: "absolute",
              inset: 0,
              minHeight: 220,
            }}
            className={`rounded-2xl bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center`}
          >
            <div style={{ fontSize: 72 }}>{theme.hero}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: theme.accent, marginTop: 8 }}>
              {theme.label}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: theme.accent, opacity: 0.6, marginTop: 4 }}>
              {MONTHS[month]} {year}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NotesPanel ───────────────────────────────────────────────────────────────

function NotesPanel({ rangeStart, rangeEnd, notes, onNoteChange, year, month, theme }) {
  const label = formatDateRange(rangeStart, rangeEnd);
  const key = rangeStart ? toKey(rangeStart.y, rangeStart.m, rangeStart.d) : null;
  const note = key ? notes[key] || "" : "";

  // Month note
  const monthKey = `month-${year}-${month}`;
  const monthNote = notes[monthKey] || "";

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Month memo */}
      <div>
        <div
          className="text-xs font-bold tracking-widest mb-1 uppercase"
          style={{ color: theme.accent, fontFamily: "'Playfair Display', serif", opacity: 0.7 }}
        >
          Monthly Memo
        </div>
        <textarea
          value={monthNote}
          onChange={(e) => onNoteChange(monthKey, e.target.value)}
          placeholder={`Notes for ${MONTHS[month]} ${year}…`}
          rows={3}
          className="w-full resize-none rounded-xl text-sm p-3 outline-none transition"
          style={{
            background: theme.bg,
            border: `1.5px solid ${theme.accent}33`,
            color: "#333",
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1.6,
            fontSize: 12,
          }}
          onFocus={(e) => (e.target.style.border = `1.5px solid ${theme.accent}88`)}
          onBlur={(e) => (e.target.style.border = `1.5px solid ${theme.accent}33`)}
        />
      </div>

      {/* Range note */}
      <div className="flex-1 flex flex-col">
        <div
          className="text-xs font-bold tracking-widest mb-1 uppercase"
          style={{ color: theme.accent, fontFamily: "'Playfair Display', serif", opacity: 0.7 }}
        >
          {label ? `Note for ${label}` : "Select a date to add a note"}
        </div>
        <textarea
          value={key ? note : ""}
          disabled={!key}
          onChange={(e) => onNoteChange(key, e.target.value)}
          placeholder={key ? "What's happening on this date?" : "Pick a date first…"}
          rows={5}
          className="w-full resize-none rounded-xl text-sm p-3 outline-none transition flex-1"
          style={{
            background: key ? theme.bg : "#f5f5f5",
            border: `1.5px solid ${theme.accent}33`,
            color: key ? "#333" : "#aaa",
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1.6,
            fontSize: 12,
          }}
          onFocus={(e) => key && (e.target.style.border = `1.5px solid ${theme.accent}88`)}
          onBlur={(e) => (e.target.style.border = `1.5px solid ${theme.accent}33`)}
        />
      </div>

      {/* Notes summary */}
      <div>
        <div
          className="text-xs font-bold tracking-widest mb-1 uppercase"
          style={{ color: theme.accent, fontFamily: "'Playfair Display', serif", opacity: 0.7 }}
        >
          Pinned Notes
        </div>
        <div
          className="rounded-xl p-2 overflow-y-auto"
          style={{ background: theme.bg, border: `1.5px solid ${theme.accent}22`, maxHeight: 120 }}
        >
          {Object.entries(notes as Record<string, string>)
  .filter(([k, v]) => v && !k.startsWith("month-") && k.startsWith(`${year}-${month + 1}-`))
  .map(([k, v]) => {
    const [, , d] = k.split("-");
    return (
      <div
        key={k}
        className="flex gap-2 text-xs py-1"
        style={{ borderBottom: `1px solid ${theme.accent}11` }}
      >
        <span
          style={{
            color: theme.accent,
            fontFamily: "'DM Mono', monospace",
            minWidth: 24,
          }}
        >
          {d}
        </span>

        <span
          style={{
            color: "#555",
            fontFamily: "'DM Mono', monospace",
          }}
          className="truncate"
        >
          {v as string}
        </span>
      </div>
    );
  })}
          {Object.keys(notes).filter((k) => !k.startsWith("month-") && k.startsWith(`${year}-${month + 1}-`) && notes[k]).length === 0 && (
            <div style={{ color: "#aaa", fontFamily: "'DM Mono', monospace", fontSize: 11 }} className="py-1">
              No notes this month yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar ────────────────────────────────────────────────────────────

export default function WallCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cal-notes") || "{}"); }
    catch { return {}; }
  });
  const [showMobile, setShowMobile] = useState(false);
  const [selecting, setSelecting] = useState(false); // false = selecting start, true = selecting end
  const [showHolidays, setShowHolidays] = useState(true);
  const [pageFlip, setPageFlip] = useState(false);

  const theme = MONTH_THEMES[month];

  useEffect(() => {
    try { localStorage.setItem("cal-notes", JSON.stringify(notes)); }
    catch {}
  }, [notes]);

  const navigate = (dir) => {
    setPageFlip(true);
    setTimeout(() => {
      if (dir === -1) {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
      } else {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
      }
      setPageFlip(false);
    }, 220);
  };

  const handleDayClick = (cell) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(cell);
      setRangeEnd(null);
      setSelecting(true);
    } else {
      // second click: set end
      const ts = new Date(rangeStart.y, rangeStart.m, rangeStart.d);
      const te = new Date(cell.y, cell.m, cell.d);
      if (te < ts) { setRangeEnd(rangeStart); setRangeStart(cell); }
      else setRangeEnd(cell);
      setSelecting(false);
    }
  };
const clearRange = () => {
  setRangeStart(null);
  setRangeEnd(null);
};

const handleNoteChange = (key: string, val: string) => {
  setNotes((n) => ({ ...n, [key]: val }));
};

return (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{
      background: "linear-gradient(135deg, #f5f0e8 0%, #ebe4d8 100%)",
      fontFamily: "'DM Mono', monospace",
    }}
  >
        {/* Calendar Card */}
        <div
          className="w-full shadow-2xl rounded-3xl overflow-hidden"
          style={{
            maxWidth: 960,
            background: "#fff",
            boxShadow: "0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {/* Hanging strip */}
          <div
            className="flex items-center justify-between px-6 py-2"
            style={{ background: theme.accent, transition: "background 0.4s" }}
          >
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2 }}>
              WALL CALENDAR
            </div>
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
          </div>

          {/* Body: two-column desktop, stacked mobile */}
          <div className="flex flex-col lg:flex-row">
            {/* ── LEFT: Hero + Controls ── */}
            <div
              className="lg:w-[340px] flex-shrink-0 flex flex-col gap-4 p-5"
              style={{ borderRight: "1px dashed #e0d8cc" }}
            >
              <HeroPanel year={year} month={month} theme={theme} />

              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                  style={{ background: theme.accent + "18", color: theme.accent, fontSize: 16 }}
                >
                  ‹
                </button>
                <div className="text-center">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#222" }}>
                    {MONTHS[month]}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>
                    {year}
                  </div>
                </div>
                <button
                  onClick={() => navigate(1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                  style={{ background: theme.accent + "18", color: theme.accent, fontSize: 16 }}
                >
                  ›
                </button>
              </div>

              {/* Range display */}
              <div
                className="rounded-xl p-3 text-sm"
                style={{ background: theme.bg, border: `1.5px dashed ${theme.accent}44` }}
              >
                <div style={{ color: theme.accent, fontSize: 10, letterSpacing: 2, marginBottom: 4, fontWeight: 700 }}>
                  SELECTED RANGE
                </div>
                {rangeStart ? (
                  <div style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                    {formatDateRange(rangeStart, rangeEnd)}
                    <button onClick={clearRange} className="ml-2 text-xs" style={{ color: "#aaa" }}>✕</button>
                  </div>
                ) : (
                  <div style={{ color: "#aaa", fontSize: 12 }}>Click a day to start selecting</div>
                )}
              </div>

              {/* Legend */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-1" style={{ fontSize: 10, color: "#888" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} /> Selected
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: 10, color: "#888" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} /> Holiday
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: 10, color: "#888" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} /> Note
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: 10, color: "#888" }}>
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: theme.accent }} /> Today
                </div>
              </div>
              {/* Today button */}
              <button
                onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
                className="w-full py-2 rounded-xl text-xs font-bold tracking-widest transition"
                style={{ background: theme.accent + "15", color: theme.accent, border: `1px solid ${theme.accent}33`, fontFamily: "'DM Mono', monospace" }}
              >
                ↩ Back to Today
              </button>
            </div>
 
                        {/* ── RIGHT: Grid + Notes ── */}
            <div className="flex-1 flex flex-col md:flex-row">

              {/* Calendar grid */}
              <div
                className="flex-1 p-5"
                style={{
                  opacity: pageFlip ? 0 : 1,
                  transition: "opacity 0.22s",
                  minWidth: 0,
                }}
              >
                <MonthGrid
                  year={year}
                  month={month}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  hoveredDay={hoveredDay}
                  onDayClick={handleDayClick}
                  onDayHover={setHoveredDay}
                  notes={notes}
                  theme={theme}
                />

                {/* Holiday list */}
                {showHolidays && (
                  <div className="mt-4">
                    {Object.entries(HOLIDAYS)
                      .filter(([k]) => parseInt(k.split("-")[0]) === month + 1)
                      .map(([k, v]) => {
                        const holiday = v as { name: string; type: string };

                        return (
                          <div
                            key={k}
                            className="flex gap-2 items-center text-xs py-1"
                            style={{
                              color: "#888",
                              borderTop: "1px solid #f0ece4",
                            }}
                          >
                            <span
                              style={{
                                color: theme.accent,
                                fontFamily: "'DM Mono', monospace",
                                minWidth: 24,
                              }}
                            >
                              {k.split("-")[1]}
                            </span>

                            <span>{holiday.name}</span>

                            <span
                              className="ml-auto px-2 py-[2px] rounded-full text-[9px]"
                              style={{
                                background:
                                  holiday.type === "national"
                                    ? "#2563eb22"
                                    : "#ef444422",
                                color:
                                  holiday.type === "national"
                                    ? "#2563eb"
                                    : "#ef4444",
                              }}
                            >
                              {holiday.type}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div
                className="hidden md:block w-px"
                style={{ background: "#f0ece4", margin: "16px 0" }}
              />
              <div
                className="md:hidden h-px mx-5"
                style={{ background: "#f0ece4" }}
              />

              {/* Notes */}
              <div className="w-full md:w-[220px] flex-shrink-0 p-5">
                <NotesPanel
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  notes={notes}
                  onNoteChange={handleNoteChange}
                  year={year}
                  month={month}
                  theme={theme}
                />
              </div>
            </div>  {/* ✅ CLOSE RIGHT PANEL */}

          </div>  {/* ✅ CLOSE BODY */}
          {/* Footer strip */}
          <div
            className="px-6 py-2 flex items-center justify-between"
            style={{
              background: "#faf7f2",
              borderTop: "1px dashed #e0d8cc",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#bbb",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {theme.hero} {theme.label}
            </div>

            <div
              style={{
                fontSize: 10,
                color: "#bbb",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {MONTHS[month].toUpperCase()} {year}
            </div>
          </div>

        </div>
      </div>
);
}