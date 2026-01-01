import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { CriteriaList } from '../../components/CriteriaList';
import { useLender } from '../../hooks/useLenders';
import { useCriteria } from '../../hooks/useCriteria';
import styles from './LenderDetailPage.module.css';

/**
 * Page to display detailed lender information and criteria
 */
export const LenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: lender, isLoading: isLoadingLender, error: errorLender } = useLender(id!);
  const { data: criteria, isLoading: isLoadingCriteria } = useCriteria(id!);

  if (isLoadingLender || isLoadingCriteria) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (errorLender || !lender) {
    return (
      <Layout>
        <ErrorMessage
          message="Failed to load lender details."
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="secondary" onClick={() => navigate('/lenders')}>
            ← Back to Lenders
          </Button>
        </div>

        <Card className={styles.lenderCard}>
          <h1 className={styles.lenderName}>{lender.name}</h1>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.infoGrid}>
              {lender.contact?.representative && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Representative:</span>
                  <span className={styles.value}>{lender.contact.representative}</span>
                </div>
              )}
              {lender.contact?.email && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{lender.contact.email}</span>
                </div>
              )}
              {lender.contact?.phone && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Phone:</span>
                  <span className={styles.value}>{lender.contact.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Business Model</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Broker:</span>
                <span className={styles.value}>
                  {lender.business_model?.is_broker ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Supports Startups:</span>
                <span className={styles.value}>
                  {lender.business_model?.supports_startups ? 'Yes' : 'No'}
                </span>
              </div>
              {lender.business_model?.decision_turnaround_days !== undefined && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Decision Time:</span>
                  <span className={styles.value}>
                    {lender.business_model.decision_turnaround_days} day(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className={styles.criteriaSection}>
          <h2 className={styles.criteriaTitle}>Lending Criteria</h2>
          {criteria && criteria.length > 0 ? (
            <CriteriaList criteria={criteria} />
          ) : (
            <Card>
              <p className={styles.noCriteria}>No criteria defined for this lender.</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
