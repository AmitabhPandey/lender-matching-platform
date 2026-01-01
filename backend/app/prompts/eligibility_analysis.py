"""Prompts for loan eligibility analysis using Gemini."""
from typing import Dict, Any, List


def get_eligibility_analysis_prompt(
    application_data: Dict[str, Any],
    lender_name: str,
    lender_criteria: List[Dict[str, Any]]
) -> str:
    """
    Get the prompt for analyzing loan application eligibility against lender criteria.
    
    Args:
        application_data: Complete loan application data
        lender_name: Name of the lender
        lender_criteria: List of criteria from the lender
        
    Returns:
        Formatted prompt string
    """
    
    # Format criteria for the prompt
    criteria_text = "\n".join([
        f"  - {c['display_name']} ({c['criteria_key']}): "
        f"{c['criteria_value']} "
        f"[Type: {c.get('criteria_type', 'string')}, "
        f"Required: {c.get('is_required', True)}, "
        f"Category: {c.get('category', 'general')}]"
        for c in lender_criteria
    ])
    
    return f"""
You are a lending criteria analyst. Analyze this loan application against the lender's criteria.

LOAN APPLICATION DATA:
{format_application_data(application_data)}

LENDER: {lender_name}

LENDER CRITERIA:
{criteria_text}

ANALYSIS INSTRUCTIONS:
1. Evaluate EACH criterion against the application data
2. Determine if the criterion is MET or NOT MET
3. Provide specific reasoning for each evaluation
4. Calculate an overall confidence score (0.0 to 1.0)
5. Provide improvement suggestions if criteria are not met

IMPORTANT EVALUATION RULES:
- For minimum values (min_fico_score, min_years_in_business, etc.), application value must be >= required value
- For maximum values (max_loan_amount, max_equipment_age, etc.), application value must be <= required value
- For boolean flags (allows_bankruptcy, allows_judgments, etc.), check if application conflicts
- For arrays/lists (excluded_industries, excluded_states, etc.), check if application value is NOT in the list
- For credit ratings (A, B, C, D, E), map FICO scores appropriately
- Consider both required AND optional criteria
- If criteria information is missing from lender, be lenient but note it

RESPONSE FORMAT (JSON only, no markdown):
{{
  "overall_match": true/false,
  "confidence_score": 0.85,
  "overall_reasoning": "Brief summary of why matched or not matched",
  "criteria_evaluations": [
    {{
      "criteria_key": "min_fico_score",
      "display_name": "Minimum FICO Score",
      "required_value": 680,
      "actual_value": 720,
      "met": true,
      "reasoning": "FICO score of 720 exceeds the minimum requirement of 680 by 40 points, showing strong creditworthiness"
    }}
  ],
  "improvement_suggestions": [
    "Increase down payment to 15% to improve approval odds",
    "Provide additional documentation of business revenue"
  ]
}}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no additional text.
"""


def format_application_data(data: Dict[str, Any]) -> str:
    """
    Format application data for the prompt.
    
    Args:
        data: Application data dictionary
        
    Returns:
        Formatted string representation
    """
    business = data.get('business_info', {})
    credit = data.get('credit_info', {})
    loan = data.get('loan_details', {})
    equipment = data.get('equipment_info', {})
    contact = data.get('contact_info', {})
    
    return f"""
Business Information:
  - Name: {business.get('business_name', 'N/A')}
  - Type: {business.get('business_type', 'N/A')}
  - Industry: {business.get('industry', 'N/A')}
  - Years in Business: {business.get('years_in_business', 'N/A')}
  - Annual Revenue: ${business.get('annual_revenue', 0):,.2f}
  - Employees: {business.get('number_of_employees', 'N/A')}

Credit Information:
  - FICO Score: {credit.get('fico_score', 'N/A')}
  - PayNet Score: {credit.get('paynet_score', 'N/A')}
  - Has Bankruptcy: {credit.get('has_bankruptcy', False)}
  - Bankruptcy Discharge: {credit.get('bankruptcy_discharge_date', 'N/A')}
  - Has Judgments: {credit.get('has_judgments', False)}
  - Has Foreclosure: {credit.get('has_foreclosure', False)}
  - Has Repossession: {credit.get('has_repossession', False)}

Loan Details:
  - Requested Amount: ${loan.get('requested_amount', 0):,.2f}
  - Down Payment: ${loan.get('down_payment', 0):,.2f}
  - Down Payment %: {(loan.get('down_payment', 0) / loan.get('requested_amount', 1) * 100):.1f}%
  - Loan Term: {loan.get('loan_term_months', 'N/A')} months
  - Purpose: {loan.get('loan_purpose', 'N/A')}

Equipment Information:
  - Type: {equipment.get('equipment_type', 'N/A')}
  - Category: {equipment.get('equipment_category', 'N/A')}
  - Age: {equipment.get('equipment_age_years', 'N/A')} years
  - Condition: {equipment.get('equipment_condition', 'N/A')}
  - Purchase Type: {equipment.get('purchase_type', 'N/A')}
  - Mileage: {equipment.get('equipment_mileage', 'N/A')}

Location:
  - State: {contact.get('state', 'N/A')}
"""
