import { useSearchParams } from 'react-router';

import styles from './Pagination.module.scss';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export const Pagination = ({ totalPages, currentPage }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <nav className={styles.pagination} aria-label="Pagination Navigation">
      <button
        className={styles.navButton}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Prev
      </button>

      <div className={styles.pageNumbers}>
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`${styles.pageButton} ${page === currentPage ? styles.active : ''} ${page === '...' ? styles.ellipsis : ''}`}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && handlePageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className={styles.navButton}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}