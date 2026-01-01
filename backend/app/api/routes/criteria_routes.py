"""API routes for criteria management."""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.dto.criteria import CriteriaCreateDTO, CriteriaUpdateDTO, CriteriaResponseDTO
from app.dto.common import MessageResponseDTO
from app.services.criteria_service import criteria_service

router = APIRouter(prefix="/criteria", tags=["criteria"])


@router.post("/create", response_model=CriteriaResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_criteria(criteria: CriteriaCreateDTO):
    """Create a new criteria."""
    try:
        return await criteria_service.create_criteria(criteria)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/lender/{lender_id}", response_model=List[CriteriaResponseDTO])
async def get_criteria_by_lender(lender_id: str, category: Optional[str] = None):
    """Get all criteria for a specific lender, optionally filtered by category."""
    try:
        return await criteria_service.get_criteria_by_lender(lender_id, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{criteria_id}", response_model=CriteriaResponseDTO)
async def update_criteria(criteria_id: str, criteria: CriteriaUpdateDTO):
    """Update a criteria."""
    try:
        updated_criteria = await criteria_service.update_criteria(criteria_id, criteria)
        if not updated_criteria:
            raise HTTPException(status_code=404, detail="Criteria not found")
        return updated_criteria
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/delete/{criteria_id}", response_model=MessageResponseDTO)
async def delete_criteria(criteria_id: str):
    """Delete a criteria."""
    try:
        deleted = await criteria_service.delete_criteria(criteria_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Criteria not found")
        
        return MessageResponseDTO(message="Criteria deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
