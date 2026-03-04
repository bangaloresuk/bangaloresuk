import React from 'react'

/** Full-page overlay with lotus spinner shown on initial data load */
export function DataLoadingOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(232,240,254,0.85)',
      backdropFilter: 'blur(6px)',
      animation: 'fadeSlideIn 0.3s ease-out both',
    }}>
      <div style={{
        fontSize: 44, marginBottom: 16,
        animation: 'floatEmoji 1.2s ease-in-out infinite alternate',
        filter: 'drop-shadow(0 0 18px rgba(255,180,0,0.55))',
      }}>🪷</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: '50%', background: '#3b82f6',
            animation: 'dotPulse 1.2s ease-in-out infinite',
            animationDelay: i * 0.2 + 's', opacity: 0.7,
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700,
        color: 'rgba(29,78,216,0.65)', letterSpacing: '1.5px',
      }}>Loading your Kendra data...</div>
      <div style={{ fontSize: 11, color: 'rgba(29,78,216,0.38)', marginTop: 6, letterSpacing: '0.5px' }}>
        Jayguru 🙏
      </div>
    </div>
  )
}
