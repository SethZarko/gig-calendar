import { useLoaderData, useNavigate, Link } from "react-router";
import type { DayLoaderData } from "../../../loaders/dayLoader";
import styles from "./DayView.module.scss";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DayView = () => {
  const { gigs, currentDate } = useLoaderData() as DayLoaderData;
  const navigate = useNavigate();

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
          </div>
        ) : (
          <div className={styles.gigList}>
            {gigs.map((gig, index) => (
              <div key={index} className={styles.gigDetailCard}>
                <div className={styles.cardHeader}>
                  <h3>{gig.venue.name}</h3>
                  <span className={`${styles.statusBadge} ${gig.confirmed ? styles.confirmed : styles.pending}`}>
                    {gig.confirmed ? "Confirmed" : "Pending"}
                  </span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Location</span>
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
          </div>
        )}
      </div>
    </div>
  );
};