import React from 'react';
import type { Lender } from '../../types/lender.types';
import { LenderCard } from '../LenderCard';
import styles from './LenderList.module.css';

export interface LenderListProps {
  lenders: Lender[];
  onDelete?: (id: string) => void;
}

/**
 * List component to display multiple lenders
 */
export const LenderList: React.FC<LenderListProps> = ({ lenders, onDelete }) => {
  if (lenders.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No lenders found. Add your first lender to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {lenders.map((lender) => (
        <LenderCard key={lender._id} lender={lender} onDelete={onDelete} />
      ))}
    </div>
  );
};
