"""Data Transfer Objects for Loan Application entities."""
from typing import Any, Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class BusinessInfoDTO(BaseModel):
    """Business information DTO."""
    business_name: str = Field(..., description="Name of the business")
    business_type: str = Field(..., description="Type of business entity (LLC, Corporation, etc.)")
    industry: str = Field(..., description="Industry sector")
    years_in_business: float = Field(..., ge=0, description="Years in business")
    annual_revenue: Optional[float] = Field(None, ge=0, description="Annual revenue in USD")
    number_of_employees: Optional[int] = Field(None, ge=0, description="Number of employees")
    
    model_config = ConfigDict(extra='ignore')


class CreditInfoDTO(BaseModel):
    """Credit information DTO."""
    fico_score: int = Field(..., ge=300, le=850, description="FICO credit score")
    paynet_score: Optional[int] = Field(None, ge=0, le=100, description="PayNet score")
    has_bankruptcy: bool = Field(False, description="Has filed bankruptcy")
    bankruptcy_discharge_date: Optional[str] = Field(None, description="Bankruptcy discharge date")
    has_judgments: bool = Field(False, description="Has judgments")
    has_foreclosure: bool = Field(False, description="Has foreclosure")
    has_repossession: bool = Field(False, description="Has repossession")
    
    model_config = ConfigDict(extra='ignore')


class LoanDetailsDTO(BaseModel):
    """Loan details DTO."""
    requested_amount: float = Field(..., gt=0, description="Requested loan amount in USD")
    down_payment: float = Field(..., ge=0, description="Down payment amount in USD")
    loan_term_months: int = Field(..., gt=0, description="Desired loan term in months")
    loan_purpose: str = Field(..., description="Purpose of the loan")
    
    model_config = ConfigDict(extra='ignore')


class EquipmentInfoDTO(BaseModel):
    """Equipment information DTO."""
    equipment_type: str = Field(..., description="Type of equipment")
    equipment_category: str = Field(..., description="Equipment category")
    equipment_age_years: Optional[int] = Field(None, ge=0, description="Age of equipment in years")
    equipment_condition: str = Field(..., description="Equipment condition (New, Used, Refurbished)")
    purchase_type: str = Field(..., description="Purchase type (Dealer, Private Party)")
    equipment_mileage: Optional[int] = Field(None, ge=0, description="Equipment mileage if applicable")
    
    model_config = ConfigDict(extra='ignore')


class ContactInfoDTO(BaseModel):
    """Contact information DTO."""
    contact_name: str = Field(..., description="Contact person name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    state: str = Field(..., description="State location")
    
    model_config = ConfigDict(extra='ignore')


class LoanApplicationBase(BaseModel):
    """Base loan application DTO."""
    business_info: BusinessInfoDTO
    credit_info: CreditInfoDTO
    loan_details: LoanDetailsDTO
    equipment_info: EquipmentInfoDTO
    contact_info: ContactInfoDTO
    additional_notes: Optional[str] = Field(None, description="Additional notes or comments")


class LoanApplicationCreateDTO(LoanApplicationBase):
    """DTO for creating a new loan application."""
    pass


class LoanApplicationResponseDTO(LoanApplicationBase):
    """DTO for loan application API response."""
    id: str = Field(..., alias="_id", description="Application unique identifier")
    status: str = Field(..., description="Application status")
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439013",
                "business_info": {
                    "business_name": "ABC Trucking LLC",
                    "business_type": "LLC",
                    "industry": "Transportation",
                    "years_in_business": 5.5,
                    "annual_revenue": 500000
                },
                "credit_info": {
                    "fico_score": 720,
                    "has_bankruptcy": False,
                    "has_judgments": False
                },
                "loan_details": {
                    "requested_amount": 75000,
                    "down_payment": 7500,
                    "loan_term_months": 48,
                    "loan_purpose": "Equipment Purchase"
                },
                "equipment_info": {
                    "equipment_type": "Class 8 Truck",
                    "equipment_category": "Heavy Duty Trucks",
                    "equipment_age_years": 2,
                    "equipment_condition": "Used",
                    "purchase_type": "Dealer"
                },
                "contact_info": {
                    "contact_name": "John Doe",
                    "email": "john@abctrucking.com",
                    "phone": "555-0123",
                    "state": "TX"
                },
                "status": "pending",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )


class CriteriaEvaluationDTO(BaseModel):
    """Individual criteria evaluation result."""
    criteria_key: str = Field(..., description="Criteria identifier")
    display_name: str = Field(..., description="Human-readable criteria name")
    required_value: Any = Field(..., description="Required value by lender")
    actual_value: Any = Field(..., description="Actual value from application")
    met: bool = Field(..., description="Whether criteria was met")
    reasoning: str = Field(..., description="Detailed reasoning for the evaluation")
    
    model_config = ConfigDict(extra='ignore')


class LenderMatchDTO(BaseModel):
    """Lender match result."""
    lender_id: str = Field(..., description="Lender identifier")
    lender_name: str = Field(..., description="Lender name")
    confidence_score: float = Field(..., ge=0, le=1, description="Match confidence score")
    overall_reasoning: str = Field(..., description="Overall reasoning for match/no-match")
    criteria_evaluations: List[CriteriaEvaluationDTO] = Field(..., description="Individual criteria evaluations")
    improvement_suggestions: Optional[List[str]] = Field(None, description="Suggestions for improvement")
    
    model_config = ConfigDict(extra='ignore')


class EligibilityResultDTO(BaseModel):
    """Complete eligibility analysis result."""
    application_id: str = Field(..., description="Application identifier")
    matched_lenders: List[LenderMatchDTO] = Field(..., description="Lenders that matched")
    unmatched_lenders: List[LenderMatchDTO] = Field(..., description="Lenders that didn't match")
    analysis_timestamp: datetime = Field(..., description="When analysis was performed")
    total_lenders_evaluated: int = Field(..., description="Total number of lenders evaluated")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "application_id": "507f1f77bcf86cd799439013",
                "matched_lenders": [
                    {
                        "lender_id": "507f1f77bcf86cd799439011",
                        "lender_name": "Advantage+ Financing",
                        "confidence_score": 0.85,
                        "overall_reasoning": "Strong credit profile meets all requirements",
                        "criteria_evaluations": [
                            {
                                "criteria_key": "min_fico_score",
                                "display_name": "Minimum FICO Score",
                                "required_value": 680,
                                "actual_value": 720,
                                "met": True,
                                "reasoning": "FICO score of 720 exceeds minimum requirement of 680"
                            }
                        ]
                    }
                ],
                "unmatched_lenders": [],
                "analysis_timestamp": "2024-01-01T00:00:00Z",
                "total_lenders_evaluated": 5
            }
        }
    )
