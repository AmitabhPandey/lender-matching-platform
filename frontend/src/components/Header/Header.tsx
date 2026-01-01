import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

/**
 * Header navigation component
 */
export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Lender Matching Platform</span>
        </Link>
        <nav className={styles.nav}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${isActive('/') && location.pathname === '/' ? styles.active : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/lenders" 
            className={`${styles.navLink} ${isActive('/lenders') ? styles.active : ''}`}
          >
            Lenders
          </Link>
        </nav>
      </div>
    </header>
  );
};
