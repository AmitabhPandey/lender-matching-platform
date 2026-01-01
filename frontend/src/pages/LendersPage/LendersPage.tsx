import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LenderList } from '../../components/LenderList';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useLenders, useDeleteLender, useSearchLenders } from '../../hooks/useLenders';
import styles from './LendersPage.module.css';

/**
 * Page to display and manage all lenders
 */
export const LendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use search if query exists, otherwise fetch all
  const shouldSearch = searchQuery.trim().length > 0;
  const { data: allLenders, isLoading: isLoadingAll, error: errorAll, refetch: refetchAll } = useLenders(0, 100);
  const { data: searchResults, isLoading: isSearching } = useSearchLenders(searchQuery, shouldSearch);
  
  const deleteMutation = useDeleteLender();

  const lenders = shouldSearch ? searchResults : allLenders;
  const isLoading = shouldSearch ? isSearching : isLoadingAll;
  const error = shouldSearch ? null : errorAll;

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete lender:', err);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Lenders</h1>
          <Button onClick={() => navigate('/lenders/new')}>
            + Add Lender
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Input
            type="search"
            placeholder="Search lenders by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>

        {isLoading && <Loading />}
        
        {error && (
          <ErrorMessage
            message="Failed to load lenders. Please try again."
            onRetry={() => refetchAll()}
          />
        )}

        {!isLoading && !error && lenders && (
          <LenderList lenders={lenders} onDelete={handleDelete} />
        )}
      </div>
    </Layout>
  );
};
