import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lenderService } from '../api/lenderService';
import type { LenderCreateDTO, LenderUpdateDTO } from '../types/lender.types';

/**
 * React Query hooks for lender operations
 */

// Query keys
export const lenderKeys = {
  all: ['lenders'] as const,
  lists: () => [...lenderKeys.all, 'list'] as const,
  list: (skip?: number, limit?: number) => [...lenderKeys.lists(), { skip, limit }] as const,
  details: () => [...lenderKeys.all, 'detail'] as const,
  detail: (id: string) => [...lenderKeys.details(), id] as const,
  search: (query: string) => [...lenderKeys.all, 'search', query] as const,
};

/**
 * Fetch all lenders
 */
export function useLenders(skip: number = 0, limit: number = 100) {
  return useQuery({
    queryKey: lenderKeys.list(skip, limit),
    queryFn: () => lenderService.getAllLenders(skip, limit),
  });
}

/**
 * Search lenders by name
 */
export function useSearchLenders(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: lenderKeys.search(query),
    queryFn: () => lenderService.searchLenders(query),
    enabled: enabled && query.length > 0,
  });
}

/**
 * Get a single lender by ID
 */
export function useLender(id: string) {
  return useQuery({
    queryKey: lenderKeys.detail(id),
    queryFn: () => lenderService.getLenderById(id),
    enabled: !!id,
  });
}

/**
 * Create a new lender
 */
export function useCreateLender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lenderData: LenderCreateDTO) => lenderService.createLender(lenderData),
    onSuccess: () => {
      // Invalidate and refetch lenders list
      queryClient.invalidateQueries({ queryKey: lenderKeys.lists() });
    },
  });
}

/**
 * Update an existing lender
 */
export function useUpdateLender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LenderUpdateDTO }) =>
      lenderService.updateLender(id, data),
    onSuccess: (data) => {
      // Invalidate specific lender and list
      queryClient.invalidateQueries({ queryKey: lenderKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: lenderKeys.lists() });
    },
  });
}

/**
 * Delete a lender
 */
export function useDeleteLender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lenderService.deleteLender(id),
    onSuccess: () => {
      // Invalidate lenders list
      queryClient.invalidateQueries({ queryKey: lenderKeys.lists() });
    },
  });
}

/**
 * Upload PDF and create lender
 * The lender name is automatically extracted from the PDF
 */
export function useUploadPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      lenderService.uploadPDF(file),
    onSuccess: () => {
      // Invalidate lenders list
      queryClient.invalidateQueries({ queryKey: lenderKeys.lists() });
    },
  });
}
