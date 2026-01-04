# Test Suite Documentation

## Overview
This test suite covers the core functionality of the Regulie SaaS application, including authentication, usage limits, client management, parent features, and data models.

## Test Project Structure

```
backend/Regulie.Tests/
├── AuthServiceTests.cs         # Authentication service tests
├── UsageLimitServiceTests.cs   # Usage limit enforcement tests
├── ModelTests.cs               # Data model tests
└── IntegrationTests.cs         # API endpoint integration tests
```

## Running Tests

### Run All Tests
```bash
cd backend/Regulie.Tests
dotnet test
```

### Run with Detailed Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

### Run Specific Test Class
```bash
dotnet test --filter "FullyQualifiedName~AuthServiceTests"
```

## Test Coverage

### 1. Authentication Tests (`AuthServiceTests.cs`)

#### `RegisterAsync_ValidRequest_CreatesUser`
- **Purpose**: Verifies user registration creates a new user account
- **Tests**: 
  - User creation with valid data
  - Password hashing
  - JWT token generation
  - Email uniqueness

#### `RegisterAsync_DuplicateEmail_ThrowsException`
- **Purpose**: Ensures duplicate email registration is prevented
- **Tests**: Exception thrown for duplicate emails

#### `LoginAsync_ValidCredentials_ReturnsToken`
- **Purpose**: Verifies successful login with correct credentials
- **Tests**:
  - User lookup by email
  - Password verification using BCrypt
  - JWT token generation

#### `LoginAsync_InvalidPassword_ThrowsException`
- **Purpose**: Ensures invalid credentials are rejected
- **Tests**: UnauthorizedAccessException thrown for wrong password

### 2. Usage Limit Tests (`UsageLimitServiceTests.cs`)

#### `CanCreateClient_FreeUser_WithinLimit_ReturnsTrue`
- **Purpose**: Verifies free tier users can create clients within limit (3 max)
- **Tests**:
  - User tier detection
  - Client count calculation
  - Limit enforcement

#### `CanCreateClient_FreeUser_AtLimit_ReturnsFalse`
- **Purpose**: Ensures free tier users are blocked at limit
- **Tests**:
  - Limit reached detection
  - False returned when at max clients

### 3. Model Tests (`ModelTests.cs`)

#### Client Model Tests
- `Client_NewInstance_HasEmptyParentUserIds`: Verifies parent list initialization
- `Client_AddGoal_SuccessfullyAddsGoal`: Tests goal creation and addition
- `ClientGoal_NewInstance_HasDefaultValues`: Validates default goal properties

#### Session Model Tests
- `Session_NewInstance_HasEmptyHomeActivities`: Verifies home activity list initialization
- `Session_AddHomeActivity_SuccessfullyAdds`: Tests home activity creation
- `HomeActivity_MarkComplete_UpdatesCompletedStatus`: Tests parent completion marking

#### User Model Tests
- `User_NewTherapist_HasFreeSubscriptionByDefault`: Validates default subscription tier
- `User_ParentRole_CanBeCreated`: Ensures parent users can be created

### 4. Integration Tests (`IntegrationTests.cs`)

#### Auth Endpoint Tests
- `Register_ValidRequest_ReturnsToken`: Full registration flow test
- `Login_ValidCredentials_ReturnsToken`: Full login flow test
- `Login_InvalidPassword_ReturnsUnauthorized`: Error handling test

#### Client Endpoint Tests
- `CreateClient_Authenticated_CreatesClient`: Client creation with auth
- `GetClients_Authenticated_ReturnsClientList`: Client retrieval test

#### Usage Endpoint Tests
- `GetUsageSummary_Authenticated_ReturnsUsage`: Usage metrics retrieval

## Manual Testing Checklist

### User Registration & Authentication
- [ ] Register new therapist account
- [ ] Register new parent account
- [ ] Login with therapist credentials
- [ ] Login with parent credentials
- [ ] Logout functionality
- [ ] Invalid credentials rejection
- [ ] Duplicate email prevention

### Client Management (Therapist)
- [ ] Create new client
- [ ] View client list
- [ ] View client details
- [ ] Edit client information
- [ ] Add goals to client
- [ ] Update goal progress
- [ ] Delete client

### Session Documentation (Therapist)
- [ ] Create new session for client
- [ ] Use session template
- [ ] Add activities done
- [ ] Update goal progress in session
- [ ] Add observations and next steps
- [ ] Add home activities for parents
- [ ] Attach media to session
- [ ] Mark session as shared with parents
- [ ] View session history

### Parent Invitation & Linking
- [ ] **Invite parent to client** (NEW FEATURE)
- [ ] Verify parent receives invite email
- [ ] Parent can login with temporary password
- [ ] View linked parents on client page
- [ ] Remove parent from client

### Parent Portal
- [ ] Parent views linked children
- [ ] Parent views child's goals
- [ ] Parent views shared sessions
- [ ] Parent views home activities
- [ ] **Parent marks home activity as complete** (NEW FEATURE)
- [ ] Parent adds notes to home activity

### Usage Limits (Free Tier)
- [ ] Create 3 clients (max for free)
- [ ] Attempt to create 4th client (should fail)
- [ ] Create 15 sessions in a month (max for free)
- [ ] Attempt to create 16th session (should fail)
- [ ] Upload files up to 250MB
- [ ] Attempt to exceed storage limit (should fail)
- [ ] View usage meter on dashboard
- [ ] Usage meter shows correct counts

### Subscription Management
- [ ] View current subscription tier
- [ ] Navigate to upgrade page
- [ ] Click "Upgrade to Professional"
- [ ] Redirected to Stripe checkout (test mode)
- [ ] Complete test payment
- [ ] Subscription tier updated
- [ ] Usage limits increased
- [ ] Access customer portal
- [ ] Cancel subscription
- [ ] Reactivate subscription

### Email Notifications
- [ ] Parent invite email sent
- [ ] Session shared email sent
- [ ] Welcome email on registration
- [ ] Password reset email

### Data Export & Reports
- [ ] Generate progress report (PDF)
- [ ] Generate monthly summary (PDF)
- [ ] Export all data (JSON)
- [ ] Download generated PDFs
- [ ] View reports page

### Analytics & Charts
- [ ] View analytics dashboard
- [ ] Goal progress chart displays correctly
- [ ] Session distribution chart displays
- [ ] Filter analytics by date range
- [ ] Export analytics data

### Calendar View
- [ ] View sessions in calendar
- [ ] Navigate between months
- [ ] Click session to view details
- [ ] Create session from calendar

### Media Upload (S3/MinIO)
- [ ] Upload image to session
- [ ] Upload video to session
- [ ] Upload audio to session
- [ ] Download uploaded media
- [ ] Delete media file
- [ ] Storage usage updates

### Voice Recording
- [ ] Record audio in session form
- [ ] Play back recorded audio
- [ ] Stop recording
- [ ] Clear recording
- [ ] Upload recorded audio

### Mobile Responsiveness
- [ ] Dashboard on mobile
- [ ] Client list on mobile
- [ ] Session form on mobile
- [ ] Parent portal on mobile
- [ ] Navigation menu on mobile
- [ ] All buttons accessible

### PWA Features
- [ ] Install app prompt appears
- [ ] Install app on device
- [ ] App opens standalone
- [ ] Offline functionality (if implemented)
- [ ] Push notifications (if implemented)

## Test Data

### Sample Users
- **Therapist**: therapist@test.com / TestPassword123!
- **Parent**: parent@test.com / TestPassword123!

### Sample Client
```json
{
  "name": "Test Client",
  "dateOfBirth": "2015-01-01",
  "diagnosis": ["ASD", "SPD"],
  "diagnosisNotes": "Mild sensory processing challenges"
}
```

### Sample Goal
```json
{
  "description": "Improve fine motor skills",
  "targetDate": "2024-06-01",
  "currentLevel": 45
}
```

### Sample Session
```json
{
  "clientId": "...",
  "sessionDate": "2024-01-15",
  "durationMinutes": 45,
  "template": "OT Session",
  "activitiesDone": ["Hand strengthening", "Pencil grip practice"],
  "observations": "Good progress on grip strength",
  "nextSteps": "Continue current activities",
  "homeActivities": [
    {
      "activity": "Practice writing letters",
      "instructions": "10 minutes daily"
    }
  ],
  "sharedWithParents": true
}
```

## Known Issues & Limitations

1. **Integration Tests**: May require running database instance
2. **Email Service**: Requires Resend API key configured
3. **Stripe Payments**: Test mode only in development
4. **S3 Storage**: Requires MinIO or AWS S3 configured

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '9.0.x'
      - name: Restore dependencies
        run: dotnet restore backend/Regulie.Tests
      - name: Build
        run: dotnet build backend/Regulie.Tests
      - name: Test
        run: dotnet test backend/Regulie.Tests --no-build --verbosity normal
```

## Future Test Additions

- [ ] Template service tests
- [ ] Session service tests
- [ ] Client service tests
- [ ] Stripe payment service tests
- [ ] Email service tests
- [ ] Report generation tests
- [ ] Storage service tests
- [ ] End-to-end browser tests (Playwright/Selenium)
- [ ] Load testing
- [ ] Security testing

## Debugging Tests

### View Test Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

### Run Single Test
```bash
dotnet test --filter "FullyQualifiedName=Regulie.Tests.AuthServiceTests.RegisterAsync_ValidRequest_CreatesUser"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "name": ".NET Core Test",
  "type": "coreclr",
  "request": "launch",
  "preLaunchTask": "build",
  "program": "dotnet",
  "args": ["test", "${workspaceFolder}/backend/Regulie.Tests"],
  "console": "internalConsole"
}
```

