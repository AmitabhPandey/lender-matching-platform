# Lender Matching Platform

An intelligent platform for matching loan applications with suitable lenders using AI-powered eligibility evaluation and PDF-based criteria extraction.

## Overview

The Lender Matching Platform automates the process of evaluating loan applications against multiple lenders' criteria. It leverages Google Gemini AI to:

- **Extract lending criteria** from PDF documents automatically
- **Evaluate loan applications** against lender requirements in parallel
- **Provide detailed reasoning** for matches and mismatches
- **Suggest improvements** for rejected applications

### Key Features

- 🤖 **AI-Powered PDF Processing**: Automatically extract and structure lending criteria from PDF documents
- 📊 **Intelligent Matching**: Parallel evaluation of applications against all lenders with confidence scoring
- 🔍 **Detailed Analysis**: Criteria-by-criteria evaluation with reasoning and improvement suggestions
- 💼 **Flexible Criteria System**: Support for any data type (numbers, strings, booleans, arrays)
- 🚀 **Modern Stack**: FastAPI backend with React TypeScript frontend
- 📱 **Responsive UI**: Clean, intuitive interface for managing lenders and applications

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Lender     │  │  Criteria    │  │ Application  │     │
│  │  Management  │  │  Management  │  │  Evaluation  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Lender     │  │     PDF      │  │ Eligibility  │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                            │                                 │
│                            ▼                                 │
│                   ┌─────────────────┐                       │
│                   │  Google Gemini  │                       │
│                   │    AI (2.5)     │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                            ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    └──────────────┘
```

### Tech Stack

**Backend:**
- FastAPI 0.115.5 (Python 3.13+)
- MongoDB with Motor (async driver)
- Google Gemini 2.5 Flash AI
- Pydantic for validation

**Frontend:**
- React 18.3
- TypeScript 5.3
- React Router 6
- React Query (TanStack)
- Vite 5

## Quick Start

### Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher
- MongoDB (local or cloud instance)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/AmitabhPandey/lender-matching-platform.git
cd lender-matching-platform
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URL=mongodb://localhost:27017
# - DATABASE_NAME=lender_matching_db
# - GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# The frontend will connect to backend at http://localhost:8000 by default
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud instance
# Update MONGODB_URL in backend/.env accordingly
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend API will be available at:
- API: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:3000

## Development Workflow

### Running in Development Mode

Both backend and frontend support hot-reload for rapid development:

**Backend (FastAPI):**
- Automatic reload on code changes
- Interactive API documentation at `/docs`
- Logging enabled for debugging

**Frontend (Vite + React):**
- Instant hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking

### Project Structure

```
lender-matching-platform/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/        # API endpoints
│   │   ├── core/              # Configuration and database
│   │   ├── dto/               # Data Transfer Objects (Pydantic)
│   │   ├── prompts/           # AI prompts for Gemini
│   │   └── services/          # Business logic
│   ├── main.py                # Application entry point
│   └── requirements.txt       # Python dependencies
│
└── frontend/                  # React TypeScript frontend
    ├── src/
    │   ├── api/              # API client services
    │   ├── components/       # Reusable UI components
    │   ├── hooks/            # Custom React hooks
    │   ├── pages/            # Page components
    │   └── types/            # TypeScript type definitions
    └── package.json          # Node dependencies
```

## API Documentation

### Core Endpoints

#### Lender Management

```http
POST   /api/lender/create              # Create a new lender
GET    /api/lender/list                # List all lenders
GET    /api/lender/search?q=query      # Search lenders
GET    /api/lender/get/{id}            # Get lender details
PUT    /api/lender/update/{id}         # Update lender
DELETE /api/lender/delete/{id}         # Delete lender
POST   /api/lender/upload-pdf          # Upload PDF and extract criteria
```

#### Criteria Management

```http
POST   /api/criteria/create            # Create criteria
GET    /api/criteria/lender/{id}       # Get lender's criteria
PUT    /api/criteria/update/{id}       # Update criteria
DELETE /api/criteria/delete/{id}       # Delete criteria
```

#### Loan Application Evaluation

```http
POST   /api/application/evaluate       # Evaluate loan application
```

### Example: Create Lender

**Request:**
```bash
curl -X POST "http://localhost:8000/api/lender/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Capital",
    "contact": {
      "representative": "John Doe",
      "email": "john@abccapital.com",
      "phone": "+1-555-0123"
    },
    "business_model": {
      "is_broker": false,
      "supports_startups": true,
      "decision_turnaround_days": 5
    }
  }'
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "ABC Capital",
  "contact": {
    "representative": "John Doe",
    "email": "john@abccapital.com",
    "phone": "+1-555-0123"
  },
  "business_model": {
    "is_broker": false,
    "supports_startups": true,
    "decision_turnaround_days": 5
  },
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Example: Upload PDF for Criteria Extraction

**Request:**
```bash
curl -X POST "http://localhost:8000/api/lender/upload-pdf" \
  -F "file=@lending_criteria.pdf" \
  -F "lender_id=507f1f77bcf86cd799439011"
```

**Response:**
```json
{
  "lender_id": "507f1f77bcf86cd799439011",
  "criteria_extracted": 15,
  "criteria": [
    {
      "criteria_key": "minimum_credit_score",
      "criteria_value": 650,
      "criteria_type": "number",
      "display_name": "Minimum Credit Score",
      "description": "Minimum FICO score required for eligibility",
      "category": "credit",
      "is_required": true
    }
  ]
}
```

### Example: Evaluate Loan Application

**Request:**
```bash
curl -X POST "http://localhost:8000/api/application/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "business": {
      "name": "Tech Startup Inc",
      "industry": "Technology",
      "years_in_business": 2,
      "annual_revenue": 500000
    },
    "loan": {
      "amount_requested": 100000,
      "purpose": "Equipment purchase",
      "term_months": 36
    },
    "owner": {
      "credit_score": 720,
      "years_experience": 5
    }
  }'
```

**Response:**
```json
{
  "application_id": "app_123",
  "matched_lenders": [
    {
      "lender_id": "507f1f77bcf86cd799439011",
      "lender_name": "ABC Capital",
      "confidence_score": 0.85,
      "overall_reasoning": "Strong match with high credit score and adequate revenue",
      "criteria_evaluations": [
        {
          "criteria_key": "minimum_credit_score",
          "display_name": "Minimum Credit Score",
          "required_value": 650,
          "actual_value": 720,
          "met": true,
          "reasoning": "Credit score of 720 exceeds minimum requirement of 650"
        }
      ],
      "improvement_suggestions": []
    }
  ],
  "unmatched_lenders": [],
  "total_lenders_evaluated": 5,
  "analysis_timestamp": "2024-01-01T12:00:00Z"
}
```

## Database Schema

### Lenders Collection

```javascript
{
  _id: ObjectId,
  name: String,
  contact: {
    representative: String,
    email: String,
    phone: String
  },
  business_model: {
    is_broker: Boolean,
    supports_startups: Boolean,
    decision_turnaround_days: Number
  },
  created_at: DateTime,
  updated_at: DateTime
}
```

### Criteria Collection

```javascript
{
  _id: ObjectId,
  lender_id: String,
  criteria_key: String,
  criteria_value: Any,              // Flexible: number, string, boolean, array
  criteria_type: String,            // "number", "string", "boolean", "array"
  display_name: String,
  description: String,
  category: String,                 // e.g., "credit", "business", "loan_parameters"
  is_required: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Key Features in Detail

### 1. AI-Powered PDF Processing

Upload lender criteria documents (PDF format) and let Google Gemini automatically:
- Extract lending requirements
- Structure data into typed criteria
- Categorize requirements
- Identify required vs. optional criteria

### 2. Parallel Eligibility Evaluation

The system evaluates loan applications against all lenders simultaneously:
- Async processing for optimal performance
- Individual criteria evaluation with reasoning
- Confidence scoring for each match
- Detailed improvement suggestions for mismatches

### 3. Flexible Criteria System

Support for diverse lending requirements:
- **Numbers**: Credit scores, revenue, loan amounts
- **Strings**: Industry types, business structures
- **Booleans**: Startup support, collateral requirements
- **Arrays**: Accepted industries, geographic regions

### 4. Comprehensive Admin Interface

Manage the entire lending ecosystem:
- Create and edit lenders
- View and modify criteria
- Upload PDFs for automatic extraction
- Review evaluation results

## Configuration

### Environment Variables

**Backend (.env):**
```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=lender_matching_db

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
LOG_LEVEL=INFO
```

**Frontend:**
The frontend connects to the backend API at `http://localhost:8000` by default. To change this, modify `src/api/client.ts`.

## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify MongoDB is running
- Check Python version (3.13+ required)
- Ensure all environment variables are set in `.env`
- Check if port 8000 is available

**Frontend won't start:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (18+ required)
- Ensure backend is running

**PDF upload fails:**
- Verify Gemini API key is valid
- Check PDF file is not encrypted
- Ensure file size is reasonable (<10MB)

**Criteria extraction is inaccurate:**
- Ensure PDF contains structured lending criteria
- Try adjusting prompts in `backend/app/prompts/pdf_extraction.py`
- Consider pre-processing complex PDFs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/AmitabhPandey/lender-matching-platform).

---

Built with ❤️ using FastAPI, React, and Google Gemini AI
