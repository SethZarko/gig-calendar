import { Router } from 'express';
import * as venueQueries from '../data/queries.js';

const router = Router();

// GET /api/venues - Get all venues
router.get('/', (req, res) => {
  try {
    const venues = venueQueries.getAllVenues();

    res.status(200).json({
        success: true,
        message: "All Venues Returned",
        data: venues,
        meta: {
            total: venues.length
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch venues.", error: error.message });
  }
});

// GET /api/venues/:id - Get a specific venue
router.get('/:id', (req, res) => {
  try {
    const venue = venueQueries.getVenueById(req.params.id);

    if (!venue) {
      return res.status(404).json({ error: "Venue not found." });
    }

    res.status(200).json({
        success: true,
        message: "Venue Returned",
        data: venue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch venue.", error: error.message });
  }
});

// PATCH /api/venues/:id - Update a venue
router.patch('/:id', (req, res) => {
  try {
    const result = venueQueries.updateVenue(req.params.id, req.body);
    
    if (!result.success) {
      if (result.message) return res.status(400).json({ error: result.message });
      return res.status(404).json({ error: "Venue not found." });
    }
    
    res.status(200).json({ success: true, message: "Venue updated successfully.", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update venue.", error: error.message });
  }
});

// DELETE /api/venues/:id - Delete a venue
router.delete('/:id', (req, res) => {
  try {
    const result = venueQueries.deleteVenue(req.params.id);
    
    if (!result.success) {
      // Handle the Foreign Key constraint protection!
      if (result.error === 'CONSTRAINT_VIOLATION') {
        return res.status(409).json({ error: result.message }); // 409 Conflict
      }
      return res.status(404).json({ error: "Venue not found." });
    }
    
    res.status(200).json({ success: true, message: "Venue deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete venue.", error: error.message });
  }
});

export default router;