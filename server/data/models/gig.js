export const gigModel = `
CREATE TABLE IF NOT EXISTS gigs (
  gig_id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  payment INTEGER NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE RESTRICT
);
`;