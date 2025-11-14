# MERN Stack Testing Assignment

This project demonstrates comprehensive testing strategies for a MERN (MongoDB, Express.js, React, Node.js) stack application. It includes unit tests, integration tests, and end-to-end tests to ensure application reliability.

## Project Structure

```
mern-testing-assignment/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── tests/         # Unit tests for React
│   │   └── ...
│   ├── cypress/           # E2E tests
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── app.js         # Main application
│   ├── tests/             # Backend tests
│   └── package.json
├── package.json            # Root package.json with test scripts
└── README.md
```

## Features

### Backend (Express.js + MongoDB)
- User authentication (JWT)
- CRUD operations for posts
- Category management
- Input validation
- Error handling

### Frontend (React)
- Authentication flow
- Posts management
- Responsive UI
- Error boundaries
- Custom hooks

## Testing Strategy

### 1. Unit Testing
- **Backend**: Models, utilities, and helper functions
- **Frontend**: React components, custom hooks
- Framework: Jest
- Coverage: >70% for statements, branches, functions, and lines

### 2. Integration Testing
- API endpoints testing
- Database operations
- Authentication middleware
- Framework: Jest + Supertest + MongoDB Memory Server

### 3. End-to-End Testing
- User workflows (registration, login, logout)
- CRUD operations
- Form validation
- Error handling
- Framework: Cypress

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up test database:**
   ```bash
   npm run setup-test-db
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### With Coverage
```bash
npm test -- --coverage
```

## Test Coverage

The project maintains high test coverage across all layers:

- **Statements**: >70%
- **Branches**: >60%
- **Functions**: >70%
- **Lines**: >70%

## Key Testing Features

### Backend Testing
- **Models**: Validation, data integrity, relationships
- **Authentication**: JWT token generation/verification, password hashing
- **API Routes**: CRUD operations, error handling, authorization
- **Middleware**: Authentication, validation, error handling

### Frontend Testing
- **Components**: Rendering, props handling, user interactions
- **Hooks**: State management, API calls, error handling
- **Error Boundaries**: Error catching and recovery
- **Forms**: Validation, submission, error display

### E2E Testing
- **User Journeys**: Registration → Login → CRUD operations → Logout
- **UI Interactions**: Buttons, forms, navigation, responsive design
- **API Integration**: Real API calls, data persistence
- **Error Scenarios**: Network failures, validation errors, 404s

## Debugging Techniques

### Backend Debugging
- **Logging**: Morgan middleware for HTTP request logging
- **Error Handling**: Centralized error handling with detailed stack traces
- **Database**: MongoDB query debugging, connection monitoring
- **Validation**: Express-validator with detailed error messages

### Frontend Debugging
- **React DevTools**: Component inspection, state/prop tracking
- **Console Logging**: API call logging, error tracking
- **Network Tab**: API request/response monitoring
- **Error Boundaries**: Graceful error handling and recovery

### Testing Debugging
- **Test Isolation**: Proper setup/teardown, mock cleanup
- **Async Testing**: Proper handling of promises and async operations
- **Mocking**: Axios, localStorage, and external dependencies
- **Coverage Analysis**: Identifying untested code paths

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Posts
- `GET /api/posts` - Get all posts (with filtering/pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

## Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-testing
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Write tests for new features before implementation
3. Maintain test coverage above the minimum thresholds
4. Use descriptive commit messages
5. Update documentation for API changes

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Frontend**: React, Axios, React Router
- **Testing**: Jest, Supertest, Cypress, React Testing Library
- **Development**: ESLint, Prettier, Nodemon

## License

This project is for educational purposes as part of a testing and debugging assignment.
