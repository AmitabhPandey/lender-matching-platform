/**
 * Type definitions for Criteria entities
 */

export type CriteriaType = 'number' | 'string' | 'boolean' | 'array';

export interface Criteria {
  _id: string;
  lender_id: string;
  criteria_key: string;
  criteria_value: any;
  criteria_type: CriteriaType;
  display_name: string;
  description?: string;
  category?: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriteriaCreateDTO {
  lender_id: string;
  criteria_key: string;
  criteria_value: any;
  criteria_type: CriteriaType;
  display_name: string;
  description?: string;
  category?: string;
  is_required: boolean;
}

export interface CriteriaUpdateDTO {
  criteria_key?: string;
  criteria_value?: any;
  criteria_type?: CriteriaType;
  display_name?: string;
  description?: string;
  category?: string;
  is_required?: boolean;
}

export interface PDFUploadResponse {
  message: string;
  lender_id: string;
  criteria_count: number;
  extracted_criteria: any[];
}
