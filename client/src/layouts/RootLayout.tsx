import { Outlet, NavLink, useNavigation, useLocation } from 'react-router';

import styles from './RootLayout.module.scss';

export const RootLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigating = navigation.state === "loading";

  const isCalendarActive = location.pathname.startsWith('/calendar') || location.pathname === '/';

  return (
    <div className={styles.appContainer}>
      <header>
        <nav>
          <NavLink 
            to="/" 
            className={() => isCalendarActive ? styles.active : ''}
          >
            Calendar
          </NavLink>
          
          <NavLink 
            to="/venues" 
            className={({ isActive }: { isActive: boolean }) => 
              isActive ? styles.active : ''
            }
          >
            Venues
          </NavLink>
        </nav>
      </header>

      <main className={`${styles.main} ${isNavigating ? styles.fadeOut : ''}`}>
        <Outlet /> 
      </main>
    </div>
  );
}