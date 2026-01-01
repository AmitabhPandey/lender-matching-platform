"""Data Transfer Objects for Criteria entities."""
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CriteriaBase(BaseModel):
    """Base criteria DTO with common attributes."""
    lender_id: str = Field(..., description="Reference to parent lender")
    criteria_key: str = Field(..., description="Unique criteria key (snake_case)")
    criteria_value: Any = Field(..., description="Criteria value (can be any type)")
    criteria_type: Optional[str] = Field(default="string", description="Data type (number, string, boolean, array)")
    display_name: str = Field(..., description="Human-readable name")
    description: Optional[str] = Field(None, description="Detailed description")
    category: Optional[str] = Field(None, description="Category (credit, business, loan_parameters, etc.)")
    is_required: bool = Field(True, description="Whether this criteria is mandatory")


class CriteriaCreateDTO(CriteriaBase):
    """DTO for creating a new criteria."""
    pass


class CriteriaUpdateDTO(BaseModel):
    """DTO for updating an existing criteria."""
    criteria_key: Optional[str] = None
    criteria_value: Optional[Any] = None
    criteria_type: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_required: Optional[bool] = None


class CriteriaResponseDTO(CriteriaBase):
    """DTO for criteria API response."""
    id: str = Field(..., alias="_id", description="Criteria unique identifier")
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439012",
                "lender_id": "507f1f77bcf86cd799439011",
                "criteria_key": "min_fico_score",
                "criteria_value": 680,
                "criteria_type": "number",
                "display_name": "Minimum FICO Score",
                "description": "Minimum required FICO score for approval",
                "category": "credit",
                "is_required": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )
