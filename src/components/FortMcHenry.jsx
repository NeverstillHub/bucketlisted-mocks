import { useState, useEffect } from "react";
import { BookmarkCheck, Heart, Navigation2, Map, ChevronRight, HelpCircle, Plus, X, Pencil, Trash2 } from "lucide-react";

export default function BucketlistedDesktopOnly() {
  // Lightweight runtime checks (acts as smoke tests in this sandbox)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      console.assert(!!document.querySelector('header'), 'Header renders');
      console.assert(!!document.querySelector('section'), 'At least one section renders');
      console.assert(!!document.querySelector('#guide'), 'Guide section renders');
      console.assert(!!document.querySelector('#faq'), 'FAQ section renders');
      console.assert(!!document.querySelector('#tips'), 'Tips section renders');
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="text-xl font-black tracking-tight mb-3">Bucketlisted — Place Page (Desktop Only)</h1>
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-neutral-100 text-xs text-neutral-600 px-3 py-2">Desktop preview</div>
          <DesktopMock />
        </div>
      </div>
    </div>
  );
}

function DesktopMock() {
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [editVisit, setEditVisit] = useState<any>(null);
  const [showBeenOptions, setShowBeenOptions] = useState(false);
  const [showManageVisits, setShowManageVisits] = useState(false);
  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);

  return (
    <div className="min-h-[70vh]">
      {/* Header (desktop) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-5 h-16 grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold">✓</span>
            <a href="#" className="text-lg font-black tracking-tight">BUCKETLISTED</a>
          </div>
          {/* Center: Primary menu (centered, equal style) */}
          <nav className="justify-center flex items-center gap-8 text-sm font-extrabold text-neutral-800">
            <a className="hover:text-neutral-900" href="#">Places</a>
            <a className="hover:text-neutral-900" href="#">Nearby</a>
            <a className="hover:text-neutral-900" href="#">Saved</a>
          </nav>
          {/* Right: empty for balance */}
          <div></div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[60vh] w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-200 via-rose-300 to-rose-500">
          {/* Center the hero content vertically within the hero image */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-6xl px-5 w-full">
              <div className="max-w-3xl mx-auto text-center">
                {/* Place badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-black/5 mx-auto">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px]">FM</span>
                  Anthem Fort
                </div>
                <h1 className="mt-2 text-6xl font-black leading-[0.95] text-white drop-shadow">Fort McHenry</h1>
                {/* Red subtitle bar */}
                <div className="mt-2 inline-block rounded-full bg-rose-600 text-white px-4 py-2 text-sm font-extrabold tracking-wide">HOME OF THE NATIONAL ANTHEM</div>

                {/* CTA row (in-hero) */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => { if (!isComplete) { setIsComplete(true); } else { setShowBeenOptions(true); } }}
                    className={`h-14 px-5 rounded-2xl font-semibold shadow-sm inline-flex items-center gap-2 ${isComplete ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}
                  >
                    <BookmarkCheck className="h-5 w-5"/> I’ve Been
                  </button>
                  <button className="h-14 px-5 rounded-2xl bg-white text-neutral-900 font-semibold shadow-sm inline-flex items-center gap-2"><Navigation2 className="h-5 w-5"/> Go</button>
                  <button onClick={()=>{setEditVisit(null); setShowSave(true);}} className="h-14 px-5 rounded-2xl bg-white text-neutral-900 font-semibold shadow-sm inline-flex items-center gap-2"><Heart className="h-5 w-5"/> Save to…</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Visits Bubble (shown only when checked off) */}
      {isComplete && (
        <section className="mx-auto max-w-6xl px-5 -mt-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Memories</p>
              <div className="flex items-center gap-2">
                <button onClick={()=>{setEditVisit(null); setShowVisit(true);}} className="rounded-xl bg-neutral-900 text-white px-3 py-2 text-sm font-semibold">Add visit</button>
                <button onClick={()=> setShowManageVisits(true)} className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium">Manage</button>
                <button className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm font-semibold">Create keepsake</button>
              </div>
            </div>

            {/* Inline visits list (if any) */}
            {visits.length > 0 ? (
              <ul className="mt-4 divide-y divide-neutral-200 rounded-xl bg-white ring-1 ring-neutral-200">
                {visits.map((v) => (
                  <li key={v.id} className="p-0">
                    <button
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50"
                      onClick={() => setExpandedVisitId(expandedVisitId === v.id ? null : v.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{v.dateLabel}{v.note ? ' • ' + v.note : ''}</p>
                        <div className="mt-1 flex items-center gap-1">
                          {(v.photos?.slice(0,3) || []).map((p: any, i: number)=> (
                            <img key={i} src={p.src} alt="" className="h-6 w-8 rounded-md object-cover"/>
                          ))}
                          {(!v.photos || v.photos.length===0) && [0,1,2].map((i)=> (
                            <span key={i} className="h-6 w-8 rounded-md bg-neutral-200"></span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e)=>{ e.stopPropagation(); setEditVisit(v); setShowVisit(true); }} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100" title="Edit">
                          <Pencil className="h-4 w-4"/>
                        </button>
                        <button onClick={(e)=>{ e.stopPropagation(); setVisits(prev=>prev.filter(x=>x.id!==v.id)); }} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100" title="Delete">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </button>
                    {expandedVisitId === v.id && (
                      <div className="px-4 pb-4">
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {(v.photos || []).slice(0,6).map((p: any, idx: number)=> (
                            <div key={idx} className="space-y-1">
                              <img src={p.src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover bg-neutral-200"/>
                              {p.caption && <p className="text-xs text-neutral-600">{p.caption}</p>}
                            </div>
                          ))}
                          {(!v.photos || v.photos.length===0) && [0,1,2,3,4,5].map((i)=> (
                            <div key={i} className="aspect-[4/3] rounded-lg bg-neutral-200"></div>
                          ))}
                        </div>
                        {v.note && <p className="mt-3 text-sm text-neutral-700">{v.note}</p>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-neutral-300 p-3 text-sm text-neutral-600">No visits yet — add a quick note or photo to start your memories. It takes 10 seconds and helps other travelers.</div>
            )}
          </div>
        </section>
      )}

      {/* Local sub-nav */}
      <div className="sticky top-16 z-20 bg-white/90 backdrop-blur border-b border-neutral-200 mt-3">
        <div className="mx-auto max-w-6xl px-5 py-2 text-sm font-extrabold text-neutral-800 flex gap-6">
          <a href="#guide" className="hover:text-neutral-900">Guide</a>
          <a href="#faq" className="hover:text-neutral-900">FAQ</a>
          <a href="#tips" className="hover:text-neutral-900">Tips</a>
        </div>
      </div>

      {/* Guide */}
      <section id="guide" className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Overview</p>
        <div className={guideExpanded ? '' : 'max-h-32 overflow-hidden'}>
          <p className="mt-2 text-sm text-neutral-800">Where the Star-Spangled Banner was born: a compact fort with sweeping harbor views and living history. It’s an easy win—flat paths, open lawns, and a visitor film that sets the scene in under 15 minutes.</p>
          <p className="mt-2 text-sm text-neutral-800">Start at the visitor center for your map, then follow the ramp to the east wall for the best harbor vantage. Time your visit for a flag raising or lowering—the ranger talk turns the place into a story you’ll remember.</p>
          <p className="mt-2 text-sm text-neutral-800">For a slower visit, circle the star-shaped ramparts clockwise and watch ships move in and out of the Patapsco.</p>
        </div>
        {!guideExpanded && (
          <div className="mt-2">
            <button
              onClick={()=>setGuideExpanded(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-800 underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-400"
            >Read more <ChevronRight className="h-4 w-4"/></button>
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
            <p className="text-sm text-neutral-800">Long-form guide content would live here. For this demo, the TOC shows how sections would be organized once expanded.</p>
            <div className="mt-3 text-right">
              <button onClick={()=>setGuideExpanded(false)} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-800 underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-400">Collapse guide</button>
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Popular Q&amp;A</p>

        <details className="mt-3 border-t border-neutral-200 pt-3">
          <summary className="cursor-pointer font-semibold">What’s new? <span className="ml-2 inline-flex items-center rounded-full bg-neutral-900 text-white text-[11px] px-2 py-[1px]">Updated today</span></summary>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>Sunset flag lowering 6:30pm (Fri–Sun)</li>
            <li>Temporary exhibit: War of 1812</li>
            <li>Harbor shuttle every 20 minutes</li>
          </ul>
        </details>

        <details className="mt-3 border-t border-neutral-200 pt-3">
          <summary className="cursor-pointer font-semibold">What are the hours? <span className="text-neutral-500 font-normal">— 9:00–17:00 (daily)</span></summary>
          <p className="mt-2 text-sm">Hours may vary for holidays and special events; check the official site before you go.</p>
        </details>

        <details className="mt-3 border-t border-neutral-200 pt-3">
          <summary className="cursor-pointer font-semibold">How much does it cost? <span className="text-neutral-500 font-normal">— $15 adults · kids free</span></summary>
          <p className="mt-2 text-sm">Admission covers the fort and visitor center exhibits; special tours may be extra.</p>
        </details>

        <details className="mt-3 border-t border-neutral-200 pt-3">
          <summary className="cursor-pointer font-semibold">Where do I park? <span className="text-neutral-500 font-normal">— On-site lot + overflow</span></summary>
          <p className="mt-2 text-sm">Lots can fill on weekends by mid-day; arrive early or consider rideshare.</p>
        </details>

        <details className="mt-3 border-t border-neutral-200 pt-3">
          <summary className="cursor-pointer font-semibold">Is it accessible? <span className="text-neutral-500 font-normal">— Flat paths; accessible restrooms</span></summary>
          <p className="mt-2 text-sm">Most ramparts have graded access; some historic areas may have uneven surfaces.</p>
        </details>

        {/* Ask a question at the bottom */}
        <div className="mt-4">
          <div className="flex items-center rounded-xl border border-neutral-300 px-3 py-2 text-sm">
            <span className="text-neutral-400 mr-2"><HelpCircle className="h-4 w-4"/></span>
            <input className="flex-1 outline-none bg-transparent" placeholder="Ask a question…" />
            <button className="ml-2 rounded-lg bg-neutral-900 text-white px-3 py-1 text-sm font-semibold">Ask</button>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section id="tips" className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Travel Tips</p>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
          <li>Arrive 30 min before sunset for the lowering ceremony and best light.</li>
          <li>Wind picks up on the ramparts—bring a light jacket even in summer.</li>
          <li>Stroller route: enter via visitor center, ramp to east wall loop.</li>
        </ul>
      </section>

      {/* Nearby */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 mb-2"><Map className="h-5 w-5 text-rose-600"/><h2 className="text-lg font-bold">Nearby</h2></div>
        <div className="h-44 rounded-xl bg-neutral-100 ring-1 ring-neutral-200 flex items-center justify-center text-neutral-500 text-sm">Map placeholder</div>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <NearbyCard title="Museum of Industry" meta="8 min away • 45–60 min"/>
          <NearbyCard title="Federal Hill Park" meta="6 min away • 20–40 min"/>
          <NearbyCard title="Inner Harbor Promenade" meta="10 min away • 30–90 min"/>
        </div>
      </section>

      {/* Modals */}
      {showVisit && (
        <VisitModal
          initial={editVisit}
          onSave={(data)=>{
            if (editVisit) {
              setVisits(prev=>prev.map(v=> v.id===editVisit.id ? {...editVisit, ...data} : v));
            } else {
              const id = Date.now();
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

      <footer className="mt-10 border-t border-neutral-200 py-8 text-sm text-neutral-600 text-center">© {new Date().getFullYear()} Bucketlisted</footer>
    </div>
  );
}

function NearbyCard({ title, meta }:{ title: string; meta: string; }){
  return (
    <div className="rounded-xl ring-1 ring-neutral-200 bg-white px-4 py-3 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-neutral-600">{meta}</p>
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
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <p className="text-sm font-semibold">{initial ? 'Edit visit' : 'Add visit'}</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">When did you go?</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {dateOptions.map((x)=> (
                <button key={x} onClick={()=>setDateChoice(x)} className={`rounded-xl border px-3 py-2 ${dateChoice===x? 'border-neutral-900' : 'border-neutral-300'}`}>{x}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Time spent</p>
            <div className="mt-1 grid grid-cols-5 gap-2">
              {timeOptions.map((x)=> (
                <button key={x} onClick={()=>setTimeChoice(x)} className={`rounded-xl border px-3 py-2 ${timeChoice===x? 'border-neutral-900' : 'border-neutral-300'}`}>{x}m</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Notes</p>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full rounded-xl border border-neutral-300 p-2" rows={3} maxLength={140} placeholder="140 characters…"/>
          </div>

          <div>
            <p className="text-xs text-neutral-500">Photos & captions (optional)</p>
            <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="mt-1"/>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((p, idx)=> (
                  <div key={idx} className="space-y-1">
                    <img src={p.src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover bg-neutral-100 ring-1 ring-neutral-200"/>
                    <input value={(p as any).caption} onChange={(e)=>updateCaption(idx, (e.target as HTMLInputElement).value)} className="w-full rounded-lg border border-neutral-300 p-1 text-xs" placeholder="Caption (optional)"/>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              className="rounded-xl bg-neutral-900 text-white px-3 py-2 text-sm font-semibold"
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
            >{initial ? 'Save changes' : 'Save visit'}</button>
            <button className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium" onClick={onClose}>Cancel</button>
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
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <p className="text-sm font-semibold">Save to…</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-2">
          <button className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-sm"><span>Bucket List (default)</span><BookmarkCheck className="h-5 w-5"/></button>
          <button className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-sm"><span>Baltimore Weekend</span></button>
          <button className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-sm"><span>Stadium Tour</span></button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-3 py-3 text-sm font-medium"><Plus className="h-4 w-4"/> Create new list</button>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button className="rounded-xl bg-neutral-900 text-white px-3 py-2 text-sm font-semibold" onClick={onClose}>Done</button>
            <button className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium" onClick={onClose}>Cancel</button>
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
          <button onClick={onAddAnother} className="rounded-xl border border-neutral-300 px-3 py-2 text-left">Add another visit</button>
          <button onClick={onManage} className="rounded-xl border border-neutral-300 px-3 py-2 text-left">Manage visits</button>
          <button onClick={onUncheck} className="rounded-xl border border-neutral-300 px-3 py-2 text-left">Remove checkmark</button>
          <button onClick={onClose} className="rounded-xl bg-neutral-900 text-white px-3 py-2 font-semibold">Cancel</button>
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
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <p className="text-sm font-semibold">Manage visits</p>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-4 grid gap-2">
          {visits.length === 0 ? (
            <p className="text-sm text-neutral-600">No visits yet.</p>
          ) : (
            visits.map((v)=> (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{v.dateLabel}</p>
                  {v.note && <p className="text-neutral-700">{v.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>onEdit(v)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100" title="Edit"><Pencil className="h-4 w-4"/></button>
                  <button onClick={()=>onDelete(v.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100" title="Delete"><Trash2 className="h-4 w-4"/></button>
                </div>
              </div>
            ))
          )}
          <div className="mt-2 text-right">
            <button onClick={onClose} className="rounded-xl bg-neutral-900 text-white px-3 py-2 text-sm font-semibold">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
