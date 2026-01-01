import apiClient from './client';
import type { Lender, LenderCreateDTO, LenderUpdateDTO } from '../types/lender.types';
import type { PDFUploadResponse } from '../types/criteria.types';
import type { MessageResponse } from '../types/common.types';

/**
 * Service for lender-related API operations
 */
export const lenderService = {
  /**
   * Fetch all lenders with pagination
   * @param skip - Number of records to skip
   * @param limit - Maximum number of records to return
   */
  async getAllLenders(skip: number = 0, limit: number = 100): Promise<Lender[]> {
    const response = await apiClient.get<Lender[]>('/lender/list', {
      params: { skip, limit }
    });
    return response.data;
  },

  /**
   * Search lenders by name
   * @param query - Search query string
   */
  async searchLenders(query: string): Promise<Lender[]> {
    const response = await apiClient.get<Lender[]>('/lender/search', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Get a single lender by ID
   * @param id - Lender ID
   */
  async getLenderById(id: string): Promise<Lender> {
    const response = await apiClient.get<Lender>(`/lender/get/${id}`);
    return response.data;
  },

  /**
   * Create a new lender
   * @param lenderData - Lender creation data
   */
  async createLender(lenderData: LenderCreateDTO): Promise<Lender> {
    const response = await apiClient.post<Lender>('/lender/create', lenderData);
    return response.data;
  },

  /**
   * Update an existing lender
   * @param id - Lender ID
   * @param lenderData - Lender update data
   */
  async updateLender(id: string, lenderData: LenderUpdateDTO): Promise<Lender> {
    const response = await apiClient.put<Lender>(`/lender/update/${id}`, lenderData);
    return response.data;
  },

  /**
   * Delete a lender and all associated criteria
   * @param id - Lender ID
   */
  async deleteLender(id: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/lender/delete/${id}`);
    return response.data;
  },

  /**
   * Upload PDF and extract lender information
   * @param file - PDF file to upload
   * @param lenderName - Name of the lender
   */
  async uploadPDF(file: File, lenderName: string): Promise<PDFUploadResponse> {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('lender_name', lenderName);

    const response = await apiClient.post<PDFUploadResponse>('/lender/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
