import React from 'react';
import { Header } from '../Header';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper component
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
