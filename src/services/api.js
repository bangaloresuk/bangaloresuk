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
  update: (id, place)     => db.bookings.updateAddress(id, place),
}

export const satsangApi = {
  getAll: ()     => db.satsang.getAll(),
  post:   (data) => db.satsang.add(data),
  delete: (id)   => db.satsang.cancel(id),
}

export const photoApi = {
  getAll:  ()                           => db.photos.getAll(),
  upload:  (file, caption, uploader)    => db.photos.upload(file, caption, uploader),
}
