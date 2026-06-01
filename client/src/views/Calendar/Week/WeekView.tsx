import { useLoaderData, useNavigate, Link } from "react-router";
import type { WeekLoaderData } from "../../../loaders/weekLoader";
import type { IGig } from "../../../types/IGig";
import styles from "./WeekView.module.scss";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const WeekView = () => {
  const { gigs, weekDates } = useLoaderData() as WeekLoaderData;
  const navigate = useNavigate();

  const gigMap = new Map<string, IGig[]>();
  gigs.forEach((gig) => {
    const dateString = gig.date.split("T")[0];
    if (!gigMap.has(dateString)) {
      gigMap.set(dateString, []);
    }
    gigMap.get(dateString)!.push(gig);
  });

  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Use the first day of the week to calculate the header title
  const firstDayObj = new Date(`${weekDates[0]}T12:00:00`);
  const headerMonth = MONTH_NAMES[firstDayObj.getMonth()];
  const headerYear = firstDayObj.getFullYear();

  const handlePrevWeek = () => {
    const prev = new Date(`${weekDates[0]}T12:00:00`);
    prev.setDate(prev.getDate() - 7);
    const prevString = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
    navigate(`/calendar/week/${prevString}`);
  };

  const handleNextWeek = () => {
    const next = new Date(`${weekDates[0]}T12:00:00`);
    next.setDate(next.getDate() + 7);
    const nextString = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
    navigate(`/calendar/week/${nextString}`);
  };

  const handleDayClick = (dateString: string) => {
    navigate(`/calendar/day/${dateString}`);
  };

  return (
    <div className={styles.weekContainer}>
      <header className={styles.weekHeader}>
        <div className={styles.navControls}>
          <button onClick={handlePrevWeek} className={styles.navButton}>&larr; Prev Week</button>
          <button onClick={handleNextWeek} className={styles.navButton}>Next Week &rarr;</button>
        </div>
        <h1>Week of {headerMonth} {firstDayObj.getDate()}, {headerYear}</h1>
        <Link to={`/calendar/month/${headerYear}/${String(firstDayObj.getMonth() + 1).padStart(2, "0")}`} className={styles.viewToggle}>
          Month View
        </Link>
      </header>

      <div className={styles.weekGrid}>
        {weekDates.map((dateString, index) => {
          const dayGigs = gigMap.get(dateString);
          const hasGig = !!dayGigs && dayGigs.length > 0;
          const isToday = dateString === todayDateString;
          
          // Parse out just the day number for the header
          const dayNumber = parseInt(dateString.split("-")[2], 10);

          return (
            <div 
              key={dateString} 
              className={`
                ${styles.dayColumn} 
                ${isToday ? styles.today : ""}
                ${hasGig ? styles.hasGig : ""}
              `}
              onClick={() => handleDayClick(dateString)}
            >
              <div className={styles.columnHeader}>
                <span className={styles.weekdayName}>{WEEKDAYS[index]}</span>
                <span className={styles.dayNumber}>{dayNumber}</span>
              </div>

              <div className={styles.gigList}>
                {hasGig && dayGigs.map((g, i) => (
                  <div key={i} className={styles.gigCard}>
                    <span className={styles.venueName}>{g.venue.name}</span>
                    <span className={styles.statusIndicator}>
                      {g.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Glass Tooltip Overlay */}
              {hasGig && (
                <div className={styles.tooltip}>
                  {dayGigs.map(g => `${g.venue.name} - $${g.payment}`).join(" & ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};