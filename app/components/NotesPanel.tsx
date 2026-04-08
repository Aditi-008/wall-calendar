"use client";
import { useState, useEffect } from "react";

export default function NotesPanel() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="w-full h-64 p-4 border rounded-xl"
      placeholder="Write notes..."
    />
  );
}