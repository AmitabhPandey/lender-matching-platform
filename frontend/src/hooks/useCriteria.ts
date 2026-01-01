import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { criteriaService } from '../api/criteriaService';
import type { CriteriaCreateDTO, CriteriaUpdateDTO } from '../types/criteria.types';
import { lenderKeys } from './useLenders';

/**
 * React Query hooks for criteria operations
 */

// Query keys
export const criteriaKeys = {
  all: ['criteria'] as const,
  lists: () => [...criteriaKeys.all, 'list'] as const,
  list: (lenderId: string, category?: string) => 
    [...criteriaKeys.lists(), lenderId, category] as const,
};

/**
 * Get all criteria for a specific lender
 */
export function useCriteria(lenderId: string, category?: string) {
  return useQuery({
    queryKey: criteriaKeys.list(lenderId, category),
    queryFn: () => criteriaService.getCriteriaByLender(lenderId, category),
    enabled: !!lenderId,
  });
}

/**
 * Create a new criteria
 */
export function useCreateCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (criteriaData: CriteriaCreateDTO) => 
      criteriaService.createCriteria(criteriaData),
    onSuccess: (data) => {
      // Invalidate criteria list for this lender
      queryClient.invalidateQueries({ 
        queryKey: criteriaKeys.list(data.lender_id) 
      });
    },
  });
}

/**
 * Update an existing criteria
 */
export function useUpdateCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CriteriaUpdateDTO }) =>
      criteriaService.updateCriteria(id, data),
    onSuccess: (data) => {
      // Invalidate criteria list for this lender
      queryClient.invalidateQueries({ 
        queryKey: criteriaKeys.list(data.lender_id) 
      });
      // Also invalidate lender detail to refresh
      queryClient.invalidateQueries({ 
        queryKey: lenderKeys.detail(data.lender_id) 
      });
    },
  });
}

/**
 * Delete a criteria
 */
export function useDeleteCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => criteriaService.deleteCriteria(id),
    onSuccess: () => {
      // Invalidate all criteria lists (we don't know which lender it belonged to)
      queryClient.invalidateQueries({ queryKey: criteriaKeys.lists() });
    },
  });
}
