import { useMemo } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Pagination } from "../../components/Pagination/Pagination";
import type { Venue } from "../../types/IVenue";
import styles from './VenueList.module.scss';

export const VenueList = () => {
  const { allVenues } = useLoaderData() as { allVenues: Venue[] };
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 5; // Handled here now!

  const filteredVenues = useMemo(() => {
    return allVenues.filter((v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVenues, searchTerm]);

  // Pagination Math
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVenues = filteredVenues.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextParams = new URLSearchParams(searchParams);
    
    if (e.target.value) {
      nextParams.set("search", e.target.value);
    } else {
      nextParams.delete("search");
    }
    
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  return (
    <div className={styles.container}>
      <h1>Venues</h1>

      <input
        type="text"
        placeholder="Search all venues..."
        value={searchTerm}
        onChange={handleSearchChange}
        className={styles.searchInput}
      />

      {paginatedVenues.length === 0 ? (
        <p>No venues match your search.</p>
      ) : (
        <ul>
          {paginatedVenues.map((venue: Venue) => (
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