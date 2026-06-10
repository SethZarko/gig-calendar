import { Router } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";

import * as venueQueries from "../data/queries.js";

const router = Router();

// GET /api/venues - Get all venues
router.get(
  "/",
  asyncWrapper(async (req, res) => {
    const rows = await venueQueries.getAllVenues();

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });

    const cleanData = rows.map((row) => ({ ...row }));

    return res.status(200).json({
      success: true,
      message: "All Venues Returned",
      data: cleanData,
      meta: {
        total: cleanData.length,
      },
    });
  }),
);

// GET /api/venues/:id - Get a specific venue
router.get(
  "/:id",
  asyncWrapper(async (req, res) => {
    const venue = venueQueries.getVenueById(req.params.id);

    if (!venue) {
      return res.status(404).json({ error: "Venue not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Venue Returned",
      data: venue,
    });
  }),
);

// TODO: Routes not in use - implement full Venue CRUD later
// PATCH /api/venues/:id - Update a venue
router.patch("/:id", (req, res) => {
  try {
    const result = venueQueries.updateVenue(req.params.id, req.body);

    if (!result.success) {
      if (result.message)
        return res.status(400).json({ error: result.message });
      return res.status(404).json({ error: "Venue not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Venue updated successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update venue.",
      error: error.message,
    });
  }
});

// DELETE /api/venues/:id - Delete a venue
router.delete("/:id", (req, res) => {
  try {
    const result = venueQueries.deleteVenue(req.params.id);

    if (!result.success) {
      // Handle the Foreign Key constraint protection!
      if (result.error === "CONSTRAINT_VIOLATION") {
        return res.status(409).json({ error: result.message }); // 409 Conflict
      }
      return res.status(404).json({ error: "Venue not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Venue deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete venue.",
      error: error.message,
    });
  }
});

export default router;
