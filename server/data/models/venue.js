export const venueModel = `
CREATE TABLE IF NOT EXISTS venues (
  venue_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL
);
`;