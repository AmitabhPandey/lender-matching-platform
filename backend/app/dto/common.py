"""Common Data Transfer Objects."""
from typing import Any
from pydantic import BaseModel, Field, ConfigDict


class PDFUploadResponseDTO(BaseModel):
    """DTO for PDF upload response."""
    message: str
    lender_id: str
    criteria_count: int
    extracted_criteria: list[dict[str, Any]]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "PDF processed successfully",
                "lender_id": "507f1f77bcf86cd799439011",
                "criteria_count": 15,
                "extracted_criteria": [
                    {
                        "criteria_key": "min_fico_score",
                        "criteria_value": 680,
                        "criteria_type": "number",
                        "display_name": "Minimum FICO Score",
                        "category": "credit"
                    }
                ]
            }
        }
    )


class ErrorResponseDTO(BaseModel):
    """DTO for error responses."""
    detail: str
    status_code: int
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Resource not found",
                "status_code": 404
            }
        }
    )


class MessageResponseDTO(BaseModel):
    """DTO for simple message responses."""
    message: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Operation completed successfully"
            }
        }
    )
