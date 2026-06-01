import { useLoaderData } from "react-router";
import { Pagination } from "../../components/Pagination/Pagination";

import type { Venue } from "../../types/IVenue";

import styles from './VenueList.module.scss'

interface VenueLoaderData {
  venues: Venue[];
  currentPage: number;
  totalPages: number;
}

export const VenueList = () => {
  const data = useLoaderData() as VenueLoaderData

  if (!data) {
    return <div className={styles.error}>No Venues Found</div>;
  }

  const { venues, currentPage, totalPages } = data;

  return (
    <div className={styles.container}>
      <h1>Venues</h1>

      {venues.length === 0 ? (
        <p>No venues found.</p>
      ) : (
        <ul>
          {venues.map((venue: Venue) => (
            <li key={venue.venue_id}>
              <strong>{venue.name}</strong> {venue.street} - {venue.city}, {venue.province}
            </li>
          ))}
        </ul>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};
