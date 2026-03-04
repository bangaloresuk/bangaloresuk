// ============================================================
//  DB PROVIDER — Google Apps Script + Google Sheets
//  ─────────────────────────────────────────────────────────
//  Unified cancel logic: booking and satsang use IDENTICAL
//  post() calls, differentiated only by sheetName.
//
//  KEY FIX: Google Apps Script (GAS) redirects POST → GET (302).
//  fetch() follows the redirect but drops the POST body.
//  Solution: ALL params go in BOTH the URL query string AND
//  the body, so GAS can read them via e.parameter (URL)
//  regardless of body parsing.
// ============================================================

const SHEET = {
  BOOKINGS: 'Bookings',
  SATSANG:  'Satsang',
  PHOTOS:   'Photos',
}

const LOCAL_TTL = 60 * 1000  // 60 seconds

let _scriptUrl = ''
let _apiKey    = ''

// ── localStorage cache helpers ────────────────────────────

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
  } catch {}
}

function localBust(key) {
  try { localStorage.removeItem(key) } catch {}
}

function makeCacheKey(action, sheetName) {
  return `suk:${_apiKey}:${action}:${sheetName}`
}

// ── HTTP helpers ──────────────────────────────────────────
//
// ALL params go in the URL query string.
// GAS reads e.parameter (URL) reliably even after a 302 redirect.
// The JSON body is sent as a fallback for GAS doPost(e.postData).

async function gasRequest(method, params) {
  const payload = { ...params, apiKey: _apiKey }
  const query   = new URLSearchParams(payload).toString()
  const options = method === 'GET'
    ? { method: 'GET' }
    : { method: 'POST', redirect: 'follow', body: JSON.stringify(payload) }

  const res  = await fetch(`${_scriptUrl}?${query}`, options)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error('GAS non-JSON response:', text.slice(0, 300))
    return { success: false, message: 'Server returned an unexpected response. Please try again.' }
  }
}

const gasGet  = (params) => gasRequest('GET',  params)
const gasPost = (params) => gasRequest('POST', params)

// ── Cached GET ────────────────────────────────────────────

async function getCached(action, sheetName) {
  const cacheKey = makeCacheKey(action, sheetName)
  const local    = localGet(cacheKey)
  if (local) return local
  const data = await gasGet({ action, sheetName, _cb: Date.now() })
  localSet(cacheKey, data)
  return data
}

// ── Provider ──────────────────────────────────────────────

export const googleSheetsProvider = {

  configure({ scriptUrl, apiKey }) {
    _scriptUrl = scriptUrl
    _apiKey    = apiKey
  },

  // ── Prayer bookings ───────────────────────────────────────

  bookings: {
    getAll: () => getCached('getAll', SHEET.BOOKINGS),

    add: (data) => gasPost({ action: 'add', sheetName: SHEET.BOOKINGS, ...data })
      .then(res => { localBust(makeCacheKey('getAll', SHEET.BOOKINGS)); return res }),

    cancel: (id) => gasPost({ action: 'delete', id, sheetName: SHEET.BOOKINGS })
      .then(res => { localBust(makeCacheKey('getAll', SHEET.BOOKINGS)); return res }),

    updateAddress: (id, place) => gasPost({ action: 'updateAddress', id, place, sheetName: SHEET.BOOKINGS })
      .then(res => { localBust(makeCacheKey('getAll', SHEET.BOOKINGS)); return res }),
  },

  // ── Satsang bookings — IDENTICAL pattern to bookings above ──

  satsang: {
    getAll: () => getCached('getAll', SHEET.SATSANG),

    add: (data) => gasPost({ action: 'add', sheetName: SHEET.SATSANG, ...data })
      .then(res => { localBust(makeCacheKey('getAll', SHEET.SATSANG)); return res }),

    cancel: (id) => gasPost({ action: 'delete', id, sheetName: SHEET.SATSANG })
      .then(res => { localBust(makeCacheKey('getAll', SHEET.SATSANG)); return res }),
  },

  // ── Photo gallery ─────────────────────────────────────────

  photos: {
    getAll: () => getCached('getPhotos', SHEET.PHOTOS),

    upload: (file, caption = '', uploader = 'Anonymous') =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (ev) => {
          try {
            const result = await gasPost({
              action:   'uploadPhoto',
              base64:   ev.target.result.split(',')[1],
              filename: file.name,
              caption,
              uploader,
            })
            localBust(makeCacheKey('getPhotos', SHEET.PHOTOS))
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