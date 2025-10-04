import React, { useEffect, useState } from "react";

// ==============================
// Mock data
// ==============================
const ITEMS = [
  { id: 1, title: "Space Center Houston", excerpt: "Tour mission control, touch moon rocks, and catch a live astronaut talk." },
  { id: 2, title: "Houston Museum District", excerpt: "Walkable cluster of world-class museums across leafy boulevards." },
  { id: 3, title: "Houston Astros (Minute Maid Park)", excerpt: "Roof open? Even better. Grab a beer and cheer from the Crawford Boxes." },
  { id: 4, title: "Houston Livestock Show & Rodeo", excerpt: "Barbecue smoke, bucking broncs, and big-name concerts—Texas-sized." },
  { id: 5, title: "Houston Museum of Natural Science", excerpt: "Dinosaurs, planetarium, and a stunning hall of gems & minerals." },
  { id: 6, title: "Houston Zoo", excerpt: "Giraffes, gorillas, and shady paths in Hermann Park—great with kids." },
  { id: 7, title: "Buffalo Bayou Park", excerpt: "Skyline views, trails, and the famous bat colony at the Waugh Bridge." },
  { id: 8, title: "The Menil Collection", excerpt: "A serene, free art oasis—Rothko Chapel is steps away." },
  { id: 9, title: "Discovery Green", excerpt: "Downtown lawn with art, splash pads, and seasonal ice skating." },
  { id: 10, title: "Kemah Boardwalk", excerpt: "Rides, waterfront dining, and sunset over the bay." },
  { id: 11, title: "Galveston Day Trip", excerpt: "Historic Strand district, Pleasure Pier, and miles of beach." },
  { id: 12, title: "Art Car Museum", excerpt: "Quirky, shiny, and unmistakably Houston—tiny but memorable." },
];

// ==============================
// Helpers (URL + localStorage)
// ==============================
const parseChecksParam = (param: string): number[] => {
  return (param || "")
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n));
};

const loadChecks = (): number[] => {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlChecks = params.get("checks");
    if (urlChecks) return parseChecksParam(urlChecks);
    const raw = localStorage.getItem("bucketlisted:houston:checks");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveChecks = (ids: number[]) => {
  try { localStorage.setItem("bucketlisted:houston:checks", JSON.stringify(ids)); } catch {}
};

const makeProgressURL = (ids: number[]) => {
  const base = window.location.origin + window.location.pathname;
  if (!ids?.length) return base; // no checks → plain list URL
  const qs = new URLSearchParams({ checks: ids.join(",") }).toString();
  return `${base}?${qs}`;
};

// ==============================
// UI style system for controls (unifies Show/View/Share)
// ==============================
const ui = {
  group: "isolate inline-flex rounded-full shadow-sm",
  btnBase:
    "px-4 h-10 text-sm md:text-base font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6]",
  btnBrand: "bg-white border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white",
  btnActive: "bg-[#3B82F6] text-white border-[#3B82F6]",
  left: "rounded-l-full",
  right: "rounded-r-full",
  solo: "rounded-full",
};

// tiny helper to compose classes
const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

// ==============================
// Dev sanity tests (keep lightweight)
// ==============================
if (typeof window !== "undefined") {
  const base = window.location.origin + window.location.pathname;
  console.assert(makeProgressURL([]) === base, "makeProgressURL([]) should return base URL");
  console.assert(makeProgressURL([1, 2]).includes("checks=1,2"), "makeProgressURL should include checks list in order");
  console.assert(!makeProgressURL([1, 2]).endsWith(","), "makeProgressURL should not end with a trailing comma");
  console.assert(JSON.stringify(parseChecksParam("1, 2, x, 5")) === JSON.stringify([1,2,5]), "parseChecksParam should ignore non-numbers and trim");
  console.assert(JSON.stringify(parseChecksParam("")) === JSON.stringify([]), "parseChecksParam should handle empty string");
  // UI contract: active has brand bg
  console.assert(ui.btnActive.includes("bg-[#3B82F6]") && ui.btnBrand.includes("text-[#3B82F6]"), "UI control classes should include brand colors");
  // New: cx helper composes and skips falsy
  console.assert(cx("a", false, "b") === "a b", "cx() should join truthy parts with spaces");
}

// ==============================
// UI bits
// ==============================
function ProgressRing({ pct = 0, size = 22, stroke = 3 }: { pct?: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct / 100)) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#EC555C" // brand coral
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

const PosterCard = () => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-white shadow">
    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100" />
    <div className="relative p-3">
      <div className="mb-2 h-5 w-28 rounded bg-gray-200" />
      <div className="h-40 rounded bg-gray-200" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-gray-600">Add a name or dedication (e.g., "Jackson Family Trip • 2025")</div>
  </div>
);

// ==============================
// Main component
// ==============================
export default function HoustonListTemplateMock() {
  const [checked, setChecked] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [view, setView] = useState<"compact" | "expanded">("compact");
  const [shareMenu, setShareMenu] = useState(false);
  const [showFilter, setShowFilter] = useState<"all" | "todo" | "done">("all");
  const [showMenu, setShowMenu] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // init
  useEffect(() => setChecked(loadChecks()), []);
  useEffect(() => saveChecks(checked), [checked]);
  useEffect(() => {
    if (view === "expanded") setExpanded(ITEMS.map((i) => i.id));
    else setExpanded([]);
  }, [view]);

  // demo email pop
  useEffect(() => {
    const dismissed = localStorage.getItem("bucketlisted:houston:freeposter_dismissed");
    const t = setTimeout(() => { if (!dismissed) setShowPopover(true); }, 4000);
    return () => clearTimeout(t);
  }, []);

  const dismissPopover = () => {
    setShowPopover(false);
    try { localStorage.setItem("bucketlisted:houston:freeposter_dismissed", "1"); } catch {}
  };

  const toggleCheck = (id: number) => setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleExpand = (id: number) => setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const count = checked.length;
  const max = ITEMS.length;
  const pct = Math.round((count / max) * 100) || 0;

  const shareList = async () => {
    const url = makeProgressURL([]);
    if (navigator.share) { try { await navigator.share({ title: "Houston Bucket List", text: "Houston Bucket List", url }); } catch {}
    } else if (navigator.clipboard) { await navigator.clipboard.writeText(url); alert("List URL copied to clipboard"); }
  };
  const shareMyProgress = async () => {
    const url = makeProgressURL(checked);
    const text = `I've checked ${count}/${max} on the Houston Bucket List!`;
    if (navigator.share) { try { await navigator.share({ title: "My Houston progress", text, url }); } catch {}
    } else if (navigator.clipboard) { await navigator.clipboard.writeText(url); alert("Your progress link is copied to clipboard"); }
  };

  const filtered = ITEMS.filter((it) => {
    if (showFilter === "todo") return !checked.includes(it.id);
    if (showFilter === "done") return checked.includes(it.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================================= Hero ================================= */}
      <header className="relative isolate grid min-h-[55vh] md:min-h-[65vh] place-items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Replace with real travel photo via CSS background-image on production */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#EC555C]/25 via-[#3B82F6]/20 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">Houston Bucket List</h1>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#EC555C] px-5 py-1.5 text-base font-extrabold text-white shadow md:text-lg">
              60 Best Things To Do in Houston
            </div>
            {/* Elevator line only (no intro card) */}
            <div className="text-white/95 text-base md:text-lg">A curated mix of icons + local gems, optimized for a weekend.</div>
          </div>
        </div>
      </header>

      {/* ================================= Main ================================= */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-12">
        {/* Left column */}
        <section className="md:col-span-8 lg:col-span-8">
          {/* Toolbar: Show (left) + View (right) — unified styles */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative shrink-0">
              <div className={ui.group}>
                <button onClick={() => setShowMenu((s) => !s)} className={cx(ui.btnBase, ui.btnBrand, ui.left) + " whitespace-nowrap"}>
                  Show: {showFilter === "all" ? "All" : showFilter === "todo" ? "To do" : "Done"}
                </button>
                <button onClick={() => setShowMenu((s) => !s)} className={cx(ui.btnBase, ui.btnBrand, ui.right)} aria-label="More show options">▼</button>
              </div>
              {showMenu && (
                <div className="absolute left-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border bg-white shadow">
                  <button onClick={() => { setShowFilter("all"); setShowMenu(false); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">All</button>
                  <button onClick={() => { setShowFilter("todo"); setShowMenu(false); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">To do</button>
                  <button onClick={() => { setShowFilter("done"); setShowMenu(false); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Done</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className={ui.group}>
                <button className={cx(ui.btnBase, view === "compact" ? ui.btnActive : ui.btnBrand, ui.left)} onClick={() => setView("compact")}>Compact</button>
                <button className={cx(ui.btnBase, view === "expanded" ? ui.btnActive : ui.btnBrand, ui.right)} onClick={() => setView("expanded")}>Expanded</button>
              </div>
            </div>
          </div>

          {/* List */}
          <ol className="space-y-3 md:space-y-4">
            {filtered.map((item) => {
              const isChecked = checked.includes(item.id);
              const isOpen = expanded.includes(item.id);
              const number = ITEMS.findIndex((i) => i.id === item.id) + 1;

              return (
                <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* Checkbox coral (smaller visual, large hit area) */}
                    {(() => { const cid = `check-${item.id}`; return (
                      <label htmlFor={cid} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-slate-50 cursor-pointer">
                        <input
                          id={cid}
                          type="checkbox"
                          className="h-6 w-6 rounded border-slate-300 text-[#EC555C] accent-[#EC555C] focus:ring-[#EC555C]"
                          checked={isChecked}
                          onChange={() => toggleCheck(item.id)}
                          aria-label={`Mark ${item.title} done`}
                        />
                      </label>
                    ); })()}

                    {/* Rank badge — blue with white text */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-sm ring-1 ring-black/5 font-extrabold text-base md:text-lg">
                      {number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-1">
                        <button className="col-start-1 row-start-1 flex w-full items-center justify-between gap-2 text-left" onClick={() => toggleExpand(item.id)}>
                          <h3 className={`truncate text-lg md:text-xl font-bold ${isChecked ? "line-through decoration-2" : ""}`}>{item.title}</h3>
                          <svg className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z"/></svg>
                        </button>
                        {/* Right-aligned square thumb when collapsed */}
                        <div className={`hidden sm:block self-center row-span-2 ${isOpen ? "opacity-0" : "opacity-100"}`}>
                          <div className="h-16 w-16 rounded-lg bg-slate-100" />
                        </div>
                        {/* Tight excerpt */}
                        <p className="col-start-1 row-start-2 mt-0 text-sm md:text-base leading-snug text-slate-600 line-clamp-2">{item.excerpt}</p>
                      </div>
                      {/* Expanded content */}
                      {isOpen && (
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <div className="h-48 w-full rounded-xl bg-slate-100" />
                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <p>Why it's on the list: succinct, persuasive blurb explaining the appeal and best-time-to-go tips.</p>
                              <div className="flex flex-wrap gap-2">
                                <a href="#" className="rounded-lg border px-3 py-2 hover:bg-slate-50 text-[#3B82F6]">Read more</a>
                                <a href="#" className="rounded-lg border px-3 py-2 hover:bg-slate-50 text-[#3B82F6]">Get directions</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Right rail */}
        <aside className="md:col-span-4 lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            {/* Progress Pill — now the first right-rail card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <ProgressRing pct={pct} size={24} />
                  <div className="text-base md:text-lg font-semibold text-slate-900">{count}/{max}</div>
                </div>
                <div className="relative shrink-0">
                  <div className={ui.group}>
                    <button onClick={() => (count ? shareMyProgress() : shareList())} className={cx(ui.btnBase, ui.btnBrand, ui.left) + " whitespace-nowrap"}>
                      Share {count ? "my progress" : "list"}
                    </button>
                    <button onClick={() => setShareMenu((s) => !s)} className={cx(ui.btnBase, ui.btnBrand, ui.right)} aria-label="More share options">▼</button>
                  </div>
                  {shareMenu && (
                    <div className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow">
                      <button onClick={shareList} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Share list (blank)</button>
                      <button onClick={shareMyProgress} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Share my progress</button>
                      <button onClick={() => setShowPreview(true)} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Preview social image</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map (lazy in prod) */}
            <div id="map" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-semibold">Map</div>
              <div className="h-56 w-full rounded-xl bg-slate-100" />
              <p className="mt-2 text-xs text-slate-600">Map loads only when viewed in production for max performance.</p>
            </div>

            {/* Explore more in Houston */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-semibold">Explore more in Houston</div>
              <ul className="space-y-2 text-sm">
                <li><a className="text-[#3B82F6] hover:underline" href="#">12 Free Things To Do in Houston</a></li>
                <li><a className="text-[#3B82F6] hover:underline" href="#">Romantic Things To Do in Houston</a></li>
                <li><a className="text-[#3B82F6] hover:underline" href="#">Houston with Kids</a></li>
              </ul>
            </div>

            {/* Store promos */}
            <div id="store" className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <div className="mb-2 font-semibold">Personalized Poster</div>
                <div className="mb-3"><PosterCard /></div>
                <ul className="mb-3 list-inside list-disc text-sm text-slate-700">
                  <li>Add your name or dedication</li>
                  <li>Optional frame</li>
                  <li>Ships fast</li>
                </ul>
                <button className="w-full rounded-lg bg-[#EC555C] py-2 text-sm font-semibold text-white hover:opacity-90">Preview my poster</button>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
                <div className="mb-2 font-semibold">The Gift Bundle <span className="ml-2 rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">Most popular</span></div>
                <ul className="mb-3 list-inside list-disc text-sm text-slate-700">
                  <li>Poster + Pocket Book</li>
                  <li>Gift note card included</li>
                  <li>Personalize recipient name</li>
                  <li>Ready-to-gift sleeve</li>
                </ul>
                <div className="mb-2 text-xs text-slate-600">Great for birthdays • housewarmings • graduations</div>
                <button className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700">Get the bundle</button>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                <div className="mb-2 font-semibold">Limited‑Edition Houston Print</div>
                <div className="text-sm text-slate-700">Numbered run, archival inks, optional frame. 30‑day returns.</div>
                <button className="mt-3 w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700">See sizes & frames</button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ========================== Email capture popover ========================== */}
      {showPopover && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-2 text-lg font-extrabold">FREE Poster + Travel Guide</div>
            <p className="text-sm text-slate-600">Get a printable Houston poster and a quick-start weekend guide. We'll send it right to your inbox.</p>
            <div className="mt-3 flex gap-2">
              <input className="flex-1 rounded-lg border px-3 py-2" placeholder="you@example.com" />
              <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Send</button>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              <button onClick={dismissPopover} className="underline">No thanks</button>
            </div>
          </div>
        </div>
      )}

      {/* =============================== Social preview =============================== */}
      {showPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-extrabold">Share preview</div>
            <div className="relative overflow-hidden rounded-xl border bg-white">
              <div className="aspect-[1200/630] bg-gradient-to-tr from-[#FDECF0] via-white to-[#EAF2F8] p-6">
                <div className="flex h-full items-center justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EC555C] px-3 py-1 text-sm font-extrabold text-white">Houston Bucket List</div>
                    <div className="text-3xl font-black text-slate-900">{count}/{max} completed</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressRing pct={pct} size={80} stroke={8} />
                    <div className="text-4xl font-extrabold text-slate-900">{pct}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setShowPreview(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== Mobile action dock ============================== */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto max-w-3xl px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Progress pill becomes the mobile anchor (full) */}
            <div className="inline-flex items-center gap-2">
              <ProgressRing pct={pct} size={24} />
              <span className="text-base font-semibold">{count}/{max}</span>
            </div>
            <div className="relative shrink-0">
              <div className={ui.group}>
                <button onClick={() => (count ? shareMyProgress() : shareList())} className={cx(ui.btnBase, ui.btnBrand, ui.left) + " whitespace-nowrap"}>
                  Share {count ? "my progress" : "list"}
                </button>
                <button onClick={() => setShareMenu((s) => !s)} className={cx(ui.btnBase, ui.btnBrand, ui.right)} aria-label="More share options">▼</button>
              </div>
              {shareMenu && (
                <div className="absolute right-0 z-10 -top-1 -translate-y-full w-52 overflow-hidden rounded-xl border bg-white shadow">
                  <button onClick={shareList} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Share list (blank)</button>
                  <button onClick={shareMyProgress} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Share my progress</button>
                  <button onClick={() => setShowPreview(true)} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">Preview social image</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="pb-20 md:pb-8" />
    </div>
  );
}
