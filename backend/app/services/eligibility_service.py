"""Service for evaluating loan application eligibility using Gemini API."""
import json
import asyncio
from typing import Dict, Any, List, Tuple
from datetime import datetime
import httpx
from app.core.config import get_settings
from app.prompts.eligibility_analysis import get_eligibility_analysis_prompt
from app.dto.loan_application import (
    LenderMatchDTO,
    CriteriaEvaluationDTO,
    EligibilityResultDTO
)

settings = get_settings()


class EligibilityService:
    """Service to handle loan eligibility evaluation using Gemini API."""
    
    def __init__(self):
        """Initialize service with API configuration."""
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.5-flash:generateContent?key={settings.gemini_api_key}"
        )
        self.generation_config = {
            "temperature": 0.2,  # Low temperature for more consistent analysis
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 8192,  # Sufficient for detailed analysis
            "responseMimeType": "application/json",  # Force JSON output
        }
    
    async def evaluate_application(
        self,
        application_id: str,
        application_data: Dict[str, Any],
        lenders_with_criteria: List[Dict[str, Any]]
    ) -> EligibilityResultDTO:
        """
        Evaluate loan application against all lenders in parallel.
        
        Args:
            application_id: Application identifier
            application_data: Complete application data
            lenders_with_criteria: List of lenders with their criteria
            
        Returns:
            EligibilityResultDTO with matched and unmatched lenders
            
        Raises:
            Exception: If evaluation fails
        """
        # Create async tasks for parallel evaluation
        evaluation_tasks = [
            self._evaluate_single_lender(application_data, lender)
            for lender in lenders_with_criteria
        ]
        
        # Execute all evaluations in parallel
        evaluation_results = await asyncio.gather(*evaluation_tasks, return_exceptions=True)
        
        # Separate matched and unmatched lenders
        matched_lenders = []
        unmatched_lenders = []
        
        for result in evaluation_results:
            # Handle any exceptions from individual evaluations
            if isinstance(result, Exception):
                print(f"Error evaluating lender: {str(result)}")
                continue
            
            if result.confidence_score >= 0.5:  # Threshold for matching
                matched_lenders.append(result)
            else:
                unmatched_lenders.append(result)
        
        # Sort by confidence score (highest first)
        matched_lenders.sort(key=lambda x: x.confidence_score, reverse=True)
        unmatched_lenders.sort(key=lambda x: x.confidence_score, reverse=True)
        
        return EligibilityResultDTO(
            application_id=application_id,
            matched_lenders=matched_lenders,
            unmatched_lenders=unmatched_lenders,
            analysis_timestamp=datetime.utcnow(),
            total_lenders_evaluated=len(lenders_with_criteria)
        )
    
    async def _evaluate_single_lender(
        self,
        application_data: Dict[str, Any],
        lender_data: Dict[str, Any]
    ) -> LenderMatchDTO:
        """
        Evaluate application against a single lender using Gemini.
        
        Args:
            application_data: Complete application data
            lender_data: Lender info with criteria
            
        Returns:
            LenderMatchDTO with evaluation results
            
        Raises:
            Exception: If Gemini API call fails
        """
        lender_id = str(lender_data.get('_id', ''))
        lender_name = lender_data.get('name', 'Unknown Lender')
        criteria = lender_data.get('criteria', [])
        
        # Generate prompt for this lender
        prompt = get_eligibility_analysis_prompt(
            application_data=application_data,
            lender_name=lender_name,
            lender_criteria=criteria
        )
        
        # Prepare request body
        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": self.generation_config
        }
        
        try:
            # Make async API call to Gemini
            async with httpx.AsyncClient(timeout=60.0, verify=False) as client:
                response = await client.post(
                    self.api_url,
                    json=request_body,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                # Parse Gemini response
                result = response.json()
                response_text = self._extract_text_from_response(result)
                
                # Clean and parse JSON
                cleaned_text = self._clean_response_text(response_text)
                
                # Try to parse JSON with better error handling
                try:
                    analysis = json.loads(cleaned_text)
                except json.JSONDecodeError as e:
                    # Log the problematic response for debugging
                    print(f"[ERROR] JSON parsing failed for {lender_name}")
                    print(f"[ERROR] Response text: {cleaned_text[:500]}...")
                    print(f"[ERROR] Error: {str(e)}")
                    
                    # Try to fix common JSON issues
                    cleaned_text = self._fix_json_issues(cleaned_text)
                    analysis = json.loads(cleaned_text)
                
                # Convert to DTO
                return self._convert_to_lender_match_dto(
                    lender_id=lender_id,
                    lender_name=lender_name,
                    analysis=analysis
                )
                
        except httpx.HTTPStatusError as e:
            raise Exception(
                f"Gemini API error for {lender_name}: "
                f"{e.response.status_code} - {e.response.text}"
            )
        except json.JSONDecodeError as e:
            raise Exception(
                f"Failed to parse Gemini response for {lender_name}: {str(e)}"
            )
        except Exception as e:
            raise Exception(
                f"Error evaluating {lender_name}: {str(e)}"
            )
    
    def _extract_text_from_response(self, result: Dict[str, Any]) -> str:
        """
        Extract text content from Gemini API response.
        
        Args:
            result: Raw API response
            
        Returns:
            Extracted text content
            
        Raises:
            Exception: If response format is unexpected
        """
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                text_parts = candidate["content"]["parts"]
                return "".join(part.get("text", "") for part in text_parts)
        
        raise Exception("Unexpected response format from Gemini API")
    
    def _clean_response_text(self, text: str) -> str:
        """
        Clean response text by removing markdown code blocks.
        
        Args:
            text: Raw response text from Gemini
            
        Returns:
            Cleaned text ready for JSON parsing
        """
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        
        if text.endswith("```"):
            text = text[:-3]
        
        return text.strip()
    
    def _convert_to_lender_match_dto(
        self,
        lender_id: str,
        lender_name: str,
        analysis: Dict[str, Any]
    ) -> LenderMatchDTO:
        """
        Convert Gemini analysis to LenderMatchDTO.
        
        Args:
            lender_id: Lender identifier
            lender_name: Lender name
            analysis: Parsed analysis from Gemini
            
        Returns:
            LenderMatchDTO instance
        """
        # Extract criteria evaluations
        criteria_evals = []
        for crit in analysis.get('criteria_evaluations', []):
            criteria_evals.append(
                CriteriaEvaluationDTO(
                    criteria_key=crit.get('criteria_key', ''),
                    display_name=crit.get('display_name', ''),
                    required_value=crit.get('required_value'),
                    actual_value=crit.get('actual_value'),
                    met=crit.get('met', False),
                    reasoning=crit.get('reasoning', '')
                )
            )
        
        # Determine confidence score based on overall match
        overall_match = analysis.get('overall_match', False)
        base_confidence = analysis.get('confidence_score', 0.5)
        
        # Adjust confidence: if not matched, ensure confidence is below 0.5
        if not overall_match and base_confidence >= 0.5:
            base_confidence = 0.4
        elif overall_match and base_confidence < 0.5:
            base_confidence = 0.6
        
        return LenderMatchDTO(
            lender_id=lender_id,
            lender_name=lender_name,
            confidence_score=base_confidence,
            overall_reasoning=analysis.get('overall_reasoning', ''),
            criteria_evaluations=criteria_evals,
            improvement_suggestions=analysis.get('improvement_suggestions', [])
        )


# Singleton instance
eligibility_service = EligibilityService()
