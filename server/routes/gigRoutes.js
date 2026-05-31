import { Router } from 'express';
import * as gigQueries from '../data/queries.js';

const router = Router();

// POST /api/gigs - Create a gig (and optionally a venue)
router.post('/', (req, res) => {
  try {
    const result = gigQueries.createGig(req.body);

    res.status(201).json({
        success: true,
        message: "Gig Created Successfully!",
        data: result
    }); 
  } catch (error) {
    if (error.message.includes("venue")) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to create gig.", error: error.message });
  }
});

// GET /api/gigs - Get all gigs
router.get('/', (req, res) => {
  try {
    const gigs = gigQueries.getAllGigs();

    res.status(200).json({
        success: true,
        message: "All Gigs Returned",
        data: gigs,
        meta: {
            total: gigs.length
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch gigs.", error: error.message });
  }
});

// GET /api/gigs/:id - Get a specific gig
router.get('/:id', (req, res) => {
  try {
    const gig = gigQueries.getGigById(Number(req.params.id));

    if (!gig) {
      return res.status(404).json({ success: true, message: "Gig not found." });
    }

    res.status(200).json({
        success: true,
        message: "Gig Returned",
        data: gig
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch gig.", error: error.message });
  }
});

// GET /api/gigs/year/:year - Get gigs by year (e.g., /api/gigs/year/2026)
router.get('/year/:year', (req, res) => {
  try {
    const gigs = gigQueries.getGigsByYear(req.params.year);

    res.status(200).json({
        success: true,
        message: "Gigs Returned By Year",
        data: gigs
    });
  } catch (error) {
     res.status(500).json({ success: false, message: "Failed to fetch gigs by year.", error: error.message });
  }
});

// GET /api/gigs/month/:year/:month - Get gigs by month (e.g., /api/gigs/month/2026/05)
router.get('/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const gigs = gigQueries.getGigsByMonth(year, month);

    res.status(200).json({
        success: true,
        message: "Gigs Returned By Month",
        data: gigs
    });
  } catch (error) {
     res.status(500).json({ success: false, message: "Failed to fetch gigs by month.", error: error.message });
  }
});

// PATCH /api/gigs/:id - Update a gig
router.patch('/:id', (req, res) => {
  try {
    const result = gigQueries.updateGig(req.params.id, req.body);
    
    if (!result.success) {
      if (result.message) return res.status(400).json({ error: result.message }); // No fields provided
      return res.status(404).json({ error: "Gig not found." }); // ID not found
    }
    
    res.status(200).json({ success: true, message: "Gig updated successfully.", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update gig.", error: error.message });
  }
});

// DELETE /api/gigs/:id - Delete a gig
router.delete('/:id', (req, res) => {
  try {
    const result = gigQueries.deleteGig(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: "Gig not found." });
    }
    res.status(200).json({ success: true, message: "Gig deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete gig.", error: error.message });
  }
});

export default router;