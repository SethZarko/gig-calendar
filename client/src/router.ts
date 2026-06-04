import { createBrowserRouter, redirect } from "react-router";

// Layouts & Global Components
import { RootLayout } from "./layouts/RootLayout";
import { GlobalError } from "./components/GlobalError";
import { GlobalLoader } from "./components/GlobalLoader/GlobalLoader";

// Pages
import { VenueList } from "./pages/Venues/VenueList";
import { NotFound } from "./pages/NotFound/NotFound";

// Calendar Views
import { YearView } from "./views/Calendar/Year/YearView";
import { MonthView } from "./views/Calendar/Month/MonthView";
import { WeekView } from "./views/Calendar/Week/WeekView";
import { DayView } from "./views/Calendar/Day/DayView";

// Loader Imports
import { venuesLoader } from './loaders/venueLoader';
import { yearLoader } from "./loaders/yearLoader";
import { monthLoader } from "./loaders/monthLoader";
import { weekLoader } from "./loaders/weekLoader";
import { dayLoader } from "./loaders/dayLoader";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    HydrateFallback: GlobalLoader,
    ErrorBoundary: GlobalError,
    children: [
      {
        index: true,
        loader: () => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          return redirect(`/calendar/month/${year}/${month}`);
        },
      },
      {
        path: "calendar",
        children: [
          {
            path: "year/:year",
            Component: YearView,
            loader: yearLoader
          },
          {
            path: "month/:year/:month",
            Component: MonthView,
            loader: monthLoader
          },
          {
            path: "week/:date",
            Component: WeekView,
            loader: weekLoader
          },
          {
            path: "day/:date",
            Component: DayView,
            loader: dayLoader
          },
        ],
      },
      {
        path: "venues",
        Component: VenueList,
        loader: venuesLoader
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
