// ============================================================
//  core/api.js
//  All calls go through the Cloudflare Worker.
//  Token is fetched once on SUK select, refreshed automatically.
//  Matched to worker routes:
//    POST /api/token
//    GET  /api/{suk}/calendar
//    POST /api/{suk}/book
//    POST /api/{suk}/retrieve
//    POST /api/{suk}/cancel
//    GET  /api/{suk}/photos
//    POST /api/{suk}/photo-upload
//    POST /api/{suk}/address
// ============================================================

"use strict";

// ── Token store (memory only) ────────────────────────────────
let _token    = null;
let _tokenExp = 0;
let _tokenSuk = null;

window.refreshToken = async function(sukKey, workerUrl) {
  const r = await fetch(`${workerUrl}/api/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sukKey }),
  });
  const data = await r.json();
  if (!data.success) throw new Error(data.error || "Auth failed");
  _token    = data.token;
  _tokenExp = data.expiresAt;
  _tokenSuk = sukKey;
  return data.token;
};

async function ensureToken(sukKey, workerUrl) {
  // Refresh if missing, wrong suk, or expiring within 60 seconds
  if (!_token || _tokenSuk !== sukKey || Date.now() > _tokenExp - 60_000) {
    await window.refreshToken(sukKey, workerUrl);
  }
}

// ── API factory — called once when a SUK is selected ─────────
window.buildApi = function(sukKey, workerUrl) {
  const base = `${workerUrl}/api/${sukKey}`;

  async function get(action, params = {}) {
    await ensureToken(sukKey, workerUrl);
    const url = new URL(`${base}/${action}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const r = await fetch(url.toString(), { headers: { "X-SUK-Token": _token } });
    if (r.status === 401) { _token = null; return get(action, params); } // auto-retry once
    return r.json();
  }

  async function post(action, body = {}) {
    await ensureToken(sukKey, workerUrl);
    const r = await fetch(`${base}/${action}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "X-SUK-Token": _token },
      body:    JSON.stringify(body),
    });
    if (r.status === 401) { _token = null; return post(action, body); } // auto-retry once
    return r.json();
  }

  return {
    prayer: {
      // Worker returns: { date, slot, isBooked, initial }
      getCalendar: (month, type)        => get("calendar", { month, type }),
      book:        (body)               => post("book", body),
      retrieve:    (mobile)             => post("retrieve", { mobile }),
      cancel:      (id, mobile, date)   => post("cancel", { id, mobile, date }),
      // Address update has its own dedicated route in this worker
      updateAddress: (id, place)        => post("address", { id, place }),
    },
    satsang: {
      book:   (body)             => post("book", { ...body, sheetName: "Satsang" }),
      cancel: (id, mobile, date) => post("cancel", { id, mobile, date, sheetName: "Satsang" }),
    },
    photos: {
      getAll: ()                                    => get("photos"),
      upload: (base64, filename, caption, uploader) =>
        post("photo-upload", { base64, filename, caption, uploader }),
    },
  };
};

// ── Guard used by satsang.js (legacy) ────────────────────────
window.isConfigured = () =>
  !!(window.ACTIVE_SUK && window.ACTIVE_SUK.configured && window.SCRIPT_URL);
