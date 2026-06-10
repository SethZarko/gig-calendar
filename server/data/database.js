import 'dotenv/config'
import { createClient } from '@libsql/client';
import { gigModel } from './models/gig.js'
import { venueModel } from './models/venue.js'

const database = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDatabase() {
  try {
    await database.execute(venueModel);
    await database.execute(gigModel);
    
    await database.execute(`
      CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date);
    `);
    
    console.log('Turso Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Turso database:', error);
  }
}

export default database;