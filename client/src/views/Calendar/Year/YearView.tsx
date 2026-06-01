import { useLoaderData, useNavigate, Link } from "react-router";
import type { YearLoaderData } from "../../../loaders/yearLoader";
import type { IGig } from "../../../types/IGig";
import styles from "./YearView.module.scss";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const YearView = () => {
  const { gigs, currentYear } = useLoaderData() as YearLoaderData;
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

  const handleDayClick = (dateString: string) => {
    navigate(`/calendar/day/${dateString}`);
  };

  const handleMonthClick = (monthIndex: number) => {
    const paddedMonth = String(monthIndex + 1).padStart(2, "0");
    navigate(`/calendar/month/${currentYear}/${paddedMonth}`);
  };

  return (
    <div className={styles.yearContainer}>
      <header className={styles.yearHeader}>
        <Link to={`/calendar/year/${currentYear - 1}`} className={styles.navButton}>
          &larr; Prev
        </Link>
        <h1>{currentYear}</h1>
        <Link to={`/calendar/year/${currentYear + 1}`} className={styles.navButton}>
          Next &rarr;
        </Link>
      </header>

      <div className={styles.monthsGrid}>
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
          const firstDayOfWeek = new Date(currentYear, monthIndex, 1).getDay();

          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          const blanks = Array.from({ length: firstDayOfWeek }, () => null);

          return (
            <div key={monthName} className={styles.monthCard}>
              <h2 onClick={() => handleMonthClick(monthIndex)} className={styles.monthTitle}>
                {monthName}
              </h2>

              <div className={styles.weekdays}>
                {DAY_NAMES.map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} className={styles.emptySlot} />
                ))}

                {days.map((day) => {
                  const paddedMonth = String(monthIndex + 1).padStart(2, "0");
                  const paddedDay = String(day).padStart(2, "0");
                  const dateString = `${currentYear}-${paddedMonth}-${paddedDay}`;

                  // Retrieve the array of gigs for this day (if any)
                  const dayGigs = gigMap.get(dateString);
                  const hasGig = !!dayGigs && dayGigs.length > 0;
                  const isToday = dateString === todayDateString;

                  return (
                    <button
                      key={dateString}
                      className={`
                        ${styles.dayButton} 
                        ${hasGig ? styles.hasGig : ""} 
                        ${isToday ? styles.today : ""}
                      `}
                      onClick={() => handleDayClick(dateString)}
                      disabled={!hasGig && !isToday}
                    >
                      {day}
                      
                      {/* The Custom Hover Tooltip */}
                      {hasGig && (
                        <div className={styles.tooltip}>
                          {dayGigs.map(g => g.venue.name || "Unknown").join(" & ")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
