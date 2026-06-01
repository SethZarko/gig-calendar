import type { LoaderFunctionArgs } from "react-router";
import type { IGig } from "../types/IGig";

export interface WeekLoaderData {
  gigs: IGig[];
  baseDate: string;
  weekDates: string[]; // Pre-calculated array of 'YYYY-MM-DD' for the UI
}

interface DatabaseGigRow {
  gig_id: number;
  date: string;
  payment: number;
  confirmed: boolean | number;
  venue_id: number;
  venue_name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export const weekLoader = async ({ params }: LoaderFunctionArgs) => {
  // Fallback to today if no date is provided in the URL
  const dateParam = params.date || params.dateString || new Date().toISOString().split("T")[0];

  const base = new Date(`${dateParam}T12:00:00`); 
  
  // Calculate the Sunday that starts this week
  const dayOfWeek = base.getDay();
  const startOfWeek = new Date(base);
  startOfWeek.setDate(base.getDate() - dayOfWeek);

  // Generate the 7 string dates for this specific week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}api/gigs/week/${weekDates[0]}`
    );

    if (!res.ok) throw new Error("Failed to fetch weekly gigs");

    const responseData = await res.json();
    const flatGigs: DatabaseGigRow[] = responseData.data || [];

    const gigs: IGig[] = flatGigs.map((g: DatabaseGigRow) => ({
      gig_id: g.gig_id,
      date: g.date,
      payment: g.payment,
      confirmed: !!g.confirmed,
      venue: {
        venue_id: g.venue_id,
        name: g.venue_name,
        city: g.city,
        province: g.province,
        postalCode: g.postalCode || "",
        street: g.street || ""
      }
    }));

    return { gigs, baseDate: dateParam, weekDates };
  } catch (error) {
    console.error("Week Loader Error:", error);
    return { gigs: [], baseDate: dateParam, weekDates };
  }
};