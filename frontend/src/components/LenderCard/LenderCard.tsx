import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lender } from '../../types/lender.types';
import { Card } from '../Card';
import { Button } from '../Button';
import styles from './LenderCard.module.css';

export interface LenderCardProps {
  lender: Lender;
  onDelete?: (id: string) => void;
}

/**
 * Card component to display lender information
 */
export const LenderCard: React.FC<LenderCardProps> = ({ lender, onDelete }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/lenders/${lender._id}`);
  };

  const handleEdit = () => {
    navigate(`/lenders/${lender._id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete ${lender.name}?`)) {
      onDelete(lender._id);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{lender.name}</h3>
        <div className={styles.badges}>
          {lender.business_model?.is_broker && (
            <span className={styles.badge}>Broker</span>
          )}
          {lender.business_model?.supports_startups && (
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Startup Friendly</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {lender.contact?.representative && (
          <div className={styles.info}>
            <span className={styles.label}>Representative:</span>
            <span className={styles.value}>{lender.contact.representative}</span>
          </div>
        )}
        {lender.contact?.email && (
          <div className={styles.info}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{lender.contact.email}</span>
          </div>
        )}
        {lender.contact?.phone && (
          <div className={styles.info}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>{lender.contact.phone}</span>
          </div>
        )}
        {lender.business_model?.decision_turnaround_days !== undefined && (
          <div className={styles.info}>
            <span className={styles.label}>Decision Time:</span>
            <span className={styles.value}>
              {lender.business_model.decision_turnaround_days} day(s)
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button size="small" onClick={handleView}>
          View Details
        </Button>
        <Button size="small" variant="secondary" onClick={handleEdit}>
          Edit
        </Button>
        {onDelete && (
          <Button size="small" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
};
