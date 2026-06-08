// ============================================================
//  DashboardTab v5 (Fixed)
// ============================================================

import React from 'react'

const BLUE   = '#1d4ed8'
const TEAL   = '#0f6e56'
const AMBER  = '#b45309'
const PURPLE = '#6d28d9'
const GREEN  = '#15803d'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const AVATAR_BG   = ['#bfdbfe','#a7f3d0','#fed7aa','#ddd6fe','#fecaca','#d1fae5','#fde68a','#e0e7ff','#fce7f3','#cffafe']
const AVATAR_TEXT = ['#1e40af','#065f46','#92400e','#4c1d95','#991b1b','#064e3b','#78350f','#3730a3','#831843','#164e63']

// ── Helpers ───────────────────────────────────────────────────
function getTodayStr() {
  const t = new Date(); t.setHours(0,0,0,0)
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}
function initials(name) {
  const p = (name||'').trim().split(' ').filter(Boolean)
  if (p.length >= 2) return (p+p[p.length-1]).toUpperCase()
  return (name||'??').substring(0,2).toUpperCase()
}
function fmtDateShort(s) {
  if (!s) return ''
  const d = new Date(s+'T00:00:00')
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

// ── Chart.js CDN loader ───────────────────────────────────────
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

// ── Chart components ──────────────────────────────────────────
function BarChart({ data, labels, color=BLUE, height=120, horizontal=false }) {
  const ref = React.useRef(null); const ch = React.useRef(null)
  React.useEffect(() => {
    if (!ref.current || !window.Chart) return
    if (ch.current) { ch.current.destroy(); ch.current = null }
    ch.current = new window.Chart(ref.current, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color+'bb', borderRadius: 5, borderWidth: 0 }] },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { grid: { display: !horizontal }, ticks: { font:{size:10}, color:'#6b7280', maxRotation: horizontal?0:30 } },
          y: { beginAtZero:true, grid: { color:'rgba(0,0,0,.04)' }, ticks: { font:{size:10}, color:'#6b7280' } },
        },
      },
    })
    return () => { if (ch.current) ch.current.destroy() }
  }, [JSON.stringify(data), JSON.stringify(labels), color, horizontal])
  return <div style={{position:'relative',width:'100%',height}}><canvas ref={ref} role="img" aria-label="bar chart"/></div>
}

function LineChart({ datasets, labels, height=160 }) {
  const ref = React.useRef(null); const ch = React.useRef(null)
  React.useEffect(() => {
    if (!ref.current || !window.Chart) return
    if (ch.current) { ch.current.destroy(); ch.current = null }
    ch.current = new window.Chart(ref.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1 }, tooltip: { enabled: true } },
        scales: {
          x: { grid:{display:false}, ticks:{font:{size:10},color:'#6b7280'} },
          y: { beginAtZero:true, grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{size:10},color:'#6b7280',stepSize:1} },
        },
      },
    })
    return () => { if (ch.current) ch.current.destroy() }
  }, [JSON.stringify(datasets), JSON.stringify(labels)])
  return <div style={{position:'relative',width:'100%',height}}><canvas ref={ref} role="img" aria-label="line chart"/></div>
}

function Doughnut({ slices, height=130 }) {
  const ref = React.useRef(null); const ch = React.useRef(null)
  React.useEffect(() => {
    if (!ref.current || !window.Chart) return
    if (ch.current) { ch.current.destroy(); ch.current = null }
    ch.current = new window.Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: slices.map(s=>s.label),
        datasets: [{ data: slices.map(s=>s.value), backgroundColor: slices.map(s=>s.color+'bb'), borderWidth:0 }],
      },
      options: { responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins: { legend:{display:false}, tooltip:{enabled:true} } },
    })
    return () => { if (ch.current) ch.current.destroy() }
  }, [JSON.stringify(slices)])
  return <div style={{position:'relative',width:'100%',height}}><canvas ref={ref} role="img" aria-label="doughnut chart"/></div>
}

// ── UI primitives ─────────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16,
      padding:'16px', border:'1px solid rgba(59,130,246,0.15)', ...style }}>
      {children}
    </div>
  )
}
function SecTitle({ children, style={} }) {
  return <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)',
    textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10, ...style }}>{children}</div>
}
function Pill({ label, active, onClick, color=BLUE }) {
  return (
    <button onClick={onClick} style={{
      padding:'6px 13px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12,
      fontWeight:700, transition:'all .15s',
      background: active ? color : 'rgba(239,246,255,0.8)',
      color: active ? '#fff' : 'rgba(29,78,216,0.55)',
      boxShadow: active ? `0 2px 8px ${color}44` : 'none',
    }}>
      {label}
    </button>
  )
}

// ── Custom date range picker ───────────────────────────────────
function DateRangePicker({ startDate, endDate, onChange }) {
  const today = getTodayStr()

  const setPreset = (preset) => {
    const now = new Date(); now.setHours(0,0,0,0)
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    if (preset === 'today') {
      onChange(today, today)
    } else if (preset === 'this_week') {
      const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1)
      onChange(fmt(mon), today)
    } else if (preset === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      onChange(fmt(first), today)
    } else if (preset === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth()-1, 1)
      const last  = new Date(now.getFullYear(), now.getMonth(), 0)
      onChange(fmt(first), fmt(last))
    } else if (preset === 'last_3m') {
      const from = new Date(now); from.setMonth(from.getMonth()-3)
      onChange(fmt(from), today)
    } else if (preset === 'all') {
      onChange('', '')
    }
  }

  const PRESETS = [
    { id:'today',      label:'Today'       },
    { id:'this_week',  label:'This week'   },
    { id:'this_month', label:'This month'  },
    { id:'last_month', label:'Last month'  },
    { id:'last_3m',    label:'Last 3 months'},
    { id:'all',        label:'All time'    },
  ]

  const inputStyle = {
    flex:1, padding:'9px 12px', borderRadius:10,
    border:'1px solid rgba(59,130,246,0.25)',
    background:'rgba(239,246,255,0.8)',
    fontSize:13, outline:'none', color:'#1e3a8a',
    fontWeight:600, cursor:'pointer',
  }

  return (
    <Card style={{padding:'14px 16px'}}>
      <SecTitle>Date range</SecTitle>

      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{display:'flex',flexDirection:'column',flex:1,gap:4}}>
          <label style={{fontSize:10,fontWeight:700,color:'rgba(29,78,216,0.5)',
            textTransform:'uppercase',letterSpacing:'1px'}}>From</label>
          <input
            type="date"
            value={startDate}
            max={endDate || today}
            onChange={e => onChange(e.target.value, endDate)}
            style={inputStyle}
          />
        </div>
        <div style={{fontSize:14,color:'rgba(29,78,216,0.3)',fontWeight:800,marginTop:18}}>→</div>
        <div style={{display:'flex',flexDirection:'column',flex:1,gap:4}}>
          <label style={{fontSize:10,fontWeight:700,color:'rgba(29,78,216,0.5)',
            textTransform:'uppercase',letterSpacing:'1px'}}>To</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={e => onChange(startDate, e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {PRESETS.map(p => (
          <button key={p.id} onClick={()=>setPreset(p.id)} style={{
            padding:'5px 11px', borderRadius:20, border:'none', cursor:'pointer',
            fontSize:11, fontWeight:700,
            background:'rgba(239,246,255,0.9)',
            color:'rgba(29,78,216,0.6)',
            transition:'all .15s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=BLUE;e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,246,255,0.9)';e.currentTarget.style.color='rgba(29,78,216,0.6)'}}
          >
            {p.label}
          </button>
        ))}
      </div>
    </Card>
  )
}

// ── Drawer shell ──────────────────────────────────────────────
function Drawer({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:4000,
      background:'rgba(0,0,0,0.4)', backdropFilter:'blur(3px)',
      display:'flex', alignItems:'flex-end' }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxHeight:'82vh',
        background:'linear-gradient(160deg,#f0f6ff,#e8f0fe)',
        borderRadius:'20px 20px 0 0',
        boxShadow:'0 -8px 40px rgba(29,78,216,0.18)',
        display:'flex', flexDirection:'column',
        animation:'slideUp .25s ease',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 18px 12px', borderBottom:'1px solid rgba(59,130,246,0.12)', flexShrink:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontWeight:800, color:'#1e3a8a', fontSize:14 }}>
            {title}
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', border:'none',
            background:'rgba(29,78,216,0.1)', cursor:'pointer', fontSize:15, color:'#1e3a8a',
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:'14px 18px 24px', flex:1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────
function KPICard({ label, value, sub, color=BLUE, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.78)',
        borderRadius:14, padding:'14px 16px',
        border: hov ? `1.5px solid ${color}55` : '1px solid rgba(59,130,246,0.15)',
        flex:'1 1 130px', cursor: onClick ? 'pointer' : 'default',
        transition:'all .18s',
        boxShadow: hov ? `0 4px 18px ${color}22` : 'none',
        position:'relative',
      }}>
      {onClick && (
        <div style={{ position:'absolute', top:10, right:10, fontSize:10,
          color: color+'99', fontWeight:700 }}>↗</div>
      )}
      <div style={{ fontSize:10, color:'rgba(29,78,216,0.5)', fontWeight:700,
        textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:900, color, fontFamily:"'Cinzel',serif", lineHeight:1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:11, color:'rgba(29,78,216,0.4)', marginTop:5 }}>{sub}</div>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  DrawerContent — all 4 types
// ════════════════════════════════════════════════════════════
function DrawerContent({ type, A, chartReady, trendLabels, trendData,
  MONTH_SHORT, DAYS_SHORT, DAYS_FULL, AVATAR_BG, AVATAR_TEXT, rangeLabel }) {

  if (type === 'total') return (
    <div>
      <div style={{fontSize:13,color:'rgba(29,78,216,0.6)',marginBottom:14}}>
        <b style={{color:BLUE}}>{A.total}</b> prayer bookings · {rangeLabel}
      </div>
      <SecTitle>Breakdown by slot</SecTitle>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        {[{label:'Morning 🌅',val:A.morning,col:'#1d4ed8'},{label:'Evening 🌙',val:A.evening,col:'#d97706'}].map(s=>(
          <div key={s.label} style={{flex:1,padding:'12px',borderRadius:12,
            background:`${s.col}11`,border:`1px solid ${s.col}33`,textAlign:'center'}}>
            <div style={{fontSize:11,color:s.col,fontWeight:700,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:24,fontWeight:900,color:s.col,fontFamily:"'Cinzel',serif"}}>{s.val}</div>
            <div style={{fontSize:10,color:s.col+'99',marginTop:3}}>
              {Math.round(s.val/(A.total||1)*100)}% of total
            </div>
          </div>
        ))}
      </div>
      <SecTitle>Monthly trend</SecTitle>
      {chartReady && A.sortedMonths.length > 0
        ? <LineChart
            datasets={[{data:trendData,
              borderColor:BLUE,backgroundColor:BLUE+'18',fill:true,tension:.4,
              pointRadius:4,pointBackgroundColor:BLUE,borderWidth:2}]}
            labels={trendLabels} height={150}/>
        : <div style={{textAlign:'center',padding:'16px 0',color:'rgba(29,78,216,0.3)',fontSize:13}}>
            {chartReady?'No data in this range':'Loading…'}
          </div>
      }
      <SecTitle style={{marginTop:14}}>Day of week</SecTitle>
      {chartReady && <BarChart data={A.dayCounts} labels={DAYS_SHORT} color={TEAL} height={100}/>}
    </div>
  )

  if (type === 'devotees') return (
    <div>
      <div style={{fontSize:13,color:'rgba(29,78,216,0.6)',marginBottom:14}}>
        <b style={{color:TEAL}}>{A.uniqueMembers}</b> unique devotees · {rangeLabel}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16}}>
        {[
          {label:'Core (5+ bookings)', val:A.members.filter(m=>m.count>=5).length,  col:GREEN},
          {label:'Regular (2–4)',       val:A.members.filter(m=>m.count>=2&&m.count<5).length, col:BLUE},
          {label:'One-time',            val:A.members.filter(m=>m.count===1).length, col:'#6b7280'},
        ].map(s=>(
          <div key={s.label} style={{flex:'1 1 90px',padding:'11px',borderRadius:12,
            background:`${s.col}11`,border:`1px solid ${s.col}33`,textAlign:'center'}}>
            <div style={{fontSize:10,color:s.col,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:900,color:s.col,fontFamily:"'Cinzel',serif"}}>{s.val}</div>
          </div>
        ))}
      </div>
      <SecTitle>Top 10 devotees</SecTitle>
      {[...A.members].sort((a,b)=>b.count-a.count).slice(0,10).map((m,i)=>{
        const ci = i % AVATAR_BG.length
        return (
          <div key={m.mobile+i} style={{display:'flex',alignItems:'center',gap:10,
            padding:'9px 0',borderBottom:i<9?'1px solid rgba(59,130,246,0.07)':'none'}}>
            <div style={{fontSize:12,fontWeight:800,color:i<3?'#d97706':'rgba(29,78,216,0.35)',
              minWidth:18,textAlign:'center'}}>
              {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
            </div>
            <div style={{width:32,height:32,borderRadius:'50%',background:AVATAR_BG[ci],
              color:AVATAR_TEXT[ci],display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:11,fontWeight:800,flexShrink:0}}>{initials(m.name)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,color:'#1e3a8a',
                fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</div>
              <div style={{fontSize:10,color:'rgba(29,78,216,0.4)',marginTop:1}}>{m.mobile}</div>
            </div>
            <div style={{fontSize:15,fontWeight:900,color:BLUE}}>{m.count}</div>
          </div>
        )
      })}
    </div>
  )

  if (type === 'avg') return (
    <div>
      <div style={{fontSize:13,color:'rgba(29,78,216,0.6)',marginBottom:14}}>
        Average of <b style={{color:PURPLE}}>{A.avgPerMonth}</b> bookings per month across{' '}
        <b style={{color:PURPLE}}>{A.sortedMonths.length}</b> month{A.sortedMonths.length!==1?'s':''}
      </div>
      <SecTitle>All months</SecTitle>
      {A.sortedMonths.length === 0
        ? <div style={{color:'rgba(29,78,216,0.35)',fontSize:13,textAlign:'center',padding:'16px 0'}}>No data for this range</div>
        : A.sortedMonths.map((m,i)=>{
          const d = A.monthMap[m]
          const maxC = Math.max(...Object.values(A.monthMap).map(x=>x.all)) || 1
          const [yr,mm] = m.split('-')
          return (
            <div key={m} style={{display:'flex',alignItems:'center',gap:10,
              padding:'8px 0',borderBottom:i<A.sortedMonths.length-1?'1px solid rgba(59,130,246,0.07)':'none'}}>
              <div style={{width:58,fontSize:11,fontWeight:700,color:'#1e3a8a',
                fontFamily:"'Cinzel',serif",flexShrink:0}}>
                {MONTH_SHORT[parseInt(mm,10)-1]} {yr}
              </div>
              <div style={{flex:1,height:7,borderRadius:4,background:'rgba(109,40,217,0.1)',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:4,background:PURPLE+'99',
                  width:Math.round(d.all/maxC*100)+'%',transition:'width .4s'}}/>
              </div>
              <div style={{width:24,fontSize:13,fontWeight:900,color:PURPLE,textAlign:'right'}}>{d.all}</div>
            </div>
          )
        })
      }
    </div>
  )

  if (type === 'upcoming') return (
    <div>
      <div style={{fontSize:13,color:'rgba(29,78,216,0.6)',marginBottom:14}}>
        <b style={{color:AMBER}}>{A.upcoming.length}</b> bookings in the next 30 days
      </div>
      {A.upcoming.length === 0
        ? <div style={{textAlign:'center',padding:'20px 0',color:'rgba(29,78,216,0.3)',fontSize:13}}>No upcoming bookings 🙏</div>
        : A.upcoming.map((b,i)=>{
          const isMorning = b.time === 'Morning'
          const d = new Date(b.date+'T00:00:00')
          return (
            <div key={b.id||i} style={{display:'flex',alignItems:'center',gap:10,
              padding:'10px 0',borderBottom:i<A.upcoming.length-1?'1px solid rgba(59,130,246,0.08)':'none'}}>
              <div style={{background:'rgba(239,246,255,0.9)',borderRadius:10,padding:'6px 9px',
                textAlign:'center',minWidth:44,flexShrink:0,border:'1px solid rgba(59,130,246,0.15)'}}>
                <div style={{fontSize:16,fontWeight:900,color:'#1e3a8a',fontFamily:"'Cinzel',serif",lineHeight:1}}>
                  {d.getDate()}
                </div>
                <div style={{fontSize:9,color:'rgba(29,78,216,0.5)',fontWeight:700,marginTop:2}}>
                  {MONTH_SHORT[d.getMonth()]}
                </div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,color:'#1e3a8a',fontSize:13,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.name}</div>
                <div style={{fontSize:11,color:'rgba(29,78,216,0.4)',marginTop:1}}>
                  {DAYS_SHORT[d.getDay()]}
                  {b.mobile && <span> · 📱 {b.mobile}</span>}
                </div>
              </div>
              <span style={{fontSize:11,padding:'3px 8px',borderRadius:20,fontWeight:700,flexShrink:0,
                background:isMorning?'#dbeafe':'#fef3c7',color:isMorning?'#1d4ed8':'#92400e'}}>
                {isMorning?'🌅':'🌙'} {b.time}
              </span>
            </div>
          )
        })
      }
    </div>
  )

  return null
}

// ════════════════════════════════════════════════════════════
//  Main component
// ════════════════════════════════════════════════════════════
export default function DashboardTab({ bookings=[], satsangBookings=[] }) {
  const chartReady = useChartJs()
  const today = getTodayStr()

  const [page,       setPage]   = React.useState('exec')
  const [drawer,     setDrawer] = React.useState(null)

  // ── Custom date range ─────────────────────────────────────
  const [startDate, setStartDate] = React.useState('')
  const [endDate,   setEndDate]   = React.useState('')

  const handleRangeChange = (s, e) => {
    setStartDate(s); setEndDate(e); setDrawer(null)
  }

  // ── Member page state ─────────────────────────────────────
  const [slotFilter,   setSlotFilter]   = React.useState('all')
  const [memberSort,   setMemberSort]   = React.useState('count')
  const [memberSearch, setMemberSearch] = React.useState('')
  const [prayerDateFilter, setPrayerDateFilter] = React.useState('')

  // ── Trends / Upcoming state ───────────────────────────────
  const [trendSlot, setTrendSlot] = React.useState('all')
  const [upSearch,  setUpSearch]  = React.useState('')
  const [upSlot,    setUpSlot]    = React.useState('all')

  // ── Apply date range filter ───────────────────────────────
  const filteredByDate = React.useMemo(() => {
    return bookings.filter(b => {
      if (!b.date) return false
      if (startDate && b.date < startDate) return false
      if (endDate   && b.date > endDate)   return false
      return true
    })
  }, [bookings, startDate, endDate])

  const rangeLabel = React.useMemo(() => {
    if (!startDate && !endDate) return 'All time'
    if (startDate && endDate)   return `${fmtDateShort(startDate)} – ${fmtDateShort(endDate)}`
    if (startDate)              return `From ${fmtDateShort(startDate)}`
    return `Up to ${fmtDateShort(endDate)}`
  }, [startDate, endDate])

  // ── Core analytics ────────────────────────────────────────
  const A = React.useMemo(() => {
    const total   = filteredByDate.length
    const morning = filteredByDate.filter(b=>b.time==='Morning').length
    const evening = filteredByDate.filter(b=>b.time==='Evening').length

    const mmap = {}
    filteredByDate.forEach(b => {
      const k = b.mobile || b.name
      if (!mmap[k]) mmap[k] = {
        name:b.name, mobile:b.mobile||'', count:0,
        morningCount:0, eveningCount:0,
        dates:[], months:new Set()
      }
      mmap[k].count++
      if (b.time==='Morning') mmap[k].morningCount++
      else mmap[k].eveningCount++
      mmap[k].dates.push(b.date)
      mmap[k].months.add((b.date||'').slice(0,7))
    })
    const members = Object.values(mmap).map(m => ({
      ...m, months: m.months.size,
      lastDate:  m.dates.filter(Boolean).sort().slice(-1) || '',
      firstDate: m.dates.filter(Boolean).sort() || '',
    }))

    const dayCounts =
    filteredByDate.forEach(b => {
      if (b.date) dayCounts[new Date(b.date+'T00:00:00').getDay()]++
    })

    const monthMap = {}
    filteredByDate.forEach(b => {
      const m = (b.date||'').slice(0,7); if (!m) return
      if (!monthMap[m]) monthMap[m] = { all:0, morning:0, evening:0 }
      monthMap[m].all++
      if (b.time==='Morning') monthMap[m].morning++; else monthMap[m].evening++
    })
    const sortedMonths = Object.keys(monthMap).sort()

    const in30 = new Date(today); in30.setDate(in30.getDate()+30)
    const in30s = in30.toISOString().slice(0,10)
    const upcoming = bookings
      .filter(b => b.date >= today && b.date <= in30s)
      .sort((a,b) => a.date.localeCompare(b.date))

    const uniqueMembers = members.length
    const avgPerMonth   = sortedMonths.length ? Math.round(total/sortedMonths.length) : 0

    return { total, morning, evening, members, dayCounts, monthMap, sortedMonths, upcoming, uniqueMembers, avgPerMonth }
  }, [filteredByDate, bookings, today])

  // ── Filtered members ──────────────────────────────────────
  const filteredMembers = React.useMemo(() => {
    let list = [...A.members]

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.mobile.includes(q))
    }

    if (slotFilter === 'morning') list = list.filter(m => m.morningCount > 0)
    if (slotFilter === 'evening') list = list.filter(m => m.eveningCount > 0)

    if (prayerDateFilter) {
      const dateBookers = new Set(
        bookings
          .filter(b => b.date === prayerDateFilter)
          .map(b => b.mobile || b.name)
      )
      list = list.filter(m => dateBookers.has(m.mobile || m.name))
    }

    if (memberSort === 'count')  list.sort((a,b) => b.count - a.count)
    if (memberSort === 'recent') list.sort((a,b) => b.lastDate.localeCompare(a.lastDate))
    if (memberSort === 'months') list.sort((a,b) => b.months - a.months)

    return list
  }, [A.members, memberSearch, slotFilter, memberSort, prayerDateFilter, bookings])

  // ── Trend data ────────────────────────────────────────────
  const trendData = React.useMemo(() => {
    return A.sortedMonths.map(m => {
      const d = A.monthMap[m]
      if (trendSlot === 'morning') return d.morning
      if (trendSlot === 'evening') return d.evening
      return d.all
    })
  }, [A.monthMap, A.sortedMonths, trendSlot])

  const trendLabels = A.sortedMonths.map(m => {
    const [,mm] = m.split('-'); return MONTH_SHORT[parseInt(mm,10)-1]
  })

  // ── Upcoming filtered ─────────────────────────────────────
  const filteredUpcoming = React.useMemo(() => {
    return A.upcoming.filter(b => {
      if (upSlot==='morning' && b.time!=='Morning') return false
      if (upSlot==='evening' && b.time!=='Evening') return false
      if (upSearch.trim() && !b.name.toLowerCase().includes(upSearch.toLowerCase())) return false
      return true
    })
  }, [A.upcoming, upSlot, upSearch])

  // ── Nav ───────────────────────────────────────────────────
  const NAV = [
    { id:'exec',     label:'📊 Summary'  },
    { id:'members',  label:'🪷 Members'  },
    { id:'trends',   label:'📈 Trends'   },
    { id:'upcoming', label:'🗓️ Upcoming' },
  ]
  const navSt = id => ({
    flex:1, padding:'9px 4px', border:'none', borderRadius:12, cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:800, transition:'all .18s',
    whiteSpace:'nowrap',
    background: page===id ? 'linear-gradient(135deg,#1e3a8a,#3b82f6)' : 'rgba(239,246,255,0.7)',
    color: page===id ? '#fff' : 'rgba(29,78,216,0.55)',
    boxShadow: page===id ? '0 3px 12px rgba(29,78,216,0.25)' : 'none',
  })

  const DRAWER_TITLES = {
    total:'Total Bookings', devotees:'Unique Devotees',
    avg:'Avg / Month', upcoming:'Upcoming Bookings',
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>

      {/* ── Drawer ── */}
      {drawer && (
        <Drawer title={DRAWER_TITLES[drawer]} onClose={()=>setDrawer(null)}>
          <DrawerContent
            type={drawer} A={A} chartReady={chartReady}
            trendLabels={trendLabels} trendData={trendData}
            MONTH_SHORT={MONTH_SHORT} DAYS_SHORT={DAYS_SHORT} DAYS_FULL={DAYS_FULL}
            AVATAR_BG={AVATAR_BG} AVATAR_TEXT={AVATAR_TEXT}
            rangeLabel={rangeLabel}
          />
        </Drawer>
      )}

      {/* ── Header ── */}
      <Card>
        <div style={{textAlign:'center',paddingBottom:4}}>
          <div style={{fontSize:34,marginBottom:6,filter:'drop-shadow(0 0 14px rgba(29,78,216,0.3))'}}>📊</div>
          <div style={{fontFamily:"'Cinzel',serif",color:'#1e3a8a',fontSize:17,fontWeight:800}}>
            Devotee Analytics
          </div>
          <div style={{fontSize:12,color:'rgba(29,78,216,0.45)',marginTop:4}}>
            Tap any card to explore details
          </div>
          <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)',marginTop:12}}/>
        </div>
      </Card>

      {/* ── Custom date range picker ── */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
      />

      {/* ── Active range badge ── */}
      <div style={{textAlign:'center',fontSize:12,color:'rgba(29,78,216,0.5)',fontWeight:600,
        background:'rgba(239,246,255,0.8)',borderRadius:10,padding:'6px 0',
        border:'1px solid rgba(59,130,246,0.12)'}}>
        <span style={{color:BLUE,fontWeight:800}}>{rangeLabel}</span>
        {' '}— <span style={{color:PURPLE,fontWeight:800}}>{A.total}</span> booking{A.total!==1?'s':''}
      </div>

      {/* ── Nav tabs ── */}
      <div style={{display:'flex',gap:6,background:'rgba(255,255,255,0.6)',
        borderRadius:14,padding:5,border:'1px solid rgba(59,130,246,0.15)'}}>
        {NAV.map(n=><button key={n.id} style={navSt(n.id)} onClick={()=>setPage(n.id)}>{n.label}</button>)}
      </div>

      {/* ════ EXECUTIVE SUMMARY ════ */}
      {page==='exec' && (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            <KPICard label="Total Bookings"  value={A.total}           sub={rangeLabel}         color={BLUE}   onClick={()=>setDrawer('total')}/>
            <KPICard label="Unique Devotees" value={A.uniqueMembers}   sub="in this range"      color={TEAL}   onClick={()=>setDrawer('devotees')}/>
            <KPICard label="Avg / Month"     value={A.avgPerMonth}     sub="bookings per month" color={PURPLE} onClick={()=>setDrawer('avg')}/>
            <KPICard label="Upcoming"        value={A.upcoming.length} sub="next 30 days"       color={AMBER}  onClick={()=>setDrawer('upcoming')}/>
          </div>

          <Card>
            <SecTitle>Morning vs Evening</SecTitle>
            {chartReady
              ? <Doughnut slices={[{label:'Morning',value:A.morning,color:'#1d4ed8'},{label:'Evening',value:A.evening,color:'#d97706'}]}/>
              : <div style={{height:130,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(29,78,216,0.3)',fontSize:13}}>Loading…</div>}
            
            <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:10,fontSize:12}}>
              {[{l:'Morning',v:A.morning,c:'#1d4ed8'},{l:'Evening',v:A.evening,c:'#d97706'}].map(item => (
                <div key={item.l} style={{color: item.c, fontWeight: 700}}>
                  {item.l}: {item.v} ({A.total ? Math.round((item.v / A.total) * 100) : 0}%)
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ════ MEMBERS TAB ════ */}
      {page==='members' && (
        <Card>
          <SecTitle>Members List ({filteredMembers.length})</SecTitle>
          <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto'}}>
            {filteredMembers.map((m, i) => (
              <div key={i} style={{fontSize:13, padding:'6px 0', borderBottom:'1px solid #f0f0f0'}}>
                <b>{m.name}</b> - {m.mobile || 'No Mobile'} ({m.count} Bookings)
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ════ TRENDS TAB ════ */}
      {page==='trends' && (
        <Card>
          <SecTitle>Analytics Trends</SecTitle>
          {chartReady && trendLabels.length > 0 ? (
            <LineChart 
              datasets={[{data: trendData, borderColor: BLUE, backgroundColor: BLUE+'11', fill: true}]} 
              labels={trendLabels} 
            />
          ) : (
            <div style={{fontSize:13, color:'gray'}}>No trend data available.</div>
          )}
        </Card>
      )}

      {/* ════ UPCOMING TAB ════ */}
      {page==='upcoming' && (
        <Card>
          <SecTitle>Filtered Upcoming Bookings ({filteredUpcoming.length})</SecTitle>
          <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto'}}>
            {filteredUpcoming.map((b, i) => (
              <div key={i} style={{fontSize:13, padding:'6px 0', borderBottom:'1px solid #f0f0f0'}}>
                {b.date} - <b>{b.name}</b> ({b.time})
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
}