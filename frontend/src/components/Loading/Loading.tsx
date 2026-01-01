import React from 'react';
import styles from './Loading.module.css';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

/**
 * Loading spinner component
 */
export const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium',
  text = 'Loading...'
}) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};
