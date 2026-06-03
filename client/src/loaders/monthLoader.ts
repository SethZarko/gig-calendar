import type { LoaderFunctionArgs } from "react-router";
import type { IGig } from "../types/IGig";

export interface MonthLoaderData {
  gigs: IGig[];
  year: number;
  month: number; // 1-indexed (1 = January, 12 = December)
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

export const monthLoader = async ({ params }: LoaderFunctionArgs) => {
  const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
  const month = params.month ? parseInt(params.month, 10) : new Date().getMonth() + 1;

  try {
    const paddedMonth = String(month).padStart(2, "0");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}api/gigs/month/${year}/${paddedMonth}`
    );

    if (!res.ok) throw new Error("Failed to fetch monthly gigs");

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
        street: g.street || "",
      },
    }));

    return { gigs, year, month };
  } catch (error) {
    console.error("Month Loader Error:", error);
    return { gigs: [], year, month };
  }
};