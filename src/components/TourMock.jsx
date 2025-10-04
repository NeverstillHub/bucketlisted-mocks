import React, { useEffect, useState } from "react";
import { Play, Pause, ChevronRight, MapPin, Camera, CheckCircle2, X as XIcon, ArrowLeft, SkipForward } from "lucide-react";

// ==============================
// Mock tour data for Fell's Point, Maryland
// ==============================
const STOPS = [
  {
    id: 1,
    title: "Broadway Square",
    excerpt: "Historic market square at the heart of Fell's Point.",
    details:
      "Broadway Square has been a public gathering space since the 18th century. Stand in the center and notice how the streets radiate outward — a clue to the neighborhood’s maritime past.",
    photo: "https://placehold.co/800x800",
    audio: "audio1.mp3",
  },
  {
    id: 2,
    title: "Thames Street Waterfront",
    excerpt: "Cobblestone streets along the harbor with historic taverns.",
    details:
      "Walk the length of Thames Street to feel the old port’s rhythm — ships once queued here, and the taverns tell the story of sailors who never quite left.",
    photo: "https://placehold.co/800x800",
    audio: "audio2.mp3",
  },
  {
    id: 3,
    title: "The Horse You Came In On Saloon",
    excerpt: "America’s oldest continually operating saloon, linked to Edgar Allan Poe.",
    details:
      "Step under the swinging doors and imagine Poe slipping into the corner. The creak of the wood and the patina on the bar are as much the exhibit as any plaque.",
    photo: "https://placehold.co/800x800",
    audio: "audio3.mp3",
  },
  {
    id: 4,
    title: "Frederick Douglass–Isaac Myers Maritime Park",
    excerpt: "Museum honoring African American maritime heritage.",
    details:
      "This waterfront site celebrates the first African American–owned shipyard in the U.S. Pause at the rail for one last look across the working harbor.",
    photo: "",
    audio: "audio4.mp3",
  },
];

// ==============================
// Helpers
// ==============================
const cx = (...parts) => parts.filter(Boolean).join(" ");

// Simple confetti burst overlay (no external libs)
function ConfettiBurst() {
  const colors = ["#EC555C", "#3B82F6", "#FFD166", "#06D6A0", "#8338EC", "#FF9F1C"]; // coral, blue + accents
  const pieces = Array.from({ length: 80 });
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {0%{transform: translateY(-10vh) rotate(0);}100%{transform: translateY(110vh) rotate(720deg);}}
      `}</style>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1 + Math.random() * 1.6;
        const sizeW = 6 + Math.random() * 6;
        const sizeH = 8 + Math.random() * 10;
        const bg = colors[i % colors.length];
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `-10vh`,
              width: `${sizeW}px`,
              height: `${sizeH}px`,
              backgroundColor: bg,
              opacity: 0.9,
              borderRadius: 2,
              animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

// ==============================
// Dev smoke tests (runtime)
// ==============================
function runSmokeTests() {
  try {
    console.assert(Array.isArray(STOPS) && STOPS.length > 0, "STOPS should be a non-empty array");
    console.assert(typeof STOPS[0].title === "string", "Stop has a title");
    setTimeout(() => {
      console.assert(!!document.querySelector("header"), "Header renders");
      console.assert(!!document.querySelector("#stops"), "Stops section renders");
      console.assert(!!document.querySelector("#map"), "Map section renders");
      console.assert(!!document.querySelector('button[data-live-start]'), 'Start Live Tour button present');
      const expandedBtns = Array.from(document.querySelectorAll('button[data-expander][aria-expanded="true"]'));
      console.assert(expandedBtns.length <= 1, 'Only one card should be expanded at a time');
      // New tests: sticky mobile bar exists & map indentation class is present
      console.assert(!!document.querySelector('#mobile-sticky'), 'Mobile sticky footer present');
      const map = document.querySelector('#map');
      console.assert(map && map.className.includes('ml-12'), 'Map is indented (ml-12)');
    }, 0);
  } catch {}
}

// ==============================
// Main component
// ==============================
export default function SelfGuidedTour() {
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]); // keep as array for compatibility; enforce single-open
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liveOverlay, setLiveOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    runSmokeTests();
  }, []);

  const firstTodoIdx = (checkedList = checked) => STOPS.findIndex((s) => !checkedList.includes(s.id));

  // Expand a card, auto-complete all previous, and ensure only one open
  const expandOne = (id) => {
    const idx = STOPS.findIndex((s) => s.id === id);
    if (idx === -1) return;
    // auto-check all previous
    setChecked((prev) => {
      const prevIds = STOPS.slice(0, idx).map((s) => s.id);
      const merged = Array.from(new Set([...prev, ...prevIds]));
      return merged;
    });
    setExpanded([id]);
    setCurrent(idx);
    // scroll into view
    const el = document.getElementById(`stop-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCheck = (id) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleExpand = (id) => {
    const isOpen = expanded.includes(id);
    if (isOpen) {
      setExpanded([]);
    } else {
      expandOne(id);
    }
  };

  const count = checked.length;
  const max = STOPS.length;
  const allDone = count === max && max > 0;

  // Kick confetti when tour completes
  useEffect(() => {
    if (allDone) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2200);
      return () => clearTimeout(t);
    }
  }, [allDone]);

  const goPrev = () => {
    const openId = expanded[0];
    if (!openId) return;
    const idx = STOPS.findIndex((s) => s.id === openId);
    if (idx > 0) expandOne(STOPS[idx - 1].id);
  };

  const goNext = () => {
    // If something is open, mark it done before advancing
    const openId = expanded[0];
    let nextChecked = checked;
    if (openId && !checked.includes(openId)) {
      nextChecked = [...checked, openId];
      setChecked(nextChecked);
    }
    const idx = firstTodoIdx(nextChecked);
    if (idx === -1) {
      setExpanded([]);
      return;
    }
    expandOne(STOPS[idx].id);
  };

  const restartTour = () => {
    setChecked([]);
    setExpanded([]);
    setCurrent(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startLive = () => {
    const idx = firstTodoIdx();
    setCurrent(idx === -1 ? 0 : idx);
    setLiveOverlay(true);
  };

  const nextInLive = () => {
    // Auto-mark current as done when advancing
    const stop = STOPS[current];
    if (stop && !checked.includes(stop.id)) setChecked((prev) => [...prev, stop.id]);
    const idx = firstTodoIdx();
    if (idx === -1) {
      setLiveOverlay(false);
      return;
    }
    setCurrent(idx);
  };

  const backInLive = () => {
    const prevIdx = Math.max(0, current - 1);
    setCurrent(prevIdx);
  };

  const skipInLive = () => {
    const idx = firstTodoIdx();
    if (idx === -1) {
      setLiveOverlay(false);
      return;
    }
    // do not mark done; just move to next unchecked
    setCurrent(idx);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiBurst />}

      {/* Hero */}
      <header className="relative isolate grid min-h-[40vh] place-items-center overflow-hidden bg-gradient-to-tr from-[#EC555C]/40 via-[#3B82F6]/30 to-transparent">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center space-y-4 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-sm">Fell's Point Walking Tour</h1>
          {/* Coral pill re-used as subtitle (consistent with other pages) */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EC555C] px-5 py-1.5 text-sm font-extrabold text-white shadow">
            Self‑Guided Tour
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              data-live-start
              onClick={() => { if (allDone) { restartTour(); } startLive(); }}
              className="rounded-full bg-white/95 text-[#3B82F6] px-5 py-2 font-bold shadow hover:bg-white"
            >
              {allDone ? 'Restart Live Tour' : 'Start Live Tour'}
            </button>
            <button className="rounded-full bg-white/95 text-[#3B82F6] px-5 py-2 font-bold shadow hover:bg-white">Save</button>
            <button className="rounded-full bg-white/95 text-[#3B82F6] px-5 py-2 font-bold shadow hover:bg-white">Share</button>
          </div>
        </div>
      </header>

      {/* Main layout: Stops (primary) + Right Rail (Progress/Congrats) */}
      <main className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 px-4 py-6">
        {/* Stops list with dotted tour style */}
        <section id="stops" className="md:col-span-8 relative space-y-6">
          <div className="absolute left-5 top-0 bottom-0 border-l-4 border-dotted border-[#3B82F6]" aria-hidden="true"></div>
          <ol className="space-y-6 relative">
            {STOPS.map((stop, idx) => {
              const isChecked = checked.includes(stop.id);
              const isOpen = expanded.includes(stop.id);
              const isCurrent = idx === current;
              const panelId = `panel-${stop.id}`;
              const thumb = stop.photo || "https://placehold.co/200x200?text=No+Photo";
              return (
                <li id={`stop-${stop.id}`} key={stop.id} className="relative ml-12">
                  {/* Pin icon */}
                  <div className="absolute -left-9 top-2 flex items-center justify-center h-8 w-8 rounded-full bg-[#3B82F6] text-white ring-4 ring-white shadow">
                    {idx + 1}
                  </div>

                  <div
                    className={cx(
                      "rounded-2xl border bg-white p-4 shadow-sm transition",
                      isCurrent && "ring-2 ring-[#3B82F6]",
                      isChecked ? "opacity-95" : ""
                    )}
                  >
                    {/* Row: thumbnail (left) → text (center) → actions (right) */}
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <label className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-50 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(stop.id)}
                          className="h-5 w-5 text-[#EC555C] focus:ring-[#EC555C] rounded"
                        />
                      </label>

                      {/* Thumbnail on the LEFT (hidden when expanded) */}
                      {!isOpen && (
                        <img src={thumb} alt="" className="h-16 w-16 rounded-md object-cover shrink-0" />
                      )}

                      {/* Main text */}
                      <button
                        data-expander
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        onClick={() => toggleExpand(stop.id)}
                        className="flex-1 text-left"
                      >
                        <h3 className={cx("font-bold text-lg", isChecked && "line-through")}>{stop.title}</h3>
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-1">{stop.excerpt}</p>
                      </button>

                      {/* Actions: Play then Chevron on the RIGHT */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrent(idx);
                            setPlaying((p) => (isCurrent ? !p : true));
                          }}
                          className="rounded-md bg-[#EC555C] text-white px-3 py-1 text-xs font-semibold inline-flex items-center gap-1"
                          aria-label={playing && isCurrent ? "Pause audio" : "Play audio"}
                        >
                          {playing && isCurrent ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{playing && isCurrent ? "Pause" : "Play"}</span>
                        </button>
                        <button
                          onClick={() => toggleExpand(stop.id)}
                          aria-controls={panelId}
                          aria-expanded={isOpen}
                          className="grid place-items-center h-8 w-8 rounded-full border bg-white shadow"
                          title={isOpen ? "Collapse" : "Expand"}
                        >
                          <ChevronRight className={cx("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded content — inline, full width, on base card background */}
                    {isOpen && (
                      <div id={panelId} className="mt-4 space-y-3 text-sm text-neutral-800">
                        {/* Full-width photo (optional) */}
                        {stop.photo && (
                          <img data-stop-img src={stop.photo} alt="" className="rounded-xl w-full h-64 object-cover" />
                        )}

                        {/* Single details block (editor-controlled) */}
                        <p>{stop.details || stop.excerpt}</p>

                        {/* Control bar: Go Back (left), Add Photo/Note (center), Next/Finish (right) */}
                        <div className="flex items-center justify-between pt-2">
                          <button onClick={goPrev} className="rounded-lg border px-3 py-2 font-semibold inline-flex items-center gap-2 text-neutral-700">
                            <ArrowLeft className="h-4 w-4" /> Go back
                          </button>

                          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[#3B82F6] font-semibold">
                            <Camera className="h-4 w-4" /> Add a photo or note
                          </button>

                          {(() => {
                            const remaining = STOPS.filter(s => !checked.includes(s.id));
                            const isLast = remaining.length === 1 && remaining[0].id === stop.id;
                            return (
                              <button onClick={goNext} className="rounded-lg bg-[#3B82F6] text-white px-4 py-2 font-semibold inline-flex items-center gap-2">
                                {isLast ? 'Finish' : 'Next stop'} <ChevronRight className="h-4 w-4" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Map sits BELOW stops to keep the primary flow clean; indented so it doesn't clash with dotted spine */}
          <section id="map" className="mt-8 ml-12 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#EC555C]" /> Map
            </div>
            <div className="h-72 bg-neutral-100 rounded-xl" />
            <p className="mt-2 text-xs text-neutral-500">Interactive map loads in production.</p>
          </section>
        </section>

        {/* Right rail: Progress card or Congrats (sticky on desktop) */}
        <aside className="md:col-span-4 space-y-4 md:sticky md:top-6 self-start">
          {!allDone ? (
            <div className="rounded-2xl border-2 border-[#EC555C] bg-white p-6 shadow-md text-center">
              <div className="text-xl font-black text-[#3B82F6] mb-2">Tour Progress</div>
              <div className="text-3xl font-extrabold text-[#EC555C]">{count}/{max}</div>
              <div className="text-sm text-neutral-700 mt-1">Stops completed</div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 shadow-md text-center bg-gradient-to-br from-[#3B82F6] to-[#EC555C] text-white">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-2xl font-extrabold">Congrats — Tour Complete!</div>
              <div className="mt-2 text-sm opacity-90">You visited all {max} stops in Fell's Point.</div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button onClick={restartTour} className="rounded-full bg-white/95 text-[#3B82F6] px-4 py-2 font-bold shadow hover:bg-white">Restart tour</button>
                <button className="rounded-full border border-white/70 px-4 py-2 font-semibold">Share</button>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Mobile sticky progress anchor */}
      <div id="mobile-sticky" className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur">
        {!allDone ? (
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="font-semibold">Progress: {count}/{max}</div>
            <button onClick={goNext} className="rounded-full bg-[#3B82F6] text-white px-4 py-2 font-semibold">
              Next stop →
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="font-semibold">Tour complete 🎉</div>
            <div className="flex items-center gap-2">
              <button onClick={restartTour} className="rounded-full bg-[#3B82F6] text-white px-3 py-2 font-semibold">Restart</button>
              <button className="rounded-full border px-3 py-2 font-semibold">Share</button>
            </div>
          </div>
        )}
      </div>

      {/* Live Tour Overlay (single stop per screen, streamlined) */}
      {liveOverlay && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="flex h-full flex-col">
            {/* Overlay header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div className="text-base font-extrabold text-[#3B82F6]">Step {current + 1} of {max}</div>
              <button
                onClick={() => setLiveOverlay(false)}
                className="rounded-full border px-3 py-1 text-sm inline-flex items-center gap-2"
              >
                <XIcon className="h-4 w-4" /> Exit
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {(() => {
                const stop = STOPS[current];
                if (!stop) return null;
                const img = stop.photo || "https://placehold.co/800x800?text=No+Photo";
                return (
                  <div className="mx-auto max-w-3xl p-4 space-y-4">
                    {stop.photo && <img src={img} alt="" className="w-full h-80 rounded-2xl object-cover" />}

                    <div>
                      <h2 className="text-2xl font-extrabold">{stop.title}</h2>
                      <p className="mt-1 text-neutral-700">{stop.details || stop.excerpt}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setPlaying((p) => !p)}
                        className="rounded-lg bg-[#EC555C] text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                        aria-label={playing ? "Pause audio" : "Play audio"}
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {playing ? "Pause audio" : "Play audio"}
                      </button>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[#3B82F6] font-semibold">
                      <Camera className="h-4 w-4" /> Add a photo or note
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Overlay footer actions — BIG primary Next that auto-completes */}
            <div className="border-t border-neutral-200 p-4">
              <div className="mx-auto max-w-3xl flex items-center justify-between gap-2">
                <button
                  onClick={backInLive}
                  className="rounded-full border px-4 py-2 font-semibold inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={skipInLive}
                  className="rounded-full border px-4 py-2 font-semibold inline-flex items-center gap-2"
                >
                  <SkipForward className="h-4 w-4" /> Skip
                </button>
                {(() => {
                  const remaining = STOPS.filter(s => !checked.includes(s.id));
                  const currentStop = STOPS[current];
                  const isLast = currentStop && remaining.length === 1 && remaining[0].id === currentStop.id;
                  return (
                    <button
                      onClick={nextInLive}
                      className="rounded-full bg-[#3B82F6] text-white px-6 py-3 text-base font-extrabold"
                    >
                      {isLast ? 'Finish' : 'Next stop →'}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="pb-16 md:pb-10 pt-6 text-center text-sm text-neutral-600 border-t border-neutral-200">
        © {new Date().getFullYear()} Self‑Guided Tours
      </footer>
    </div>
  );
}
