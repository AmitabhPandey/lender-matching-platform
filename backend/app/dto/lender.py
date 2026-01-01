"""Data Transfer Objects for Lender entities."""
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ContactDTO(BaseModel):
    """Contact information DTO with all optional fields."""
    representative: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    model_config = ConfigDict(extra='ignore')


class BusinessModelDTO(BaseModel):
    """Business model DTO with all optional fields."""
    is_broker: Optional[bool] = None
    supports_startups: Optional[bool] = None
    decision_turnaround_days: Optional[int] = None
    
    model_config = ConfigDict(extra='ignore')


class LenderBase(BaseModel):
    """Base lender DTO with common attributes."""
    name: str = Field(..., description="Lender company name")
    contact: Optional[ContactDTO] = Field(default=None, description="Contact information")
    business_model: Optional[BusinessModelDTO] = Field(default=None, description="Business model details")


class LenderCreateDTO(LenderBase):
    """DTO for creating a new lender."""
    pass


class LenderUpdateDTO(BaseModel):
    """DTO for updating an existing lender."""
    name: Optional[str] = None
    contact: Optional[ContactDTO] = None
    business_model: Optional[BusinessModelDTO] = None


class LenderResponseDTO(LenderBase):
    """DTO for lender API response."""
    id: str = Field(..., alias="_id", description="Lender unique identifier")
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Advantage+ Financing",
                "contact": {
                    "representative": "John Doe",
                    "email": "sales@advantageplusfinancing.com",
                    "phone": "(262) 439-7600"
                },
                "business_model": {
                    "is_broker": False,
                    "supports_startups": True,
                    "decision_turnaround_days": 1
                },
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )
