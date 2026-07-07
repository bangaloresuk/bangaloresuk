// ============================================================
//  DB PROVIDER — Google Apps Script + Google Sheets
//  Calls the Python FastAPI backend (Render) which then
//  calls GAS server-side. GAS URL never reaches the browser.
// ============================================================

const SHEET = {
  BOOKINGS: 'Bookings',
  SATSANG:  'Satsang',
  BHADRA:   'Bhadra',
  MATRI:    'Matri',
  SAVAN:    'Savan',
  PHOTOS:   'Photos',
}

let _scriptUrl = ''
let _apiKey    = ''

async function apiCall(method, path, body = null, extraParams = {}) {
  const params = new URLSearchParams({ suk_key: _apiKey, ...extraParams })
  const url = `${_scriptUrl}${path}?${params}`
  const options = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  try { return await res.json() }
  catch { return { success: false, message: 'Server error. Please try again.' } }
}

export const googleSheetsProvider = {

  configure({ scriptUrl, apiKey }) {
    _scriptUrl = scriptUrl
    _apiKey    = apiKey
  },

  bookings: {
    getAll:         ()           => apiCall('GET',    '/booking/bookings'),
    add:            (data)       => apiCall('POST',   '/booking/bookings', { ...data, suk_key: _apiKey }),
    cancel:         (id)         => apiCall('DELETE', `/booking/bookings/${id}`),
    updateAddress:  (id, place)  => apiCall('PATCH',  `/booking/bookings/${id}/address`, { id, place, suk_key: _apiKey }),
  },

  satsang: {
    getAll: ()     => apiCall('GET',    '/satsang/satsang'),
    add:    (data) => apiCall('POST',   '/satsang/satsang', { ...data, suk_key: _apiKey }),
    cancel: (id)   => apiCall('DELETE', `/satsang/satsang/${id}`),
    updateVenue: (id, venue, mapsLink) => apiCall('PATCH', `/satsang/satsang/${id}/venue`, { id, venue, mapsLink, suk_key: _apiKey }),
  },

  bhadra: {
    getAll: ()     => apiCall('GET',    '/bhadra/bhadra'),
    add:    (data) => apiCall('POST',   '/bhadra/bhadra', { ...data, suk_key: _apiKey }),
    cancel: (id)   => apiCall('DELETE', `/bhadra/bhadra/${id}`),
    updateVenue: (id, venue, mapsLink) => apiCall('PATCH', `/bhadra/bhadra/${id}/venue`, { id, venue, mapsLink, suk_key: _apiKey }),
  },

  matri: {
    getAll: ()     => apiCall('GET',    '/matri/matri'),
    add:    (data) => apiCall('POST',   '/matri/matri', { ...data, suk_key: _apiKey }),
    cancel: (id)   => apiCall('DELETE', `/matri/matri/${id}`),
    updateVenue: (id, venue, mapsLink) => apiCall('PATCH', `/matri/matri/${id}/venue`, { id, venue, mapsLink, suk_key: _apiKey }),
  },

  savan: {
    getAll: ()     => apiCall('GET',    '/savan/savan'),
    add:    (data) => apiCall('POST',   '/savan/savan', { ...data, suk_key: _apiKey }),
    cancel: (id)   => apiCall('DELETE', `/savan/savan/${id}`),
    updateVenue: (id, venue, mapsLink) => apiCall('PATCH', `/savan/savan/${id}/venue`, { id, venue, mapsLink, suk_key: _apiKey }),
  },

  photos: {
    getAll:  ()                                    => apiCall('GET',    '/gallery/photos'),
    upload:  (base64, filename, caption, uploader) => apiCall('POST',   '/gallery/photos', { base64, filename, caption, uploader, suk_key: _apiKey }),
    delete:  (photoId)                             => apiCall('DELETE', `/gallery/photos/${photoId}`),
  },

  location: {
    search:  (q)         => apiCall('GET', '/location/search', null, { q }),
    place:   (placeId)   => apiCall('GET', `/location/place/${placeId}`),
    reverse: (lat, lon)  => apiCall('GET', '/location/reverse', null, { lat, lon }),
  },
}