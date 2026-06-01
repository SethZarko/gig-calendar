import { useState } from "react";
import { useLoaderData, useNavigate, Link, useRevalidator } from "react-router"; 
import { GigModal } from "../../../components/GigModal/GigModal";
import type { DayLoaderData } from "../../../loaders/dayLoader";
import type { IGig } from "../../../types/IGig";
import styles from "./DayView.module.scss";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DayView = () => {
  const { gigs, currentDate } = useLoaderData() as DayLoaderData;
  const navigate = useNavigate();
  const revalidator = useRevalidator(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<IGig | null>(null);

  const handleOpenAddModal = () => {
    setSelectedGig(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (gig: IGig) => {
    setSelectedGig(gig);
    setIsModalOpen(true);
  };

  // --- Delete Handler ---
  const handleDeleteGig = async (gigId: number | undefined) => {
    if (!gigId) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this gig? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/gigs/${gigId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete gig");

      revalidator.revalidate();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete gig. Please try again.");
    }
  };
  // --------------------------

  const dateObj = new Date(`${currentDate}T12:00:00`);
  const dayOfWeek = WEEKDAYS[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];
  const dayNumber = dateObj.getDate();
  const year = dateObj.getFullYear();

  const handlePrevDay = () => {
    const prev = new Date(`${currentDate}T12:00:00`);
    prev.setDate(prev.getDate() - 1);
    const prevString = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
    navigate(`/calendar/day/${prevString}`);
  };

  const handleNextDay = () => {
    const next = new Date(`${currentDate}T12:00:00`);
    next.setDate(next.getDate() + 1);
    const nextString = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
    navigate(`/calendar/day/${nextString}`);
  };

  return (
    <div className={styles.dayContainer}>
      <header className={styles.dayHeader}>
        <div className={styles.navControls}>
          <button onClick={handlePrevDay} className={styles.navButton}>&larr; Prev Day</button>
          <button onClick={handleNextDay} className={styles.navButton}>Next Day &rarr;</button>
        </div>
        
        <div className={styles.titleStack}>
          <h1>{dayOfWeek}</h1>
          <h2>{monthName} {dayNumber}, {year}</h2>
        </div>

        <Link to={`/calendar/week/${currentDate}`} className={styles.viewToggle}>
          Week View
        </Link>
      </header>

      <div className={styles.contentArea}>
        {gigs.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No gigs scheduled for this day.</p>
            <button onClick={handleOpenAddModal} className={styles.addGigBtn}>
              + Add Gig
            </button>
          </div>
        ) : (
          <div className={styles.gigList}>
            {gigs.map((gig, index) => (
              <div key={index} className={styles.gigDetailCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <h3>{gig.venue.name}</h3>
                    <span className={`${styles.statusBadge} ${gig.confirmed ? styles.confirmed : styles.pending}`}>
                      {gig.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                  
                  {/* Grouped Edit and Delete Buttons */}
                  <div className={styles.actionButtons}>
                    <button onClick={() => handleOpenEditModal(gig)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteGig(gig.gig_id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Address</span>
                    <span className={styles.value}>
                      {gig.venue.street ? `${gig.venue.street}, ` : ""}
                      {gig.venue.city}, {gig.venue.province} {gig.venue.postalCode}
                    </span>
                  </div>

                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Compensation</span>
                    <span className={styles.valuePayment}>${gig.payment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <button onClick={handleOpenAddModal} className={styles.addGigBtn}>
              + Add Another Gig
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <GigModal 
          key={selectedGig ? `edit-${selectedGig.gig_id}` : "add-new"}
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          currentDate={currentDate} 
          existingGig={selectedGig} 
        />
      )}
    </div>
  );
};