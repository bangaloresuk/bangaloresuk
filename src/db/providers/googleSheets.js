// ============================================================
//  DB PROVIDER — Google Apps Script + Google Sheets
//  ─────────────────────────────────────────────────────────
//  Level 1: Cloudflare Worker KV cache (server side, 60s TTL)
//  Level 2: localStorage cache (browser side, 60s TTL)
//  Together: first load ~1s, repeat loads instant
// ============================================================

const SHEET = {
  BOOKINGS: 'Bookings',
  SATSANG:  'Satsang',
  PHOTOS:   'Photos',
}

const LOCAL_TTL = 60 * 1000  // 60 seconds in ms

let _scriptUrl = ''
let _apiKey    = ''

// ── Level 2: localStorage cache helpers ──────────────────────

function localGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > LOCAL_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function localSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function localBust(key) {
  try { localStorage.removeItem(key) } catch {}
}

// ── Internal HTTP helpers ─────────────────────────────────────

async function get(params) {
  const query = new URLSearchParams({ ...params, apiKey: _apiKey }).toString()
  const res   = await fetch(`${_scriptUrl}?${query}`)
  return res.json()
}

async function post(body) {
  const res = await fetch(_scriptUrl, {
    method: 'POST',
    body:   JSON.stringify({ ...body, apiKey: _apiKey }),
  })
  return res.json()
}

// ── Cached GET — checks localStorage first, then Worker KV ───

async function getCached(params) {
  const cacheKey = `suk:${_apiKey}:${params.action}`

  // Level 2: check localStorage first (instant)
  const local = localGet(cacheKey)
  if (local) return local

  // Level 1: Worker KV cache handles this if localStorage misses
  const data = await get(params)

  // Store in localStorage for next time
  localSet(cacheKey, data)
  return data
}

// ── Provider object — implements the standard DB interface ────

export const googleSheetsProvider = {

  /** Call this once when a SUK is selected */
  configure({ scriptUrl, apiKey }) {
    _scriptUrl = scriptUrl
    _apiKey    = apiKey
  },

  // ── Prayer bookings ───────────────────────────────────────

  bookings: {
    getAll: () => getCached({ action: 'getAll' }),  // ← cached

    add: (data) => post({ action: 'add', ...data }).then(res => {
      localBust(`suk:${_apiKey}:getAll`)  // bust cache on new booking
      return res
    }),

    cancel: (id) => post({ action: 'delete', id }).then(res => {
      localBust(`suk:${_apiKey}:getAll`)  // bust cache on cancel
      return res
    }),

    updateAddress: (id, place) => post({ action: 'updateAddress', id, place }),
  },

  // ── Satsang bookings ─────────────────────────────────────

  satsang: {
    getAll: () => getCached({ action: 'getAll', sheetName: SHEET.SATSANG }),  // ← cached

    add: (data) => post({ action: 'add', sheetName: SHEET.SATSANG, ...data }).then(res => {
      localBust(`suk:${_apiKey}:getAll`)
      return res
    }),

    cancel: (id) => post({ action: 'delete', id, sheetName: SHEET.SATSANG }).then(res => {
      localBust(`suk:${_apiKey}:getAll`)
      return res
    }),
  },

  // ── Photo gallery ─────────────────────────────────────────

  photos: {
    getAll: () => getCached({ action: 'getPhotos' }),  // ← cached

    upload: (file, caption = '', uploader = 'Anonymous') =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (ev) => {
          try {
            const result = await post({
              action:   'uploadPhoto',
              base64:   ev.target.result.split(',')[1],
              filename: file.name,
              caption,
              uploader,
            })
            localBust(`suk:${_apiKey}:getPhotos`)  // bust photo cache
            resolve(result)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
      }),
  },
}