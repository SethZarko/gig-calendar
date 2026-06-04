import React from 'react';

import styles from './GlobalLoader.module.scss';

interface LoaderProps {
  message?: string;
}

export const GlobalLoader: React.FC<LoaderProps> = ({ message = 'Loading' }) => {
  return (
    <div className={styles.backdrop} role="alert" aria-busy="true">
      <div className={styles.container}>
        <div className={styles.spinnerWrapper}>
          <svg className={styles.svg} viewBox="0 0 80 80">
            {/* Definitions for gradient colors */}
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Static background track */}
            <circle 
              className={styles.track} 
              cx="40" 
              cy="40" 
              r="36" 
            />
            
            {/* Glow layer */}
            <circle 
              className={styles.glow} 
              cx="40" 
              cy="40" 
              r="36" 
            />
            
            {/* Active animated ring */}
            <circle 
              className={styles.ring} 
              cx="40" 
              cy="40" 
              r="36" 
              stroke="url(#loaderGradient)"
            />
          </svg>
        </div>
        <span className={styles.text}>{message}</span>
      </div>
    </div>
  );
};