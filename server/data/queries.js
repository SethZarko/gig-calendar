import database from './database.js'

/**
 * Creates a new gig and optionally a new venue if an existing ID isn't provided.
 * @param {Object} payload 
 * @param {string} payload.date - ISO 8601 string
 * @param {number} payload.payment - Integer (cents)
 * @param {number} [payload.venue_id] - Optional: The integer ID of an existing venue
 * @param {Object} [payload.venue] - Optional: Details for a new venue
 */
export function createGig(payload) {
  const { date, payment, venue_id, venue } = payload;
  
  let finalVenueId = venue_id; 
  let finalGigId = null;

  // 1. Begin the Transaction
  database.exec('BEGIN TRANSACTION');

  try {
    // 2. Handle New Venue Creation
    if (!finalVenueId && venue) {
      const insertVenue = database.prepare(`
        INSERT INTO venues (name, street, city, province, postal_code)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const venueInfo = insertVenue.run(
        venue.name,
        venue.street,
        venue.city,
        venue.province,
        venue.postal_code
      );
      
      finalVenueId = venueInfo.lastInsertRowid; 
    }

    if (!finalVenueId) {
      throw new Error("A venue_id or a valid venue object is required.");
    }

    // 3. Create the Gig
    const insertGig = database.prepare(`
      INSERT INTO gigs (venue_id, date, payment)
      VALUES (?, ?, ?)
    `);
    const gigInfo = insertGig.run(finalVenueId, date, payment);
    
    finalGigId = gigInfo.lastInsertRowid;

    // 4. Commit the Transaction
    database.exec('COMMIT');

    return { 
      success: true, 
      gig_id: finalGigId, 
      venue_id: finalVenueId 
    };

  } catch (error) {
    // 5. Rollback on Error
    database.exec('ROLLBACK');
    throw error; 
  }
}

// GET Queries // 

const baseGigQuery = `
  SELECT 
    g.gig_id, g.date, g.payment, g.confirmed,
    v.venue_id, v.name AS venue_name, v.city, v.province
  FROM gigs g
  INNER JOIN venues v ON g.venue_id = v.venue_id
`;

export function getAllGigs() {
  const stmt = database.prepare(`
    ${baseGigQuery}
    ORDER BY g.date ASC
  `);
  return stmt.all();
}

export function getGigById(gigId) {
  const stmt = database.prepare(`
    ${baseGigQuery}
    WHERE g.gig_id = ?
  `);
  return stmt.get(gigId);
}

export function getGigsByYear(year) {
  const stmt = database.prepare(`
    ${baseGigQuery}
    WHERE g.date LIKE ?
    ORDER BY g.date ASC
  `);
  // Matches anything starting with "YYYY-"
  return stmt.all(`${year}-%`); 
}

export function getGigsByMonth(year, month) {
  const stmt = database.prepare(`
    ${baseGigQuery}
    WHERE g.date LIKE ?
    ORDER BY g.date ASC
  `);
  // month is padded with a zero (e.g., "05" instead of "5")
  const paddedMonth = month.toString().padStart(2, '0');
  
  // Matches anything starting with "YYYY-MM-"
  return stmt.all(`${year}-${paddedMonth}-%`); 
}

export function getAllVenues() {
  const stmt = database.prepare(`
    SELECT * FROM venues
    ORDER BY name ASC
  `);
  return stmt.all();
}

export function getVenueById(venueId) {
  const stmt = database.prepare(`
    SELECT * FROM venues
    WHERE venue_id = ?
  `);
  return stmt.get(venueId);
}

// PATCH Queries //

export function updateGig(gigId, payload) {
  const updates = [];
  const values = [];

  // 1. Dynamically check which fields were provided
  if (payload.venue_id !== undefined) {
    updates.push('venue_id = ?');
    values.push(payload.venue_id);
  }
  if (payload.date !== undefined) {
    updates.push('date = ?');
    values.push(payload.date);
  }
  if (payload.payment !== undefined) {
    updates.push('payment = ?');
    values.push(payload.payment);
  }
  if (payload.confirmed !== undefined) {
    // Convert boolean to integer for SQLite if necessary (true = 1, false = 0)
    updates.push('confirmed = ?');
    values.push(payload.confirmed ? 1 : 0);
  }

  if (updates.length === 0) {
    return { success: false, message: "No valid fields provided for update." };
  }

  // 3. Bump the updated_at timestamp
  updates.push('updated_at = (unixepoch())');

  // 4. Construct final SQL string
  const setClause = updates.join(', ');
  
  const stmt = database.prepare(`
    UPDATE gigs 
    SET ${setClause} 
    WHERE gig_id = ?
  `);
  values.push(gigId);

  // 5. Execute the update
  const info = stmt.run(...values);

  return { 
    success: info.changes > 0, 
    changes: info.changes 
  };
}

export function updateVenue(venueId, payload) {
  const updates = [];
  const values = [];

  if (payload.name !== undefined) {
    updates.push('name = ?');
    values.push(payload.name);
  }
  if (payload.street !== undefined) {
    updates.push('street = ?');
    values.push(payload.street);
  }
  if (payload.city !== undefined) {
    updates.push('city = ?');
    values.push(payload.city);
  }
  if (payload.province !== undefined) {
    updates.push('province = ?');
    values.push(payload.province);
  }
  if (payload.postal_code !== undefined) {
    updates.push('postal_code = ?');
    values.push(payload.postal_code);
  }

  if (updates.length === 0) {
    return { success: false, message: "No valid fields provided for update." };
  }

  const setClause = updates.join(', ');
  
  const stmt = database.prepare(`
    UPDATE venues 
    SET ${setClause} 
    WHERE venue_id = ?
  `);

  values.push(venueId);
  const info = stmt.run(...values);

  return { 
    success: info.changes > 0, 
    changes: info.changes 
  };
}

// DELETE Queries //
export function deleteGig(gigId) {
  const stmt = database.prepare(`
    DELETE FROM gigs 
    WHERE gig_id = ?
  `);
  
  const info = stmt.run(gigId);

  return { 
    success: info.changes > 0, 
    changes: info.changes 
  };
}

export function deleteVenue(venueId) {
  try {
    const stmt = database.prepare(`
      DELETE FROM venues 
      WHERE venue_id = ?
    `);
    
    const info = stmt.run(venueId);

    return { 
      success: info.changes > 0, 
      changes: info.changes 
    };

  } catch (error) {
    // Catch the specific SQLite Foreign Key constraint violation
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return { 
        success: false, 
        error: 'CONSTRAINT_VIOLATION',
        message: 'Cannot delete this venue because there are still gigs attached to it.' 
      };
    }
    
    throw error;
  }
}