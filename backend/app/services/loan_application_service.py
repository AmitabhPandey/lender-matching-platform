"""Service for managing loan applications."""
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.dto.loan_application import (
    LoanApplicationCreateDTO,
    LoanApplicationResponseDTO
)


class LoanApplicationService:
    """Service to handle loan application database operations."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        """
        Initialize service with database connection.
        
        Args:
            database: MongoDB database instance
        """
        self.db = database
        self.collection = database["loan_applications"]
    
    async def create_application(
        self,
        application_data: LoanApplicationCreateDTO
    ) -> LoanApplicationResponseDTO:
        """
        Create a new loan application.
        
        Args:
            application_data: Application data to create
            
        Returns:
            Created application with generated ID
            
        Raises:
            Exception: If creation fails
        """
        try:
            # Convert DTO to dict and add metadata
            app_dict = application_data.model_dump()
            app_dict["status"] = "pending"
            app_dict["created_at"] = datetime.utcnow()
            app_dict["updated_at"] = datetime.utcnow()
            
            # Insert into database
            result = await self.collection.insert_one(app_dict)
            
            # Fetch the created document
            created_app = await self.collection.find_one({"_id": result.inserted_id})
            
            if not created_app:
                raise Exception("Failed to retrieve created application")
            
            return self._convert_to_response_dto(created_app)
            
        except Exception as e:
            raise Exception(f"Error creating loan application: {str(e)}")
    
    async def get_application_by_id(
        self,
        application_id: str
    ) -> Optional[LoanApplicationResponseDTO]:
        """
        Get application by ID.
        
        Args:
            application_id: Application identifier
            
        Returns:
            Application DTO if found, None otherwise
            
        Raises:
            Exception: If ID is invalid
        """
        try:
            obj_id = ObjectId(application_id)
        except Exception:
            raise Exception(f"Invalid application ID format: {application_id}")
        
        application = await self.collection.find_one({"_id": obj_id})
        
        if not application:
            return None
        
        return self._convert_to_response_dto(application)
    
    async def get_application_data_dict(
        self,
        application_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get raw application data as dictionary (for eligibility analysis).
        
        Args:
            application_id: Application identifier
            
        Returns:
            Application data dictionary if found, None otherwise
        """
        try:
            obj_id = ObjectId(application_id)
        except Exception:
            raise Exception(f"Invalid application ID format: {application_id}")
        
        application = await self.collection.find_one({"_id": obj_id})
        
        if not application:
            return None
        
        # Return only the application data fields (not metadata)
        return {
            "business_info": application.get("business_info", {}),
            "credit_info": application.get("credit_info", {}),
            "loan_details": application.get("loan_details", {}),
            "equipment_info": application.get("equipment_info", {}),
            "contact_info": application.get("contact_info", {}),
            "additional_notes": application.get("additional_notes")
        }
    
    async def list_applications(
        self,
        skip: int = 0,
        limit: int = 50
    ) -> List[LoanApplicationResponseDTO]:
        """
        List applications with pagination.
        
        Args:
            skip: Number of applications to skip
            limit: Maximum number of applications to return
            
        Returns:
            List of application DTOs
        """
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        applications = await cursor.to_list(length=limit)
        
        return [
            self._convert_to_response_dto(app)
            for app in applications
        ]
    
    async def update_application_status(
        self,
        application_id: str,
        status: str
    ) -> bool:
        """
        Update application status.
        
        Args:
            application_id: Application identifier
            status: New status
            
        Returns:
            True if updated, False if not found
            
        Raises:
            Exception: If ID is invalid
        """
        try:
            obj_id = ObjectId(application_id)
        except Exception:
            raise Exception(f"Invalid application ID format: {application_id}")
        
        result = await self.collection.update_one(
            {"_id": obj_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0
    
    async def delete_application(
        self,
        application_id: str
    ) -> bool:
        """
        Delete an application.
        
        Args:
            application_id: Application identifier
            
        Returns:
            True if deleted, False if not found
            
        Raises:
            Exception: If ID is invalid
        """
        try:
            obj_id = ObjectId(application_id)
        except Exception:
            raise Exception(f"Invalid application ID format: {application_id}")
        
        result = await self.collection.delete_one({"_id": obj_id})
        return result.deleted_count > 0
    
    def _convert_to_response_dto(
        self,
        application: Dict[str, Any]
    ) -> LoanApplicationResponseDTO:
        """
        Convert database document to response DTO.
        
        Args:
            application: Application document from database
            
        Returns:
            LoanApplicationResponseDTO instance
        """
        # Convert ObjectId to string
        application["_id"] = str(application["_id"])
        
        return LoanApplicationResponseDTO(**application)


def get_loan_application_service(database: AsyncIOMotorDatabase) -> LoanApplicationService:
    """
    Factory function to create LoanApplicationService instance.
    
    Args:
        database: MongoDB database instance
        
    Returns:
        LoanApplicationService instance
    """
    return LoanApplicationService(database)
