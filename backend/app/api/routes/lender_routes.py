"""API routes for lender management."""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from app.dto.lender import LenderCreateDTO, LenderUpdateDTO, LenderResponseDTO
from app.dto.common import PDFUploadResponseDTO, MessageResponseDTO
from app.services.lender_service import lender_service
from app.services.criteria_service import criteria_service
from app.services.pdf_service import pdf_service
from app.dto.criteria import CriteriaCreateDTO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lender", tags=["lender"])


@router.post("/create", response_model=LenderResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_lender(lender: LenderCreateDTO):
    """Create a new lender."""
    try:
        return await lender_service.create_lender(lender)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/list", response_model=List[LenderResponseDTO])
async def list_lenders(skip: int = 0, limit: int = 100):
    """List all lenders with pagination."""
    try:
        return await lender_service.list_lenders(skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=List[LenderResponseDTO])
async def search_lenders(q: str):
    """Search lenders by name."""
    try:
        return await lender_service.search_lenders(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get/{lender_id}", response_model=LenderResponseDTO)
async def get_lender(lender_id: str):
    """Get a specific lender by ID."""
    try:
        lender = await lender_service.get_lender(lender_id)
        if not lender:
            raise HTTPException(status_code=404, detail="Lender not found")
        return lender
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{lender_id}", response_model=LenderResponseDTO)
async def update_lender(lender_id: str, lender: LenderUpdateDTO):
    """Update a lender."""
    try:
        updated_lender = await lender_service.update_lender(lender_id, lender)
        if not updated_lender:
            raise HTTPException(status_code=404, detail="Lender not found")
        return updated_lender
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/delete/{lender_id}", response_model=MessageResponseDTO)
async def delete_lender(lender_id: str):
    """Delete a lender and all associated criteria."""
    try:
        # Delete all criteria for this lender first
        await criteria_service.delete_criteria_by_lender(lender_id)
        
        # Delete the lender
        deleted = await lender_service.delete_lender(lender_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Lender not found")
        
        return MessageResponseDTO(message="Lender deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-pdf", response_model=PDFUploadResponseDTO, status_code=status.HTTP_201_CREATED)
async def upload_lender_pdf(
    pdf_file: UploadFile = File(...),
    lender_name: str = Form(...)
):
    """
    Upload a PDF document and extract lender criteria using AI.
    Creates both the lender and associated criteria.
    """
    try:
        # Validate file type
        if not pdf_file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read PDF content
        pdf_content = await pdf_file.read()
        
        # Extract criteria using Gemini
        extracted_data = await pdf_service.extract_criteria_from_pdf(
            pdf_content=pdf_content,
            lender_name=lender_name
        )
        
        logger.info(f"Extracted data from PDF: {extracted_data}")
        
        # Clean null values from nested dictionaries
        contact = extracted_data.get("contact")
        if contact and isinstance(contact, dict):
            contact = {k: v for k, v in contact.items() if v is not None} or None
        
        business_model = extracted_data.get("business_model")
        if business_model and isinstance(business_model, dict):
            business_model = {k: v for k, v in business_model.items() if v is not None} or None
        
        # Create lender
        lender_create = LenderCreateDTO(
            name=extracted_data.get("lender_name", lender_name),
            contact=contact,
            business_model=business_model
        )
        
        created_lender = await lender_service.create_lender(lender_create)
        
        # Create criteria
        criteria_list = []
        for criterion in extracted_data.get("criteria", []):
            # Handle null values from AI extraction properly
            criteria_key = criterion.get("criteria_key") or ""
            criteria_type = criterion.get("criteria_type") or "string"
            display_name = criterion.get("display_name") or ""
            is_required = criterion.get("is_required")
            if is_required is None:
                is_required = True
            
            # Skip criteria with empty required fields
            if not criteria_key or not display_name:
                continue
                
            criteria_create = CriteriaCreateDTO(
                lender_id=created_lender.id,
                criteria_key=criteria_key,
                criteria_value=criterion.get("criteria_value"),
                criteria_type=criteria_type,
                display_name=display_name,
                description=criterion.get("description"),
                category=criterion.get("category"),
                is_required=is_required
            )
            criteria_list.append(criteria_create)
        
        created_criteria = await criteria_service.bulk_create_criteria(criteria_list)
        
        return PDFUploadResponseDTO(
            message="PDF processed successfully",
            lender_id=created_lender.id,
            criteria_count=len(created_criteria),
            extracted_criteria=[c.model_dump() for c in created_criteria]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
