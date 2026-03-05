import React from 'react'
import { SUK_CONFIG, sukLabel } from '../../config/sukConfig.js'
import SUKSearchDropdown from './SUKSearchDropdown.jsx'

// ── Floating petals config ────────────────────────────────────
const PETALS = [
  { left:'4%',  dur:'7s',  delay:'0s',   filter:'drop-shadow(0 0 6px rgba(255,180,210,0.9))' },
  { left:'13%', dur:'9s',  delay:'1.2s', filter:'saturate(0) brightness(2) drop-shadow(0 0 5px rgba(255,255,255,0.8))' },
  { left:'23%', dur:'6s',  delay:'0.5s', filter:'drop-shadow(0 0 8px rgba(255,180,210,0.9))' },
  { left:'34%', dur:'8s',  delay:'2.1s', filter:'saturate(0) brightness(2) drop-shadow(0 0 5px rgba(255,255,255,0.8))' },
  { left:'45%', dur:'10s', delay:'0.8s', filter:'drop-shadow(0 0 6px rgba(255,180,210,0.9))' },
  { left:'56%', dur:'7s',  delay:'1.7s', filter:'saturate(0) brightness(2) drop-shadow(0 0 5px rgba(255,255,255,0.8))' },
  { left:'67%', dur:'8.5s',delay:'0.3s', filter:'drop-shadow(0 0 8px rgba(255,180,210,0.9))' },
  { left:'78%', dur:'6.5s',delay:'2.5s', filter:'saturate(0) brightness(2) drop-shadow(0 0 5px rgba(255,255,255,0.8))' },
  { left:'89%', dur:'9.5s',delay:'1s',   filter:'drop-shadow(0 0 6px rgba(255,180,210,0.9))' },
]

// ── Light beam config ─────────────────────────────────────────
const BEAMS = [
  { left:'20%', rot:'-30deg', delay:'0s',   dur:'4s'   },
  { left:'35%', rot:'-12deg', delay:'0.5s', dur:'4.5s' },
  { left:'50%', rot:'0deg',   delay:'0s',   dur:'3.5s' },
  { left:'65%', rot:'12deg',  delay:'0.7s', dur:'5s'   },
  { left:'80%', rot:'30deg',  delay:'0.3s', dur:'4.2s' },
]

function WelcomeScreen({ onSelect }) {
  const [selected,  setSelected]  = React.useState("")
  const [launching, setLaunching] = React.useState(false)
  const [mounted,   setMounted]   = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const activeSuk = selected ? SUK_CONFIG[selected] : null
  const canLaunch = activeSuk && activeSuk.configured

  const handleLaunch = () => {
    if (!canLaunch) return
    setLaunching(true)
    setTimeout(() => onSelect(activeSuk), 520)
  }

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"32px 16px", position:"relative", zIndex:10,
      overflow:"hidden",
    }}>

      {/* ── Animated gold beams ── */}
      {BEAMS.map((b, i) => (
        <div key={i} style={{
          position:"fixed", top:0, left:b.left,
          width:"1px", height:"55%", pointerEvents:"none",
          background:"linear-gradient(to bottom, rgba(255,210,80,0.25), transparent)",
          transformOrigin:"top center",
          transform:`rotate(${b.rot})`,
          animation:`wBeamPulse ${b.dur} ease-in-out ${b.delay} infinite alternate`,
        }}/>
      ))}

      {/* ── Floating lotus petals ── */}
      {PETALS.map((p, i) => (
        <div key={i} style={{
          position:"fixed", bottom:"-5%", left:p.left,
          fontSize:13, pointerEvents:"none",
          filter:p.filter, opacity:0,
          animation:`wPetalFloat ${p.dur} linear ${p.delay} infinite`,
        }}>🪷</div>
      ))}

      {/* ── Expanding rings ── */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"fixed", top:"38%", left:"50%",
          width:160, height:160, borderRadius:"50%",
          border:"1px solid rgba(255,210,80,0.12)",
          transform:"translate(-50%,-50%)",
          pointerEvents:"none",
          animation:`wRingExpand 5s ease-out ${i*1.65}s infinite`,
        }}/>
      ))}

      {/* ── Main content ── */}

      {/* Lotus */}
      <span style={{
        fontSize:42, display:"inline-block", marginBottom:10,
        filter:"drop-shadow(0 0 24px rgba(255,180,0,0.7)) drop-shadow(0 0 50px rgba(255,140,0,0.3))",
        animation:"wLotusFloat 3s ease-in-out infinite alternate, wLotusGlow 2s ease-in-out infinite alternate",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        transition:"opacity 0.7s ease, transform 0.7s ease",
      }}>🪷</span>

      {/* JAYGURU */}
      <div style={{
        fontFamily:"'Cinzel',serif", fontWeight:900,
        fontSize:"clamp(32px,8vw,52px)", letterSpacing:"8px", textAlign:"center",
        background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 45%,#d97706 100%)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition:"opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
        animation:"wTitleShimmer 3.5s ease-in-out 1s infinite alternate",
      }}>JAYGURU</div>

      {/* Subtitle */}
      <div style={{
        fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700,
        letterSpacing:"5px", color:"rgba(29,78,216,0.45)",
        textTransform:"uppercase", marginTop:5, textAlign:"center",
        opacity: mounted ? 1 : 0,
        transition:"opacity 0.7s ease 0.3s",
      }}>🙏 Satsang Upayojana Kendra 🙏</div>

      {/* Ornamental divider */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        margin:"18px 0 24px", width:"100%", maxWidth:400,
        opacity: mounted ? 1 : 0,
        transition:"opacity 0.7s ease 0.45s",
      }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,200,60,0.45),rgba(59,130,246,0.3))" }}/>
        <span style={{ fontSize:14, color:"rgba(255,180,0,0.7)", animation:"wSparkle 2s ease-in-out infinite alternate" }}>✦</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(59,130,246,0.3),rgba(255,200,60,0.45),transparent)" }}/>
      </div>

      {/* ── DROPDOWN CARD ── */}
      <div style={{
        width:"100%", maxWidth:400,
        background:"rgba(255,255,255,0.84)", borderRadius:22,
        padding:"28px 24px 24px",
        boxShadow:"0 8px 40px rgba(29,78,216,0.13), 0 2px 8px rgba(0,0,0,0.05)",
        border:"1.5px solid rgba(59,130,246,0.14)",
        backdropFilter:"blur(14px)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        transition:"opacity 0.7s ease 0.55s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s",
      }}>

        <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:800,
          color:"rgba(29,78,216,0.55)", letterSpacing:"2.5px",
          textTransform:"uppercase", marginBottom:10 }}>
          Select Your Satsang Upayojana Kendra
        </div>

        <SUKSearchDropdown selected={selected} onSelect={setSelected} />

        {/* SUK preview */}
        {activeSuk && activeSuk.configured && (() => {
          const tc = activeSuk.themeColor || '#1d4ed8'
          return (
            <div style={{ marginTop:16, padding:"14px 16px", borderRadius:14,
              background:`linear-gradient(135deg,${tc}0a,${tc}05)`,
              border:`1px solid ${tc}20`,
              animation:"fadeSlideIn 0.3s ease-out both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ fontSize:24, filter:`drop-shadow(0 0 8px ${tc}60)`,
                  animation:"wLotusFloat 2.5s ease-in-out infinite alternate" }}>
                  {activeSuk.emoji}
                </div>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontWeight:800, fontSize:14, color:"#1e3a8a" }}>
                    {sukLabel(activeSuk)}
                  </div>
                  <div style={{ fontSize:11, color:"rgba(29,78,216,0.45)", fontWeight:600 }}>
                    {activeSuk.location ? `📍 ${activeSuk.location}` : ""}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={!canLaunch || launching}
          style={{
            width:"100%", marginTop:18,
            padding:"15px", borderRadius:13, border:"none",
            fontFamily:"'Cinzel',serif", fontWeight:800,
            fontSize:15, letterSpacing:"1px",
            cursor: canLaunch ? "pointer" : "not-allowed",
            transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: (canLaunch && !launching) ? "scale(1)" : "scale(0.98)",
            background: canLaunch
              ? "linear-gradient(135deg,#0f2266,#1d4ed8,#3b82f6)"
              : "rgba(200,210,230,0.5)",
            color: canLaunch ? "#fff" : "#aaa",
            boxShadow: canLaunch
              ? "0 6px 24px rgba(29,78,216,0.35), 0 0 0 0 rgba(99,102,241,0)"
              : "none",
            animation: canLaunch && !launching ? "wButtonPulse 2.5s ease-in-out infinite" : "none",
          }}>
          {launching
            ? `${activeSuk.emoji || '🪷'}  Entering ${sukLabel(activeSuk)}...`
            : canLaunch
              ? `${activeSuk.emoji || '🪷'}  Open ${sukLabel(activeSuk)}`
              : "Select a Kendra to continue"}
        </button>
      </div>

      {/* Bottom tagline */}
      <div style={{
        marginTop:24, textAlign:"center",
        opacity: mounted ? 1 : 0,
        transition:"opacity 0.7s ease 0.75s",
      }}>
        <div style={{ fontSize:10, color:"rgba(29,78,216,0.28)", fontWeight:600,
          letterSpacing:"2px", textTransform:"uppercase" }}>
          Book · Satsang · Photos · Manage
        </div>
        <div style={{ fontSize:11, color:"rgba(29,78,216,0.2)", marginTop:5, fontFamily:"'Cinzel',serif" }}>
          Jayguru 🙏
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes wPetalFloat {
          0%   { transform:translateY(0) rotate(0deg) scale(0.5); opacity:0; }
          8%   { opacity:0.75; }
          90%  { opacity:0.35; }
          100% { transform:translateY(-105vh) rotate(720deg) scale(1.2); opacity:0; }
        }
        @keyframes wBeamPulse {
          from { opacity:0.08; transform:scaleX(1)   rotate(var(--r, 0deg)); }
          to   { opacity:0.5;  transform:scaleX(3.5) rotate(var(--r, 0deg)); }
        }
        @keyframes wRingExpand {
          0%   { transform:translate(-50%,-50%) scale(0.1); opacity:0.8; }
          100% { transform:translate(-50%,-50%) scale(6);   opacity:0;   }
        }
        @keyframes wLotusFloat {
          from { transform:translateY(0) scale(1); }
          to   { transform:translateY(-10px) scale(1.06); }
        }
        @keyframes wLotusGlow {
          from { filter:drop-shadow(0 0 18px rgba(255,200,50,0.6)) drop-shadow(0 0 50px rgba(255,160,0,0.3)); }
          to   { filter:drop-shadow(0 0 40px rgba(255,220,80,1.0)) drop-shadow(0 0 90px rgba(255,180,0,0.5)); }
        }
        @keyframes wTitleShimmer {
          from { filter:brightness(1); }
          to   { filter:brightness(1.3) drop-shadow(0 0 12px rgba(99,102,241,0.3)); }
        }
        @keyframes wSparkle {
          from { opacity:0.5; transform:scale(1)    rotate(0deg); }
          to   { opacity:1;   transform:scale(1.35) rotate(180deg); }
        }
        @keyframes wButtonPulse {
          0%,100% { box-shadow:0 6px 24px rgba(29,78,216,0.35), 0 0 0 0   rgba(99,102,241,0.4); }
          50%     { box-shadow:0 6px 24px rgba(29,78,216,0.35), 0 0 0 8px rgba(99,102,241,0);   }
        }
      `}</style>

    </div>
  )
}


// ============================================================
//  APP SHELL — manages SUK selection + renders App
// ============================================================

export default WelcomeScreen
