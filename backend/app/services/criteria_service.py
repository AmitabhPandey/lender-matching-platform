"""Service for managing criteria operations."""
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.core.database import get_database
from app.dto.criteria import CriteriaCreateDTO, CriteriaUpdateDTO, CriteriaResponseDTO


class CriteriaService:
    """Service to handle criteria CRUD operations."""
    
    def __init__(self):
        """Initialize service."""
        self.collection_name = "criteria"
    
    async def create_criteria(self, criteria_data: CriteriaCreateDTO) -> CriteriaResponseDTO:
        """
        Create a new criteria.
        
        Args:
            criteria_data: Criteria creation data
            
        Returns:
            Created criteria
            
        Raises:
            Exception: If creation fails
        """
        db = get_database()
        collection = db[self.collection_name]
        
        # Prepare document
        criteria_dict = criteria_data.model_dump()
        criteria_dict["created_at"] = datetime.utcnow()
        criteria_dict["updated_at"] = datetime.utcnow()
        
        try:
            result = await collection.insert_one(criteria_dict)
            criteria_dict["_id"] = str(result.inserted_id)
            
            return CriteriaResponseDTO(**criteria_dict)
            
        except Exception as e:
            raise Exception(f"Failed to create criteria: {str(e)}")
    
    async def get_criteria(self, criteria_id: str) -> Optional[CriteriaResponseDTO]:
        """
        Get a criteria by ID.
        
        Args:
            criteria_id: Criteria ID
            
        Returns:
            Criteria if found, None otherwise
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            criteria = await collection.find_one({"_id": ObjectId(criteria_id)})
            
            if criteria:
                criteria["_id"] = str(criteria["_id"])
                return CriteriaResponseDTO(**criteria)
            
            return None
            
        except Exception as e:
            raise Exception(f"Failed to fetch criteria: {str(e)}")
    
    async def get_criteria_by_lender(
        self, 
        lender_id: str,
        category: Optional[str] = None
    ) -> List[CriteriaResponseDTO]:
        """
        Get all criteria for a specific lender.
        
        Args:
            lender_id: Lender ID
            category: Optional category filter
            
        Returns:
            List of criteria
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            query = {"lender_id": lender_id}
            
            if category:
                query["category"] = category
            
            cursor = collection.find(query).sort("category", 1)
            criteria_list = await cursor.to_list(length=1000)
            
            for criteria in criteria_list:
                criteria["_id"] = str(criteria["_id"])
            
            return [CriteriaResponseDTO(**criteria) for criteria in criteria_list]
            
        except Exception as e:
            raise Exception(f"Failed to fetch criteria for lender: {str(e)}")
    
    async def update_criteria(
        self, 
        criteria_id: str, 
        criteria_data: CriteriaUpdateDTO
    ) -> Optional[CriteriaResponseDTO]:
        """
        Update a criteria.
        
        Args:
            criteria_id: Criteria ID
            criteria_data: Updated criteria data
            
        Returns:
            Updated criteria if found, None otherwise
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            # Prepare update data (exclude None values)
            update_dict = criteria_data.model_dump(exclude_none=True)
            
            if not update_dict:
                # Nothing to update
                return await self.get_criteria(criteria_id)
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await collection.find_one_and_update(
                {"_id": ObjectId(criteria_id)},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                result["_id"] = str(result["_id"])
                return CriteriaResponseDTO(**result)
            
            return None
            
        except Exception as e:
            raise Exception(f"Failed to update criteria: {str(e)}")
    
    async def delete_criteria(self, criteria_id: str) -> bool:
        """
        Delete a criteria.
        
        Args:
            criteria_id: Criteria ID
            
        Returns:
            True if deleted, False if not found
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            result = await collection.delete_one({"_id": ObjectId(criteria_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            raise Exception(f"Failed to delete criteria: {str(e)}")
    
    async def delete_criteria_by_lender(self, lender_id: str) -> int:
        """
        Delete all criteria for a specific lender.
        
        Args:
            lender_id: Lender ID
            
        Returns:
            Number of criteria deleted
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            result = await collection.delete_many({"lender_id": lender_id})
            return result.deleted_count
            
        except Exception as e:
            raise Exception(f"Failed to delete criteria for lender: {str(e)}")
    
    async def bulk_create_criteria(
        self, 
        criteria_list: List[CriteriaCreateDTO]
    ) -> List[CriteriaResponseDTO]:
        """
        Create multiple criteria at once.
        
        Args:
            criteria_list: List of criteria to create
            
        Returns:
            List of created criteria
        """
        db = get_database()
        collection = db[self.collection_name]
        
        try:
            # Prepare documents
            criteria_dicts = []
            for criteria_data in criteria_list:
                criteria_dict = criteria_data.model_dump()
                criteria_dict["created_at"] = datetime.utcnow()
                criteria_dict["updated_at"] = datetime.utcnow()
                criteria_dicts.append(criteria_dict)
            
            if not criteria_dicts:
                return []
            
            result = await collection.insert_many(criteria_dicts)
            
            # Update with IDs
            for i, inserted_id in enumerate(result.inserted_ids):
                criteria_dicts[i]["_id"] = str(inserted_id)
            
            return [CriteriaResponseDTO(**criteria) for criteria in criteria_dicts]
            
        except Exception as e:
            raise Exception(f"Failed to bulk create criteria: {str(e)}")


# Singleton instance
criteria_service = CriteriaService()
