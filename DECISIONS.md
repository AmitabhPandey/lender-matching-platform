# Design Decisions & Architecture

This document outlines the key technical decisions, architectural choices, and trade-offs made during the development of the Lender Matching Platform.

## Table of Contents

1. [Technology Stack Rationale](#technology-stack-rationale)
2. [Architecture Decisions](#architecture-decisions)
3. [AI Integration Strategy](#ai-integration-strategy)
4. [Simplifications Made](#simplifications-made)
5. [Future Enhancements](#future-enhancements)

---

## Technology Stack Rationale

### Backend: FastAPI + Python

**Why FastAPI?**
- **Performance**: ASGI-based async framework with performance comparable to Node.js and Go
- **Type Safety**: Built-in Pydantic integration for request/response validation
- **Auto Documentation**: Automatic OpenAPI/Swagger documentation generation
- **Modern Python**: Leverages Python 3.13+ type hints and async/await
- **Developer Experience**: Intuitive API design with minimal boilerplate

**Alternatives Considered:**
- **Django REST Framework**: Too heavyweight for this use case; FastAPI provides better async support
- **Flask**: Lacks built-in async support and type validation
- **Node.js/Express**: Python chosen for better AI/ML library ecosystem

### Frontend: React + TypeScript + Vite

**Why React?**
- **Component Reusability**: Modular architecture with reusable UI components
- **Ecosystem**: Rich ecosystem with React Query for server state management
- **Developer Experience**: Excellent tooling and community support
- **Performance**: Virtual DOM for efficient updates

**Why TypeScript?**
- **Type Safety**: Catch errors at compile time, not runtime
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Self-Documenting**: Types serve as inline documentation
- **Scalability**: Easier to maintain and refactor large codebases

**Why Vite?**
- **Speed**: Lightning-fast HMR (Hot Module Replacement)
- **Modern**: Native ES modules, optimized builds
- **Simplicity**: Minimal configuration compared to Webpack

**Alternatives Considered:**
- **Next.js**: Overkill for this SPA; server-side rendering not required
- **Vue.js**: React chosen for broader talent pool and ecosystem
- **Angular**: Too opinionated and heavyweight for this project

### Database: MongoDB

**Why MongoDB?**
- **Schema Flexibility**: Criteria system requires dynamic, flexible schema
- **Document Model**: Natural fit for nested lender/criteria data
- **Easy Scaling**: Horizontal scaling with sharding
- **JSON-Native**: Seamless integration with FastAPI and React
- **Motor Driver**: Excellent async support for Python

**Key Use Case:**
The flexible criteria system (supporting any data type) aligns perfectly with MongoDB's schema-less nature. Each lender can have different criteria types without schema migrations.

**Alternatives Considered:**
- **PostgreSQL**: Would require JSONB columns or complex schema migrations for flexible criteria. Hard to Define a fixed schema as lender requirements might change/ new requirements might arise.


### AI: Google Gemini 2.5 Flash

**Why Gemini?**
- **Cost-Effective**: Only freely available API which works well at the moment 



---

## Architecture Decisions

### 1. Async/Await Throughout

**Decision:** Use async/await for all I/O operations (database, API calls, AI requests)

**Rationale:**
- **Performance**: Non-blocking I/O allows handling multiple requests concurrently
- **Scalability**: Better resource utilization under load
- **Parallel Evaluation**: Evaluate applications against multiple lenders simultaneously

**Implementation:**
- FastAPI with async route handlers
- Motor (async MongoDB driver)
- httpx for async HTTP requests to Gemini API
- asyncio.gather() for parallel lender evaluation

**Trade-offs:**
- Slightly more complex code than sync
- Requires understanding of async programming concepts

### 2. Service Layer Architecture

**Decision:** Separate business logic into dedicated service classes

**Structure:**
```
app/
├── api/routes/       # API endpoints (thin layer)
├── services/         # Business logic
├── dto/              # Data Transfer Objects
└── core/             # Config and database
```

**Rationale:**
- **Separation of Concerns**: API routes stay thin and focused
- **Testability**: Easy to unit test business logic independently
- **Reusability**: Services can be used across multiple routes
- **Maintainability**: Clear organization of responsibilities

**Example:**
- `lender_service.py`: Lender CRUD operations
- `pdf_service.py`: PDF processing with Gemini
- `eligibility_service.py`: Application evaluation logic
- `criteria_service.py`: Criteria management

### 3. DTO-Based Validation

**Decision:** Use Pydantic models for all request/response validation

**Benefits:**
- **Type Safety**: Automatic validation and type coercion
- **Documentation**: Self-documenting API with OpenAPI schema
- **Error Handling**: Clear validation error messages
- **Consistency**: Single source of truth for data structures

**Example:**
```python
class LenderCreateDTO(BaseModel):
    name: str
    contact: ContactInfoDTO
    business_model: BusinessModelDTO
```

### 4. Flexible Criteria System

**Decision:** Store criteria with dynamic types (number, string, boolean, array)

**Schema:**
```javascript
{
  criteria_key: "minimum_credit_score",
  criteria_value: 650,
  criteria_type: "number",  // Dynamic typing
  display_name: "Minimum Credit Score",
  category: "credit",
  is_required: true
}
```

**Rationale:**
- **Adaptability**: Support any lender requirement without code changes
- **Extensibility**: Easy to add new criteria types
- **AI-Friendly**: Gemini can extract diverse criteria from PDFs

**Trade-offs:**
- Loss of compile-time type checking for criteria values
- Need runtime validation during evaluation

### 5. Parallel Lender Evaluation

**Decision:** Evaluate all lenders concurrently using asyncio.gather()

**Implementation:**
```python
evaluation_tasks = [
    self._evaluate_single_lender(application_data, lender)
    for lender in lenders_with_criteria
]
results = await asyncio.gather(*evaluation_tasks)
```

**Benefits:**
- **Speed**: Evaluate 10 lenders in the time it takes to evaluate 1
- **Scalability**: Performance improves with more lenders
- **Cost-Efficient**: Maximize Gemini API throughput

**Considerations:**
- Rate limiting may be needed for very large lender counts
- Error handling for individual failures

### 6. Frontend State Management

**Decision:** Use React Query (TanStack Query) for server state

**Rationale:**
- **Caching**: Automatic caching of API responses
- **Synchronization**: Keep client state in sync with server
- **Optimistic Updates**: Better UX with optimistic UI updates
- **Developer Experience**: Less boilerplate than Redux

**Pattern:**
```typescript
const { data, isLoading, error } = useLenders();
```

**Trade-offs:**
- Adds dependency on React Query
- Requires understanding of query invalidation patterns

### 7. Component Architecture

**Decision:** Atomic design with composition

**Structure:**
- **Atoms**: Button, Input, Loading, ErrorMessage
- **Molecules**: LenderCard, CriteriaList
- **Organisms**: LenderList, Modal
- **Pages**: HomePage, LendersPage, LenderDetailPage

**Benefits:**
- **Reusability**: Components used across multiple pages
- **Consistency**: Uniform UI/UX throughout app
- **Maintainability**: Easy to update common elements

---

## AI Integration Strategy

### 1. Structured JSON Output

**Decision:** Use Gemini's JSON response mode for all AI operations

**Configuration:**
```python
generation_config = {
    "responseMimeType": "application/json"
}
```

**Benefits:**
- **Reliability**: Guaranteed valid JSON responses
- **Type Safety**: Can parse directly into Pydantic models
- **Error Reduction**: No need for regex parsing or cleanup

### 2. PDF Processing Prompts

**Decision:** Specialized prompts for criteria extraction

**Key Elements:**
- Clear instructions for extracting lending criteria
- Expected JSON schema specification
- Categorization guidance (credit, business, loan parameters)
- Type inference (number, string, boolean, array)

**Location:** `backend/app/prompts/pdf_extraction.py`

### 3. Eligibility Analysis Prompts

**Decision:** Criteria-by-criteria evaluation with reasoning

**Output Structure:**
```json
{
  "overall_match": boolean,
  "confidence_score": float,
  "criteria_evaluations": [...],
  "improvement_suggestions": [...]
}
```

**Benefits:**
- **Transparency**: Clear reasoning for each decision
- **Actionability**: Specific suggestions for improvement
- **Trust**: Users understand why applications match or don't match

**Location:** `backend/app/prompts/eligibility_analysis.py`

### 4. Temperature Settings

**Decision:** Low temperature (0.2) for consistent analysis

**Rationale:**
- **Consistency**: Similar applications get similar evaluations
- **Reliability**: Less creative output, more factual analysis
- **Compliance**: Important for financial/lending decisions

### 5. Error Handling

**Decision:** Graceful degradation with detailed error logging

**Strategy:**
- Individual lender evaluation failures don't crash entire analysis
- Return exceptions from asyncio.gather() with `return_exceptions=True`
- Log failures for monitoring and debugging

---

## Simplifications Made

### 1. Authentication & Authorization

**Current State:** No authentication implemented

**Rationale:**
- Focus on core functionality (matching logic)
- Assumes internal tool or MVP stage
- Easier to demo and test

**Production Requirement:**
- JWT-based authentication
- Role-based access control (admin, lender, borrower)
- API key management for Gemini

### 2. Database Indexing

**Current State:** Basic indexes only

**Simplification:**
- No compound indexes
- No full-text search indexes
- Basic querying without optimization

**Future Enhancement:**
- Index on `lender_id` for criteria lookups
- Text index for lender search
- Compound index for common query patterns

### 3. Error Recovery

**Current State:** Basic error handling

**Limitations:**
- No retry logic for API failures
- No circuit breaker for Gemini API
- Simple error messages without detailed logging

**Future Enhancement:**
- Exponential backoff for retries
- Circuit breaker pattern for external APIs
- Structured logging with correlation IDs

### 4. PDF Processing Limitations

**Current State:** Single PDF upload, in-memory processing

**Limitations:**
- No batch processing
- File size limits not enforced
- No support for encrypted PDFs
- No OCR for scanned documents

**Future Enhancement:**
- Queue-based batch processing
- Document preprocessing pipeline
- OCR integration for scanned documents

### 5. Caching

**Current State:** No caching layer

**Simplification:**
- Every request hits database
- No Redis or memory cache
- AI responses not cached

**Future Enhancement:**
- Redis for frequently accessed data
- Cache AI evaluations for identical applications
- CDN for static assets

### 6. Testing

**Current State:** Manual testing only

**Limitation:**
- No unit tests
- No integration tests
- No E2E tests

**Future Enhancement:**
- Pytest for backend unit/integration tests
- Jest + React Testing Library for frontend
- Playwright for E2E testing

### 7. Monitoring & Observability

**Current State:** Basic logging to console

**Limitation:**
- No structured logging
- No metrics collection
- No distributed tracing
- No error tracking (Sentry)

**Future Enhancement:**
- Structured logging with context
- Prometheus metrics
- OpenTelemetry for distributed tracing
- Sentry for error tracking

### 8. Rate Limiting

**Current State:** No rate limiting

**Risk:**
- Unbounded API calls to Gemini
- Potential cost overruns
- No protection from abuse

**Future Enhancement:**
- Rate limiting per user/IP
- Request queuing
- Cost monitoring and alerts

---

## Future Enhancements

Here are some improvements I'd like to add with more time:

### Near-Term Improvements

**1. Better Error Handling**
- Add retry logic when API calls fail
- Show more helpful error messages to users
- Add proper logging to track issues

**2. Testing**
- Write unit tests for the main services
- Add basic integration tests for API endpoints
- This will make the code more reliable and easier to maintain

**3. Authentication**
- Add user login/signup
- Protect API endpoints with JWT tokens
- Different access levels (admin vs regular user)

**4. Performance Optimization**
- Add database indexes for faster queries
- Cache frequently accessed lender data
- This will help when we have more lenders in the system

### What I'd Build Next

**5. Better Matching Features**
- Handle edge cases (like credit score 649 vs 650)
- Give partial match scores instead of just yes/no
- Show why an application didn't match and what to improve

**6. User Dashboard**
- Show stats like total applications, match rates
- List of recent evaluations
- Filter and sort results

**7. PDF Improvements**
- Support batch upload of multiple PDFs
- Better handling of complex PDF formats
- Add progress indicator for long uploads

**8. Lender Management**
- Bulk import lenders from CSV
- Templates for common lending criteria
- Better search and filtering

### Bigger Feature: Async Application Processing

**9. Background Job Processing with Kafka**

**Current Problem:** 
When a customer submits a loan application, they have to wait while we evaluate it against all lenders (which can take 30-60 seconds with many lenders). If the evaluation takes too long, the request might timeout.

**What I'd Build:**

Instead of processing immediately, I'd use Kafka to handle applications in the background:

1. **Customer submits application** → API immediately returns "Application received, we'll email you the results"
2. **Publish to Kafka** → Send application to `loan-applications` topic
3. **Worker processes it** → Separate worker service picks up the message, runs the evaluation
4. **Send email** → When done, worker sends email to customer with the matching lenders report

**Why Kafka?**
- Handles messages reliably (won't lose applications)
- Can scale by adding more workers
- Customer doesn't wait - better experience
- If worker crashes, Kafka retries automatically

**Implementation:**
- Use `aiokafka` to publish messages from FastAPI
- Build a simple worker that consumes from the topic
- Use email service (like SendGrid) to notify customers

This would make the system way more scalable and give customers a better experience.

### Why These Priorities?

I focused on features that:
- Fix current limitations (like no auth, no tests)
- Make the app more useful for real users
- Are achievable to build in reasonable time
- Include async processing to handle scale better

The goal is to build on what works and make it production-ready step by step.
