import type { LoaderFunctionArgs } from "react-router";
import type { IGig } from "../types/IGig";

export interface YearLoaderData {
  gigs: IGig[];
  currentYear: number;
}

interface IFlatGig {
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

export const yearLoader = async ({ params }: LoaderFunctionArgs) => {
  const yearParam = params.year;
  const currentYear = yearParam
    ? parseInt(yearParam, 10)
    : new Date().getFullYear();

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}api/gigs/year/${currentYear}`,
    );

    if (!res.ok) throw new Error("Failed to fetch year gigs");

    const responseData = await res.json();
    const flatGigs = responseData.data || [];

    const gigs: IGig[] = flatGigs.map((g: IFlatGig) => ({
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

    return { gigs, currentYear };
  } catch (error) {
    console.error("Year Loader Error:", error);
    return { gigs: [], currentYear };
  }
};
