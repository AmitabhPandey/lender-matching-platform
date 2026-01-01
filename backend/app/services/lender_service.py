"""Service for managing lender operations."""
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from app.core.database import get_database
from app.dto.lender import LenderCreateDTO, LenderUpdateDTO, LenderResponseDTO


class LenderService:
    """Service to handle lender CRUD operations."""
    
    def __init__(self):
        """Initialize service."""
        self.collection_name = "lenders"
    
    async def create_lender(self, lender_data: LenderCreateDTO) -> LenderResponseDTO:
        """
        Create a new lender.
        
        Args:
            lender_data: Lender creation data
            
        Returns:
            Created lender
            
        Raises:
            Exception: If creation fails
        """
        db = get_database()
        collection = db[self.collection_name]
        
        # Prepare document
        lender_dict = lender_data.model_dump()
        lender_dict["created_at"] = datetime.utcnow()
        lender_dict["updated_at"] = datetime.utcnow()
        
        try:
            result = await collection.insert_one(lender_dict)
            lender_dict["_id"] = str(result.inserted_id)
            
            return LenderResponseDTO(**lender_dict)
            
        except DuplicateKeyError:
            raise Exception("Lender with this name already exists")
        except Exception as e:
            raise Exception(f"Failed to create lender: {str(e)}")
    
    async def get_lender(self, lender_id: str) -> Optional[LenderResponseDTO]:
        """
        Get a lender by ID.
        
        Args:
            lender_id: Lender ID
            
        Returns:
            Lender if found, None otherwise
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            lender = await collection.find_one({"_id": ObjectId(lender_id)})
            
            if lender:
                lender["_id"] = str(lender["_id"])
                return LenderResponseDTO(**lender)
            
            return None
            
        except Exception as e:
            raise Exception(f"Failed to fetch lender: {str(e)}")
    
    async def list_lenders(
        self, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[LenderResponseDTO]:
        """
        List all lenders with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of lenders
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            cursor = collection.find().skip(skip).limit(limit).sort("created_at", -1)
            lenders = await cursor.to_list(length=limit)
            
            for lender in lenders:
                lender["_id"] = str(lender["_id"])
            
            return [LenderResponseDTO(**lender) for lender in lenders]
            
        except Exception as e:
            raise Exception(f"Failed to list lenders: {str(e)}")
    
    async def update_lender(
        self, 
        lender_id: str, 
        lender_data: LenderUpdateDTO
    ) -> Optional[LenderResponseDTO]:
        """
        Update a lender.
        
        Args:
            lender_id: Lender ID
            lender_data: Updated lender data
            
        Returns:
            Updated lender if found, None otherwise
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            # Prepare update data (exclude None values)
            update_dict = lender_data.model_dump(exclude_none=True)
            
            if not update_dict:
                # Nothing to update
                return await self.get_lender(lender_id)
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await collection.find_one_and_update(
                {"_id": ObjectId(lender_id)},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                result["_id"] = str(result["_id"])
                return LenderResponseDTO(**result)
            
            return None
            
        except Exception as e:
            raise Exception(f"Failed to update lender: {str(e)}")
    
    async def delete_lender(self, lender_id: str) -> bool:
        """
        Delete a lender.
        
        Args:
            lender_id: Lender ID
            
        Returns:
            True if deleted, False if not found
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            result = await collection.delete_one({"_id": ObjectId(lender_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            raise Exception(f"Failed to delete lender: {str(e)}")
    
    async def search_lenders(self, query: str) -> List[LenderResponseDTO]:
        """
        Search lenders by name.
        
        Args:
            query: Search query
            
        Returns:
            List of matching lenders
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            cursor = collection.find({
                "name": {"$regex": query, "$options": "i"}
            }).sort("created_at", -1)
            
            lenders = await cursor.to_list(length=100)
            
            for lender in lenders:
                lender["_id"] = str(lender["_id"])
            
            return [LenderResponseDTO(**lender) for lender in lenders]
            
        except Exception as e:
            raise Exception(f"Failed to search lenders: {str(e)}")


# Singleton instance
lender_service = LenderService()
