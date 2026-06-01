import type { LoaderFunctionArgs } from "react-router";
import type { IGig } from "../types/IGig";

export interface DayLoaderData {
  gigs: IGig[];
  currentDate: string; // 'YYYY-MM-DD'
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

export const dayLoader = async ({ params }: LoaderFunctionArgs) => {
  const dateParam = params.date || params.dateString || new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}api/gigs/day/${dateParam}`
    );

    if (!res.ok) throw new Error("Failed to fetch daily gigs");

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
        street: g.street || "",
        city: g.city,
        province: g.province,
        postalCode: g.postalCode || "",
      }
    }));

    return { gigs, currentDate: dateParam };
  } catch (error) {
    console.error("Day Loader Error:", error);
    return { gigs: [], currentDate: dateParam };
  }
};