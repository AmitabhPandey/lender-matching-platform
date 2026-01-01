"""API routes for loan applications."""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.dto.loan_application import (
    LoanApplicationCreateDTO,
    LoanApplicationResponseDTO,
    EligibilityResultDTO
)
from app.services.loan_application_service import get_loan_application_service
from app.services.eligibility_service import eligibility_service
from app.services.lender_service import LenderService
from app.services.criteria_service import CriteriaService

router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationSubmitResponseDTO(BaseModel):
    """Response for application submission with immediate evaluation."""
    application: LoanApplicationResponseDTO
    eligibility: EligibilityResultDTO


class EvaluateRequestDTO(BaseModel):
    """Request body for evaluation endpoint."""
    application_id: str = Field(..., description="Application ID to evaluate")


@router.post(
    "/submit",
    response_model=ApplicationSubmitResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Submit and evaluate loan application",
    description="Submit a new loan application and immediately evaluate against all lenders"
)
async def submit_and_evaluate_application(
    application: LoanApplicationCreateDTO,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Submit application and evaluate immediately.
    
    This endpoint:
    1. Creates the application in database
    2. Fetches all lenders and their criteria
    3. Makes parallel async calls to Gemini AI to evaluate each lender
    4. Returns application data and eligibility results
    
    Args:
        application: Application data
        db: Database connection
        
    Returns:
        Application data and eligibility results
        
    Raises:
        HTTPException: If creation or evaluation fails
    """
    try:
        # Create application
        app_service = get_loan_application_service(db)
        created_app = await app_service.create_application(application)
        application_id = created_app.id
        
        # Get application data for evaluation
        application_data = await app_service.get_application_data_dict(application_id)
        
        # Get all lenders with their criteria
        lender_service = LenderService()
        criteria_service = CriteriaService()
        
        lenders = await lender_service.list_lenders()
        
        if not lenders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No lenders available for evaluation"
            )
        
        # Fetch criteria for each lender
        lenders_with_criteria = []
        for lender in lenders:
            lender_dict = lender.model_dump(by_alias=True)
            criteria = await criteria_service.get_criteria_by_lender(lender_dict["_id"])
            lender_dict["criteria"] = [c.model_dump() for c in criteria]
            lenders_with_criteria.append(lender_dict)
        
        # Evaluate application against all lenders (parallel async calls to Gemini)
        eligibility_result = await eligibility_service.evaluate_application(
            application_id=application_id,
            application_data=application_data,
            lenders_with_criteria=lenders_with_criteria
        )
        
        # Update application status
        await app_service.update_application_status(application_id, "evaluated")
        
        return ApplicationSubmitResponseDTO(
            application=created_app,
            eligibility=eligibility_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit and evaluate application: {str(e)}"
        )


@router.post(
    "/evaluate",
    response_model=EligibilityResultDTO,
    summary="Re-evaluate existing application",
    description="Re-evaluate an existing application against all lenders"
)
async def evaluate_existing_application(
    request: EvaluateRequestDTO = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Re-evaluate an existing application.
    
    Args:
        request: Request with application_id
        db: Database connection
        
    Returns:
        Eligibility results
        
    Raises:
        HTTPException: If application not found or evaluation fails
    """
    try:
        application_id = request.application_id
        
        # Get application data
        app_service = get_loan_application_service(db)
        application_data = await app_service.get_application_data_dict(application_id)
        
        if not application_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found"
            )
        
        # Get all lenders with their criteria
        lender_service = LenderService()
        criteria_service = CriteriaService()
        
        lenders = await lender_service.list_lenders()
        
        if not lenders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No lenders available for evaluation"
            )
        
        # Fetch criteria for each lender
        lenders_with_criteria = []
        for lender in lenders:
            lender_dict = lender.model_dump(by_alias=True)
            criteria = await criteria_service.get_criteria_by_lender(lender_dict["_id"])
            lender_dict["criteria"] = [c.model_dump() for c in criteria]
            lenders_with_criteria.append(lender_dict)
        
        # Evaluate application
        eligibility_result = await eligibility_service.evaluate_application(
            application_id=application_id,
            application_data=application_data,
            lenders_with_criteria=lenders_with_criteria
        )
        
        return eligibility_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate application: {str(e)}"
        )


@router.get(
    "/",
    response_model=List[LoanApplicationResponseDTO],
    summary="List loan applications",
    description="List all loan applications with pagination"
)
async def list_applications(
    skip: int = 0,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List applications with pagination.
    
    Args:
        skip: Number of applications to skip
        limit: Maximum number to return
        db: Database connection
        
    Returns:
        List of applications
        
    Raises:
        HTTPException: If error occurs
    """
    try:
        app_service = get_loan_application_service(db)
        applications = await app_service.list_applications(skip, limit)
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list applications: {str(e)}"
        )
