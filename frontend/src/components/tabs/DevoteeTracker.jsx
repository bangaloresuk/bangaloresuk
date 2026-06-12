// ============================================================
//  DevoteeTracker — Live data from Google Sheets via bookings prop
//  Props: bookings[]  (same array App.jsx fetches via api.getAll())
//  Each booking: { id, date, name, mobile, time, place, ... }
// ============================================================

import React from 'react'

// ── Colours ───────────────────────────────────────────────────
const C = {
  active:   '#15803d',
  'at-risk':'#b45309',
  inactive: '#dc2626',
  activeBg:   '#dcfce7',
  'at-riskBg':'#fef3c7',
  inactiveBg: '#fee2e2',
}
const AV_BG   = ['#bfdbfe','#a7f3d0','#fed7aa','#ddd6fe','#fecaca','#d1fae5','#fde68a','#e0e7ff']
const AV_TEXT = ['#1e40af','#065f46','#92400e','#4c1d95','#991b1b','#064e3b','#78350f','#3730a3']
const MONTH_KEYS   = ['01','02','03','04','05','06','07','08','09','10','11','12']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function ci(name)  { let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))&0xffff; return h%8 }
function ini(name) { const p=name.trim().split(/\s+/); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase() }
function today()   { const d=new Date(); d.setHours(0,0,0,0); return d }
function todayStr(){ return today().toISOString().slice(0,10) }
function daysBetween(a,b){ return Math.round((b-new Date(a+'T00:00:00'))/86400000) }

// ── Build devotees from live bookings array ───────────────────
function buildDevotees(bookings) {
  const NOW     = today()
  const NOW_STR = todayStr()
  const map     = {}

  bookings.forEach(b => {
    const mob  = (b.mobile || '').trim()
    const name = (b.name   || '').trim()
    const date = (b.date   || '').slice(0,10)
    if (!mob || !date) return
    if (!map[mob]) map[mob] = { name, mobile: mob, dates: new Set() }
    map[mob].dates.add(date)
    map[mob].name = name   // keep latest name variant
  })

  return Object.values(map).map(d => {
    const allDates  = [...d.dates].sort()
    const past      = allDates.filter(x => x <= NOW_STR)
    const future    = allDates.filter(x => x >  NOW_STR)

    const lastPast   = past.length ? past[past.length-1] : null
    const daysSince  = lastPast ? daysBetween(lastPast, NOW) : 9999
    const nextBook   = future.length ? future[0] : null

    const status = daysSince <= 30 ? 'active' : daysSince <= 90 ? 'at-risk' : 'inactive'

    // Score (0–100):
    //  50 pts — past bookings (5 pts each, max 10 bookings)
    //  30 pts — status  (active=30, at-risk=15, inactive=0)
    //  20 pts — recency (linear: 20 at 0d → 0 at 90d)
    const bPts = Math.min(50, past.length * 5)
    const sPts = status==='active' ? 30 : status==='at-risk' ? 15 : 0
    const rPts = daysSince <= 90 ? Math.round(20*(1-daysSince/90)) : 0
    const score = bPts + sPts + rPts

    // Tier: based on PAST bookings only
    const tier = past.length >= 5 ? 'core' : past.length >= 2 ? 'regular' : 'one-time'

    return {
      name:        d.name,
      mobile:      d.mobile,
      total:       past.length,        // PAST bookings only
      futureCount: future.length,
      allDates,
      pastDates:   past,
      lastPast:    lastPast || '',
      daysSince,
      nextBook,
      status,
      score,
      tier,
    }
  }).sort((a,b) => b.total - a.total)
}

// ── Chart.js loader ───────────────────────────────────────────
function useChartJs() {
  const [ready, setReady] = React.useState(!!window.Chart)
  React.useEffect(() => {
    if (window.Chart) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])
  return ready
}
function ChartCanvas({ config, deps, height=220 }) {
  const ref = React.useRef()
  const ok  = useChartJs()
  React.useEffect(() => {
    if (!ok || !ref.current) return
    const ch = new window.Chart(ref.current, config())
    return () => ch.destroy()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, ...deps])
  if (!ok) return <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(29,78,216,0.3)',fontSize:12}}>Loading chart…</div>
  return <div style={{position:'relative',width:'100%',height}}><canvas ref={ref}/></div>
}

// ── Small components ──────────────────────────────────────────
function Av({ name, size=32 }) {
  const i = ci(name)
  return <div style={{width:size,height:size,borderRadius:'50%',flexShrink:0,background:AV_BG[i],color:AV_TEXT[i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:800}}>{ini(name)}</div>
}

function Badge({ status }) {
  return <span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:20,background:C[status+'Bg']||'#f3f4f6',color:C[status]||'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>{status}</span>
}

function ScoreBar({ score, status }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:5}}>
      <div style={{flex:1,height:5,borderRadius:3,background:'rgba(239,246,255,0.9)',overflow:'hidden'}}>
        <div style={{height:5,borderRadius:3,background:C[status],width:score+'%',transition:'width .4s'}}/>
      </div>
      <span style={{fontSize:10,color:'rgba(29,78,216,0.4)',minWidth:22}}>{score}</span>
    </div>
  )
}

// ── Devotee detail drawer ─────────────────────────────────────
function DetailDrawer({ dev, onClose }) {
  const year = new Date().getFullYear()
  const mCounts = MONTH_KEYS.map(m =>
    dev.pastDates.filter(x => x.startsWith(year+'-'+m)).length
  )
  const mLabels = MONTH_LABELS

  // weekly heatmap Feb–Dec of current year
  const start = new Date(`${year}-02-01T00:00:00`)
  const dateSet = new Set(dev.allDates)
  const weeks=[], wLabels=[]
  let prevM=''
  for(let w=0;w<46;w++){
    const ws=new Date(start); ws.setDate(start.getDate()+w*7)
    if(ws.getFullYear()>year) break
    const mk=ws.toISOString().slice(0,7)
    const mn=MONTH_LABELS[parseInt(mk.slice(5,7))-1]
    wLabels.push(mn!==prevM?mn:''); if(mn) prevM=mn
    const has=dev.allDates.some(dt=>{const d=new Date(dt+'T00:00:00');return d>=ws&&d<new Date(ws.getTime()+7*86400000)})
    weeks.push({has,label:ws.toISOString().slice(0,10)})
  }
  const c=ci(dev.name)

  return (
    <div style={{background:'rgba(239,246,255,0.7)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:16,padding:16,marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
        <Av name={dev.name} size={44}/>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontWeight:800,color:'#1e3a8a',fontSize:15}}>{dev.name}</div>
          <div style={{fontSize:12,color:'rgba(29,78,216,0.5)',marginTop:2}}>📱 {dev.mobile}</div>
          <div style={{marginTop:5}}><Badge status={dev.status}/></div>
        </div>
        <button onClick={onClose} style={{marginLeft:'auto',width:32,height:32,borderRadius:'50%',border:'none',background:'rgba(29,78,216,0.1)',cursor:'pointer',fontSize:16,color:'#1e3a8a',fontWeight:900}}>✕</button>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))',gap:8,marginBottom:14}}>
        {[
          ['Past bookings',dev.total],
          ['Upcoming',dev.futureCount],
          ['Days since',dev.daysSince===9999?'—':dev.daysSince+'d'],
          ['Next booking',dev.nextBook||'—'],
          ['Seva score',dev.score+'/100'],
        ].map(([l,v])=>(
          <div key={l} style={{background:'rgba(255,255,255,0.8)',borderRadius:10,padding:'9px 10px'}}>
            <div style={{fontSize:10,color:'rgba(29,78,216,0.45)',fontWeight:700,textTransform:'uppercase',marginBottom:3}}>{l}</div>
            <div style={{fontSize:15,fontWeight:900,color:'#1e3a8a'}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <ChartCanvas height={160} deps={[dev.mobile]} config={()=>({
        type:'bar',
        data:{labels:mLabels,datasets:[{data:mCounts,backgroundColor:mCounts.map(v=>v>0?AV_BG[c]:'rgba(239,246,255,0.5)'),borderColor:mCounts.map(v=>v>0?AV_TEXT[c]:'rgba(59,130,246,0.15)'),borderWidth:1,borderRadius:3}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Monthly bookings',font:{size:12},color:'#6b7280'}},scales:{x:{ticks:{font:{size:10}},grid:{display:false}},y:{beginAtZero:true,ticks:{font:{size:10},stepSize:1},grid:{color:'rgba(0,0,0,0.05)'}}}}
      })}/>

      {/* Weekly heatmap */}
      <div style={{marginTop:12}}>
        <div style={{fontSize:11,color:'rgba(29,78,216,0.45)',fontWeight:700,marginBottom:5}}>Week-by-week activity ({year})</div>
        <div style={{display:'flex',gap:2,overflowX:'auto',paddingBottom:3}}>
          {weeks.map((w,i)=>(
            <div key={i} title={`${w.label}${w.has?' — booked':''}`}
              style={{width:13,height:13,borderRadius:2,flexShrink:0,background:w.has?AV_TEXT[c]:'#e0e7ff'}}/>
          ))}
        </div>
        <div style={{display:'flex',gap:2,marginTop:2}}>
          {wLabels.map((l,i)=><div key={i} style={{width:13,fontSize:8,color:'rgba(29,78,216,0.35)',textAlign:'center',flexShrink:0}}>{l}</div>)}
        </div>
      </div>

      {/* Booking history */}
      <div style={{marginTop:14}}>
        <div style={{fontSize:11,color:'rgba(29,78,216,0.45)',fontWeight:700,marginBottom:6}}>All bookings</div>
        <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:200,overflowY:'auto'}}>
          {dev.allDates.slice().reverse().map(dt=>{
            const isPast = dt <= todayStr()
            return (
              <div key={dt} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'5px 8px',borderRadius:8,background:'rgba(255,255,255,0.7)'}}>
                <span style={{fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:800,background:isPast?'#dcfce7':'#dbeafe',color:isPast?'#065f46':'#1e40af'}}>{isPast?'Done':'Upcoming'}</span>
                <span style={{fontWeight:700,color:'#1e3a8a'}}>{dt}</span>
                <span style={{color:'rgba(29,78,216,0.35)',fontSize:10,marginLeft:'auto'}}>{new Date(dt+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'})}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Heatmap table ─────────────────────────────────────────────
function HeatmapTable({ devs }) {
  const year = new Date().getFullYear()
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:560}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',padding:'6px 8px',color:'rgba(29,78,216,0.5)',fontWeight:800,fontSize:10,textTransform:'uppercase',borderBottom:'1px solid rgba(59,130,246,0.12)'}}>Devotee</th>
            {MONTH_LABELS.map(m=><th key={m} style={{padding:'6px 4px',color:'rgba(29,78,216,0.5)',fontWeight:800,fontSize:10,textAlign:'center',borderBottom:'1px solid rgba(59,130,246,0.12)'}}>{m}</th>)}
            <th style={{padding:'6px 4px',color:'rgba(29,78,216,0.5)',fontWeight:800,fontSize:10,textAlign:'center',borderBottom:'1px solid rgba(59,130,246,0.12)'}}>Total</th>
          </tr>
        </thead>
        <tbody>
          {devs.map(d=>(
            <tr key={d.mobile}>
              <td style={{padding:'5px 8px',borderBottom:'1px solid rgba(59,130,246,0.07)'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <Av name={d.name} size={22}/>
                  <span style={{fontSize:12,color:'#1e3a8a',fontWeight:600}}>{d.name}</span>
                </div>
              </td>
              {MONTH_KEYS.map(m=>{
                const cnt=d.pastDates.filter(x=>x.startsWith(year+'-'+m)).length
                return (
                  <td key={m} style={{padding:'3px 2px',textAlign:'center',borderBottom:'1px solid rgba(59,130,246,0.07)'}}>
                    <div style={{width:26,height:26,borderRadius:5,background:cnt>0?C[d.status]:'rgba(239,246,255,0.5)',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:cnt>0?'#fff':'transparent',fontWeight:800}}>
                      {cnt>0?cnt:''}
                    </div>
                  </td>
                )
              })}
              <td style={{padding:'5px 4px',textAlign:'center',fontWeight:800,color:'#1e3a8a',fontSize:13,borderBottom:'1px solid rgba(59,130,246,0.07)'}}>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Attention strip ───────────────────────────────────────────
function AttentionStrip({ devs }) {
  const needs = devs.filter(d=>d.status!=='active').sort((a,b)=>b.daysSince-a.daysSince).slice(0,5)
  if (!needs.length) return null
  return (
    <div style={{background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:14,padding:'12px 16px',marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:800,color:'#92400e',marginBottom:10}}>⚠️ Needs your attention</div>
      {needs.map(d=>(
        <div key={d.mobile} style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',fontSize:12,marginBottom:7}}>
          <Av name={d.name} size={22}/>
          <span style={{fontWeight:700,color:'#78350f'}}>{d.name}</span>
          <span style={{color:'rgba(120,53,15,0.6)'}}>— last seen <b>{d.daysSince}d ago</b> ({d.lastPast})</span>
          <Badge status={d.status}/>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
//  MAIN EXPORT — receives live bookings prop from App.jsx
// ════════════════════════════════════════════════════════════════
export default function DevoteeTracker({ bookings = [] }) {
  const [search,   setSearch]   = React.useState('')
  const [filter,   setFilter]   = React.useState('all')
  const [subPage,  setSubPage]  = React.useState('overview')
  const [selected, setSelected] = React.useState(null)
  const [tierOpen, setTierOpen] = React.useState(null) // 'core'|'regular'|'one-time'|null

  const ALL = React.useMemo(() => buildDevotees(bookings), [bookings])

  const devs = React.useMemo(() => {
    let d = ALL
    if (search.trim()) d = d.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.mobile.includes(search))
    if (filter !== 'all') d = d.filter(x => x.status === filter)
    return d
  }, [ALL, search, filter])

  const active   = ALL.filter(d=>d.status==='active').length
  const atRisk   = ALL.filter(d=>d.status==='at-risk').length
  const inactive = ALL.filter(d=>d.status==='inactive').length

  const core     = ALL.filter(d=>d.tier==='core')
  const regular  = ALL.filter(d=>d.tier==='regular')
  const oneTime  = ALL.filter(d=>d.tier==='one-time')

  const navSt = id => ({
    flex:1, padding:'8px 4px', border:'none', borderRadius:10, cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:800, whiteSpace:'nowrap',
    transition:'all .15s',
    background: subPage===id ? 'linear-gradient(135deg,#1e3a8a,#3b82f6)' : 'rgba(239,246,255,0.7)',
    color:      subPage===id ? '#fff' : 'rgba(29,78,216,0.55)',
    boxShadow:  subPage===id ? '0 2px 8px rgba(29,78,216,0.2)' : 'none',
  })

  if (!bookings.length) return (
    <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(29,78,216,0.35)',fontSize:13}}>
      <div style={{fontSize:36,marginBottom:8}}>🪷</div>
      Loading devotee data…
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>

      {/* ── KPI cards ── */}
      <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
        {[
          ['Total devotees', ALL.length,             '#1d4ed8'],
          ['Active',         active,                 '#15803d'],
          ['At risk',        atRisk,                 '#b45309'],
          ['Inactive',       inactive,               '#dc2626'],
          ['Total bookings', bookings.length,         '#6d28d9'],
        ].map(([l,v,c])=>(
          <div key={l} style={{flex:'1 1 100px',background:'rgba(255,255,255,0.78)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
            <div style={{fontSize:10,color:'rgba(29,78,216,0.45)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:6}}>{l}</div>
            <div style={{fontSize:28,fontWeight:900,color:c,fontFamily:"'Cinzel',serif",lineHeight:1}}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Tier cards (Core / Regular / One-time) ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[['core','Core (5+)',core],['regular','Regular (2–4)',regular],['one-time','One-time',oneTime]].map(([id,label,list])=>(
          <div key={id}>
            <div onClick={()=>setTierOpen(tierOpen===id?null:id)}
              style={{background:'rgba(255,255,255,0.78)',border:`2px solid ${tierOpen===id?'rgba(29,78,216,0.4)':'rgba(59,130,246,0.15)'}`,borderRadius:14,padding:'12px 14px',cursor:'pointer',textAlign:'center',transition:'border-color .15s'}}>
              <div style={{fontSize:10,color:'rgba(29,78,216,0.45)',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>{label}</div>
              <div style={{fontSize:28,fontWeight:900,color:'#1e3a8a',fontFamily:"'Cinzel',serif"}}>{list.length}</div>
              <div style={{fontSize:10,color:'rgba(29,78,216,0.4)',marginTop:3}}>{tierOpen===id?'▲ Hide':'▼ Show'}</div>
            </div>
            {tierOpen===id && (
              <div style={{background:'rgba(239,246,255,0.8)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:12,padding:'10px 12px',marginTop:4,display:'flex',flexDirection:'column',gap:7}}>
                {list.map(d=>(
                  <div key={d.mobile} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                    onClick={()=>{setSelected(d);setSubPage('table');window.scrollTo({top:0,behavior:'smooth'})}}>
                    <Av name={d.name} size={26}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#1e3a8a'}}>{d.name}</div>
                      <div style={{fontSize:10,color:'rgba(29,78,216,0.45)'}}>{d.total} bookings · <Badge status={d.status}/></div>
                    </div>
                    <span style={{marginLeft:'auto',fontSize:13,fontWeight:900,color:'#1e3a8a'}}>{d.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Attention strip ── */}
      <AttentionStrip devs={ALL}/>

      {/* ── Sub-nav ── */}
      <div style={{display:'flex',gap:5,background:'rgba(255,255,255,0.6)',borderRadius:12,padding:4,border:'1px solid rgba(59,130,246,0.12)'}}>
        {[['overview','📊 Overview'],['charts','📈 Charts'],['heatmap','🗓️ Heatmap'],['table','🪷 All Devotees']].map(([id,lbl])=>(
          <button key={id} style={navSt(id)} onClick={()=>{setSubPage(id);setSelected(null)}}>{lbl}</button>
        ))}
      </div>

      {/* ── Search + filter ── */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input placeholder="🔍 Search name or mobile…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{flex:'1 1 180px',padding:'9px 12px',borderRadius:10,border:'1px solid rgba(59,130,246,0.2)',background:'rgba(239,246,255,0.8)',fontSize:13,outline:'none'}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{padding:'9px 12px',borderRadius:10,border:'1px solid rgba(59,130,246,0.2)',background:'rgba(239,246,255,0.8)',fontSize:13,cursor:'pointer'}}>
          <option value="all">All devotees</option>
          <option value="active">Active (≤30d)</option>
          <option value="at-risk">At risk (31–90d)</option>
          <option value="inactive">Inactive (90d+)</option>
        </select>
      </div>

      {/* ── Detail drawer ── */}
      {selected && <DetailDrawer dev={selected} onClose={()=>setSelected(null)}/>}

      {/* ── Legend ── */}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:11,color:'rgba(29,78,216,0.55)'}}>
        {[['Active ≤30d','#15803d'],['At risk 31–90d','#b45309'],['Inactive 90d+','#dc2626']].map(([l,c])=>(
          <span key={l} style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:10,height:10,borderRadius:2,background:c}}/>{l}
          </span>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {subPage==='overview' && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>

            {/* Donut */}
            <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>Status breakdown</div>
              <ChartCanvas height={170} deps={[active,atRisk,inactive]} config={()=>({
                type:'doughnut',
                data:{labels:['Active','At risk','Inactive'],datasets:[{data:[active,atRisk,inactive],backgroundColor:['#15803d','#b45309','#dc2626'],borderWidth:0}]},
                options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}
              })}/>
              <div style={{marginTop:10}}>
                {[['Active',active,'#15803d'],['At risk',atRisk,'#b45309'],['Inactive',inactive,'#dc2626']].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:5}}>
                    <span style={{width:10,height:10,borderRadius:2,background:c,flexShrink:0}}/>
                    <span style={{color:'#1e3a8a'}}>{l}</span>
                    <span style={{marginLeft:'auto',fontWeight:800,color:'#1e3a8a'}}>{v}</span>
                    <span style={{color:'rgba(29,78,216,0.4)',fontSize:11}}>{ALL.length?Math.round(v/ALL.length*100):0}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly line — based on past dates only */}
            <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>Monthly past bookings ({new Date().getFullYear()})</div>
              {(() => {
                const year = new Date().getFullYear()
                const counts = MONTH_KEYS.map(m => bookings.filter(b => (b.date||'').startsWith(year+'-'+m) && b.date <= todayStr()).length)
                return <ChartCanvas height={170} deps={[bookings.length]} config={()=>({
                  type:'line',
                  data:{labels:MONTH_LABELS,datasets:[{data:counts,borderColor:'#1d4ed8',backgroundColor:'rgba(29,78,216,0.08)',borderWidth:2,tension:0.4,fill:true,pointRadius:4,pointBackgroundColor:'#1d4ed8'}]},
                  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:11}},grid:{display:false}},y:{beginAtZero:true,ticks:{font:{size:11},stepSize:5},grid:{color:'rgba(0,0,0,0.05)'}}}}
                })}/>
              })()}
            </div>
          </div>

          {/* Top devotees bar */}
          <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
            <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>Top devotees by past bookings</div>
            <ChartCanvas
              height={Math.max(260,Math.min(devs.length,14)*34+60)}
              deps={[devs.map(d=>d.total).join(',')]}
              config={()=>({
                type:'bar',
                data:{labels:devs.slice(0,14).map(d=>d.name.length>16?d.name.slice(0,14)+'…':d.name),datasets:[{data:devs.slice(0,14).map(d=>d.total),backgroundColor:devs.slice(0,14).map(d=>C[d.status]),borderWidth:0,borderRadius:4}]},
                options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} bookings`}}},scales:{x:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:11},stepSize:5}},y:{ticks:{font:{size:11}},grid:{display:false}}}}
              })}
            />
          </div>
        </div>
      )}

      {/* ══ CHARTS ══ */}
      {subPage==='charts' && (
        <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
          <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>Days since last booking — outreach priority</div>
          <ChartCanvas
            height={Math.max(300,devs.length*30+60)}
            deps={[devs.map(d=>d.daysSince).join(',')]}
            config={()=>{
              const sorted=[...devs].sort((a,b)=>b.daysSince-a.daysSince)
              return {
                type:'bar',
                data:{labels:sorted.map(d=>d.name.length>14?d.name.slice(0,12)+'…':d.name),datasets:[{data:sorted.map(d=>d.daysSince===9999?0:d.daysSince),backgroundColor:sorted.map(d=>C[d.status]),borderWidth:0,borderRadius:4}]},
                options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} days ago`}}},scales:{x:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:11}}},y:{ticks:{font:{size:11}},grid:{display:false}}}}
              }
            }}
          />
        </div>
      )}

      {/* ══ HEATMAP ══ */}
      {subPage==='heatmap' && (
        <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
          <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>Month-by-month past bookings ({new Date().getFullYear()})</div>
          <HeatmapTable devs={devs}/>
        </div>
      )}

      {/* ══ ALL DEVOTEES TABLE ══ */}
      {subPage==='table' && (
        <div style={{background:'rgba(255,255,255,0.78)',borderRadius:16,padding:'14px 16px',border:'1px solid rgba(59,130,246,0.15)'}}>
          <div style={{fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.45)',textTransform:'uppercase',letterSpacing:'1.2px',marginBottom:10}}>
            {devs.length} devotee{devs.length!==1?'s':''} · click a row to see details
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr>
                  {['Devotee','Mobile','Past bookings','Upcoming','Last booking','Days since','Score','Status'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'8px 10px',fontSize:10,fontWeight:800,color:'rgba(29,78,216,0.5)',textTransform:'uppercase',letterSpacing:'0.8px',borderBottom:'1px solid rgba(59,130,246,0.15)',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devs.map(d=>(
                  <tr key={d.mobile} onClick={()=>{setSelected(d);window.scrollTo({top:0,behavior:'smooth'})}}
                    style={{cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(239,246,255,0.6)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'9px 10px',borderBottom:'1px solid rgba(59,130,246,0.08)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <Av name={d.name} size={28}/>
                        <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,color:'#1e3a8a',fontSize:12}}>{d.name}</span>
                      </div>
                    </td>
                    <td style={{padding:'9px 10px',color:'rgba(29,78,216,0.45)',fontSize:11,borderBottom:'1px solid rgba(59,130,246,0.08)'}}>{d.mobile}</td>
                    <td style={{padding:'9px 10px',fontWeight:900,color:'#1e3a8a',fontSize:14,borderBottom:'1px solid rgba(59,130,246,0.08)'}}>{d.total}</td>
                    <td style={{padding:'9px 10px',color:'rgba(29,78,216,0.5)',fontSize:12,borderBottom:'1px solid rgba(59,130,246,0.08)'}}>{d.futureCount>0?<span style={{background:'#dbeafe',color:'#1e40af',padding:'1px 7px',borderRadius:20,fontWeight:700,fontSize:11}}>{d.futureCount} upcoming</span>:'—'}</td>
                    <td style={{padding:'9px 10px',color:'rgba(29,78,216,0.5)',fontSize:11,borderBottom:'1px solid rgba(59,130,246,0.08)'}}>{d.lastPast||'—'}</td>
                    <td style={{padding:'9px 10px',fontWeight:800,fontSize:13,borderBottom:'1px solid rgba(59,130,246,0.08)',color:d.daysSince>90?'#dc2626':d.daysSince>30?'#b45309':'#15803d'}}>{d.daysSince===9999?'—':d.daysSince+'d'}</td>
                    <td style={{padding:'9px 10px',borderBottom:'1px solid rgba(59,130,246,0.08)'}}><ScoreBar score={d.score} status={d.status}/></td>
                    <td style={{padding:'9px 10px',borderBottom:'1px solid rgba(59,130,246,0.08)'}}><Badge status={d.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
