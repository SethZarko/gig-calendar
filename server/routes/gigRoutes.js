import { Router } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";

import * as gigQueries from "../data/queries.js";

const router = Router();

// POST /api/gigs - Create a gig (and optionally a venue)
router.post(
  "/",
  asyncWrapper(async (req, res) => {
    const result = await gigQueries.createGig(req.body);

    return res.status(201).json({
      success: true,
      message: "Gig Created Successfully!",
      data: result,
    });
  }),
);

// GET /api/gigs - Get all gigs
router.get(
  "/",
  asyncWrapper(async (req, res) => {
    const rows = await gigQueries.getAllGigs();
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });

    const cleanData = rows.map((row) => ({ ...row }));

    return res.status(200).json({
      success: true,
      message: "All Gigs Returned",
      data: cleanData,
      meta: {
        total: cleanData.length,
      },
    });
  }),
);

// GET /api/gigs/:id - Get a specific gig
router.get(
  "/:id",
  asyncWrapper(async (req, res) => {
    const gig = await gigQueries.getGigById(Number(req.params.id));
    if (!gig)
      return res.status(404).json({ success: true, message: "Gig not found." });

    return res.status(200).json({
      success: true,
      message: "Gig Returned",
      data: gig,
    });
  }),
);

// GET /api/gigs/year/:year - Get gigs by year (e.g., /api/gigs/year/2026)
router.get(
  "/year/:year",
  asyncWrapper(async (req, res) => {
    const rows = await gigQueries.getGigsByYear(req.params.year);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });

    const cleanData = rows.map((row) => ({ ...row }));

    return res.status(200).json({
      success: true,
      message: "Gigs Returned By Year",
      data: cleanData,
    });
  }),
);

// GET /api/gigs/month/:year/:month - Get gigs by month (e.g., /api/gigs/month/2026/05)
router.get(
  "/month/:year/:month",
  asyncWrapper(async (req, res) => {
    const { year, month } = req.params;

    const rows = await gigQueries.getGigsByMonth(year, month);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });
    }

    const cleanData = rows.map((row) => ({ ...row }));

    return res.json({
      success: true,
      message: "Gigs Returned By Month",
      data: cleanData,
    });
  }),
);

// GET /api/gigs/week/:date - Get gigs by week (e.g., /api/gigs/week/2026-05-24)
router.get(
  "/week/:date",
  asyncWrapper(async (req, res) => {
    const startDateString = req.params.date;

    // Calculate the start and end dates natively
    const startDate = new Date(startDateString);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Convert to ISO strings to perfectly match the SQLite range query
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const rows = await gigQueries.getGigsByWeek(startIso, endIso);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });

    const cleanData = rows.map((row) => ({ ...row }));

    return res.status(200).json({
      success: true,
      message: "Gigs Returned By Week",
      data: cleanData,
    });
  }),
);

// GET /api/gigs/day/:date - Get gigs by day (e.g., /api/gigs/day/2026-05-24)
router.get(
  "/day/:date",
  asyncWrapper(async (req, res) => {
    const rows = await gigQueries.getGigsByDay(req.params.date);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: true, message: "No Gigs in The Database" });

    const cleanData = rows.map((row) => ({ ...row }));

    return res.status(200).json({
      success: true,
      message: "Gigs Returned By Day",
      data: cleanData,
    });
  }),
);

// PATCH /api/gigs/:id - Update a gig
router.patch(
  "/:id",
  asyncWrapper(async (req, res) => {
    const result = await gigQueries.updateGig(req.params.id, req.body);

    if (!result.success) {
      if (result.message)
        return res.status(400).json({ error: result.message });
      return res.status(404).json({ error: "Gig not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Gig updated successfully.",
      data: result,
    });
  }),
);

// DELETE /api/gigs/:id - Delete a gig
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const result = await gigQueries.deleteGig(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: "Gig not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Gig deleted successfully." });
  }),
);

export default router;
