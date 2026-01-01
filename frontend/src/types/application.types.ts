/**
 * TypeScript types for loan applications and eligibility results
 */

export interface BusinessInfo {
  business_name: string;
  business_type: string;
  industry: string;
  years_in_business: number;
  annual_revenue?: number;
  number_of_employees?: number;
}

export interface CreditInfo {
  fico_score: number;
  paynet_score?: number;
  has_bankruptcy: boolean;
  bankruptcy_discharge_date?: string;
  has_judgments: boolean;
  has_foreclosure: boolean;
  has_repossession: boolean;
}

export interface LoanDetails {
  requested_amount: number;
  down_payment: number;
  loan_term_months: number;
  loan_purpose: string;
}

export interface EquipmentInfo {
  equipment_type: string;
  equipment_category: string;
  equipment_age_years?: number;
  equipment_condition: string;
  purchase_type: string;
  equipment_mileage?: number;
}

export interface ContactInfo {
  contact_name: string;
  email: string;
  phone: string;
  state: string;
}

export interface LoanApplication {
  business_info: BusinessInfo;
  credit_info: CreditInfo;
  loan_details: LoanDetails;
  equipment_info: EquipmentInfo;
  contact_info: ContactInfo;
  additional_notes?: string;
}

export interface LoanApplicationResponse extends LoanApplication {
  _id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CriteriaEvaluation {
  criteria_key: string;
  display_name: string;
  required_value: any;
  actual_value: any;
  met: boolean;
  reasoning: string;
}

export interface LenderMatch {
  lender_id: string;
  lender_name: string;
  confidence_score: number;
  overall_reasoning: string;
  criteria_evaluations: CriteriaEvaluation[];
  improvement_suggestions?: string[];
}

export interface EligibilityResult {
  application_id: string;
  matched_lenders: LenderMatch[];
  unmatched_lenders: LenderMatch[];
  analysis_timestamp: string;
  total_lenders_evaluated: number;
}

export interface ApplicationSubmitResponse {
  application: LoanApplicationResponse;
  eligibility: EligibilityResult;
}

// Form data types (for step-by-step form)
export interface FormData {
  businessInfo: Partial<BusinessInfo>;
  creditInfo: Partial<CreditInfo>;
  loanDetails: Partial<LoanDetails>;
  equipmentInfo: Partial<EquipmentInfo>;
  contactInfo: Partial<ContactInfo>;
  additionalNotes: string;
}

// Initial form state
export const initialFormData: FormData = {
  businessInfo: {
    business_name: '',
    business_type: '',
    industry: '',
    years_in_business: 0,
    annual_revenue: undefined,
    number_of_employees: undefined,
  },
  creditInfo: {
    fico_score: 300,
    paynet_score: undefined,
    has_bankruptcy: false,
    bankruptcy_discharge_date: undefined,
    has_judgments: false,
    has_foreclosure: false,
    has_repossession: false,
  },
  loanDetails: {
    requested_amount: 0,
    down_payment: 0,
    loan_term_months: 12,
    loan_purpose: '',
  },
  equipmentInfo: {
    equipment_type: '',
    equipment_category: '',
    equipment_age_years: undefined,
    equipment_condition: '',
    purchase_type: '',
    equipment_mileage: undefined,
  },
  contactInfo: {
    contact_name: '',
    email: '',
    phone: '',
    state: '',
  },
  additionalNotes: '',
};
