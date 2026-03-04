// ============================================================
//  GalleryTab — Upload & browse prayer photos
//
//  Props:
//    isConfigured   {boolean}  — false = show "not configured" warning
//    photos         {array}    — photo list from parent
//    photosLoading  {boolean}
//    photoUpload    {object}   — { file, preview, caption, uploader }
//    setPhotoUpload {function}
//    photoMsg       {string}   — success/error message
//    setPhotoMsg    {function}
//    photoUploading {boolean}
//    onUpload       {function} — called when Upload button clicked
// ============================================================

import React from 'react'
import state from '../../config/activeSuk.js'
import { sukLabel } from '../../config/sukConfig.js'
import { cleanPhotoDate } from '../../utils/utils.js'

export default function GalleryTab({
  isConfigured,
  photos, photosLoading,
  photoUpload, setPhotoUpload,
  photoMsg, setPhotoMsg,
  photoUploading,
  onUpload,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setPhotoMsg('⚠️ Photo must be under 5MB.'); return }
    setPhotoMsg('')
    const reader = new FileReader()
    reader.onload = ev => setPhotoUpload(p => ({ ...p, file, preview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handlePhotoShare = (p) => {
    const galleryUrl = (() => {
      try {
        const base   = window.location.origin + window.location.pathname
        const sukKey = state.ACTIVE_SUK ? state.ACTIVE_SUK.key : ''
        return `${base}?suk=${encodeURIComponent(sukKey)}&open=gallery`
      } catch (e) { return '' }
    })()
    const text = [
      '🌸 *Jayguru* 🙏', '',
      p.caption ? p.caption : 'A sacred prayer moment 🪷',
      p.uploader ? `— 🙏 ${p.uploader}` : '',
      '', '📸 View the Prayer Photo Gallery:', galleryUrl, '',
      `🙏 *${state.ACTIVE_SUK ? sukLabel(state.ACTIVE_SUK) : 'Satsang Upayojana Kendra'}*`,
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      navigator.share({ title: '🌸 Jayguru — Prayer Gallery', text }).catch(() => {})
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('✅ Copied! Paste it anywhere.'))
        .catch(() => prompt('Copy this:', text))
    } else {
      prompt('Copy this:', text)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div className="card" style={{ textAlign: 'center', padding: '22px 16px 18px' }}>
        <div style={{ fontSize: 44, marginBottom: 8,
          filter: 'drop-shadow(0 0 18px rgba(255,160,200,0.5))',
          animation: 'floatEmoji 3s ease-in-out infinite alternate' }}>🌸</div>
        <div style={{ fontFamily: "'Cinzel',serif", color: '#1e3a8a', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
          Prayer Photo Gallery
        </div>
        <div style={{ fontSize: 12, color: 'rgba(29,78,216,0.45)', lineHeight: 1.7 }}>
          Upload & cherish sacred prayer moments
        </div>
        <div className="blue-line" style={{ marginTop: 14 }} />
      </div>

      {/* Upload form */}
      <div className="card">
        <div style={{ fontFamily: "'Cinzel',serif", color: '#1e3a8a', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
          📸 Upload a Photo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* File picker */}
          <div>
            <label className="divine-label">Select Photo</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '20px 16px', borderRadius: 14,
              border: '2px dashed rgba(59,130,246,0.3)',
              background: 'rgba(239,246,255,0.5)', cursor: 'pointer', textAlign: 'center',
            }}>
              {photoUpload.preview ? (
                <img src={photoUpload.preview} alt="preview" style={{
                  maxWidth: '100%', maxHeight: 200, borderRadius: 10,
                  objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }} />
              ) : (
                <>
                  <span style={{ fontSize: 36 }}>🌸</span>
                  <span style={{ fontSize: 13, color: 'rgba(29,78,216,0.5)', fontWeight: 600 }}>
                    Tap to choose a photo
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(29,78,216,0.35)' }}>JPG, PNG up to 5MB</span>
                </>
              )}
              <input type="file" accept="image/*"
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="divine-label">Caption (optional)</label>
            <input className="divine-input" placeholder="e.g. Morning prayer at home, Feb 2026"
              value={photoUpload.caption}
              onChange={e => setPhotoUpload(p => ({ ...p, caption: e.target.value }))} />
          </div>

          <div>
            <label className="divine-label">Your Name (optional)</label>
            <input className="divine-input" placeholder="e.g. Bannerghatta SUK"
              value={photoUpload.uploader}
              onChange={e => setPhotoUpload(p => ({ ...p, uploader: e.target.value }))} />
          </div>

          {photoMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: photoMsg.startsWith('✅') ? '#d1fae5' : '#fef3c7',
              color: photoMsg.startsWith('✅') ? '#065f46' : '#92400e',
            }}>{photoMsg}</div>
          )}

          <button onClick={onUpload} disabled={photoUploading || !photoUpload.file} className="submit-btn">
            {photoUploading ? '⏳ Uploading...' : '🌸 Upload Photo'}
          </button>

          {!isConfigured && (
            <div style={{ fontSize: 11, color: 'rgba(217,119,6,0.7)', textAlign: 'center' }}>
              ⚙️ Configure Script URL to enable uploads
            </div>
          )}
        </div>
      </div>

      {/* Photo grid */}
      <div className="card">
        <div style={{ fontFamily: "'Cinzel',serif", color: '#1e3a8a', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
          🌸 Prayer Photo Gallery
          {photos.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(29,78,216,0.45)', fontWeight: 600, marginLeft: 8 }}>
              ({photos.length} photos)
            </span>
          )}
        </div>

        {photosLoading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'rgba(29,78,216,0.4)', fontSize: 13 }}>
            ⏳ Loading gallery...
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10, filter: 'saturate(0) brightness(2.2)' }}>🪷</div>
            <div style={{ color: 'rgba(29,78,216,0.35)', fontSize: 13 }}>
              No photos yet — be the first to share a sacred moment 🙏
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {photos.map((p, i) => (
              <div key={i} style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(59,130,246,0.15)',
                background: 'rgba(239,246,255,0.4)',
                display: 'flex', flexDirection: 'column',
              }}>
                <img src={p.url} alt={p.caption || 'Prayer'} loading="lazy"
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />

                {(p.caption || p.uploader || p.date) && (
                  <div style={{ padding: '8px 10px 4px' }}>
                    {p.caption && (
                      <div style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }}>
                        {p.caption}
                      </div>
                    )}
                    {p.uploader && (
                      <div style={{ fontSize: 10, color: 'rgba(29,78,216,0.45)' }}>🙏 {p.uploader}</div>
                    )}
                    {p.date && (
                      <div style={{ fontSize: 10, color: 'rgba(29,78,216,0.3)', marginTop: 2 }}>
                        {cleanPhotoDate(p.date)}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => handlePhotoShare(p)} style={{
                  marginTop: 'auto', padding: 8, border: 'none',
                  borderTop: '1px solid rgba(59,130,246,0.08)',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 5, fontSize: 11, fontWeight: 700, color: 'rgba(29,78,216,0.55)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,78,216,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 14 }}>📤</span> Share
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
