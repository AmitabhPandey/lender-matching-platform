import React from 'react';
import type { Criteria } from '../../types/criteria.types';
import { Card } from '../Card';
import styles from './CriteriaList.module.css';

export interface CriteriaListProps {
  criteria: Criteria[];
}

/**
 * Component to display criteria list grouped by category
 */
export const CriteriaList: React.FC<CriteriaListProps> = ({ criteria }) => {
  if (criteria.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No criteria available for this lender.</p>
      </div>
    );
  }

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    const category = criterion.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(criterion);
    return acc;
  }, {} as Record<string, Criteria[]>);

  return (
    <div className={styles.container}>
      {Object.entries(groupedCriteria).map(([category, items]) => (
        <Card key={category} className={styles.categoryCard}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <div className={styles.criteriaList}>
            {items.map((criterion) => (
              <div key={criterion._id} className={styles.criteriaItem}>
                <div className={styles.criteriaHeader}>
                  <span className={styles.criteriaName}>{criterion.display_name}</span>
                  {criterion.is_required && (
                    <span className={styles.requiredBadge}>Required</span>
                  )}
                </div>
                <div className={styles.criteriaValue}>
                  {formatValue(criterion.criteria_value, criterion.criteria_type)}
                </div>
                {criterion.description && (
                  <p className={styles.criteriaDescription}>{criterion.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

function formatValue(value: any, type: string): string {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'array':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'number':
      return value.toLocaleString();
    default:
      return String(value);
  }
}
