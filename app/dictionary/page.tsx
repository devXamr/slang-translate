"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type DictionaryEntry = {
  term: string;
  definition: string;
  addedAt: number;
};

const STORAGE_KEY = "genz_dictionary_terms";
const LIST_HEIGHT = 420;
const ROW_HEIGHT = 96;
const OVERSCAN = 4;

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<DictionaryEntry | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as DictionaryEntry[];
      if (!Array.isArray(parsed)) {
        return;
      }

      const cleaned = parsed
        .filter((entry) => entry && entry.term && entry.definition)
        .sort((a, b) => b.addedAt - a.addedAt);

      setEntries(cleaned);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const totalHeight = entries.length * ROW_HEIGHT;
  const visibleCount = Math.ceil(LIST_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    entries.length,
    startIndex + visibleCount + OVERSCAN * 2,
  );

  const visibleEntries = useMemo(
    () => entries.slice(startIndex, endIndex),
    [entries, startIndex, endIndex],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();
    if (!term) {
      setErrorMessage("Please enter a term.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    const normalized = term.toLowerCase();
    const existing = entries.find((entry) => entry.term.toLowerCase() === normalized);

    if (existing) {
      setActiveEntry(existing);
      setStatusMessage("Loaded from your saved dictionary.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch term.");
      }

      const newEntry: DictionaryEntry = {
        term,
        definition: data.definition,
        addedAt: Date.now(),
      };

      setEntries((prev) => [newEntry, ...prev]);
      setActiveEntry(newEntry);
      setStatusMessage("Fetched from Groq and added to your dictionary.");
      setQuery("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not look up this term right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full max-w-3xl mx-auto px-6 py-10 font-genz">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">Gen Z Dictionary</h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to translator
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search or add a Gen Z term"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <button
          disabled={isLoading}
          className="rounded-md bg-yellow-300 px-4 py-2 text-sm text-gray-900 disabled:opacity-50"
        >
          {isLoading ? "Looking up..." : "Search term"}
        </button>

        {statusMessage && <p className="text-sm text-green-700">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      </form>

      {activeEntry && (
        <div className="mt-8 rounded-md border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg">{activeEntry.term}</h2>
          <p className="mt-2 text-sm text-gray-700">{activeEntry.definition}</p>
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-2 text-sm text-gray-600">Recently added terms</h3>

        <div
          className="relative overflow-auto rounded-md border border-gray-200"
          style={{ height: `${LIST_HEIGHT}px` }}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          {entries.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              No saved terms yet. Search above to add your first one.
            </div>
          ) : (
            <div style={{ height: `${totalHeight}px`, position: "relative" }}>
              {visibleEntries.map((entry, index) => {
                const absoluteIndex = startIndex + index;
                const isActive = activeEntry?.term === entry.term;

                return (
                  <button
                    type="button"
                    key={`${entry.term}-${entry.addedAt}`}
                    onClick={() => setActiveEntry(entry)}
                    className={`absolute left-0 w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                      isActive ? "bg-yellow-50" : "bg-white"
                    }`}
                    style={{
                      top: `${absoluteIndex * ROW_HEIGHT}px`,
                      height: `${ROW_HEIGHT}px`,
                    }}
                  >
                    <p className="font-medium">{entry.term}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {entry.definition}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
