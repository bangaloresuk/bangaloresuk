// ============================================================
//  DB PROVIDER — Google Apps Script + Google Sheets
//  ─────────────────────────────────────────────────────────
//  Implements the standard DB interface using Google Sheets
//  as the backend via a deployed Apps Script web app.
//
//  To configure: call googleSheetsProvider.configure({ scriptUrl, apiKey })
//  This is called automatically by AppShell when a SUK is selected.
// ============================================================

const SHEET = {
  BOOKINGS: 'Bookings',
  SATSANG:  'Satsang',
  PHOTOS:   'Photos',
}

let _scriptUrl = ''
let _apiKey    = ''

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

// ── Provider object — implements the standard DB interface ────

export const googleSheetsProvider = {

  /** Call this once when a SUK is selected */
  configure({ scriptUrl, apiKey }) {
    _scriptUrl = scriptUrl
    _apiKey    = apiKey
  },

  // ── Prayer bookings ───────────────────────────────────────

  bookings: {
    getAll:        ()           => get({ action: 'getAll' }),
    add:           (data)       => post({ action: 'add', ...data }),
    cancel:        (id)         => post({ action: 'delete', id }),
    updateAddress: (id, place)  => post({ action: 'updateAddress', id, place }),
  },

  // ── Satsang bookings ─────────────────────────────────────

  satsang: {
    getAll: ()     => get({ action: 'getAll', sheetName: SHEET.SATSANG }),
    add:    (data) => post({ action: 'add',   sheetName: SHEET.SATSANG, ...data }),
    cancel: (id)   => post({ action: 'delete', id, sheetName: SHEET.SATSANG }),
  },

  // ── Photo gallery ─────────────────────────────────────────

  photos: {
    getAll: () => get({ action: 'getPhotos' }),

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
