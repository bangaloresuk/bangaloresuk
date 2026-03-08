// ============================================================
//  adminConfig — Admin Access Configuration
//  ─────────────────────────────────────────────────────────
//  Step 1: Set your Gmail address below
//  Step 2: Paste your GAS Script URL (same one used for bookings)
//  Step 3: The OTP will be emailed to your Gmail via GAS
// ============================================================

// ============================================================
//  adminConfig — Admin Access Configuration
//  ─────────────────────────────────────────────────────────
//  NO secrets here — API key and GAS URL live inside the
//  Cloudflare Worker (never exposed to the browser).
// ============================================================

export const ADMIN_CONFIG = {
  // Only the admin email is needed here — it's not a secret,
  // it's just used to gate the sign-in UI on the frontend.
  adminEmail: 'bangaloresuk@gmail.com',
}