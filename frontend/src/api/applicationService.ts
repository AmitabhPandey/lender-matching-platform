/**
 * API service for loan applications
 */
import apiClient from './client';
import {
  LoanApplication,
  LoanApplicationResponse,
  ApplicationSubmitResponse,
  EligibilityResult,
} from '../types/application.types';

/**
 * Submit a new loan application and get immediate eligibility results
 */
export const submitApplication = async (
  application: LoanApplication
): Promise<ApplicationSubmitResponse> => {
  const response = await apiClient.post<ApplicationSubmitResponse>(
    '/applications/submit',
    application
  );
  return response.data;
};

/**
 * Re-evaluate an existing application
 */
export const evaluateApplication = async (
  applicationId: string
): Promise<EligibilityResult> => {
  const response = await apiClient.post<EligibilityResult>(
    '/applications/evaluate',
    { application_id: applicationId }
  );
  return response.data;
};

/**
 * List all applications (admin functionality)
 */
export const listApplications = async (
  skip: number = 0,
  limit: number = 50
): Promise<LoanApplicationResponse[]> => {
  const response = await apiClient.get<LoanApplicationResponse[]>(
    '/applications',
    {
      params: { skip, limit },
    }
  );
  return response.data;
};
