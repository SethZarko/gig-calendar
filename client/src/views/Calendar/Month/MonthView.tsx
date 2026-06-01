import { useLoaderData, useNavigate, Link } from "react-router";
import type { MonthLoaderData } from "../../../loaders/monthLoader";
import type { IGig } from "../../../types/IGig";

import styles from "./MonthView.module.scss";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MonthView = () => {
  const { gigs, year, month } = useLoaderData() as MonthLoaderData;
  const navigate = useNavigate();

  // Hash-map configuration for data access layers
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

  // Native Math Layout Elements
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const totalDaysCurrent = new Date(year, month, 0).getDate();
  const totalDaysPrevious = new Date(year, month - 1, 0).getDate();

  // Calculations
  const handlePrevMonth = () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    navigate(
      `/calendar/month/${prevYear}/${String(prevMonth).padStart(2, "0")}`,
    );
  };

  const handleNextMonth = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    navigate(
      `/calendar/month/${nextYear}/${String(nextMonth).padStart(2, "0")}`,
    );
  };

  const handleDayClick = (dateString: string) => {
    navigate(`/calendar/week/${dateString}`);
  };

  // Grid Builder Arrays
  const currentMonthDays = Array.from(
    { length: totalDaysCurrent },
    (_, i) => i + 1,
  );
  const leadingBlanks = Array.from(
    { length: firstDayIndex },
    (_, i) => totalDaysPrevious - firstDayIndex + i + 1,
  );

  // (6 rows * 7 columns = 42 slots total)
  const totalGridSlots = 42;
  const trailingBlanksCount =
    totalGridSlots - (leadingBlanks.length + currentMonthDays.length);
  const trailingBlanks = Array.from(
    { length: trailingBlanksCount },
    (_, i) => i + 1,
  );

  return (
    <div className={styles.monthContainer}>
      <header className={styles.monthHeader}>
        <div className={styles.navControls}>
          <button onClick={handlePrevMonth} className={styles.navButton}>
            &larr; Prev
          </button>
          <button onClick={handleNextMonth} className={styles.navButton}>
            Next &rarr;
          </button>
        </div>
        <h1>
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <Link to={`/calendar/year/${year}`} className={styles.viewToggle}>
          Yearly View
        </Link>
      </header>

      <div className={styles.calendarGrid}>
        {/* Header Columns */}
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekdayHeader}>
            <span className={styles.fullDay}>{day}</span>
            <span className={styles.shortDay}>{day.slice(0, 3)}</span>
          </div>
        ))}

        {/* Leading Days (Previous Month Context) */}
        {leadingBlanks.map((day) => {
          const prevMonthRaw = month === 1 ? 12 : month - 1;
          const prevYearRaw = month === 1 ? year - 1 : year;
          const dateString = `${prevYearRaw}-${String(prevMonthRaw).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return (
            <div
              key={`lead-${day}`}
              className={`${styles.gridCell} ${styles.adjacentMonthCell}`}
              onClick={() => handleDayClick(dateString)}
            >
              <span className={styles.dayLabel}>{day}</span>
            </div>
          );
        })}

        {/* Active Core Days (Current Selection Month) */}
        {currentMonthDays.map((day) => {
          const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayGigs = gigMap.get(dateString);
          const hasGig = !!dayGigs && dayGigs.length > 0;
          const isToday = dateString === todayDateString;

          return (
            <div
              key={`curr-${day}`}
              className={`
                ${styles.gridCell} 
                ${hasGig ? styles.hasGig : ""} 
                ${isToday ? styles.today : ""}
              `}
              onClick={() => handleDayClick(dateString)}
            >
              <span className={styles.dayLabel}>{day}</span>

              {hasGig && (
                <div className={styles.gigIndicatorStack}>
                  {dayGigs.map((g, idx) => (
                    <span key={idx} className={styles.gigBadge}>
                      {g.venue.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Glass Tooltip Overlay */}
              {hasGig && (
                <div className={styles.tooltip}>
                  {dayGigs
                    .map((g) => g.venue?.name || "Unknown Venue")
                    .join(" & ")}
                </div>
              )}
            </div>
          );
        })}

        {/* Trailing Days (Next Month Context) */}
        {trailingBlanks.map((day) => {
          const nextMonthRaw = month === 12 ? 1 : month + 1;
          const nextYearRaw = month === 12 ? year + 1 : year;
          const dateString = `${nextYearRaw}-${String(nextMonthRaw).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return (
            <div
              key={`trail-${day}`}
              className={`${styles.gridCell} ${styles.adjacentMonthCell}`}
              onClick={() => handleDayClick(dateString)}
            >
              <span className={styles.dayLabel}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
