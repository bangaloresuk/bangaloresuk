// ============================================================
//  DevoteeTracker — Devotee performance tracker
//  Drop this in: frontend/src/components/tabs/DevoteeTracker.jsx
// ============================================================

import React from 'react'
import { buildDevotees, RAW_BOOKINGS, MONTH_KEYS, MONTH_LABELS } from '../../data/bookings.js'

const STATUS_COLOR = { active: '#15803d', 'at-risk': '#b45309', inactive: '#dc2626' }
const STATUS_BG    = { active: '#dcfce7', 'at-risk': '#fef3c7', inactive: '#fee2e2' }
const AV_BG   = ['#bfdbfe','#a7f3d0','#fed7aa','#ddd6fe','#fecaca','#d1fae5','#fde68a','#e0e7ff']
const AV_TEXT = ['#1e40af','#065f46','#92400e','#4c1d95','#991b1b','#064e3b','#78350f','#3730a3']

function colorIdx(name) { let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))&0xffff; return h%8 }
function ini(name) { const p=name.trim().split(/\s+/); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase() }

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

function useChart(canvasRef, configFn, deps) {
  React.useEffect(() => {
    if (!window.Chart || !canvasRef.current) return
    const ch = new window.Chart(canvasRef.current, configFn())
    return () => ch.destroy()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// ── Avatar ────────────────────────────────────────────────────
function Av({ name, size=32 }) {
  const i = colorIdx(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: AV_BG[i], color: AV_TEXT[i],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800,
    }}>{ini(name)}</div>
  )
}

// ── Status badge ──────────────────────────────────────────────
function Badge({ status }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
      background: STATUS_BG[status] || '#f3f4f6',
      color: STATUS_COLOR[status] || '#6b7280',
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>{status}</span>
  )
}

// ── Horizontal bar chart ──────────────────────────────────────
function HBar({ labels, data, colors, height=320 }) {
  const ref = React.useRef()
  const chartReady = useChartJs()
  useChart(ref, () => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0, borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} bookings` } } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, stepSize: 5 } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  }), [JSON.stringify(labels), JSON.stringify(data), chartReady])
  if (!chartReady) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(29,78,216,0.3)', fontSize:13 }}>Loading chart…</div>
  return <div style={{ position: 'relative', width: '100%', height }}><canvas ref={ref} /></div>
}

// ── Doughnut ──────────────────────────────────────────────────
function Donut({ active, atRisk, inactive }) {
  const ref = React.useRef()
  const chartReady = useChartJs()
  useChart(ref, () => ({
    type: 'doughnut',
    data: {
      labels: ['Active', 'At risk', 'Inactive'],
      datasets: [{ data: [active, atRisk, inactive], backgroundColor: ['#15803d','#b45309','#dc2626'], borderWidth: 0 }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } },
  }), [active, atRisk, inactive, chartReady])
  if (!chartReady) return <div style={{ height: 180, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(29,78,216,0.3)', fontSize:13 }}>Loading…</div>
  return <div style={{ position: 'relative', width: '100%', height: 180 }}><canvas ref={ref} /></div>
}

// ── Monthly line chart ────────────────────────────────────────
function MonthlyLine() {
  const ref = React.useRef()
  const chartReady = useChartJs()
  const TODAY = new Date('2026-06-10')
  const counts = MONTH_KEYS.map(mk => RAW_BOOKINGS.filter(r => r[0].startsWith(mk) && new Date(r[0]) <= TODAY).length)
  useChart(ref, () => ({
    type: 'line',
    data: {
      labels: MONTH_LABELS,
      datasets: [{
        data: counts, borderColor: '#1d4ed8', backgroundColor: 'rgba(29,78,216,0.08)',
        borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#1d4ed8',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 11 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { font: { size: 11 }, stepSize: 5 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  }), [chartReady])
  if (!chartReady) return <div style={{ height: 180, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(29,78,216,0.3)', fontSize:13 }}>Loading…</div>
  return <div style={{ position: 'relative', width: '100%', height: 180 }}><canvas ref={ref} /></div>
}

// ── Days-since bar chart ──────────────────────────────────────
function DaysBar({ devs }) {
  const ref = React.useRef()
  const chartReady = useChartJs()
  const sorted = React.useMemo(() => [...devs].sort((a,b) => b.daysSince - a.daysSince), [devs])
  useChart(ref, () => ({
    type: 'bar',
    data: {
      labels: sorted.map(d => d.name.length > 14 ? d.name.slice(0,12)+'…' : d.name),
      datasets: [{ data: sorted.map(d => d.daysSince), backgroundColor: sorted.map(d => STATUS_COLOR[d.status]), borderWidth: 0, borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} days ago` } } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  }), [JSON.stringify(sorted.map(d=>d.daysSince)), chartReady])
  if (!chartReady) return <div style={{ height: Math.max(300, sorted.length*30+60), display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(29,78,216,0.3)', fontSize:13 }}>Loading…</div>
  return <div style={{ position: 'relative', width: '100%', height: Math.max(300, sorted.length*30+60) }}><canvas ref={ref} /></div>
}

// ── Month heatmap table ───────────────────────────────────────
function HeatmapTable({ devs }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ textAlign:'left', padding:'6px 8px', color:'rgba(29,78,216,0.5)', fontWeight:800, fontSize:10, textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:'1px solid rgba(59,130,246,0.12)' }}>Devotee</th>
            {MONTH_LABELS.map(m => (
              <th key={m} style={{ padding:'6px 4px', color:'rgba(29,78,216,0.5)', fontWeight:800, fontSize:10, textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center', borderBottom:'1px solid rgba(59,130,246,0.12)' }}>{m}</th>
            ))}
            <th style={{ padding:'6px 4px', color:'rgba(29,78,216,0.5)', fontWeight:800, fontSize:10, textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center', borderBottom:'1px solid rgba(59,130,246,0.12)' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {devs.map(d => (
            <tr key={d.mobile}>
              <td style={{ padding:'5px 8px', borderBottom:'1px solid rgba(59,130,246,0.07)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Av name={d.name} size={22} />
                  <span style={{ fontSize:12, color:'#1e3a8a', fontWeight:600 }}>{d.name}</span>
                </div>
              </td>
              {MONTH_KEYS.map(mk => {
                const cnt = d.dates.filter(x => x.startsWith(mk)).length
                const bg  = cnt > 0 ? STATUS_COLOR[d.status] : 'rgba(239,246,255,0.5)'
                const clr = cnt > 0 ? '#fff' : 'transparent'
                return (
                  <td key={mk} style={{ padding:'3px 2px', textAlign:'center', borderBottom:'1px solid rgba(59,130,246,0.07)' }}>
                    <div style={{
                      width:26, height:26, borderRadius:5, background:bg, margin:'0 auto',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, color:clr, fontWeight:800,
                    }}>
                      {cnt > 0 ? cnt : ''}
                    </div>
                  </td>
                )
              })}
              <td style={{ padding:'5px 4px', textAlign:'center', fontWeight:800, color:'#1e3a8a', fontSize:13, borderBottom:'1px solid rgba(59,130,246,0.07)' }}>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Devotee table ─────────────────────────────────────────────
function DevoteeTable({ devs, onSelect }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Devotee','Mobile','Bookings','Last booking','Days since','Score','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.5)', textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:'1px solid rgba(59,130,246,0.15)', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {devs.map(d => (
            <tr key={d.mobile}
              onClick={() => onSelect(d)}
              style={{ cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(239,246,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <td style={{ padding:'9px 10px', borderBottom:'1px solid rgba(59,130,246,0.08)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Av name={d.name} size={28} />
                  <span style={{ fontFamily:"'Cinzel',serif", fontWeight:700, color:'#1e3a8a', fontSize:12 }}>{d.name}</span>
                </div>
              </td>
              <td style={{ padding:'9px 10px', color:'rgba(29,78,216,0.45)', fontSize:11, borderBottom:'1px solid rgba(59,130,246,0.08)' }}>{d.mobile}</td>
              <td style={{ padding:'9px 10px', fontWeight:900, color:'#1e3a8a', fontSize:14, borderBottom:'1px solid rgba(59,130,246,0.08)' }}>{d.total}</td>
              <td style={{ padding:'9px 10px', color:'rgba(29,78,216,0.5)', fontSize:11, borderBottom:'1px solid rgba(59,130,246,0.08)' }}>{d.lastPast}</td>
              <td style={{ padding:'9px 10px', fontWeight:800, fontSize:13, borderBottom:'1px solid rgba(59,130,246,0.08)', color: d.daysSince>90?'#dc2626':d.daysSince>30?'#b45309':'#15803d' }}>{d.daysSince}d</td>
              <td style={{ padding:'9px 10px', borderBottom:'1px solid rgba(59,130,246,0.08)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(239,246,255,0.8)', overflow:'hidden' }}>
                    <div style={{ height:5, borderRadius:3, background: STATUS_COLOR[d.status], width: d.score+'%', transition:'width .4s' }} />
                  </div>
                  <span style={{ fontSize:10, color:'rgba(29,78,216,0.4)', minWidth:22 }}>{d.score}</span>
                </div>
              </td>
              <td style={{ padding:'9px 10px', borderBottom:'1px solid rgba(59,130,246,0.08)' }}><Badge status={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Attention alert strip ─────────────────────────────────────
function AttentionStrip({ devs }) {
  const needs = [...devs].filter(d => d.status !== 'active').sort((a,b) => b.daysSince - a.daysSince).slice(0,4)
  if (!needs.length) return null
  return (
    <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:14, padding:'12px 16px', marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:800, color:'#92400e', marginBottom:10 }}>⚠️ Needs your attention</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {needs.map(d => (
          <div key={d.mobile} style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', fontSize:12 }}>
            <Av name={d.name} size={22} />
            <span style={{ fontWeight:700, color:'#78350f' }}>{d.name}</span>
            <span style={{ color:'rgba(120,53,15,0.6)' }}>— last seen <b>{d.daysSince} days ago</b> ({d.lastPast})</span>
            <Badge status={d.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────
function DetailPanel({ dev, onClose }) {
  const chartReady = useChartJs()
  const monthRef = React.useRef()
  const mCounts = MONTH_KEYS.map(mk => dev.dates.filter(x => x.startsWith(mk)).length)
  const ci = colorIdx(dev.name)

  useChart(monthRef, () => ({
    type: 'bar',
    data: {
      labels: MONTH_LABELS,
      datasets: [{
        data: mCounts,
        backgroundColor: mCounts.map(v => v>0 ? AV_BG[ci] : 'rgba(239,246,255,0.5)'),
        borderColor: mCounts.map(v => v>0 ? AV_TEXT[ci] : 'rgba(59,130,246,0.15)'),
        borderWidth: 1, borderRadius: 3,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: 'Monthly bookings', font: { size: 12 }, color: '#6b7280' } },
      scales: {
        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  }), [dev.mobile, chartReady])

  const dateSet = new Set(dev.dates)
  const start   = new Date('2026-02-01')
  const weeks   = []
  const wkLabels = []
  let prevM = ''
  for (let w = 0; w < 46; w++) {
    const ws = new Date(start); ws.setDate(start.getDate() + w*7)
    if (ws > new Date('2026-12-31')) break
    const mk  = ws.toISOString().slice(0,7)
    const mLbl = MONTH_LABELS[MONTH_KEYS.indexOf(mk)] || ''
    wkLabels.push(mLbl !== prevM ? mLbl : '')
    if (mLbl) prevM = mLbl
    const has = dev.dates.some(dt => { const d=new Date(dt); return d>=ws && d<new Date(ws.getTime()+7*86400000) })
    weeks.push({ has, label: ws.toISOString().slice(0,10) })
  }

  return (
    <div style={{ background:'rgba(239,246,255,0.6)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:16, padding:'16px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <Av name={dev.name} size={44} />
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontWeight:800, color:'#1e3a8a', fontSize:15 }}>{dev.name}</div>
          <div style={{ fontSize:12, color:'rgba(29,78,216,0.5)', marginTop:2 }}>📱 {dev.mobile}</div>
          <div style={{ marginTop:5 }}><Badge status={dev.status} /></div>
        </div>
        <button onClick={onClose} style={{ marginLeft:'auto', width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(29,78,216,0.1)', cursor:'pointer', fontSize:15, color:'#1e3a8a', fontWeight:900 }}>✕</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:8, marginBottom:14 }}>
        {[
          ['Total','',dev.total],
          ['Done','',dev.pastCount],
          ['Upcoming','',dev.total-dev.pastCount],
          ['Days since','', dev.daysSince],
          ['Score','', dev.score+'/100'],
        ].map(([l,,v]) => (
          <div key={l} style={{ background:'rgba(255,255,255,0.7)', borderRadius:10, padding:'9px 10px' }}>
            <div style={{ fontSize:10, color:'rgba(29,78,216,0.45)', fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:17, fontWeight:900, color:'#1e3a8a' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:12 }}>
        {chartReady
          ? <div style={{ position:'relative', width:'100%', height:160 }}><canvas ref={monthRef} /></div>
          : <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(29,78,216,0.3)', fontSize:12 }}>Loading chart…</div>
        }
      </div>

      <div style={{ fontSize:11, color:'rgba(29,78,216,0.45)', fontWeight:700, marginBottom:5 }}>Week-by-week activity</div>
      <div style={{ display:'flex', gap:2, overflowX:'auto', paddingBottom:4 }}>
        {weeks.map((w,i) => (
          <div key={i} title={`${w.label}${w.has?' — booked':''}`}
            style={{ width:13, height:13, borderRadius:2, flexShrink:0, background: w.has ? AV_TEXT[ci] : '#e0e7ff' }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:2, marginTop:3 }}>
        {wkLabels.map((l,i) => (
          <div key={i} style={{ width:13, fontSize:8, color:'rgba(29,78,216,0.35)', textAlign:'center', flexShrink:0 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
//  Main export
// ════════════════════════════════════════════════════════════════
export default function DevoteeTracker() {
  const chartReady = useChartJs()
  const [search,   setSearch]   = React.useState('')
  const [filter,   setFilter]   = React.useState('all')
  const [subPage,  setSubPage]  = React.useState('overview')
  const [selected, setSelected] = React.useState(null)

  const ALL = React.useMemo(() => buildDevotees(), [])

  const devs = React.useMemo(() => {
    let d = ALL
    if (search.trim()) d = d.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.mobile.includes(search))
    if (filter !== 'all') d = d.filter(x => x.status === filter)
    return d
  }, [ALL, search, filter])

  const active   = ALL.filter(d => d.status === 'active').length
  const atRisk   = ALL.filter(d => d.status === 'at-risk').length
  const inactive = ALL.filter(d => d.status === 'inactive').length

  const SUB_TABS = [
    { id:'overview', label:'📊 Overview' },
    { id:'charts',   label:'📈 Charts' },
    { id:'heatmap',  label:'🗓️ Heatmap' },
    { id:'table',    label:'🪷 All devotees' },
  ]

  const subTabSt = id => ({
    flex:1, padding:'8px 4px', border:'none', borderRadius:10, cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:800, whiteSpace:'nowrap',
    transition:'all .15s',
    background: subPage===id ? 'linear-gradient(135deg,#1e3a8a,#3b82f6)' : 'rgba(239,246,255,0.7)',
    color: subPage===id ? '#fff' : 'rgba(29,78,216,0.55)',
    boxShadow: subPage===id ? '0 2px 8px rgba(29,78,216,0.2)' : 'none',
  })

  const legend = (
    <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:11, color:'rgba(29,78,216,0.55)', marginBottom:12 }}>
      {[['Active','#15803d'],['At risk','#b45309'],['Inactive','#dc2626']].map(([l,c]) => (
        <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:10, height:10, borderRadius:2, background:c }} />{l}
        </span>
      ))}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* KPI cards */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
        {[
          ['Total devotees', ALL.length, '#1d4ed8'],
          ['Active',  active,   '#15803d'],
          ['At risk', atRisk,   '#b45309'],
          ['Inactive',inactive, '#dc2626'],
          ['Bookings',RAW_BOOKINGS.length,'#6d28d9'],
        ].map(([l,v,c]) => (
          <div key={l} style={{ flex:'1 1 100px', background:'rgba(255,255,255,0.78)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize:10, color:'rgba(29,78,216,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>{l}</div>
            <div style={{ fontSize:28, fontWeight:900, color:c, fontFamily:"'Cinzel',serif", lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Attention strip */}
      <AttentionStrip devs={ALL} />

      {/* Sub nav */}
      <div style={{ display:'flex', gap:5, background:'rgba(255,255,255,0.6)', borderRadius:12, padding:4, border:'1px solid rgba(59,130,246,0.12)' }}>
        {SUB_TABS.map(t => <button key={t.id} style={subTabSt(t.id)} onClick={() => { setSubPage(t.id); setSelected(null) }}>{t.label}</button>)}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <input
          placeholder="🔍 Search name or mobile…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex:'1 1 180px', padding:'9px 12px', borderRadius:10, border:'1px solid rgba(59,130,246,0.2)', background:'rgba(239,246,255,0.8)', fontSize:13, outline:'none' }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding:'9px 12px', borderRadius:10, border:'1px solid rgba(59,130,246,0.2)', background:'rgba(239,246,255,0.8)', fontSize:13, cursor:'pointer' }}>
          <option value="all">All devotees</option>
          <option value="active">Active</option>
          <option value="at-risk">At risk</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel dev={selected} onClose={() => setSelected(null)} />}

      {/* ── OVERVIEW ── */}
      {subPage === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {legend}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>Status breakdown</div>
              <Donut active={active} atRisk={atRisk} inactive={inactive} />
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
                {[['Active',active,'#15803d'],['At risk',atRisk,'#b45309'],['Inactive',inactive,'#dc2626']].map(([l,v,c]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                    <span style={{ width:10, height:10, borderRadius:2, background:c, flexShrink:0 }} />
                    <span style={{ color:'#1e3a8a' }}>{l}</span>
                    <span style={{ marginLeft:'auto', fontWeight:800, color:'#1e3a8a' }}>{v}</span>
                    <span style={{ color:'rgba(29,78,216,0.4)', fontSize:11 }}>{Math.round(v/ALL.length*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>Monthly bookings</div>
              <MonthlyLine />
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>Top devotees by total bookings</div>
            <HBar
              labels={devs.slice(0,14).map(d => d.name.length>16 ? d.name.slice(0,14)+'…' : d.name)}
              data={devs.slice(0,14).map(d => d.total)}
              colors={devs.slice(0,14).map(d => STATUS_COLOR[d.status])}
              height={Math.max(280, devs.slice(0,14).length*34+60)}
            />
          </div>
        </div>
      )}

      {/* ── CHARTS ── */}
      {subPage === 'charts' && (
        <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>Days since last booking — outreach priority</div>
          {legend}
          <DaysBar devs={devs} />
        </div>
      )}

      {/* ── HEATMAP ── */}
      {subPage === 'heatmap' && (
        <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>Month-by-month activity — number = bookings that month</div>
          <HeatmapTable devs={devs} />
        </div>
      )}

      {/* ── TABLE ── */}
      {subPage === 'table' && (
        <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ fontSize:10, fontWeight:800, color:'rgba(29,78,216,0.45)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:10 }}>
            {devs.length} devotee{devs.length!==1?'s':''} · click a row to see details
          </div>
          <DevoteeTable devs={devs} onSelect={d => { setSelected(d); window.scrollTo({top:0,behavior:'smooth'}) }} />
        </div>
      )}

    </div>
  )
}
