// ============================================================
//  app.js  — Main React Application Shell
//  Token auth and API calls are handled by core/api.js
//  This file handles: welcome screen, SUK switcher, tab routing
// ============================================================

"use strict";

var { createElement: h, useState, useEffect, useMemo, useRef } = React;

// ── Expose globally ──────────────────────────────────────────
window._sukApi = null;

// ── Shared UI atoms ──────────────────────────────────────────
function BlueDivider() {
  return h("div", { style:{ display:"flex", alignItems:"center", gap:10, margin:"6px 0 16px" } },
    h("div", { style:{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(59,130,246,0.4))" } }),
    h("span", { style:{ color:"rgba(59,130,246,0.45)", fontSize:14 } }, "✦"),
    h("div", { style:{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(59,130,246,0.4),transparent)" } })
  );
}

// ── SUK searchable dropdown ──────────────────────────────────
function SUKSearchDropdown({ selected, onSelect }) {
  var allSuks  = useMemo(() => Object.values(window.SUK_CONFIG), []);
  var [isOpen,      setIsOpen]      = useState(false);
  var [search,      setSearch]      = useState("");
  var [highlighted, setHighlighted] = useState(0);
  var [pinging,     setPinging]     = useState(null);
  var inputRef     = useRef(null);
  var listRef      = useRef(null);
  var containerRef = useRef(null);

  var activeSuk = selected ? window.SUK_CONFIG[selected] : null;

  var filtered = useMemo(() => {
    var q = search.toLowerCase().trim();
    var list = !q ? allSuks : allSuks.filter(s =>
      (s.shortName||s.name||"").toLowerCase().includes(q) ||
      (s.location||"").toLowerCase().includes(q)
    );
    return [...list].sort((a,b) => {
      var an = (a.shortName||a.name||"").replace(/ SUK$/i,"").trim().toLowerCase();
      var bn = (b.shortName||b.name||"").replace(/ SUK$/i,"").trim().toLowerCase();
      return an.localeCompare(bn);
    });
  }, [search, allSuks]);

  useEffect(() => { setHighlighted(0); }, [search]);

  useEffect(() => {
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function open() { setIsOpen(true); setTimeout(() => inputRef.current && inputRef.current.focus(), 50); }

  function pick(suk) {
    if (!suk.configured) {
      setPinging(suk.key);
      setTimeout(() => setPinging(null), 2200);
      return;
    }
    onSelect(suk.key);
    setIsOpen(false);
    setSearch("");
  }

  function onKey(e) {
    if (!isOpen) { if (e.key === "Enter" || e.key === " ") open(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(function(h) { return Math.min(h+1, filtered.length-1); }); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(function(h) { return Math.max(h-1, 0); }); }
    else if (e.key === "Enter") { if (filtered[highlighted]) pick(filtered[highlighted]); }
    else if (e.key === "Escape") { setIsOpen(false); setSearch(""); }
  }

  useEffect(() => {
    if (isOpen && listRef.current) {
      var el = listRef.current.children[highlighted];
      if (el) el.scrollIntoView({ block:"nearest" });
    }
  }, [highlighted, isOpen]);

  var displayName = activeSuk ? (activeSuk.shortName || activeSuk.name) : "— Select Your Kendra —";

  return h("div", { ref: containerRef, style:{ position:"relative" }, onKeyDown: onKey, tabIndex: 0 },
    h("div", {
      onClick: () => isOpen ? setIsOpen(false) : open(),
      className: "divine-input",
      style:{ cursor:"pointer", display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"12px 14px", userSelect:"none" }
    },
      h("span", { style:{ color: activeSuk ? "#1e3a8a" : "rgba(96,130,200,0.4)" } }, displayName),
      h("span", { style:{ color:"rgba(59,130,246,0.5)", fontSize:12, transition:"transform .2s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0)" } }, "▾")
    ),
    isOpen && h("div", {
      style:{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:200,
              background:"#fff", borderRadius:16, border:"1px solid rgba(59,130,246,0.2)",
              boxShadow:"0 8px 32px rgba(29,78,216,0.15)", overflow:"hidden",
              maxHeight:320, display:"flex", flexDirection:"column" }
    },
      h("div", { style:{ padding:"10px 12px", borderBottom:"1px solid rgba(59,130,246,0.1)" } },
        h("input", {
          ref: inputRef, className: "divine-input", placeholder: "Search Kendra...",
          value: search, onChange: e => setSearch(e.target.value),
          style:{ padding:"8px 12px", fontSize:13 },
        })
      ),
      h("div", { ref: listRef, style:{ overflowY:"auto", flex:1 } },
        filtered.length === 0
          ? h("div", { style:{ padding:"18px", textAlign:"center", color:"rgba(29,78,216,0.35)", fontSize:13 } }, "No results")
          : filtered.map((suk, i) => {
              var isActive  = suk.key === selected;
              var isPinging = suk.key === pinging;
              return h("div", {
                key: suk.key, onClick: () => pick(suk),
                style:{
                  padding:"11px 16px", cursor: suk.configured ? "pointer" : "default",
                  background: i===highlighted ? "rgba(239,246,255,0.9)" : isActive ? "rgba(219,234,254,0.5)" : "transparent",
                  borderBottom:"1px solid rgba(59,130,246,0.05)",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  transition:"background .15s",
                  animation: isPinging ? "pingPulse 0.4s ease 3" : "none",
                }
              },
                h("div", null,
                  h("div", { style:{ fontSize:14, fontWeight:600, color: suk.configured ? "#1e3a8a" : "#9ca3af" } },
                    suk.shortName || suk.name),
                  suk.location && h("div", { style:{ fontSize:11, color:"rgba(29,78,216,0.4)", marginTop:2 } }, suk.location)
                ),
                !suk.configured && h("span", {
                  style:{ fontSize:9, fontWeight:700, color:"#6366f1", background:"#ede9fe",
                          padding:"2px 6px", borderRadius:4, textTransform:"uppercase", letterSpacing:1 }
                }, isPinging ? "Soon 🔔" : "Soon")
              );
            })
      )
    )
  );
}

// ══════════════════════════════════════════════════════════════
//  WELCOME SCREEN
// ══════════════════════════════════════════════════════════════
function Welcome({ onEnter }) {
  var [sel,     setSel]     = useState("");
  var [loading, setLoading] = useState(false);
  var [error,   setError]   = useState("");

  async function enter() {
    if (!sel) return setError("Please select your Kendra.");
    var suk = window.SUK_CONFIG[sel];
    if (!suk || !suk.configured) return setError("This Kendra is coming soon. Please select another.");
    setLoading(true); setError("");
    try {
      await window.refreshToken(sel, suk.scriptUrl);
      onEnter(suk, suk.scriptUrl);
    } catch(e) {
      setError("Could not connect. Please check your internet and try again.");
    }
    setLoading(false);
  }

  return h("div", {
    style:{ minHeight:"100vh", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1 }
  },
    h("div", { className:"divine-bg" }),
    h("div", { style:{ textAlign:"center", marginBottom:40, position:"relative", zIndex:1 } },
      h("div", { style:{ fontSize:64, marginBottom:8, filter:"drop-shadow(0 0 30px rgba(255,180,0,.6))" } }, "🪷"),
      h("div", { className:"jayguru-title" }, "Jayguru"),
      h("div", { style:{ color:"rgba(29,78,216,.55)", fontSize:11, letterSpacing:4, marginTop:8, textTransform:"uppercase" } },
        "Satsang Upayojana Kendra · Bangalore")
    ),
    h("div", { className:"card", style:{ width:"100%", maxWidth:420 } },
      h("div", { style:{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700,
                         color:"#1e3a8a", textAlign:"center", marginBottom:20, letterSpacing:1 } },
        "Select Your Kendra 🙏"),
      h("label", { className:"divine-label" }, "Choose your SUK center"),
      h(SUKSearchDropdown, { selected: sel, onSelect: v => { setSel(v); setError(""); } }),
      error && h("div", {
        style:{ color:"#dc2626", fontSize:13, fontWeight:600, marginTop:10, textAlign:"center",
                padding:"10px 14px", background:"#fef2f2", borderRadius:10, border:"1px solid #fecaca" }
      }, "⚠️ " + error),
      h("button", {
        className:"submit-btn", style:{ marginTop:20 },
        onClick: enter, disabled: loading
      }, loading ? "Connecting to Kendra..." : "Enter 🙏 Jayguru")
    ),
    h("div", { style:{ marginTop:24, color:"rgba(29,78,216,.3)", fontSize:11, letterSpacing:3, textTransform:"uppercase" } },
      "Bannerghatta · Peenya · Banashankari")
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
function Main({ suk, api, onLogout }) {
  var feat = window.getFeatures ? window.getFeatures() : {};
  var TABS = [
    { id:"book",     icon:"📿", label:"Book",    show: feat.prayerBooking !== false },
    { id:"manage",   icon:"🔍", label:"Manage",  show: feat.retrieveBooking !== false },
    { id:"all",      icon:"📅", label:"All",     show: feat.allBookings !== false },
    { id:"times",    icon:"🕐", label:"Times",   show: feat.prayerTimes !== false },
    { id:"messages", icon:"💬", label:"Msgs",    show: feat.messages !== false },
    { id:"gallery",  icon:"📸", label:"Gallery", show: feat.photoGallery !== false },
  ].filter(function(t) { return t.show; });

  var [tab,          setTab]          = useState(TABS[0] ? TABS[0].id : "book");
  var [bookMode,     setBookMode]     = useState("prayer");
  var [calendar,     setCalendar]     = useState([]);
  var [calLoading,   setCalLoading]   = useState(true);
  var [prayerConfirm,  setPrayerConfirm]  = useState(null);
  var [satsangConfirm, setSatsangConfirm] = useState(null);

  async function loadCal() {
    setCalLoading(true);
    try {
      var now = new Date();
      var m1  = now.toISOString().slice(0,7);
      var m2  = new Date(now.getFullYear(), now.getMonth()+1, 1).toISOString().slice(0,7);
      var [r1, r2] = await Promise.all([
        api.prayer.getCalendar(m1, "prayer"),
        api.prayer.getCalendar(m2, "prayer"),
      ]);
      setCalendar([...(r1.data||[]), ...(r2.data||[])]);
    } catch(e) {
      setCalendar([]);
    } finally {
      setCalLoading(false);
    }
  }

  useEffect(() => { loadCal(); }, [suk.key]);

  function handlePrayerBooked(confirmation) {
    if (confirmation) setPrayerConfirm(confirmation);
    loadCal();
  }

  function handleSatsangBooked(confirmation) {
    if (confirmation) setSatsangConfirm(confirmation);
  }

  function content() {
    if (calLoading && tab === "book") return h(window.DataLoadingOverlay || "div", {});
    switch(tab) {
      case "book": return h("div", { className:"fade-in" },
        feat.satsangBooking !== false && h("div", {
          style:{ display:"flex", gap:8, marginBottom:20, background:"rgba(240,246,255,.8)", padding:6, borderRadius:14 }
        },
          [["prayer","🌅 Prayer"],["satsang","🪷 Satsang"]].map(([m,label]) =>
            h("button", { key:m, className:"tab-btn " + (bookMode===m?"active":"inactive"),
              onClick: () => setBookMode(m) }, label)
          )
        ),
        bookMode === "prayer" || feat.satsangBooking === false
          ? h(window.PrayerBookingTab || "div", { sukKey: suk.key, api, calendar, onBooked: handlePrayerBooked, feat })
          : h(window.SatsangBookingForm || "div", { sukKey: suk.key, api, onBooked: handleSatsangBooked })
      );
      case "manage":   return h(window.RetrieveBookingTab || "div", { sukKey: suk.key, api });
      case "all":      return h(window.AllBookingsView    || "div", { sukKey: suk.key, api });
      case "times":    return h(window.PrayerTimesTab     || "div", {});
      case "messages": return h(window.MessageComposerTab || "div", { suk });
      case "gallery":  return h(window.PhotoGalleryTab    || "div", { sukKey: suk.key, api });
      default: return null;
    }
  }

  return h("div", { style:{ minHeight:"100vh", background:"#e8f0fe", overflowX:"hidden" } },
    h("div", { className:"divine-bg" }),
    h("svg", { className:"mandala", viewBox:"0 0 500 500", xmlns:"http://www.w3.org/2000/svg" },
      h("g", { fill:"none", stroke:"#1d4ed8", strokeWidth:"0.7", transform:"translate(250,250)" },
        h("circle",{r:"240"}),h("circle",{r:"210"}),h("circle",{r:"180"}),
        h("circle",{r:"150"}),h("circle",{r:"110"}),h("circle",{r:"70"}),h("circle",{r:"36"}),
        ...[0,30,60,90,120,150].map(a => h("ellipse",{key:"e"+a,rx:"28",ry:"95",transform:"rotate("+a+")"})),
        ...[15,45,75,105,135,165].map(a => h("ellipse",{key:"f"+a,rx:"16",ry:"55",transform:"rotate("+a+")"})),
        ...[0,30,60,90,120,150].map(a => h("line",{key:"l"+a,x1:"0",y1:"-240",x2:"0",y2:"240",transform:"rotate("+a+")"}))
      )
    ),
    h("div", { className:"content" },
      h("div", { style:{ paddingTop:20, textAlign:"center", marginBottom:20, position:"relative" } },
        h("div", { style:{ fontSize:40, marginBottom:2, filter:"drop-shadow(0 0 20px rgba(255,180,0,.5))" } }, "🪷"),
        h("div", { className:"jayguru-title", style:{ fontSize:34 } }, "Jayguru"),
        h("div", { style:{ fontSize:11, color:"rgba(29,78,216,.5)", letterSpacing:3, textTransform:"uppercase", marginTop:4 } },
          suk.shortName || suk.name),
        h("button", {
          onClick: onLogout,
          style:{ position:"absolute", right:0, top:24, background:"none",
                  border:"1px solid rgba(59,130,246,.25)", borderRadius:8,
                  padding:"5px 10px", fontSize:11, cursor:"pointer",
                  color:"rgba(29,78,216,.5)", fontWeight:600 }
        }, "← Change")
      ),
      h("div", { className:"card" },
        h("div", { style:{ display:"flex", gap:3, marginBottom:20, background:"rgba(240,246,255,.8)",
                            padding:5, borderRadius:14, overflowX:"auto" } },
          TABS.map(t =>
            h("button", {
              key: t.id, className:"tab-btn " + (tab===t.id?"active":"inactive"),
              onClick: () => setTab(t.id),
              style:{ minWidth:55, whiteSpace:"nowrap", fontSize:11, padding:"9px 4px" }
            }, t.icon, h("br",{}), h("span",{style:{fontSize:10}}, t.label))
          )
        ),
        h(BlueDivider, {}),
        content()
      ),
      h("div", { style:{ textAlign:"center", marginTop:20, fontSize:11, color:"rgba(29,78,216,.3)", letterSpacing:2 } },
        "🪷 Jayguru · " + (suk.shortName || suk.name) + " · Bangalore")
    ),
    prayerConfirm && h(window.BookingConfirmModal, { confirmation: prayerConfirm, onClose: () => setPrayerConfirm(null) }),
    satsangConfirm && h(window.SatsangConfirmModal, { confirmation: satsangConfirm, onClose: () => setSatsangConfirm(null) })
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════
function App() {
  var [suk, setSuk]           = useState(null);
  var [workerUrl, setWorkerUrl] = useState(null);
  var apiRef = useRef(null);

  function handleEnter(sukObj, url) {
    window.ACTIVE_SUK = sukObj;
    window.SCRIPT_URL = url;
    window.API_KEY    = sukObj.key;
    apiRef.current    = window.buildApi(sukObj.key, url);
    window._sukApi    = apiRef.current;
    setSuk(sukObj);
    setWorkerUrl(url);
    try { sessionStorage.setItem("activeSuk", sukObj.key); } catch {}
  }

  function handleLogout() {
    window.ACTIVE_SUK = null;
    window._sukApi    = null;
    apiRef.current    = null;
    setSuk(null);
    setWorkerUrl(null);
    try { sessionStorage.removeItem("activeSuk"); } catch {}
  }

  useEffect(() => {
    try {
      var saved = sessionStorage.getItem("activeSuk");
      if (saved) {
        var sukObj = window.SUK_CONFIG && window.SUK_CONFIG[saved];
        if (sukObj && sukObj.configured) handleEnter(sukObj, sukObj.scriptUrl);
      }
    } catch {}
  }, []);

  if (!suk) return h(Welcome, { onEnter: handleEnter });
  return h(Main, { suk, api: apiRef.current, onLogout: handleLogout });
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App, {}));
