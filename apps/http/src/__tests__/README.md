# HTTP API Tests

Comprehensive test suite for all API routes including authentication, meetings, and chat functionality.

## Test Coverage

### Auth Routes (`auth.test.ts`)
- ✅ **POST /auth/signup**
  - Create user with valid data
  - Reject existing email
  - Validate email format
  - Validate password length (min 6 chars)
  - Require name field

- ✅ **POST /auth/login**
  - Login with valid credentials
  - Reject invalid credentials
  - Reject wrong password
  - Prevent OAuth users from password login

- ✅ **POST /auth/google-auth**
  - Create new user via Google OAuth
  - Link Google account to existing user
  - Validate required fields

### Meeting Routes (`meeting.test.ts`)
- ✅ **GET /meeting/**
  - List user's recordings
  - Return empty array when no recordings

- ✅ **GET /meeting/:id**
  - Return recording details for owner
  - Deny access to non-owner
  - Return 404 for non-existent recording

- ✅ **GET /meeting/:id/status**
  - Return recording and transcript status
  - Deny access to non-owner

- ✅ **POST /meeting/join**
  - Create recording and queue join request
  - Validate URL format
  - Require link field

### Chat Routes (`chat.test.ts`)
- ✅ **POST /chat/start**
  - Create chat session for owned recording
  - Deny access to non-owned recording
  - Validate UUID format
  - Require recordingId

- ✅ **POST /chat/message**
  - Send message and get AI response
  - Deny access to non-owned chat
  - Return 403 for non-existent chat
  - Return 404 when transcript not found
  - Validate message is not empty
  - Validate chatId UUID format

- ✅ **GET /chat/**
  - List user's chats
  - Filter by recordingId
  - Return empty array when no chats

- ✅ **GET /chat/:chatId**
  - Return chat with messages for owner
  - Deny access to non-owned chat
  - Return 404 for non-existent chat

### Middleware (`middleware.test.ts`)
- ✅ **Auth Middleware**
  - Allow valid JWT token
  - Reject missing authorization header
  - Reject invalid authorization format
  - Reject missing token
  - Reject invalid token
  - Reject expired token
  - Reject token with wrong secret

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Statistics

- **Total Test Suites**: 4
- **Total Tests**: 45
- **All Passing**: ✅

## Technologies Used

- **Jest**: Testing framework
- **Supertest**: HTTP assertions
- **ts-jest**: TypeScript support for Jest

## Mock Strategy

All tests use Jest mocks for:
- **Prisma Client**: Database operations
- **Redis**: Queue operations
- **Langchain**: AI responses
- **Auth Middleware**: User authentication

This ensures tests run fast and don't require external dependencies.
