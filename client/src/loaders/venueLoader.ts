import type { LoaderFunctionArgs } from 'react-router';
import type { Venue } from '../types/IVenue';

export const venuesLoader = async ({ request }: LoaderFunctionArgs) => {
  // Grab the current URL and extract the page number
  const url = new URL(request.url);
  const pageParam = url.searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = 5;

  // Fetch all venues
  const res = await fetch(`${import.meta.env.VITE_API_URL}api/venues`);
  
  if (!res.ok) throw new Error("Failed to load venues");
  
  const responseData = await res.json();
  const allVenues: Venue[] = responseData.data;

  // Pagination math 
  const totalPages = Math.ceil(allVenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVenues = allVenues.slice(startIndex, endIndex);

  return {
    venues: paginatedVenues,
    currentPage,
    totalPages
  };
};