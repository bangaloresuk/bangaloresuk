// ============================================================
//  API SERVICE — thin adapter over the DB layer
//  ─────────────────────────────────────────────────────────
//  All app code imports from here. This file just re-exports
//  the db layer with the legacy { api, satsangApi, photoApi }
//  shape so App.jsx doesn't need to change.
//
//  If you want to call the db directly you can:
//  import db from '../db/index.js'
//  db.bookings.getAll()
// ============================================================

import db from '../db/index.js'

export const api = {
  getAll: ()              => db.bookings.getAll(),
  post:   (data)          => db.bookings.add(data),
  delete: (id)            => db.bookings.cancel(id),
  cancel: (id)            => db.bookings.cancel(id),
  update: (id, place)     => db.bookings.updateAddress(id, place),
}

export const satsangApi = {
  getAll: ()     => db.satsang.getAll(),
  post:   (data) => db.satsang.add(data),
  delete: (id)   => db.satsang.cancel(id),
  cancel: (id)   => db.satsang.cancel(id),  // ← this was missing, App.jsx calls satsangApi.cancel()
  update: (id, venue, mapsLink) => db.satsang.updateVenue(id, venue, mapsLink),
}

export const bhadraApi = {
  getAll: ()     => db.bhadra.getAll(),
  post:   (data) => db.bhadra.add(data),
  delete: (id)   => db.bhadra.cancel(id),
  cancel: (id)   => db.bhadra.cancel(id),
  update: (id, venue, mapsLink) => db.bhadra.updateVenue(id, venue, mapsLink),
}

export const matriApi = {
  getAll: ()     => db.matri.getAll(),
  post:   (data) => db.matri.add(data),
  delete: (id)   => db.matri.cancel(id),
  cancel: (id)   => db.matri.cancel(id),
  update: (id, venue, mapsLink) => db.matri.updateVenue(id, venue, mapsLink),
}

export const savanApi = {
  getAll: ()     => db.savan.getAll(),
  post:   (data) => db.savan.add(data),
  delete: (id)   => db.savan.cancel(id),
  cancel: (id)   => db.savan.cancel(id),
  update: (id, venue, mapsLink) => db.savan.updateVenue(id, venue, mapsLink),
}

export const photoApi = {
  getAll:  ()                           => db.photos.getAll(),
  upload:  (base64, filename, caption, uploader) => db.photos.upload(base64, filename, caption, uploader),
  delete:  (photoId)                    => db.photos.delete(photoId),
}

export const locationApi = {
  search:  (q)        => db.location.search(q),
  place:   (placeId)  => db.location.place(placeId),
  reverse: (lat, lon) => db.location.reverse(lat, lon),
}