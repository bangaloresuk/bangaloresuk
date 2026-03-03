// ═══════════════════════════════════════════════════════════════
//  SUK BANGALORE — app.js  (Complete React App)
//
//  ⚠️  BEFORE DEPLOYING: Change WORKER_URL on line 7
//  to the URL you get after deploying your Cloudflare Worker.
//  Example: "https://suk-bangalore.badalk.workers.dev"
// ═══════════════════════════════════════════════════════════════

const WORKER_URL = "https://suk-bangalore.bangaloresuk.workers.dev"; // ⚠️ CHANGE THIS

// ── Static data ────────────────────────────────────────────────
const PRAYER_TIMES = {
  1:{M:"06:44",E:"18:10"}, 2:{M:"06:40",E:"18:23"},
  3:{M:"06:24",E:"18:28"}, 4:{M:"06:04",E:"18:31"},
  5:{M:"05:52",E:"18:37"}, 6:{M:"05:51",E:"18:46"},
  7:{M:"05:59",E:"18:48"}, 8:{M:"06:05",E:"18:38"},
  9:{M:"06:06",E:"18:19"},10:{M:"06:09",E:"17:58"},
 11:{M:"06:18",E:"17:48"},12:{M:"06:34",E:"17:54"},
};
const MONTHS = ["","January","February","March","April","May","June",
  "July","August","September","October","November","December"];

// SUK list — add more here when ready (set active: true)
const SUKS = [
  { key:"bannerghatta",     name:"Bannerghatta SUK",     active:true  },
  { key:"peenya-2nd-stage", name:"Peenya 2nd Stage SUK", active:true  },
  { key:"banashankari",     name:"Banashankari SUK",      active:true  },
  { key:"hsr-layout",       name:"HSR Layout SUK",        active:false },
  { key:"electronic-city",  name:"Electronic City SUK",   active:false },
  { key:"marathahalli",     name:"Marathahalli SUK",      active:false },
  { key:"btm-layout",       name:"BTM Layout SUK",        active:false },
  { key:"yelahanka",        name:"Yelahanka SUK",          active:false },
  { key:"jp-park",          name:"J P Park SUK",           active:false },
  { key:"itpl-main-road",   name:"ITPL Main Road SUK",    active:false },
  { key:"domlur",           name:"Domlur SUK",             active:false },
  { key:"sarjapura-road",   name:"Sarjapura Road SUK",    active:false },
];

// ── API state (in memory, never persisted) ──────────────────────
let _token    = null;
let _tokenExp = 0;
let _sukKey   = null;

async function refreshToken(sukKey) {
  const r    = await fetch(`${WORKER_URL}/api/token`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ sukKey }),
  });
  const data = await r.json();
  if (!data.success) throw new Error(data.error || "Auth failed");
  _token    = data.token;
  _tokenExp = data.expiresAt;
  _sukKey   = sukKey;
}

async function ensureToken(sukKey) {
  if (!_token || _sukKey !== sukKey || Date.now() > _tokenExp - 60000)
    await refreshToken(sukKey);
}

async function apiPost(sukKey, action, body = {}) {
  await ensureToken(sukKey);
  const r = await fetch(`${WORKER_URL}/api/${sukKey}/${action}`, {
    method:"POST",
    headers:{"Content-Type":"application/json","X-SUK-Token":_token},
    body: JSON.stringify(body),
  });
  if (r.status === 401) { _token = null; return apiPost(sukKey, action, body); }
  return r.json();
}

async function apiGet(sukKey, action, params = {}) {
  await ensureToken(sukKey);
  const url = new URL(`${WORKER_URL}/api/${sukKey}/${action}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url.toString(), { headers:{"X-SUK-Token":_token} });
  if (r.status === 401) { _token = null; return apiGet(sukKey, action, params); }
  return r.json();
}

// ── Date helpers ────────────────────────────────────────────────
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtLong(s) {
  if (!s) return "";
  return new Date(s+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
}
function fmtWithDay(s) {
  if (!s) return "";
  const d   = new Date(s+"T00:00:00");
  const day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  return `${day}, ${d.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}`;
}
function dayName(s) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(s+"T00:00:00").getDay()];
}
function pretty(s) {
  try { return new Date(s+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return s; }
}
function getPT(dateStr, slot) {
  const mo = parseInt((dateStr||"2026-01").split("-")[1]);
  const t  = PRAYER_TIMES[mo];
  return t ? (slot === "Morning" ? t.M : t.E) : "";
}

// ── Tiny components ─────────────────────────────────────────────
function BlueLine() {
  return <div style={{display:"flex",alignItems:"center",gap:10,margin:"8px 0 16px"}}>
    <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(59,130,246,.4))"}}/>
    <span style={{color:"rgba(59,130,246,.45)",fontSize:14}}>✦</span>
    <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(59,130,246,.4),transparent)"}}/>
  </div>;
}

function Loader({ text = "Loading your Kendra data..." }) {
  return <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",
    background:"rgba(232,240,254,.88)",backdropFilter:"blur(6px)",
    animation:"fadeSlideIn .3s ease-out both"}}>
    <div style={{fontSize:44,marginBottom:16,
      animation:"floatEmoji 1.2s ease-in-out infinite alternate",
      filter:"drop-shadow(0 0 18px rgba(255,180,0,.55))"}}>🪷</div>
    <div style={{display:"flex",gap:7,marginBottom:14}}>
      {[0,1,2].map(i => <div key={i} style={{
        width:9,height:9,borderRadius:"50%",background:"#3b82f6",
        animation:"dotPulse 1.2s ease-in-out infinite",
        animationDelay:i*0.2+"s",opacity:.7}}/>)}
    </div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,
      color:"rgba(29,78,216,.65)",letterSpacing:"1.5px"}}>{text}</div>
  </div>;
}

function SkeletonCard() {
  return <div className="skeleton-card">
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div className="skeleton" style={{width:36,height:36,borderRadius:"50%",flexShrink:0}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
        <div className="skeleton" style={{height:13,width:"55%",borderRadius:6}}/>
        <div className="skeleton" style={{height:10,width:"35%",borderRadius:6}}/>
      </div>
    </div>
    <div className="skeleton" style={{height:11,borderRadius:6,width:"80%"}}/>
    <div className="skeleton" style={{height:11,borderRadius:6,width:"60%"}}/>
    <div className="skeleton" style={{height:38,borderRadius:10,marginTop:4}}/>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  WELCOME SCREEN
// ══════════════════════════════════════════════════════════════
function Welcome({ onEnter }) {
  const [sel,     setSel]     = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState("");

  async function enter() {
    if (!sel) return setError("Please select your Kendra.");
    const suk = SUKS.find(s => s.key === sel);
    if (!suk?.active) return setError("This Kendra is coming soon. Please select another.");
    setLoading(true); setError("");
    try {
      await refreshToken(sel);
      onEnter(suk);
    } catch(e) {
      setError("Could not connect. Please check your internet and try again.");
      setLoading(false);
    }
  }

  return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",padding:20,position:"relative",zIndex:1}}>
    <div className="divine-bg"/>
    <div className="header-halo"/>
    <div style={{textAlign:"center",marginBottom:40,position:"relative",zIndex:1}}>
      <div style={{fontSize:64,marginBottom:8,filter:"drop-shadow(0 0 30px rgba(255,180,0,.6))"}}>🪷</div>
      <div className="jayguru-title">Jayguru</div>
      <div style={{color:"rgba(29,78,216,.55)",fontSize:11,letterSpacing:4,marginTop:8,textTransform:"uppercase"}}>
        Satsang Upayojana Kendra · Bangalore
      </div>
    </div>

    <div className="card" style={{width:"100%",maxWidth:420}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,
        color:"#1e3a8a",textAlign:"center",marginBottom:20,letterSpacing:1}}>
        Select Your Kendra 🙏
      </div>
      <label className="divine-label">Choose your SUK center</label>
      <select className="divine-input" value={sel} onChange={e => { setSel(e.target.value); setError(""); }}>
        <option value="">— Select Kendra —</option>
        {SUKS.map(s => (
          <option key={s.key} value={s.key} disabled={!s.active}>
            {s.name}{!s.active ? " (Coming Soon)" : ""}
          </option>
        ))}
      </select>

      {error && <div style={{color:"#dc2626",fontSize:13,fontWeight:600,
        marginTop:10,textAlign:"center",padding:"10px 14px",
        background:"#fef2f2",borderRadius:10,border:"1px solid #fecaca"}}>⚠️ {error}</div>}

      <button className="submit-btn" style={{marginTop:20}}
        onClick={enter} disabled={loading}>
        {loading ? "Connecting to Kendra..." : "Enter 🙏 Jayguru"}
      </button>
    </div>

    <div style={{marginTop:24,color:"rgba(29,78,216,.3)",fontSize:11,letterSpacing:3,textTransform:"uppercase"}}>
      Bannerghatta · Peenya · Banashankari
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  BOOK PRAYER TAB
// ══════════════════════════════════════════════════════════════
function BookPrayer({ sukKey, calendar, onBooked }) {
  const td = today();
  const [f, setF]   = React.useState({ name:"",mobile:"",place:"",mapsLink:"",date:"",time:"" });
  const [err, setE] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [busy, setBusy]   = React.useState(false);
  const [done, setDone]   = React.useState(null);

  const booked = React.useMemo(() => {
    const s = new Set();
    (calendar||[]).forEach(c => { if (c.isBooked) s.add(`${c.date}_${c.slot}`); });
    return s;
  }, [calendar]);

  const isTaken = (date, slot) => booked.has(`${date}_${slot}`);
  const upd = (k, v) => { setF(p => ({...p, [k]:v})); setE(""); };
  function trigErr(m) { setE(m); setShake(true); setTimeout(() => setShake(false), 450); }

  async function submit() {
    if (!f.name.trim())                         return trigErr("Please enter your name.");
    if (!/^\d{10}$/.test(f.mobile.trim()))      return trigErr("Mobile must be 10 digits.");
    if (!f.date || f.date < td)                 return trigErr("Please select a valid future date.");
    if (!f.time)                                return trigErr("Please select Morning or Evening.");
    if (isTaken(f.date, f.time))               return trigErr("This slot is already booked. Choose another.");
    if (!f.place.trim())                        return trigErr("Please enter your address.");
    setBusy(true);
    try {
      const pt = getPT(f.date, f.time);
      const r  = await apiPost(sukKey, "book", {
        name:f.name.trim(), mobile:f.mobile.trim(),
        place:f.place.trim(), mapsLink:f.mapsLink.trim(),
        date:f.date, day:dayName(f.date), time:f.time, prayerTime:pt,
      });
      if (r.success) {
        setDone({...f, id:r.id, prayerTime:pt});
        setF({ name:"",mobile:"",place:"",mapsLink:"",date:"",time:"" });
        if (onBooked) onBooked();
      } else {
        trigErr(r.message || "Booking failed. Please try again.");
      }
    } catch { trigErr("Connection error. Please check your internet."); }
    setBusy(false);
  }

  function shareWA() {
    if (!done) return;
    const msg = `🪷 Jayguru 🙏\n\nYou are invited for the *${done.time} Prayer*\non *${fmtWithDay(done.date)}* at *${done.prayerTime}*\n\n📍 ${done.place}${done.mapsLink ? "\n🗺️ " + done.mapsLink : ""}\n\n*Booking ID:* ${done.id}\n\n🙏 Jayguru — Bannerghatta SUK`;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  }

  return <div className="fade-in">
    {done && <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setDone(null); }}>
      <div className="modal-box">
        <div style={{fontSize:52,marginBottom:8,animation:"floatEmoji 1.2s ease-in-out infinite alternate",
          filter:"drop-shadow(0 0 20px rgba(255,180,0,.6))"}}>🪷</div>
        <div className="modal-title">Prayer Booked!</div>
        <div style={{background:"#eff6ff",borderRadius:12,padding:"14px 16px",margin:"14px 0",
          borderLeft:"4px solid #1d4ed8",textAlign:"left"}}>
          <div style={{fontSize:10,color:"#6b7280",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Booking ID</div>
          <div style={{fontSize:22,fontWeight:900,color:"#1e3a8a",fontFamily:"'Cinzel',serif"}}>{done.id}</div>
        </div>
        <div style={{fontSize:14,color:"#374151",lineHeight:1.7}}>
          <strong>{done.name}</strong><br/>
          {done.time} Prayer · {pretty(done.date)}<br/>
          <span style={{color:"#1d4ed8",fontWeight:700}}>🕐 {done.prayerTime}</span>
        </div>
        <div className="modal-jayguru">Jayguru 🙏</div>
        <button onClick={shareWA} style={{marginTop:14,width:"100%",padding:12,border:"none",borderRadius:13,
          background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff",
          fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px rgba(34,197,94,.4)"}}>
          📤 Share on WhatsApp
        </button>
        <button className="modal-close-btn" onClick={() => setDone(null)}>Close</button>
      </div>
    </div>}

    <div className={shake ? "shake" : ""}>
      {[["name","Your Full Name","e.g. Ramesh Kumar"],
        ["mobile","Mobile Number","10-digit mobile number"],
      ].map(([key,label,ph]) => (
        <div key={key} style={{marginBottom:16}}>
          <label className="divine-label">{label}</label>
          <input className="divine-input" placeholder={ph} value={f[key]}
            maxLength={key==="mobile"?10:undefined}
            onChange={e => upd(key, key==="mobile" ? e.target.value.replace(/\D/g,"") : e.target.value)}/>
        </div>
      ))}

      <div style={{marginBottom:16}}>
        <label className="divine-label">Date</label>
        <input className="divine-input" type="date" min={td} value={f.date}
          onChange={e => upd("date", e.target.value)}/>
      </div>

      <div style={{marginBottom:16}}>
        <label className="divine-label">Select Slot</label>
        <div style={{display:"flex",gap:12}}>
          {["Morning","Evening"].map(slot => {
            const taken    = f.date && isTaken(f.date, slot);
            const sel      = f.time === slot;
            const sc       = slot==="Morning" ? "#b45309" : "#6d28d9";
            const sbg      = slot==="Morning" ? "#fef3c7" : "#ede9fe";
            return <button key={slot} disabled={taken} onClick={() => !taken && upd("time",slot)}
              className="slot-btn" style={{
                background: taken ? "#f3f4f6" : sel ? sbg : "#fff",
                borderColor: taken ? "#e5e7eb" : sel ? sc : "rgba(59,130,246,.25)",
                opacity: taken ? .6 : 1,
              }}>
              <div style={{fontSize:24,marginBottom:4}}>{slot==="Morning"?"🌅":"🌙"}</div>
              <div style={{fontSize:12,fontWeight:700,color:taken?"#9ca3af":sc}}>{slot}</div>
              {taken && <div style={{fontSize:10,color:"#dc2626",fontWeight:700,marginTop:2}}>Booked</div>}
              {sel && !taken && <div style={{fontSize:10,color:sc,fontWeight:700,marginTop:2}}>Selected ✓</div>}
            </button>;
          })}
        </div>
        {f.date && f.time && !isTaken(f.date,f.time) &&
          <div style={{marginTop:8,fontSize:12,color:"rgba(29,78,216,.7)",fontWeight:600,textAlign:"center"}}>
            🕐 Prayer time: <strong>{getPT(f.date,f.time)}</strong>
          </div>}
      </div>

      <div style={{marginBottom:16}}>
        <label className="divine-label">Your Full Address</label>
        <input className="divine-input" placeholder="House no, Street, Locality, Area" value={f.place}
          onChange={e => upd("place",e.target.value)}/>
      </div>

      <div style={{marginBottom:20}}>
        <label className="divine-label">Google Maps Link (optional)</label>
        <input className="divine-input" placeholder="https://maps.app.goo.gl/..." value={f.mapsLink}
          onChange={e => upd("mapsLink",e.target.value)}/>
      </div>

      {err && <div style={{color:"#dc2626",fontSize:13,fontWeight:600,textAlign:"center",
        marginBottom:12,padding:"10px 14px",background:"#fef2f2",
        borderRadius:10,border:"1px solid #fecaca"}}>⚠️ {err}</div>}

      <button className="submit-btn" onClick={submit} disabled={busy}>
        {busy ? "Booking..." : "🪷 Book Prayer Slot"}
      </button>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  BOOK SATSANG TAB
// ══════════════════════════════════════════════════════════════
function BookSatsang({ sukKey }) {
  const td = today();
  const [f, setF]    = React.useState({ name:"",mobile:"",venue:"",mapsLink:"",date:"",time:"",hostedBy:"" });
  const [err, setE]  = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [busy, setBusy]   = React.useState(false);
  const [done, setDone]   = React.useState(null);

  const upd = (k, v) => { setF(p => ({...p, [k]:v})); setE(""); };
  function trigErr(m) { setE(m); setShake(true); setTimeout(() => setShake(false), 450); }

  async function submit() {
    if (!f.name.trim())                    return trigErr("Please enter your name.");
    if (!/^\d{10}$/.test(f.mobile.trim())) return trigErr("Mobile must be 10 digits.");
    if (!f.date || f.date < td)            return trigErr("Please select a valid future date.");
    if (!f.time.trim())                    return trigErr("Please enter the satsang time.");
    if (!f.venue.trim())                   return trigErr("Please enter the venue address.");
    setBusy(true);
    try {
      const r = await apiPost(sukKey, "book", {
        name:f.name.trim(), mobile:f.mobile.trim(),
        venue:f.venue.trim(), mapsLink:f.mapsLink.trim(),
        date:f.date, day:dayName(f.date), time:f.time.trim(),
        hostedBy: f.hostedBy.trim() || "Bannerghatta SUK",
        sheetName: "Satsang",
      });
      if (r.success) {
        setDone({...f, id:r.id});
        setF({ name:"",mobile:"",venue:"",mapsLink:"",date:"",time:"",hostedBy:"" });
      } else {
        trigErr(r.message || "Booking failed.");
      }
    } catch { trigErr("Connection error. Please check your internet."); }
    setBusy(false);
  }

  return <div className="fade-in">
    {done && <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setDone(null); }}>
      <div className="modal-box">
        <div style={{fontSize:52,marginBottom:8}}>🪷</div>
        <div className="modal-title">Satsang Booked!</div>
        <div style={{background:"#fef3c7",borderRadius:12,padding:"14px 16px",margin:"14px 0",
          borderLeft:"4px solid #d97706",textAlign:"left"}}>
          <div style={{fontSize:10,color:"#6b7280",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Satsang ID</div>
          <div style={{fontSize:22,fontWeight:900,color:"#92400e",fontFamily:"'Cinzel',serif"}}>{done.id}</div>
        </div>
        <div style={{fontSize:14,color:"#374151",lineHeight:1.7}}>
          <strong>{done.name}</strong><br/>
          {pretty(done.date)} at {done.time}<br/>
          📍 {done.venue}
        </div>
        <div className="modal-jayguru">Jayguru 🙏</div>
        <button className="modal-close-btn" onClick={() => setDone(null)}>Close</button>
      </div>
    </div>}

    <div className={shake?"shake":""}>
      {[["name","Host Name","Your full name"],
        ["mobile","Mobile Number","10-digit mobile"],
        ["venue","Venue / Address","House no, Street, Locality"],
        ["mapsLink","Google Maps Link (optional)","https://maps.app.goo.gl/..."],
        ["hostedBy","Hosted By (optional)","e.g. Bannerghatta SUK"],
      ].map(([key,label,ph]) => (
        <div key={key} style={{marginBottom:14}}>
          <label className="divine-label">{label}</label>
          <input className="divine-input" placeholder={ph} value={f[key]}
            maxLength={key==="mobile"?10:undefined}
            onChange={e => upd(key, key==="mobile" ? e.target.value.replace(/\D/g,"") : e.target.value)}/>
        </div>
      ))}
      <div style={{marginBottom:14}}>
        <label className="divine-label">Date</label>
        <input className="divine-input" type="date" min={td} value={f.date}
          onChange={e => upd("date",e.target.value)}/>
      </div>
      <div style={{marginBottom:20}}>
        <label className="divine-label">Satsang Time</label>
        <input className="divine-input" placeholder="e.g. 06:30 AM" value={f.time}
          onChange={e => upd("time",e.target.value)}/>
      </div>
      {err && <div style={{color:"#dc2626",fontSize:13,fontWeight:600,textAlign:"center",
        marginBottom:12,padding:"10px 14px",background:"#fef2f2",
        borderRadius:10,border:"1px solid #fecaca"}}>⚠️ {err}</div>}
      <button className="submit-btn" onClick={submit} disabled={busy}>
        {busy?"Booking...":"🪷 Book Satsang"}
      </button>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  MANAGE — retrieve and cancel bookings
// ══════════════════════════════════════════════════════════════
function Manage({ sukKey }) {
  const [mobile,    setMobile]    = React.useState("");
  const [results,   setResults]   = React.useState(null);
  const [searching, setSearching] = React.useState(false);
  const [cancelling,setCancelling]= React.useState(null);
  const [msg,       setMsg]       = React.useState("");

  async function search() {
    if (!/^\d{10}$/.test(mobile.trim()))
      return setMsg("⚠️ Please enter a valid 10-digit mobile number.");
    setSearching(true); setMsg(""); setResults(null);
    try {
      const d = await apiPost(sukKey, "retrieve", { mobile: mobile.trim() });
      if (d.success) {
        setResults(d.data || []);
        if (!d.data?.length) setMsg("No bookings found for this mobile number.");
      } else {
        setMsg("⚠️ " + (d.error || d.message || "Could not fetch bookings."));
      }
    } catch { setMsg("⚠️ Connection error. Please try again."); }
    setSearching(false);
  }

  async function cancel(b) {
    if (!window.confirm(`Cancel booking ${b.id}?`)) return;
    setCancelling(b.id);
    try {
      const d = await apiPost(sukKey, "cancel", {
        id: b.id, mobile: mobile.trim(),
        date: b.date,
        sheetName: b._type === "satsang" ? "Satsang" : "Bookings",
      });
      if (d.success) {
        setResults(r => r.filter(x => x.id !== b.id));
        setMsg("✅ Booking " + b.id + " cancelled successfully.");
      } else {
        setMsg("⚠️ " + (d.message || "Could not cancel."));
      }
    } catch { setMsg("⚠️ Connection error."); }
    setCancelling(null);
  }

  const msgStyle = msg.startsWith("✅")
    ? {background:"#ecfdf5",color:"#065f46",border:"1px solid #a7f3d0"}
    : {background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"};

  return <div className="fade-in">
    <div style={{marginBottom:16}}>
      <label className="divine-label">Enter Your Mobile Number</label>
      <input className="divine-input" placeholder="10-digit mobile number"
        value={mobile} maxLength={10}
        onChange={e => { setMobile(e.target.value.replace(/\D/g,"")); setMsg(""); setResults(null); }}/>
    </div>
    <button className="submit-btn" onClick={search} disabled={searching}>
      {searching ? "Searching..." : "🔍 Find My Bookings"}
    </button>

    {msg && <div style={{marginTop:14,fontSize:13,fontWeight:600,textAlign:"center",
      padding:"10px 14px",borderRadius:10,...msgStyle}}>{msg}</div>}

    {results && results.length > 0 && (
      <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
        {results.map(b => (
          <div key={b.id} style={{
            background:"#f8faff",borderRadius:16,padding:16,
            border:"1px solid rgba(59,130,246,.12)",
            borderLeft:`4px solid ${b._type==="satsang"?"#d97706":"#1d4ed8"}`,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <span style={{fontSize:10,fontWeight:700,
                  color:b._type==="satsang"?"#92400e":"#1e3a8a",
                  background:b._type==="satsang"?"#fef3c7":"#eff6ff",
                  padding:"2px 8px",borderRadius:6,textTransform:"uppercase"}}>
                  {b._type==="satsang"?"Satsang":"Prayer"}
                </span>
                <div style={{fontSize:17,fontWeight:900,color:"#1e3a8a",
                  fontFamily:"'Cinzel',serif",marginTop:4}}>{b.id}</div>
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"#6b7280"}}>
                {pretty(b.date)}<br/>
                <strong>{b.time}</strong>
              </div>
            </div>
            <div style={{fontSize:13,color:"#374151",marginBottom:10,lineHeight:1.7}}>
              {b._type==="prayer" ? <>
                👤 {b.name}<br/>
                {b.place && <>📍 {b.place}<br/></>}
                {b.prayerTime && <span>🕐 Prayer at <strong>{b.prayerTime}</strong></span>}
              </> : <>
                👤 {b.name}<br/>
                {b.venue && <>📍 {b.venue}<br/></>}
                {b.hostedBy && <span>🏛️ {b.hostedBy}</span>}
              </>}
            </div>
            <button onClick={() => cancel(b)} disabled={cancelling===b.id} style={{
              width:"100%",padding:"10px",border:"1px solid #fca5a5",borderRadius:10,
              background:cancelling===b.id?"#f3f4f6":"#fef2f2",color:"#dc2626",
              fontWeight:700,fontSize:13,cursor:cancelling===b.id?"wait":"pointer",
              transition:"all .2s",
            }}>
              {cancelling===b.id ? "Cancelling..." : "✕ Cancel This Booking"}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  ALL BOOKINGS — calendar view (no PII)
// ══════════════════════════════════════════════════════════════
function AllBookings({ sukKey }) {
  const td = today();
  const [month, setMonth]   = React.useState(td.slice(0,7));
  const [data,  setData]    = React.useState(null);
  const [loading,setLoading]= React.useState(false);

  React.useEffect(() => {
    setLoading(true); setData(null);
    apiGet(sukKey, "calendar", { month, type:"prayer" })
      .then(d => setData(d.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [sukKey, month]);

  const map = React.useMemo(() => {
    const m = {};
    (data||[]).forEach(b => { m[`${b.date}_${b.slot}`] = b; });
    return m;
  }, [data]);

  const [yr, mo] = month.split("-").map(Number);
  const days = Array.from({ length: new Date(yr, mo, 0).getDate() }, (_, i) => {
    return `${month}-${String(i+1).padStart(2,"0")}`;
  });

  function adj(n) {
    const d = new Date(month+"-01");
    d.setMonth(d.getMonth() + n);
    setMonth(d.toISOString().slice(0,7));
  }

  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <button onClick={() => adj(-1)} style={{background:"none",border:"1px solid rgba(59,130,246,.3)",
        borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#1d4ed8",fontWeight:700,fontSize:13}}>
        ← Prev
      </button>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#1e3a8a"}}>
        {MONTHS[mo]} {yr}
      </div>
      <button onClick={() => adj(1)} style={{background:"none",border:"1px solid rgba(59,130,246,.3)",
        borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#1d4ed8",fontWeight:700,fontSize:13}}>
        Next →
      </button>
    </div>

    {loading ? <SkeletonCard/> : (
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {days.map(date => {
          const mb = map[`${date}_Morning`];
          const eb = map[`${date}_Evening`];
          const past = date < td;
          return <div key={date} style={{
            background:past?"rgba(255,255,255,.5)":"rgba(255,255,255,.88)",
            borderRadius:12,padding:"10px 14px",
            border:"1px solid rgba(59,130,246,.1)",
            opacity:past?.7:1,
          }}>
            <div style={{fontSize:12,fontWeight:700,color:past?"#9ca3af":"#1e3a8a",marginBottom:6}}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(date+"T00:00:00").getDay()]}, {pretty(date)}
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["Morning","🌅","#fef3c7","#b45309",mb],
                ["Evening","🌙","#ede9fe","#6d28d9",eb]].map(([slot,ic,bg,col,bk]) => (
                <div key={slot} style={{flex:1,borderRadius:8,padding:"6px 10px",
                  background:bk?bg:"rgba(236,253,245,.7)",
                  border:`1px solid ${bk?"rgba(180,160,0,.2)":"rgba(167,243,208,.6)"}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:bk?col:"#16a34a"}}>{ic} {slot}</div>
                  <div style={{fontSize:11,marginTop:2,color:bk?"#374151":"#16a34a"}}>
                    {bk ? bk.initial : "Available ✓"}
                  </div>
                </div>
              ))}
            </div>
          </div>;
        })}
      </div>
    )}
    <div style={{marginTop:14,fontSize:11,color:"rgba(29,78,216,.4)",textAlign:"center",fontStyle:"italic"}}>
      Names shown as initials only to protect privacy 🔒
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  PRAYER TIMES TABLE
// ══════════════════════════════════════════════════════════════
function PrayerTimes() {
  const curMo = new Date().getMonth() + 1;
  return <div className="fade-in">
    <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,
      color:"#1e3a8a",textAlign:"center",marginBottom:16,letterSpacing:1}}>
      Monthly Prayer Timings 🕐
    </div>
    <div style={{borderRadius:16,overflow:"hidden",border:"1px solid rgba(59,130,246,.2)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
        background:"linear-gradient(135deg,#0e2266,#1d4ed8)",
        padding:"10px 16px",color:"#fff",fontWeight:700,fontSize:12,letterSpacing:.5}}>
        <div>Month</div>
        <div style={{textAlign:"center"}}>🌅 Morning</div>
        <div style={{textAlign:"center"}}>🌙 Evening</div>
      </div>
      {Object.entries(PRAYER_TIMES).map(([mo, t]) => {
        const n = parseInt(mo);
        const isCur = n === curMo;
        return <div key={mo} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
          padding:"10px 16px",borderTop:"1px solid rgba(59,130,246,.08)",
          background:isCur?"linear-gradient(135deg,#eff6ff,#dbeafe)":"#fff",
          fontWeight:isCur?700:400}}>
          <div style={{fontSize:13,color:isCur?"#1d4ed8":"#374151"}}>
            {isCur && "→ "}{MONTHS[n].slice(0,3)}
          </div>
          <div style={{textAlign:"center",fontSize:13,color:"#b45309",fontWeight:700}}>{t.M}</div>
          <div style={{textAlign:"center",fontSize:13,color:"#6d28d9",fontWeight:700}}>{t.E}</div>
        </div>;
      })}
    </div>
    <div style={{marginTop:12,fontSize:11,color:"rgba(29,78,216,.4)",textAlign:"center"}}>
      Times are for Bangalore (IST). Adjust ±2 min for your locality.
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  PHOTO GALLERY
// ══════════════════════════════════════════════════════════════
function Gallery({ sukKey }) {
  const [photos, setPhotos]       = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [showUp, setShowUp]       = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [form, setForm]           = React.useState({ caption:"",uploader:"",file:null,preview:null });
  const [msg, setMsg]             = React.useState("");
  const [selected, setSelected]   = React.useState(null);

  React.useEffect(() => {
    apiGet(sukKey, "photos")
      .then(d => { if (d.success) setPhotos(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sukKey]);

  function pickFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4*1024*1024) { setMsg("⚠️ File too large. Max 4MB."); return; }
    const rd = new FileReader();
    rd.onload = ev => setForm(f => ({...f, file, preview:ev.target.result}));
    rd.readAsDataURL(file);
  }

  async function upload() {
    if (!form.file) return setMsg("⚠️ Please select a photo.");
    setUploading(true); setMsg("");
    try {
      const r = await apiPost(sukKey, "photo-upload", {
        base64:    form.preview.split(",")[1],
        filename:  form.file.name,
        caption:   form.caption.trim(),
        uploader:  form.uploader.trim() || "Anonymous",
      });
      if (r.success) {
        setMsg("✅ Photo uploaded!");
        setPhotos(p => [{ id:r.photoId, url:r.url, caption:form.caption,
          uploader:form.uploader||"Anonymous", date:new Date().toLocaleDateString() }, ...p]);
        setForm({ caption:"",uploader:"",file:null,preview:null });
        setShowUp(false);
      } else { setMsg("⚠️ " + r.message); }
    } catch { setMsg("⚠️ Upload failed. Try again."); }
    setUploading(false);
  }

  return <div className="fade-in">
    {selected && <div className="modal-overlay" onClick={() => setSelected(null)}>
      <div style={{maxWidth:500,width:"100%"}} onClick={e => e.stopPropagation()}>
        <img src={selected.url} alt={selected.caption}
          style={{width:"100%",borderRadius:16,maxHeight:"60vh",objectFit:"cover"}}/>
        {selected.caption && <div style={{background:"rgba(0,0,0,.85)",color:"#fff",
          padding:"10px 16px",borderRadius:"0 0 16px 16px",fontSize:14}}>{selected.caption}</div>}
        {selected.uploader && <div style={{background:"rgba(0,0,0,.6)",color:"rgba(255,255,255,.7)",
          padding:"4px 16px 10px",borderRadius:"0 0 16px 16px",fontSize:11}}>📸 {selected.uploader}</div>}
        <button onClick={() => setSelected(null)} style={{marginTop:12,width:"100%",padding:12,border:"none",
          borderRadius:12,background:"#fff",fontWeight:700,cursor:"pointer",color:"#1d4ed8",fontSize:14}}>
          Close
        </button>
      </div>
    </div>}

    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
      <button onClick={() => { setShowUp(s => !s); setMsg(""); }} style={{
        padding:"8px 16px",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
        background:showUp?"#fee2e2":"linear-gradient(135deg,#1d4ed8,#3b82f6)",
        color:showUp?"#dc2626":"#fff",transition:"all .2s",
      }}>
        {showUp ? "✕ Cancel" : "+ Add Photo"}
      </button>
    </div>

    {showUp && <div style={{background:"rgba(240,246,255,.9)",borderRadius:16,padding:20,
      marginBottom:20,border:"1px solid rgba(59,130,246,.2)"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,color:"#1e3a8a",marginBottom:14}}>
        Upload a Photo
      </div>
      {form.preview && <img src={form.preview} style={{width:"100%",maxHeight:200,
        objectFit:"cover",borderRadius:10,marginBottom:12}}/>}
      <input type="file" accept="image/*" onChange={pickFile}
        style={{marginBottom:12,fontSize:13,color:"#1e3a8a"}}/>
      <div style={{marginBottom:10}}>
        <label className="divine-label">Caption (optional)</label>
        <input className="divine-input" placeholder="Describe the photo"
          value={form.caption} onChange={e => setForm(f => ({...f,caption:e.target.value}))}/>
      </div>
      <div style={{marginBottom:14}}>
        <label className="divine-label">Your Name</label>
        <input className="divine-input" placeholder="Your name"
          value={form.uploader} onChange={e => setForm(f => ({...f,uploader:e.target.value}))}/>
      </div>
      {msg && <div style={{fontSize:13,fontWeight:600,marginBottom:10,
        color:msg.startsWith("✅")?"#065f46":"#dc2626"}}>{msg}</div>}
      <button className="submit-btn" onClick={upload} disabled={uploading}>
        {uploading ? "Uploading..." : "📤 Upload Photo"}
      </button>
    </div>}

    {loading ? <><SkeletonCard/><SkeletonCard/></> :
      photos.length === 0 ?
        <div style={{textAlign:"center",padding:40,color:"rgba(29,78,216,.4)"}}>
          <div style={{fontSize:48,marginBottom:12}}>📷</div>
          <div style={{fontWeight:600}}>No photos yet</div>
          <div style={{fontSize:13,marginTop:4}}>Be the first to share a memory!</div>
        </div> :
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
          {photos.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{
              cursor:"pointer",borderRadius:12,overflow:"hidden",
              border:"1px solid rgba(59,130,246,.15)",
              boxShadow:"0 2px 8px rgba(29,78,216,.1)",transition:"transform .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
              <img src={p.url} alt={p.caption}
                style={{width:"100%",height:130,objectFit:"cover",display:"block"}}
                onError={e => { e.target.style.display="none"; }}/>
              {p.caption && <div style={{padding:"6px 8px",fontSize:11,color:"#374151",
                background:"#fff",fontWeight:600,lineHeight:1.3}}>{p.caption}</div>}
            </div>
          ))}
        </div>
    }
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  MESSAGES — build and share invitations
// ══════════════════════════════════════════════════════════════
function Messages() {
  const [type, setType] = React.useState("");
  const [f, setF]       = React.useState({ date:"",time:"",venue:"",mapsLink:"",hostedBy:"",custom:"" });
  const upd = (k, v) => setF(p => ({...p, [k]:v}));

  const td = today();

  const prayerMsg = () => {
    const pt = getPT(f.date||td, f.time||"Morning");
    return `🪷 Jayguru 🙏\n\nYou are cordially invited for the\n*${f.time||"Morning"} Prayer*\non *${fmtWithDay(f.date||td)}*\nat *${pt}*\n\n📍 ${f.venue||"[Your Address]"}\n${f.mapsLink?"🗺️ "+f.mapsLink+"\n":""}\nPlease join with family & friends 🙏\n\n— ${f.hostedBy||"Bannerghatta SUK"}\n\nJayguru 🙏`;
  };
  const satsangMsg = () =>
    `🪷 Jayguru 🙏\n\n*Satsang Invitation*\n\nYou are warmly invited to join Satsang\n\n📅 *Date:* ${fmtWithDay(f.date||td)}\n⏰ *Time:* ${f.time||"06:30 AM"}\n📍 *Venue:* ${f.venue||"[Venue Address]"}\n${f.mapsLink?"🗺️ Maps: "+f.mapsLink+"\n":""}\n🕉️ Hosted by *${f.hostedBy||"Bannerghatta SUK"}*\n\nJayguru 🙏`;

  const message = type==="prayer" ? prayerMsg() : type==="satsang" ? satsangMsg() : (f.custom||"");

  function shareWA()  { window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank"); }
  function copyMsg()  { navigator.clipboard.writeText(message).catch(() => {}).then(() => alert("Copied! Paste into WhatsApp.")); }

  return <div className="fade-in">
    <div style={{marginBottom:18}}>
      <label className="divine-label">Message Type</label>
      <div style={{display:"flex",gap:8}}>
        {[["prayer","🌅 Prayer Invite"],["satsang","🪷 Satsang Invite"],["custom","✍️ Custom"]].map(([t,label]) => (
          <button key={t} onClick={() => setType(t)} style={{flex:1,padding:"10px 6px",border:"none",
            borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:12,transition:"all .2s",
            background:type===t?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"rgba(240,246,255,.9)",
            color:type===t?"#fff":"rgba(29,78,216,.7)",
            boxShadow:type===t?"0 3px 12px rgba(29,78,216,.3)":"none"}}>
            {label}
          </button>
        ))}
      </div>
    </div>

    {(type==="prayer" || type==="satsang") && <>
      <div style={{marginBottom:12}}>
        <label className="divine-label">Date</label>
        <input className="divine-input" type="date" value={f.date} onChange={e => upd("date",e.target.value)}/>
      </div>
      {type==="prayer" ? (
        <div style={{marginBottom:12}}>
          <label className="divine-label">Slot</label>
          <select className="divine-input" value={f.time} onChange={e => upd("time",e.target.value)}>
            <option value="">Select</option>
            <option>Morning</option>
            <option>Evening</option>
          </select>
        </div>
      ) : (
        <div style={{marginBottom:12}}>
          <label className="divine-label">Time</label>
          <input className="divine-input" placeholder="e.g. 06:30 AM" value={f.time} onChange={e => upd("time",e.target.value)}/>
        </div>
      )}
      <div style={{marginBottom:12}}>
        <label className="divine-label">Venue / Address</label>
        <input className="divine-input" placeholder="Full address" value={f.venue} onChange={e => upd("venue",e.target.value)}/>
      </div>
      <div style={{marginBottom:12}}>
        <label className="divine-label">Maps Link (optional)</label>
        <input className="divine-input" placeholder="https://maps.app.goo.gl/..." value={f.mapsLink} onChange={e => upd("mapsLink",e.target.value)}/>
      </div>
      <div style={{marginBottom:18}}>
        <label className="divine-label">Hosted By</label>
        <input className="divine-input" placeholder="Bannerghatta SUK" value={f.hostedBy} onChange={e => upd("hostedBy",e.target.value)}/>
      </div>
    </>}

    {type==="custom" && <div style={{marginBottom:18}}>
      <label className="divine-label">Your Message</label>
      <textarea className="divine-input" rows={7} placeholder="Type your message..."
        value={f.custom} onChange={e => upd("custom",e.target.value)} style={{resize:"vertical"}}/>
    </div>}

    {type && <>
      <div style={{background:"rgba(240,246,255,.9)",borderRadius:14,padding:16,marginBottom:16,
        border:"1px solid rgba(59,130,246,.15)"}}>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(29,78,216,.5)",
          textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Preview</div>
        <pre style={{fontSize:13,color:"#1f2937",whiteSpace:"pre-wrap",
          fontFamily:"'Lato',sans-serif",lineHeight:1.65}}>{message}</pre>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={shareWA} style={{flex:1,padding:12,border:"none",borderRadius:12,
          background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff",
          fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(34,197,94,.4)"}}>
          📤 WhatsApp
        </button>
        <button onClick={copyMsg} style={{flex:1,padding:12,border:"none",borderRadius:12,
          background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",
          fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(29,78,216,.35)"}}>
          📋 Copy
        </button>
      </div>
    </>}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP (shown after SUK selected)
// ══════════════════════════════════════════════════════════════
function Main({ suk, onLogout }) {
  const [tab,      setTab]      = React.useState("book");
  const [bookMode, setBookMode] = React.useState("prayer");
  const [calendar, setCalendar] = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);

  async function loadCal() {
    setLoading(true);
    try {
      const now = new Date();
      const m1  = now.toISOString().slice(0,7);
      const m2  = new Date(now.getFullYear(), now.getMonth()+1, 1).toISOString().slice(0,7);
      const [r1, r2] = await Promise.all([
        apiGet(suk.key, "calendar", { month:m1, type:"prayer" }),
        apiGet(suk.key, "calendar", { month:m2, type:"prayer" }),
      ]);
      setCalendar([...(r1.data||[]), ...(r2.data||[])]);
    } catch {}
    setLoading(false);
  }
  React.useEffect(() => { loadCal(); }, [suk.key]);

  const TABS = [
    { id:"book",     icon:"📿", label:"Book"    },
    { id:"manage",   icon:"🔍", label:"Manage"  },
    { id:"all",      icon:"📅", label:"All"     },
    { id:"times",    icon:"🕐", label:"Times"   },
    { id:"messages", icon:"💬", label:"Msgs"    },
    { id:"gallery",  icon:"📸", label:"Gallery" },
  ];

  function content() {
    if (loading && tab==="book") return <Loader/>;
    switch(tab) {
      case "book": return <>
        <div style={{display:"flex",gap:8,marginBottom:20,
          background:"rgba(240,246,255,.8)",padding:6,borderRadius:14}}>
          {[["prayer","🌅 Prayer"],["satsang","🪷 Satsang"]].map(([m,label]) => (
            <button key={m} className={`tab-btn ${bookMode===m?"active":"inactive"}`}
              onClick={() => setBookMode(m)}>{label}</button>
          ))}
        </div>
        {bookMode==="prayer"
          ? <BookPrayer sukKey={suk.key} calendar={calendar} onBooked={loadCal}/>
          : <BookSatsang sukKey={suk.key}/>}
      </>;
      case "manage":   return <Manage sukKey={suk.key}/>;
      case "all":      return <AllBookings sukKey={suk.key}/>;
      case "times":    return <PrayerTimes/>;
      case "messages": return <Messages/>;
      case "gallery":  return <Gallery sukKey={suk.key}/>;
      default: return null;
    }
  }

  return <div style={{minHeight:"100vh",background:"#e8f0fe",overflowX:"hidden"}}>
    <div className="divine-bg"/>

    {/* Background mandala SVG */}
    <svg className="mandala" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[...Array(12)].map((_, i) => (
        <g key={i} transform={`rotate(${i*30},100,100)`}>
          <ellipse cx="100" cy="60" rx="4" ry="18" fill="rgba(99,145,255,.35)"/>
          <ellipse cx="100" cy="42" rx="3" ry="12" fill="rgba(255,200,50,.3)"/>
          <circle  cx="100" cy="32" r="3" fill="rgba(99,145,255,.4)"/>
        </g>
      ))}
      <circle cx="100" cy="100" r="30" stroke="rgba(99,145,255,.25)" strokeWidth="2" fill="none"/>
      <circle cx="100" cy="100" r="20" stroke="rgba(255,200,50,.2)"  strokeWidth="1.5" fill="none"/>
      <circle cx="100" cy="100" r="8"  fill="rgba(255,200,50,.15)"/>
    </svg>
    <svg className="mandala2" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[...Array(8)].map((_, i) => (
        <g key={i} transform={`rotate(${i*45},100,100)`}>
          <rect x="98" y="40" width="4" height="30" rx="2" fill="rgba(255,200,50,.25)"/>
        </g>
      ))}
      <circle cx="100" cy="100" r="45" stroke="rgba(99,145,255,.15)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
    </svg>

    {/* Floating particles */}
    <div className="particles">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${8 + i*8}%`,
          width:  i%3===0?6:i%3===1?4:3,
          height: i%3===0?6:i%3===1?4:3,
          background: i%2===0?"rgba(99,145,255,.35)":"rgba(255,200,50,.3)",
          animationDuration: `${6+i*1.4}s`,
          animationDelay:    `${i*0.55}s`,
        }}/>
      ))}
    </div>

    <div className="content">
      {/* Header */}
      <div style={{paddingTop:20,textAlign:"center",marginBottom:20,position:"relative"}}>
        <div style={{fontSize:40,marginBottom:2,filter:"drop-shadow(0 0 20px rgba(255,180,0,.5))"}}>🪷</div>
        <div className="jayguru-title" style={{fontSize:34}}>Jayguru</div>
        <div style={{fontSize:11,color:"rgba(29,78,216,.5)",letterSpacing:3,
          textTransform:"uppercase",marginTop:4}}>{suk.name}</div>
        <button onClick={onLogout} style={{
          position:"absolute",right:0,top:24,background:"none",
          border:"1px solid rgba(59,130,246,.25)",borderRadius:8,
          padding:"5px 10px",fontSize:11,cursor:"pointer",
          color:"rgba(29,78,216,.5)",fontWeight:600,
        }}>← Change</button>
      </div>

      {/* Main card */}
      <div className="card">
        {/* Tab bar */}
        <div style={{display:"flex",gap:3,marginBottom:20,
          background:"rgba(240,246,255,.8)",padding:5,borderRadius:14,overflowX:"auto"}}>
          {TABS.map(t => (
            <button key={t.id}
              className={`tab-btn ${tab===t.id?"active":"inactive"}`}
              onClick={() => setTab(t.id)}
              style={{minWidth:55,whiteSpace:"nowrap",fontSize:11,padding:"9px 4px"}}>
              {t.icon}<br/><span style={{fontSize:10}}>{t.label}</span>
            </button>
          ))}
        </div>
        <BlueLine/>
        {content()}
      </div>

      <div style={{textAlign:"center",marginTop:20,fontSize:11,
        color:"rgba(29,78,216,.3)",letterSpacing:2}}>
        🪷 Jayguru · Bannerghatta SUK · Bangalore
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  ROOT — app entry point
// ══════════════════════════════════════════════════════════════
function App() {
  const [suk, setSuk] = React.useState(null);
  if (!suk) return <Welcome onEnter={setSuk}/>;
  return <Main suk={suk} onLogout={() => { _token = null; setSuk(null); }}/>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
