CREATE TABLE IF NOT EXISTS partner_trackers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_key TEXT NOT NULL UNIQUE,
  partner_name TEXT NOT NULL,
  tracker_url TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partner_trackers_active_key
  ON partner_trackers (partner_key, is_active);

INSERT INTO partner_trackers (partner_key, partner_name, tracker_url)
VALUES (
  'able-nh',
  'ABLE NH',
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOHvkmwHZUpL8iVRl1Oeq_NUiCF_vgus74V0gGGf3DScKu1t4XUhzbvp2bvNy4yqz3KOuZ8BLZtNMR/pub?output=csv'
)
ON CONFLICT(partner_key) DO UPDATE SET
  partner_name = excluded.partner_name,
  tracker_url = excluded.tracker_url,
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;
