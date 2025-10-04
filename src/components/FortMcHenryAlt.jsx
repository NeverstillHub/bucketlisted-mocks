import { useState, useEffect } from "react";
import { BookmarkCheck, Heart, Navigation2, ChevronRight, HelpCircle, Plus, X, Pencil, Trash2, SquareCheckBig } from "lucide-react";

// Brand checkbox icon to match Bucketlisted style
function BrandCheckIcon({ checked, className }:{ checked: boolean; className?: string }){
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill={checked ? '#EC555C' : '#ffffff'} stroke="#111827" strokeWidth="2" />
      {checked && (
        <path d="M7 12.5l3 3 7-7" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// ==========================================
// Shared UI tokens (aligned with List page)
// ==========================================
const ui = {
  group: "isolate inline-flex rounded-full shadow-sm",
  btnBase:
    "px-4 h-10 text-sm md:text-base font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6]",
  btnBrand: "bg-white border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white",
  btnActive: "bg-[#3B82F6] text-white border-[#3B82F6]",
  btnGhost: "px-3 h-9 md:h-10 text-sm font-semibold rounded-full border border-transparent text-[#3B82F6] hover:bg-[#3B82F6]/10",
  left: "rounded-l-full",
  right: "rounded-r-full",
  solo: "rounded-full",
};
const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

// --- Tiny pure helper + smoke tests ---
// group bursts of photos taken within a time window (ms) into one visit id
export function groupIntoVisits(timestamps: number[], windowMs: number): number[] {
  if (timestamps.length === 0) return [];
  const sorted = [...timestamps].sort((a,b)=>a-b);
  const groups: number[] = [0];
  for (let i=1;i<sorted.length;i++) {
    const prev = sorted[i-1];
    const curr = sorted[i];
    groups.push(curr - prev <= windowMs ? groups[groups.length-1] : groups[groups.length-1] + 1);
  }
  return groups;
}

export default function BucketlistedItemPolished() {
  // Existing smoke tests + a couple extra (do not remove)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      console.assert(!!document.querySelector('header'), 'Header renders');
      // these sections should exist in DOM structure
      console.assert(!!document.querySelector('#guide'), 'Guide section renders');
      console.assert(!!document.querySelector('#faq'), 'FAQ section renders');
      console.assert(!!document.querySelector('#tips'), 'Tips section renders');
      // sub-nav presence
      const subnavLinks = document.querySelectorAll('.subnav-bar nav a');
      console.assert(subnavLinks.length >= 3, 'Sub-nav has items');
      console.assert(!document.querySelector('a[href="#visits"]'), 'Visits link hidden when not complete');
      // right rail/aside exists & is singular
      console.assert(document.querySelectorAll('aside').length === 1, 'One aside renders');
      console.assert(!!document.querySelector('aside .right-rail [data-test="type-tags"]'), 'Type & Tags card renders');
      console.assert(!!document.querySelector('aside .right-rail [data-test="location"]'), 'Location card renders');
      console.assert(document.querySelectorAll('aside .right-rail .store-promos .rounded-2xl').length === 3, 'Store promos render');
      // CTA row sanity
      console.assert(!!document.querySelector('.blp-cta-row button'), 'CTA row renders');
      console.assert(!!document.querySelector('a[href="#guide"]'), 'Guide link present');
      // pure function test (window of 2 minutes)
      const g = groupIntoVisits([0, 30_000, 60_000, 500_000], 120_000);
      console.assert(JSON.stringify(g) === JSON.stringify([0,0,0,1]), 'groupIntoVisits works');
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ItemPage />
    </div>
  );
}

function ItemPage() {
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [editVisit, setEditVisit] = useState<any>(null);
  const [showBeenOptions, setShowBeenOptions] = useState(false);
  const [showManageVisits, setShowManageVisits] = useState(false);
  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);
  // active section state
  const [activeSection, setActiveSection] = useState<string>('guide');
  
  const linkClass = (id: string) =>
    `px-2 py-2 text-sm md:text-[15px] font-medium ${
      activeSection === id
        ? 'text-slate-900 border-b-2 border-[#3B82F6]'
        : 'text-[#3B82F6] hover:text-[#1d4ed8] hover:underline'
    }`;

  useEffect(() => {
    const ids = [...(isComplete ? (['visits'] as const) : []), 'guide', 'faq', 'tips'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection((entry.target as HTMLElement).id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.6] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [isComplete]);

  return (
    <div>
      {/* ================================= Hero (polished to match List) ================================= */}
      <header className="relative isolate grid min-h-[55vh] md:min-h-[65vh] place-items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#EC555C]/25 via-[#3B82F6]/20 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 text-center">
          <div className="space-y-3">
            {/* Title + subtitle */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow">Fort McHenry</h1>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#EC555C] px-5 py-1.5 text-base font-extrabold text-white shadow md:text-lg">
              HOME OF THE NATIONAL ANTHEM
            </div>

            {/* CTA row — unified buttons */}
            <div className="blp-cta-row mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => { if (!isComplete) { setIsComplete(true); } else { setShowBeenOptions(true); } }}
                className={cx(ui.btnBase, isComplete ? ui.btnActive : ui.btnBrand, ui.solo)}
              >
                <BrandCheckIcon checked={isComplete} className="h-5 w-5 mr-1 inline"/> I’ve Been
              </button>
              <a href="#" className={cx(ui.btnBase, ui.btnBrand, ui.solo, 'inline-flex items-center justify-center')}><Navigation2 className="h-5 w-5 mr-1 inline"/> Go</a>
              <button onClick={()=>{setEditVisit(null); setShowSave(true);}} className={cx(ui.btnBase, ui.btnBrand, ui.solo)}><Heart className="h-5 w-5 mr-1 inline"/> Save to…</button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================= Sub-nav (full-width bar above content) ======================= */}
      <div className="subnav-bar sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="h-11 flex items-center gap-4">
            {isComplete && <a href="#visits" className={linkClass('visits')}>Visits</a>}
            <a href="#guide" className={linkClass('guide')}>Guide</a>
            <a href="#faq" className={linkClass('faq')}>FAQ</a>
            <a href="#tips" className={linkClass('tips')}>Tips</a>
          </nav>
        </div>
      </div>

      {/* ================================= Main grid: Left content + Right rail ================================= */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-4 pb-6 md:grid-cols-12">
        {/* Left column */}
        <section className="md:col-span-8 lg:col-span-8">
          {/* Visits (first when complete) */}
          {isComplete && (
            <section id="visits" className="mt-4 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Memories</p>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{setEditVisit(null); setShowVisit(true);}} className={cx(ui.btnBase, ui.btnActive, ui.solo)} style={{height:'auto'}}>Add visit</button>
                  {visits.length > 0 && (
                    <button onClick={()=> setShowManageVisits(true)} className="text-sm font-medium text-[#3B82F6] hover:underline px-2 py-1 rounded">Manage</button>
                  )}
                </div>
              </div>
              {visits.length > 0 ? (
                <ul className="mt-4 divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
                  {visits.map((v) => (
                    <li key={v.id} className="p-0">
                      <button
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                        onClick={() => setExpandedVisitId(expandedVisitId === v.id ? null : v.id)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{v.dateLabel}{v.note ? ' • ' + v.note : ''}</p>
                          <div className="mt-1 flex items-center gap-1">
                            {(v.photos?.slice(0,3) || []).map((p: any, i: number)=> (
                              <img key={i} src={p.src} alt="" className="h-6 w-8 rounded-md object-cover"/>
                            ))}
                            {(!v.photos || v.photos.length===0) && [0,1,2].map((i)=> (
                              <span key={i} className="h-6 w-8 rounded-md bg-slate-200"></span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e)=>{ e.stopPropagation(); setEditVisit(v); setShowVisit(true); }} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100" title="Edit">
                            <Pencil className="h-4 w-4"/>
                          </button>
                          <button onClick={(e)=>{ e.stopPropagation(); setVisits(prev=>prev.filter(x=>x.id!==v.id)); }} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100" title="Delete">
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </div>
                      </button>
                      {expandedVisitId === v.id && (
                        <div className="px-4 pb-4">
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {(v.photos || []).slice(0,6).map((p: any, idx: number)=> (
                              <div key={idx} className="space-y-1">
                                <img src={p.src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover bg-slate-200"/>
                                {p.caption && <p className="text-xs text-slate-600">{p.caption}</p>}
                              </div>
                            ))}
                            {(!v.photos || v.photos.length===0) && [0,1,2,3,4,5].map((i)=> (
                              <div key={i} className="aspect-[4/3] rounded-lg bg-slate-200"></div>
                            ))}
                          </div>
                          {v.note && <p className="mt-3 text-sm text-slate-700">{v.note}</p>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">No visits yet — add a quick note or photo to start your memories. It takes 10 seconds and helps other travelers.</div>
              )}
            </section>
          )}

          {/* Guide */}
          <section id="guide" className="mt-4 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overview</p>
            <div className={!guideExpanded ? 'max-h-32 overflow-hidden relative' : ''}>
              {!guideExpanded && <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"/>}
              <p className="mt-2 text-sm text-slate-800">Where the Star-Spangled Banner was born: a compact fort with sweeping harbor views and living history. It’s an easy win—flat paths, open lawns, and a visitor film that sets the scene in under 15 minutes.</p>
              <p className="mt-2 text-sm text-slate-800">Start at the visitor center for your map, then follow the ramp to the east wall for the best harbor vantage. Time your visit for a flag raising or lowering—the ranger talk turns the place into a story you’ll remember.</p>
              <p className="mt-2 text-sm text-slate-800">For a slower visit, circle the star-shaped ramparts clockwise and watch ships move in and out of the Patapsco.</p>
            </div>
            {!guideExpanded && (
              <div className="mt-2">
                <button onClick={()=>setGuideExpanded(true)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400">Read more <ChevronRight className="h-4 w-4"/></button>
              </div>
            )}
            {guideExpanded && (
              <div className="mt-4">
                <div className="mb-3 text-sm">
                  <strong>In this guide</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>History & context</li>
                    <li>What to see</li>
                    <li>Getting there & parking</li>
                    <li>Accessibility</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-800">Long-form guide content would live here. For this demo, the TOC shows how sections would be organized once expanded.</p>
                <div className="mt-3 text-right">
                  <button onClick={()=>setGuideExpanded(false)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400">Collapse guide</button>
                </div>
              </div>
            )}
          </section>

          {/* FAQ */}
          <section id="faq" className="mt-4 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Popular Q&amp;A</p>

            <details className="mt-3 border-t border-slate-200 pt-3">
              <summary className="cursor-pointer font-semibold">What’s new? <span className="ml-2 inline-flex items-center rounded-full bg-slate-900 text-white text-[11px] px-2 py-[1px]">Updated today</span></summary>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                <li>Sunset flag lowering 6:30pm (Fri–Sun)</li>
                <li>Temporary exhibit: War of 1812</li>
                <li>Harbor shuttle every 20 minutes</li>
              </ul>
            </details>

            <details className="mt-3 border-t border-slate-200 pt-3">
              <summary className="cursor-pointer font-semibold">What are the hours? <span className="text-slate-500 font-normal">— 9:00–17:00 (daily)</span></summary>
              <p className="mt-2 text-sm">Hours may vary for holidays and special events; check the official site before you go.</p>
            </details>

            <details className="mt-3 border-t border-slate-200 pt-3">
              <summary className="cursor-pointer font-semibold">How much does it cost? <span className="text-slate-500 font-normal">— $15 adults · kids free</span></summary>
              <p className="mt-2 text-sm">Admission covers the fort and visitor center exhibits; special tours may be extra.</p>
            </details>

            <details className="mt-3 border-t border-slate-200 pt-3">
              <summary className="cursor-pointer font-semibold">Where do I park? <span className="text-slate-500 font-normal">— On-site lot + overflow</span></summary>
              <p className="mt-2 text-sm">Lots can fill on weekends by mid-day; arrive early or consider rideshare.</p>
            </details>

            <details className="mt-3 border-t border-slate-200 pt-3">
              <summary className="cursor-pointer font-semibold">Is it accessible? <span className="text-slate-500 font-normal">— Flat paths; accessible restrooms</span></summary>
              <p className="mt-2 text-sm">Most ramparts have graded access; some historic areas may have uneven surfaces.</p>
            </details>

            {/* Ask a question at the bottom */}
            <div className="mt-4">
              <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <span className="text-slate-400 mr-2"><HelpCircle className="h-4 w-4"/></span>
                <input className="flex-1 outline-none bg-transparent" placeholder="Ask a question…" />
                <button className={cx(ui.btnBase, ui.btnActive, ui.solo)} style={{height:'auto'}}>Ask</button>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section id="tips" className="mt-4 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Travel Tips</p>
            <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
              <li>Arrive 30 min before sunset for the lowering ceremony and best light.</li>
              <li>Wind picks up on the ramparts—bring a light jacket even in summer.</li>
              <li>Stroller route: enter via visitor center, ramp to east wall loop.</li>
            </ul>
          </section>
        </section>

        {/* Right rail */}
        <aside className="md:col-span-4 lg:col-span-4">
          <div className="right-rail sticky top-4 space-y-4">
            {/* Explore More */}
            <div data-test="type-tags" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Explore More</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full border border-slate-200 px-2 py-0.5">Historic Fort</span>
                <span className="rounded-full border border-slate-200 px-2 py-0.5">history</span>
                <span className="rounded-full border border-slate-200 px-2 py-0.5">harbor views</span>
                <span className="rounded-full border border-slate-200 px-2 py-0.5">family-friendly</span>
              </div>
            </div>

            {/* Map & Location */}
            <div data-test="location" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</div>
              <div className="mt-3 h-40 w-full rounded-xl bg-slate-100" />
              <div className="mt-2 text-sm text-slate-700"><span className="font-semibold">USA</span> <span className="text-slate-400">›</span> Maryland <span className="text-slate-400">›</span> Baltimore</div>
              <a href="#" className="mt-2 inline-flex items-center text-sm font-semibold text-[#3B82F6] hover:underline">View on Google Maps</a>
            </div>

            {/* Store promos (mirrors List style) */}
            <div className="store-promos space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <div className="mb-2 font-semibold">Personalized Poster</div>
                <div className="h-40 w-full rounded-xl bg-slate-100 mb-3" />
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
                <div className="mb-2 font-semibold">Limited‑Edition Fort Print</div>
                <div className="text-sm text-slate-700">Numbered run, archival inks, optional frame. 30‑day returns.</div>
                <button className="mt-3 w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700">See sizes & frames</button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ============================== Modals ============================== */}
      {showVisit && (
        <VisitModal
          initial={editVisit}
          onSave={(data)=>{
            if (editVisit && editVisit.id) {
              setVisits(prev=>prev.map(v=> v.id===editVisit.id ? {...editVisit, ...data} : v));
            } else {
              const id = data?.id || Date.now();
              setVisits(prev=>[{ id, ...data }, ...prev]);
            }
            setIsComplete(true);
            setEditVisit(null);
            setShowVisit(false);
          }}
          onClose={()=>{ setEditVisit(null); setShowVisit(false); }}
        />
      )}
      {showSave && <SaveModal onClose={()=>setShowSave(false)} />}
      {showBeenOptions && (
        <BeenOptionsModal
          onAddAnother={() => { setShowBeenOptions(false); setEditVisit(null); setShowVisit(true); }}
          onManage={() => { setShowBeenOptions(false); setShowManageVisits(true); }}
          onUncheck={() => { setShowBeenOptions(false); setIsComplete(false); }}
          onClose={() => setShowBeenOptions(false)}
        />
      )}
      {showManageVisits && (
        <ManageVisitsModal
          visits={visits}
          onEdit={(v)=>{ setEditVisit(v); setShowManageVisits(false); setShowVisit(true); }}
          onDelete={(id)=>{ setVisits(prev=>prev.filter(x=>x.id!==id)); }}
          onClose={()=> setShowManageVisits(false)}
        />
      )}

      <footer className="pb-20 md:pb-8" />
    </div>
  );
}

function VisitModal({ onClose, onSave, initial }:{ onClose: ()=>void; onSave: (p:any)=>void; initial: any }){
  const [dateChoice, setDateChoice] = useState(initial?.dateChoice || 'Today');
  const [timeChoice, setTimeChoice] = useState(initial?.timeChoice || '60');
  const [note, setNote] = useState(initial?.note || '');
  const [photos, setPhotos] = useState<any[]>(initial?.photos || []);
  const dateOptions = ['Today','This week','Pick date'];
  const timeOptions = ['15','30','60','90','120+'];

  function onFilesSelected(e:any){
    const files = Array.from(e.target.files || []).slice(0,6);
    Promise.all(files.map((f:any)=> new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res({src:fr.result as string, caption:''}); fr.onerror=rej; fr.readAsDataURL(f);})))
      .then((items:any)=> setPhotos(items))
      .catch(()=>{});
  }
  function updateCaption(i:number, val:string){ setPhotos(prev=> prev.map((p,idx)=> idx===i? {...p, caption:val} : p)); }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <p className="text-sm font-semibold">{initial && initial.id ? 'Edit visit' : 'Add visit'}</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">When did you go?</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {dateOptions.map((x)=> (
                <button key={x} onClick={()=>setDateChoice(x)} className={`rounded-xl border px-3 py-2 ${dateChoice===x? 'border-slate-900' : 'border-slate-300'}`}>{x}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Time spent</p>
            <div className="mt-1 grid grid-cols-5 gap-2">
              {timeOptions.map((x)=> (
                <button key={x} onClick={()=>setTimeChoice(x)} className={`rounded-xl border px-3 py-2 ${timeChoice===x? 'border-slate-900' : 'border-slate-300'}`}>{x}m</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Notes</p>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2" rows={3} maxLength={140} placeholder="140 characters…"/>
          </div>

          <div>
            <p className="text-xs text-slate-500">Photos & captions (optional)</p>
            <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="mt-1"/>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((p, idx)=> (
                  <div key={idx} className="space-y-1">
                    <img src={p.src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover bg-slate-100 ring-1 ring-slate-200"/>
                    <input value={(p as any).caption} onChange={(e)=>updateCaption(idx, (e.target as HTMLInputElement).value)} className="w-full rounded-lg border border-slate-300 p-1 text-xs" placeholder="Caption (optional)"/>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold"
              onClick={() => {
                const payload = {
                  id: initial?.id || Date.now(),
                  dateLabel: dateChoice,
                  dateChoice,
                  timeSpent: timeChoice,
                  timeChoice,
                  note: note.trim(),
                  photos
                };
                onSave && onSave(payload);
              }}
            >{initial && initial.id ? 'Save changes' : 'Save visit'}</button>
            <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveModal({ onClose }:{ onClose: ()=>void }){
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <p className="text-sm font-semibold">Save to…</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-2">
          <button className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm"><span>Bucket List (default)</span><BookmarkCheck className="h-5 w-5"/></button>
          <button className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm"><span>Baltimore Weekend</span></button>
          <button className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm"><span>Stadium Tour</span></button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-sm font-medium"><Plus className="h-4 w-4"/> Create new list</button>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold" onClick={onClose}>Done</button>
            <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeenOptionsModal({ onAddAnother, onManage, onUncheck, onClose }:{ onAddAnother: ()=>void; onManage: ()=>void; onUncheck: ()=>void; onClose: ()=>void; }){
  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 p-4">
        <p className="text-sm font-semibold mb-3">What would you like to do?</p>
        <div className="grid gap-2 text-sm">
          <button onClick={onAddAnother} className="rounded-xl border border-slate-300 px-3 py-2 text-left">Add another visit</button>
          <button onClick={onManage} className="rounded-xl border border-slate-300 px-3 py-2 text-left">Manage visits</button>
          <button onClick={onUncheck} className="rounded-xl border border-slate-300 px-3 py-2 text-left">Remove checkmark</button>
          <button onClick={onClose} className="rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ManageVisitsModal({ visits, onEdit, onDelete, onClose }:{ visits:any[]; onEdit:(v:any)=>void; onDelete:(id:number)=>void; onClose: ()=>void; }){
  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <p className="text-sm font-semibold">Manage visits</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-2">
          {visits.length === 0 ? (
            <p className="text-sm text-slate-600">No visits yet.</p>
          ) : (
            visits.map((v)=> (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{v.dateLabel}</p>
                  {v.note && <p className="text-slate-700">{v.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>onEdit(v)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4"/></button>
                  <button onClick={()=>onDelete(v.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100" title="Delete"><Trash2 className="h-4 w-4"/></button>
                </div>
              </div>
            ))
          )}
          <div className="mt-2 text-right">
            <button onClick={onClose} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
