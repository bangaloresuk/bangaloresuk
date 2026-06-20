// ============================================================
//  ConfirmationModals — booking success modals (prayer + satsang)
// ============================================================
import React from 'react'
import { formatDateWithDay, cleanTime } from '../../utils/utils.js'

// ── Prayer booking confirmed modal ────────────────────────────
export function PrayerConfirmModal({ confirmation, onClose, buildShareMsg, buildShareMsgPlain, handleCopy }) {
  if (!confirmation) return null
  const c = confirmation
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:56, marginBottom:8, animation:'floatEmoji 2s ease-in-out infinite alternate' }}>🙏</div>
        <div className="modal-title">Booking Confirmed!</div>

        <div style={{ background:'#eff6ff', borderRadius:14, padding:'14px 16px',
          margin:'14px 0', textAlign:'left', border:'1px solid rgba(59,130,246,0.2)' }}>
          {[
            ['👤 Name',  c.name],
            [c.time==='Morning' ? '🌅 Slot' : '🌙 Slot', `${c.time} Prayer`],
            ['🗓️ Date',  formatDateWithDay(c.date)],
            ['🕐 Time',  cleanTime(c.prayerTime)],
          ].map(([label, val]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'5px 0', borderBottom:'1px solid rgba(59,130,246,0.08)' }}>
              <span style={{ fontSize:12, color:'rgba(29,78,216,0.55)', fontWeight:600 }}>{label}</span>
              <span style={{ fontSize:13, color:'#1e3a8a', fontWeight:700 }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="modal-jayguru">Jayguru 🙏</div>

        <div style={{ marginTop:18, padding:'14px', background:'#f0fdf4',
          borderRadius:12, border:'1px solid #bbf7d0' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#065f46',
            marginBottom:10, textAlign:'center', letterSpacing:'0.5px' }}>📤 Share Booking Details</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href={`https://wa.me/?text=${buildShareMsg(c)}`} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, textDecoration:'none',
                background:'linear-gradient(135deg,#25D366,#128C7E)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 14px rgba(37,211,102,0.35)' }}>
              <span style={{ fontSize:20 }}>💬</span>Share on WhatsApp
            </a>
            <a href={`sms:${c.mobile}?body=${buildShareMsg(c)}`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, textDecoration:'none',
                background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 14px rgba(29,78,216,0.3)' }}>
              <span style={{ fontSize:20 }}>📱</span>Send as SMS
            </a>
            <button onClick={() => handleCopy(c)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, border:'none',
                background:'rgba(30,64,175,0.08)', cursor:'pointer',
                color:'#1e3a8a', fontWeight:700, fontSize:14 }}>
              <span style={{ fontSize:20 }}>📋</span>Copy to Clipboard
            </button>
          </div>
          <div style={{ fontSize:11, color:'#6b7280', marginTop:8, textAlign:'center', lineHeight:1.5 }}>
            Tap WhatsApp to share with family · or SMS to send directly · or Copy to paste anywhere
          </div>
        </div>

        <button className="modal-close-btn" style={{ marginTop:14 }} onClick={onClose}>✓ Done</button>
      </div>
    </div>
  )
}

// ── Satsang booking confirmed modal ───────────────────────────
export function SatsangConfirmModal({ satsangConfirm, onClose, buildSatsangShareMsg, buildSatsangShareMsgPlain, handleSatsangCopy }) {
  if (!satsangConfirm) return null
  const c = satsangConfirm
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:56, marginBottom:8,
          animation:'floatEmoji 2s ease-in-out infinite alternate',
          filter:'drop-shadow(0 0 18px rgba(217,119,6,0.5))' }}>🪔</div>
        <div className="modal-title" style={{ color:'#78350f' }}>Satsang Booked!</div>

        <div style={{ background:'#fef3c7', borderRadius:14, padding:'14px 16px',
          margin:'14px 0', textAlign:'left', border:'1px solid rgba(217,119,6,0.3)' }}>
          {[
            ['👤 Host',    c.name],
            ['📅 Date',    (c.day||'')+', '],
            ['⏰ Time',    c.time+' onwards'],
            ['📍 Venue',   c.venue],
            ['🪔 Occasion', c.occasion||null],
          ].map(([label, val]) => val ? (
            <div key={label} style={{ display:'flex', justifyContent:'space-between',
              alignItems:'flex-start', padding:'5px 0',
              borderBottom:'1px solid rgba(217,119,6,0.1)' }}>
              <span style={{ fontSize:12, color:'rgba(120,53,15,0.6)', fontWeight:600 }}>{label}</span>
              <span style={{ fontSize:13, color:'#78350f', fontWeight:700, textAlign:'right', maxWidth:'60%' }}>{val}</span>
            </div>
          ) : null)}
        </div>

        <div style={{ fontFamily:"'Cinzel',serif", color:'#78350f',
          fontSize:14, fontWeight:700, textAlign:'center', marginBottom:4 }}>Jayguru 🪔</div>

        <div style={{ marginTop:14, padding:'14px', background:'#fffbeb',
          borderRadius:12, border:'1px solid rgba(217,119,6,0.25)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#78350f',
            marginBottom:10, textAlign:'center', letterSpacing:'0.5px' }}>📤 Share Satsang Details</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href={`https://wa.me/?text=${buildSatsangShareMsg(c)}`} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, textDecoration:'none',
                background:'linear-gradient(135deg,#25D366,#128C7E)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 14px rgba(37,211,102,0.35)' }}>
              <span style={{ fontSize:20 }}>💬</span>Share on WhatsApp
            </a>
            <a href={`sms:?body=${buildSatsangShareMsg(c)}`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, textDecoration:'none',
                background:'linear-gradient(135deg,#d97706,#fbbf24)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 14px rgba(217,119,6,0.35)' }}>
              <span style={{ fontSize:20 }}>📱</span>Send as SMS
            </a>
            <button onClick={() => handleSatsangCopy(c)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center',
                gap:10, padding:'12px', borderRadius:11, border:'none',
                background:'rgba(120,53,15,0.08)', cursor:'pointer',
                color:'#78350f', fontWeight:700, fontSize:14 }}>
              <span style={{ fontSize:20 }}>📋</span>Copy to Clipboard
            </button>
          </div>
          <div style={{ fontSize:11, color:'#6b7280', marginTop:8, textAlign:'center', lineHeight:1.5 }}>
            Share the invitation with family & friends 🙏
          </div>
        </div>

        <button className="modal-close-btn"
          style={{ marginTop:14, background:'linear-gradient(135deg,#78350f,#d97706)' }}
          onClick={onClose}>✓ Done</button>
      </div>
    </div>
  )
}
