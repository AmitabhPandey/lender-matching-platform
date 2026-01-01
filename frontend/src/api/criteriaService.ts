import apiClient from './client';
import type { Criteria, CriteriaCreateDTO, CriteriaUpdateDTO } from '../types/criteria.types';
import type { MessageResponse } from '../types/common.types';

/**
 * Service for criteria-related API operations
 */
export const criteriaService = {
  /**
   * Create a new criteria
   * @param criteriaData - Criteria creation data
   */
  async createCriteria(criteriaData: CriteriaCreateDTO): Promise<Criteria> {
    const response = await apiClient.post<Criteria>('/criteria/create', criteriaData);
    return response.data;
  },

  /**
   * Get all criteria for a specific lender
   * @param lenderId - Lender ID
   * @param category - Optional category filter
   */
  async getCriteriaByLender(lenderId: string, category?: string): Promise<Criteria[]> {
    const response = await apiClient.get<Criteria[]>(`/criteria/lender/${lenderId}`, {
      params: category ? { category } : undefined
    });
    return response.data;
  },

  /**
   * Update an existing criteria
   * @param id - Criteria ID
   * @param criteriaData - Criteria update data
   */
  async updateCriteria(id: string, criteriaData: CriteriaUpdateDTO): Promise<Criteria> {
    const response = await apiClient.put<Criteria>(`/criteria/update/${id}`, criteriaData);
    return response.data;
  },

  /**
   * Delete a criteria
   * @param id - Criteria ID
   */
  async deleteCriteria(id: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/criteria/delete/${id}`);
    return response.data;
  },
};
