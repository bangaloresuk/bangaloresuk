// // // ============================================================
// // //  DB PROVIDER — Google Apps Script + Google Sheets
// // //  ─────────────────────────────────────────────────────────
// // //  Level 1: Cloudflare Worker KV cache (server side, 60s TTL)
// // //  Level 2: localStorage cache (browser side, 60s TTL)
// // //  Together: first load ~1s, repeat loads instant
// // // ============================================================

// // const SHEET = {
// //   BOOKINGS: 'Bookings',
// //   SATSANG:  'Satsang',
// //   PHOTOS:   'Photos',
// // }

// // const LOCAL_TTL = 60 * 1000  // 60 seconds in ms

// // let _scriptUrl = ''
// // let _apiKey    = ''

// // // ── Level 2: localStorage cache helpers ──────────────────────

// // function localGet(key) {
// //   try {
// //     const raw = localStorage.getItem(key)
// //     if (!raw) return null
// //     const { data, timestamp } = JSON.parse(raw)
// //     if (Date.now() - timestamp > LOCAL_TTL) {
// //       localStorage.removeItem(key)
// //       return null
// //     }
// //     return data
// //   } catch {
// //     return null
// //   }
// // }

// // function localSet(key, data) {
// //   try {
// //     localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
// //   } catch {
// //     // localStorage full or unavailable — silently skip
// //   }
// // }

// // function localBust(key) {
// //   try { localStorage.removeItem(key) } catch {}
// // }

// // // ── Internal HTTP helpers ─────────────────────────────────────

// // async function get(params) {
// //   const query = new URLSearchParams({ ...params, apiKey: _apiKey }).toString()
// //   const res   = await fetch(`${_scriptUrl}?${query}`)
// //   return res.json()
// // }

// // async function post(body) {
// //   const res = await fetch(_scriptUrl, {
// //     method: 'POST',
// //     body:   JSON.stringify({ ...body, apiKey: _apiKey }),
// //   })
// //   return res.json()
// // }

// // // ── Cached GET — checks localStorage first, then Worker KV ───

// // async function getCached(params) {
// //   const cacheKey = `suk:${_apiKey}:${params.action}`

// //   // Level 2: check localStorage first (instant)
// //   const local = localGet(cacheKey)
// //   if (local) return local

// //   // Level 1: Worker KV cache handles this if localStorage misses
// //   const data = await get(params)

// //   // Store in localStorage for next time
// //   localSet(cacheKey, data)
// //   return data
// // }

// // // ── Provider object — implements the standard DB interface ────

// // export const googleSheetsProvider = {

// //   /** Call this once when a SUK is selected */
// //   configure({ scriptUrl, apiKey }) {
// //     _scriptUrl = scriptUrl
// //     _apiKey    = apiKey
// //   },

// //   // ── Prayer bookings ───────────────────────────────────────

// //   bookings: {
// //     getAll: () => getCached({ action: 'getAll' }),  // ← cached

// //     add: (data) => post({ action: 'add', ...data }).then(res => {
// //       localBust(`suk:${_apiKey}:getAll`)  // bust cache on new booking
// //       return res
// //     }),

// //     cancel: (id) => post({ action: 'delete', id }).then(res => {
// //       localBust(`suk:${_apiKey}:getAll`)  // bust cache on cancel
// //       return res
// //     }),

// //     updateAddress: (id, place) => post({ action: 'updateAddress', id, place }),
// //   },

// //   // ── Satsang bookings ─────────────────────────────────────

// //   satsang: {
// //     getAll: () => getCached({ action: 'getAll', sheetName: SHEET.SATSANG }),  // ← cached

// //     add: (data) => post({ action: 'add', sheetName: SHEET.SATSANG, ...data }).then(res => {
// //       localBust(`suk:${_apiKey}:getAll`)
// //       return res
// //     }),

// //     cancel: (id) => post({ action: 'delete', id, sheetName: SHEET.SATSANG }).then(res => {
// //       localBust(`suk:${_apiKey}:getAll`)
// //       return res
// //     }),
// //   },

// //   // ── Photo gallery ─────────────────────────────────────────

// //   photos: {
// //     getAll: () => getCached({ action: 'getPhotos' }),  // ← cached

// //     upload: (file, caption = '', uploader = 'Anonymous') =>
// //       new Promise((resolve, reject) => {
// //         const reader = new FileReader()
// //         reader.onload = async (ev) => {
// //           try {
// //             const result = await post({
// //               action:   'uploadPhoto',
// //               base64:   ev.target.result.split(',')[1],
// //               filename: file.name,
// //               caption,
// //               uploader,
// //             })
// //             localBust(`suk:${_apiKey}:getPhotos`)  // bust photo cache
// //             resolve(result)
// //           } catch (err) {
// //             reject(err)
// //           }
// //         }
// //         reader.onerror = () => reject(new Error('File read failed'))
// //         reader.readAsDataURL(file)
// //       }),
// //   },
// // }

// // ============================================================
// //  DB PROVIDER — Google Apps Script + Google Sheets
// //  ─────────────────────────────────────────────────────────
// //  Level 1: Cloudflare Worker KV cache (server side, 60s TTL)
// //  Level 2: localStorage cache (browser side, 60s TTL)
// //  Together: first load ~1s, repeat loads instant
// //
// //  FIX: Each action+sheetName combo gets its own unique cache key
// //       to prevent booking/satsang data cross-contamination on refresh.
// // ============================================================

// const SHEET = {
//   BOOKINGS: 'Bookings',
//   SATSANG:  'Satsang',
//   PHOTOS:   'Photos',
// }

// const LOCAL_TTL = 60 * 1000  // 60 seconds in ms

// let _scriptUrl = ''
// let _apiKey    = ''

// // ── Level 2: localStorage cache helpers ──────────────────────

// function localGet(key) {
//   try {
//     const raw = localStorage.getItem(key)
//     if (!raw) return null
//     const { data, timestamp } = JSON.parse(raw)
//     if (Date.now() - timestamp > LOCAL_TTL) {
//       localStorage.removeItem(key)
//       return null
//     }
//     return data
//   } catch {
//     return null
//   }
// }

// function localSet(key, data) {
//   try {
//     localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
//   } catch {
//     // localStorage full or unavailable — silently skip
//   }
// }

// function localBust(key) {
//   try { localStorage.removeItem(key) } catch {}
// }

// // ── Build a unique, stable cache key for any action+sheet combo ──
// // BUG FIX: Previously both bookings and satsang used 'suk:${apiKey}:getAll'
// // which caused them to overwrite each other in localStorage, showing wrong
// // data on refresh. Now each combination gets its own unique key.
// function makeCacheKey(params) {
//   const action = params.action || ''
//   const sheet  = params.sheetName || SHEET.BOOKINGS
//   return `suk:${_apiKey}:${action}:${sheet}`
// }

// // ── Internal HTTP helpers ─────────────────────────────────────

// async function get(params) {
//   // Add _cb timestamp to bust any CDN/browser HTTP cache
//   const query = new URLSearchParams({ ...params, apiKey: _apiKey, _cb: Date.now() }).toString()
//   const res   = await fetch(`${_scriptUrl}?${query}`)
//   return res.json()
// }

// async function post(body) {
//   const res = await fetch(_scriptUrl, {
//     method: 'POST',
//     body:   JSON.stringify({ ...body, apiKey: _apiKey }),
//   })
//   return res.json()
// }

// // ── Cached GET — checks localStorage first, then network ─────

// async function getCached(params) {
//   const cacheKey = makeCacheKey(params)

//   // Level 2: check localStorage first (instant)
//   const local = localGet(cacheKey)
//   if (local) return local

//   // Level 1: fetch fresh data (Worker KV cache handles server side)
//   const data = await get(params)

//   // Store in localStorage for next time
//   localSet(cacheKey, data)
//   return data
// }

// // ── Provider object — implements the standard DB interface ────

// export const googleSheetsProvider = {

//   /** Call this once when a SUK is selected */
//   configure({ scriptUrl, apiKey }) {
//     _scriptUrl = scriptUrl
//     _apiKey    = apiKey
//   },

//   // ── Prayer bookings ───────────────────────────────────────

//   bookings: {
//     // Cache key: suk:{apiKey}:getAll:Bookings
//     getAll: () => getCached({ action: 'getAll', sheetName: SHEET.BOOKINGS }),

//     add: (data) => post({ action: 'add', ...data }).then(res => {
//       localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
//       return res
//     }),

//     cancel: (id) => post({ action: 'delete', id }).then(res => {
//       localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
//       return res
//     }),

//     updateAddress: (id, place) => post({ action: 'updateAddress', id, place }).then(res => {
//       localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
//       return res
//     }),
//   },

//   // ── Satsang bookings ─────────────────────────────────────

//   satsang: {
//     // Cache key: suk:{apiKey}:getAll:Satsang  ← DIFFERENT from bookings now
//     getAll: () => getCached({ action: 'getAll', sheetName: SHEET.SATSANG }),

//     add: (data) => post({ action: 'add', sheetName: SHEET.SATSANG, ...data }).then(res => {
//       localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.SATSANG }))
//       return res
//     }),

//     cancel: (id) => post({ action: 'delete', id, sheetName: SHEET.SATSANG }).then(res => {
//       localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.SATSANG }))
//       return res
//     }),
//   },

//   // ── Photo gallery ─────────────────────────────────────────

//   photos: {
//     // Cache key: suk:{apiKey}:getPhotos:Photos
//     getAll: () => getCached({ action: 'getPhotos', sheetName: SHEET.PHOTOS }),

//     upload: (file, caption = '', uploader = 'Anonymous') =>
//       new Promise((resolve, reject) => {
//         const reader = new FileReader()
//         reader.onload = async (ev) => {
//           try {
//             const result = await post({
//               action:   'uploadPhoto',
//               base64:   ev.target.result.split(',')[1],
//               filename: file.name,
//               caption,
//               uploader,
//             })
//             localBust(makeCacheKey({ action: 'getPhotos', sheetName: SHEET.PHOTOS }))
//             resolve(result)
//           } catch (err) {
//             reject(err)
//           }
//         }
//         reader.onerror = () => reject(new Error('File read failed'))
//         reader.readAsDataURL(file)
//       }),
//   },
// }
// // ============================================================
// //  DB PROVIDER — Google Apps Script + Google Sheets
// //  ─────────────────────────────────────────────────────────
// //  Level 1: Cloudflare Worker KV cache (server side, 60s TTL)
// //  Level 2: localStorage cache (browser side, 60s TTL)
// //  Together: first load ~1s, repeat loads instant
// // ============================================================

// const SHEET = {
//   BOOKINGS: 'Bookings',
//   SATSANG:  'Satsang',
//   PHOTOS:   'Photos',
// }

// const LOCAL_TTL = 60 * 1000  // 60 seconds in ms

// let _scriptUrl = ''
// let _apiKey    = ''

// // ── Level 2: localStorage cache helpers ──────────────────────

// function localGet(key) {
//   try {
//     const raw = localStorage.getItem(key)
//     if (!raw) return null
//     const { data, timestamp } = JSON.parse(raw)
//     if (Date.now() - timestamp > LOCAL_TTL) {
//       localStorage.removeItem(key)
//       return null
//     }
//     return data
//   } catch {
//     return null
//   }
// }

// function localSet(key, data) {
//   try {
//     localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
//   } catch {
//     // localStorage full or unavailable — silently skip
//   }
// }

// function localBust(key) {
//   try { localStorage.removeItem(key) } catch {}
// }

// // ── Internal HTTP helpers ─────────────────────────────────────

// async function get(params) {
//   const query = new URLSearchParams({ ...params, apiKey: _apiKey }).toString()
//   const res   = await fetch(`${_scriptUrl}?${query}`)
//   return res.json()
// }

// async function post(body) {
//   const res = await fetch(_scriptUrl, {
//     method: 'POST',
//     body:   JSON.stringify({ ...body, apiKey: _apiKey }),
//   })
//   return res.json()
// }

// // ── Cached GET — checks localStorage first, then Worker KV ───

// async function getCached(params) {
//   const cacheKey = `suk:${_apiKey}:${params.action}`

//   // Level 2: check localStorage first (instant)
//   const local = localGet(cacheKey)
//   if (local) return local

//   // Level 1: Worker KV cache handles this if localStorage misses
//   const data = await get(params)

//   // Store in localStorage for next time
//   localSet(cacheKey, data)
//   return data
// }

// // ── Provider object — implements the standard DB interface ────

// export const googleSheetsProvider = {

//   /** Call this once when a SUK is selected */
//   configure({ scriptUrl, apiKey }) {
//     _scriptUrl = scriptUrl
//     _apiKey    = apiKey
//   },

//   // ── Prayer bookings ───────────────────────────────────────

//   bookings: {
//     getAll: () => getCached({ action: 'getAll' }),  // ← cached

//     add: (data) => post({ action: 'add', ...data }).then(res => {
//       localBust(`suk:${_apiKey}:getAll`)  // bust cache on new booking
//       return res
//     }),

//     cancel: (id) => post({ action: 'delete', id }).then(res => {
//       localBust(`suk:${_apiKey}:getAll`)  // bust cache on cancel
//       return res
//     }),

//     updateAddress: (id, place) => post({ action: 'updateAddress', id, place }),
//   },

//   // ── Satsang bookings ─────────────────────────────────────

//   satsang: {
//     getAll: () => getCached({ action: 'getAll', sheetName: SHEET.SATSANG }),  // ← cached

//     add: (data) => post({ action: 'add', sheetName: SHEET.SATSANG, ...data }).then(res => {
//       localBust(`suk:${_apiKey}:getAll`)
//       return res
//     }),

//     cancel: (id) => post({ action: 'delete', id, sheetName: SHEET.SATSANG }).then(res => {
//       localBust(`suk:${_apiKey}:getAll`)
//       return res
//     }),
//   },

//   // ── Photo gallery ─────────────────────────────────────────

//   photos: {
//     getAll: () => getCached({ action: 'getPhotos' }),  // ← cached

//     upload: (file, caption = '', uploader = 'Anonymous') =>
//       new Promise((resolve, reject) => {
//         const reader = new FileReader()
//         reader.onload = async (ev) => {
//           try {
//             const result = await post({
//               action:   'uploadPhoto',
//               base64:   ev.target.result.split(',')[1],
//               filename: file.name,
//               caption,
//               uploader,
//             })
//             localBust(`suk:${_apiKey}:getPhotos`)  // bust photo cache
//             resolve(result)
//           } catch (err) {
//             reject(err)
//           }
//         }
//         reader.onerror = () => reject(new Error('File read failed'))
//         reader.readAsDataURL(file)
//       }),
//   },
// }

// ============================================================
//  DB PROVIDER — Google Apps Script + Google Sheets
//  ─────────────────────────────────────────────────────────
//  Level 1: Cloudflare Worker KV cache (server side, 60s TTL)
//  Level 2: localStorage cache (browser side, 60s TTL)
//  Together: first load ~1s, repeat loads instant
//
//  FIX: Each action+sheetName combo gets its own unique cache key
//       to prevent booking/satsang data cross-contamination on refresh.
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

// ── Build a unique, stable cache key for any action+sheet combo ──
// BUG FIX: Previously both bookings and satsang used 'suk:${apiKey}:getAll'
// which caused them to overwrite each other in localStorage, showing wrong
// data on refresh. Now each combination gets its own unique key.
function makeCacheKey(params) {
  const action = params.action || ''
  const sheet  = params.sheetName || SHEET.BOOKINGS
  return `suk:${_apiKey}:${action}:${sheet}`
}

// ── Internal HTTP helpers ─────────────────────────────────────

async function get(params) {
  // Add _cb timestamp to bust any CDN/browser HTTP cache
  const query = new URLSearchParams({ ...params, apiKey: _apiKey, _cb: Date.now() }).toString()
  const res   = await fetch(`${_scriptUrl}?${query}`)
  return res.json()
}

// queryParams: optional key-value pairs appended to the URL (e.g. { sheetName })
// GAS reads these reliably via e.parameter regardless of body parsing.
async function post(body, queryParams = {}) {
  const query = new URLSearchParams({ apiKey: _apiKey, ...queryParams }).toString()
  const res = await fetch(`${_scriptUrl}?${query}`, {
    method: 'POST',
    body:   JSON.stringify({ ...body, apiKey: _apiKey }),
  })
  return res.json()
}

// ── Cached GET — checks localStorage first, then network ─────

async function getCached(params) {
  const cacheKey = makeCacheKey(params)

  // Level 2: check localStorage first (instant)
  const local = localGet(cacheKey)
  if (local) return local

  // Level 1: fetch fresh data (Worker KV cache handles server side)
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
    // Cache key: suk:{apiKey}:getAll:Bookings
    getAll: () => getCached({ action: 'getAll', sheetName: SHEET.BOOKINGS }),

    add: (data) => post({ action: 'add', ...data }).then(res => {
      localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
      return res
    }),

    cancel: (id) => post({ action: 'delete', id }).then(res => {
      localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
      return res
    }),

    updateAddress: (id, place) => post({ action: 'updateAddress', id, place }).then(res => {
      localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.BOOKINGS }))
      return res
    }),
  },

  // ── Satsang bookings ─────────────────────────────────────

  satsang: {
    // Cache key: suk:{apiKey}:getAll:Satsang  ← DIFFERENT from bookings now
    getAll: () => getCached({ action: 'getAll', sheetName: SHEET.SATSANG }),

    add: (data) => post(
      { action: 'add', sheetName: SHEET.SATSANG, ...data },
      { action: 'add', sheetName: SHEET.SATSANG }          // also in URL so GAS reads via e.parameter
    ).then(res => {
      localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.SATSANG }))
      return res
    }),

    cancel: (id) => post(
      { action: 'delete', id, sheetName: SHEET.SATSANG },
      { action: 'delete', sheetName: SHEET.SATSANG }        // also in URL so GAS reads via e.parameter
    ).then(res => {
      localBust(makeCacheKey({ action: 'getAll', sheetName: SHEET.SATSANG }))
      return res
    }),
  },

  // ── Photo gallery ─────────────────────────────────────────

  photos: {
    // Cache key: suk:{apiKey}:getPhotos:Photos
    getAll: () => getCached({ action: 'getPhotos', sheetName: SHEET.PHOTOS }),

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
            localBust(makeCacheKey({ action: 'getPhotos', sheetName: SHEET.PHOTOS }))
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