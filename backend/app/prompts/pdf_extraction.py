"""Prompts for PDF criteria extraction using Gemini."""


def get_criteria_extraction_prompt(lender_name: str) -> str:
    """
    Get the prompt for extracting lending criteria from PDF.
    
    Args:
        lender_name: Name of the lender
        
    Returns:
        Formatted prompt string
    """
    return f"""
You are analyzing a lender guidelines document for {lender_name}. 
Extract all lending criteria and requirements from this PDF document.

Please provide the extracted information in the following JSON format:

{{
  "lender_name": "string",
  "contact": {{
    "representative": "string",
    "email": "string",
    "phone": "string"
  }},
  "business_model": {{
    "is_broker": boolean,
    "supports_startups": boolean,
    "decision_turnaround_days": number
  }},
  "criteria": [
    {{
      "criteria_key": "string (e.g., 'min_fico_score')",
      "criteria_value": "any (number, string, boolean, or array)",
      "criteria_type": "string (number, string, boolean, or array)",
      "display_name": "string (human-readable name)",
      "description": "string (detailed description)",
      "category": "string (credit, business, loan_parameters, documentation, restrictions, etc.)",
      "is_required": boolean
    }}
  ]
}}

Important guidelines:
1. Extract ALL criteria mentioned in the document
2. For FICO scores, credit ranges, loan amounts, use appropriate numeric or array types
3. For yes/no questions (allows bankruptcy, judgments, etc.), use boolean values
4. Categorize criteria logically (credit, business, loan_parameters, documentation, restrictions)
5. Use snake_case for criteria_key (e.g., min_fico_score, allows_bankruptcy)
6. **IMPORTANT: If information is not available, OMIT the field entirely from the JSON. Do NOT include fields with null values.**
7. For startup-specific criteria, add "_startup" suffix to the key

Common criteria to look for:
- FICO score requirements (minimum, startup minimum)
- Credit ranges (A, B, C, etc.)
- Industry experience requirements
- Loan amount limits (min, max)
- Down payment percentages
- Loan term limits
- Collateral age/mileage restrictions
- Geographic restrictions
- Industry exclusions
- Bankruptcy/judgment/foreclosure policies
- Documentation requirements (bank statements, tax returns, etc.)
- Any other specific requirements or preferences

Return ONLY the JSON object, no additional text.
"""
