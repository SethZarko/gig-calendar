import database from './database.js'

/**
 * Creates a new gig and optionally a new venue if an existing ID isn't provided.
 */
export async function createGig(payload) {
  const { date, payment, confirmed, venue_id, venue } = payload;
  
  let finalVenueId = venue_id; 
  let finalGigId = null;

  const tx = await database.transaction("write");

  try {
    if (!finalVenueId && venue) {
      const venueInfo = await tx.execute({
        sql: `INSERT INTO venues (name, street, city, province, postal_code)
              VALUES (?, ?, ?, ?, ?)`,
        args: [venue.name, venue.street, venue.city, venue.province, venue.postal_code]
      });
      
      finalVenueId = Number(venueInfo.lastInsertRowid); 
    }

    if (!finalVenueId) {
      throw new Error("A venue_id or a valid venue object is required.");
    }

    const gigInfo = await tx.execute({
      sql: `INSERT INTO gigs (venue_id, date, payment, confirmed)
            VALUES (?, ?, ?, ?)`,
      args: [finalVenueId, date, payment, confirmed ? 1 : 0]
    });
    
    finalGigId = Number(gigInfo.lastInsertRowid);

    await tx.commit();

    return { 
      success: true, 
      gig_id: finalGigId, 
      venue_id: finalVenueId 
    };

  } catch (error) {
    await tx.rollback();
    throw error; 
  }
}

// GET Queries // 
const baseGigQuery = `
  SELECT 
    g.gig_id, g.date, g.payment, g.confirmed,
    v.venue_id, v.name AS venue_name, v.street, v.city, v.province, v.postal_code
  FROM gigs g
  INNER JOIN venues v ON g.venue_id = v.venue_id
`;

export async function getAllGigs() {
  const res = await database.execute(`${baseGigQuery} ORDER BY g.date ASC`);
  return res.rows;
}

export async function getGigById(gigId) {
  const res = await database.execute({
    sql: `${baseGigQuery} WHERE g.gig_id = ?`,
    args: [gigId]
  });
  return res.rows[0] || null;
}

export async function getGigsByYear(year) {
  const res = await database.execute({
    sql: `${baseGigQuery} WHERE g.date LIKE ? ORDER BY g.date ASC`,
    args: [`${year}-%`]
  });
  return res.rows;
}

export async function getGigsByMonth(year, month) {
  const paddedMonth = month.toString().padStart(2, '0');
  const res = await database.execute({
    sql: `${baseGigQuery} WHERE g.date LIKE ? ORDER BY g.date ASC`,
    args: [`${year}-${paddedMonth}-%`]
  });
  return res.rows;
}

export async function getGigsByWeek(startDate, endDate) {
  const res = await database.execute({
    sql: `${baseGigQuery} WHERE g.date >= ? AND g.date < ? ORDER BY g.date ASC`,
    args: [startDate, endDate]
  });
  return res.rows;
}

export async function getGigsByDay(dateString) {
  const res = await database.execute({
    sql: `${baseGigQuery} WHERE g.date LIKE ? ORDER BY g.date ASC`,
    args: [`${dateString}%`]
  });
  return res.rows;
}

export async function getAllVenues() {
  const res = await database.execute(`SELECT * FROM venues ORDER BY name ASC`);
  return res.rows;
}

export async function getVenueById(venueId) {
  const res = await database.execute({
    sql: `SELECT * FROM venues WHERE venue_id = ?`,
    args: [venueId]
  });
  return res.rows[0] || null;
}

// PATCH Queries //

export async function updateGig(gigId, payload) {
  const updates = [];
  const values = [];

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
    updates.push('confirmed = ?');
    values.push(payload.confirmed ? 1 : 0);
  }

  if (updates.length === 0) {
    return { success: false, message: "No valid fields provided for update." };
  }

  updates.push('updated_at = (unixepoch())');
  const setClause = updates.join(', ');
  values.push(gigId);

  const info = await database.execute({
    sql: `UPDATE gigs SET ${setClause} WHERE gig_id = ?`,
    args: values
  });

  return { 
    success: info.rowsAffected > 0, 
    changes: Number(info.rowsAffected)
  };
}

export async function updateVenue(venueId, payload) {
  const updates = [];
  const values = [];

  if (payload.name !== undefined) { updates.push('name = ?'); values.push(payload.name); }
  if (payload.street !== undefined) { updates.push('street = ?'); values.push(payload.street); }
  if (payload.city !== undefined) { updates.push('city = ?'); values.push(payload.city); }
  if (payload.province !== undefined) { updates.push('province = ?'); values.push(payload.province); }
  if (payload.postal_code !== undefined) { updates.push('postal_code = ?'); values.push(payload.postal_code); }

  if (updates.length === 0) {
    return { success: false, message: "No valid fields provided for update." };
  }

  const setClause = updates.join(', ');
  values.push(venueId);

  const info = await database.execute({
    sql: `UPDATE venues SET ${setClause} WHERE venue_id = ?`,
    args: values
  });

  return { 
    success: info.rowsAffected > 0, 
    changes: Number(info.rowsAffected)
  };
}

// DELETE Queries //
export async function deleteGig(gigId) {
  const info = await database.execute({
    sql: `DELETE FROM gigs WHERE gig_id = ?`,
    args: [gigId]
  });

  return { 
    success: info.rowsAffected > 0, 
    changes: Number(info.rowsAffected)
  };
}

export async function deleteVenue(venueId) {
  try {
    const info = await database.execute({
      sql: `DELETE FROM venues WHERE venue_id = ?`,
      args: [venueId]
    });

    return { 
      success: info.rowsAffected > 0, 
      changes: Number(info.rowsAffected)
    };

  } catch (error) {
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