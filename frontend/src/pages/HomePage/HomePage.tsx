import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import styles from './HomePage.module.css';

/**
 * Home page with platform overview
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Lender Matching Platform</h1>
          <p className={styles.subtitle}>
            Manage and match lender criteria efficiently. Upload PDFs, track requirements, 
            and find the perfect lending partners for your needs.
          </p>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/lenders')} size="large">
              View All Lenders
            </Button>
            <Button onClick={() => navigate('/lenders/new')} variant="secondary" size="large">
              Add New Lender
            </Button>
          </div>
        </div>

        <div className={styles.features}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>📋</div>
            <h3 className={styles.featureTitle}>Lender Management</h3>
            <p className={styles.featureDescription}>
              Easily add, edit, and manage lender information with detailed contact and business model data.
            </p>
          </Card>

          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>📄</div>
            <h3 className={styles.featureTitle}>PDF Import</h3>
            <p className={styles.featureDescription}>
              Upload lender criteria PDFs and automatically extract requirements using AI-powered analysis.
            </p>
          </Card>

          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3 className={styles.featureTitle}>Criteria Tracking</h3>
            <p className={styles.featureDescription}>
              Track and organize lending criteria by category for easy comparison and decision making.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
