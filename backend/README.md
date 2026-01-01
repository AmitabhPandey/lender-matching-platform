# Lender Matching Platform - Backend

FastAPI-based backend for managing lenders and their lending criteria with AI-powered PDF processing.

## Features

- **Lender Management**: Full CRUD operations for lenders
- **Criteria Management**: Flexible criteria system with support for any data type
- **PDF Processing**: AI-powered extraction of lending criteria from PDF documents using Google Gemini
- **RESTful API**: Clean, well-documented API endpoints

## Tech Stack

- **Framework**: FastAPI 0.115.5
- **Database**: MongoDB (Motor async driver)
- **AI**: Google Gemini 2.5 Flash
- **Language**: Python 3.13+

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/          # API route handlers
│   ├── core/                # Core functionality (config, database)
│   ├── dto/                 # Data Transfer Objects (Pydantic models)
│   ├── prompts/             # AI prompts for PDF extraction
│   └── services/            # Business logic layer
├── main.py                  # FastAPI application entry point
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Setup Instructions

### Prerequisites

- Python 3.13+
- MongoDB (local or cloud)
- Google Gemini API key

### Installation

1. **Create virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**:
Create a `.env` file:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=lender_matching_db
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start MongoDB**:
```bash
# If using local MongoDB
mongod
```

### Running the Application

**Development mode**:
```bash
python main.py
```

**Or with uvicorn directly**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Lenders

- `POST /api/lender/create` - Create a new lender
- `GET /api/lender/list` - List all lenders
- `GET /api/lender/search?q=query` - Search lenders
- `GET /api/lender/get/{id}` - Get lender by ID
- `PUT /api/lender/update/{id}` - Update lender
- `DELETE /api/lender/delete/{id}` - Delete lender
- `POST /api/lender/upload-pdf` - Upload PDF and extract criteria

### Criteria

- `POST /api/criteria/create` - Create a criteria
- `GET /api/criteria/lender/{lender_id}` - Get all criteria for a lender
- `PUT /api/criteria/update/{id}` - Update criteria
- `DELETE /api/criteria/delete/{id}` - Delete criteria

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
  criteria_value: Any,
  criteria_type: String,  // number, string, boolean, array
  display_name: String,
  description: String,
  category: String,  // credit, business, loan_parameters, etc.
  is_required: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Development

### Code Structure

- **DTOs** (`app/dto/`): Pydantic models for request/response validation
- **Services** (`app/services/`): Business logic and database operations
- **Routes** (`app/api/routes/`): API endpoint definitions
- **Core** (`app/core/`): Configuration and database setup

### Adding New Features

1. Define DTOs in `app/dto/`
2. Implement business logic in `app/services/`
3. Create routes in `app/api/routes/`
4. Register router in `main.py`

## Notes

- SSL verification is disabled for Gemini API calls (development only)
- PDF files are processed in-memory and not stored
- MongoDB connection uses async motor driver for better performance
