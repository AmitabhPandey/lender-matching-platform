/**
 * Type definitions for Lender entities
 * Aligned with backend DTOs (backend/app/dto/lender.py)
 */

export interface ContactInfo {
  [key: string]: string;
}

export interface BusinessModel {
  [key: string]: any;
}

export interface Lender {
  _id: string;
  id?: string;  // Alias for _id (backend uses both)
  name: string;
  contact: ContactInfo;
  business_model: BusinessModel;
  created_at: string;
  updated_at: string;
}

export interface LenderCreateDTO {
  name: string;
  contact: ContactInfo;
  business_model: BusinessModel;
}

export interface LenderUpdateDTO {
  name?: string;
  contact?: ContactInfo;
  business_model?: BusinessModel;
}
