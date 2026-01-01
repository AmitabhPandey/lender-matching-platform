"""Service for processing PDF documents using Gemini API."""
import json
import base64
import httpx
from app.core.config import get_settings
from app.prompts.pdf_extraction import get_criteria_extraction_prompt

settings = get_settings()


class PDFProcessingService:
    """Service to handle PDF processing and criteria extraction using Gemini REST API."""
    
    def __init__(self):
        """Initialize service with API configuration."""
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.5-flash:generateContent?key={settings.gemini_api_key}"
        )
        self.generation_config = {
            "temperature": 0.1,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 65536,
        }
    
    async def extract_criteria_from_pdf(
        self, 
        pdf_content: bytes, 
    ) -> dict:
        """
        Extract lending criteria from PDF using Gemini API.
        
        Args:
            pdf_content: PDF file content as bytes
            lender_name: Name of the lender
            
        Returns:
            Dictionary containing extracted lender info and criteria
            
        Raises:
            ValueError: If JSON parsing fails
            Exception: If Gemini API call fails
        """
        prompt = get_criteria_extraction_prompt()
        
        # Encode PDF to base64
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        # Prepare request body
        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": pdf_base64
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": self.generation_config
        }
        
        try:
            # Make API call with SSL verification disabled
            async with httpx.AsyncClient(timeout=120.0, verify=False) as client:
                response = await client.post(
                    self.api_url,
                    json=request_body,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                # Parse response
                result = response.json()
                
                # Extract text from response
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        text_parts = candidate["content"]["parts"]
                        response_text = "".join(
                            part.get("text", "") for part in text_parts
                        )
                    else:
                        raise Exception("Unexpected response format from Gemini API")
                else:
                    raise Exception("No candidates returned from Gemini API")
                
                # Clean and parse JSON
                cleaned_text = self._clean_response_text(response_text)
                extracted_data = json.loads(cleaned_text)
                
                return extracted_data
                
        except httpx.HTTPStatusError as e:
            raise Exception(
                f"Gemini API HTTP error: {e.response.status_code} - {e.response.text}"
            )
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Failed to parse Gemini response as JSON: {str(e)}\n"
                f"Response: {cleaned_text[:500] if 'cleaned_text' in locals() else 'N/A'}..."
            )
        except Exception as e:
            raise Exception(f"Error processing PDF with Gemini: {str(e)}")
    
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


# Singleton instance
pdf_service = PDFProcessingService()
