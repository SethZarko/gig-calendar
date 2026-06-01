import type { Venue } from '../types/IVenue';

export const venuesLoader = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}api/venues`);
  
  if (!res.ok) throw new Error("Failed to load venues");
  
  const responseData = await res.json();
  const allVenues: Venue[] = responseData.data || [];

  return { allVenues };
};