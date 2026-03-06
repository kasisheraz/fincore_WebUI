Create a complete React application based on the provided UI design template and screen specifications. The application should meet the following requirements:

## Project Requirements:
1. **React**: React with TypeScript, using Create React App or Vite
2. **Styling**: Use the provided design template and implement responsive design
3. **State Management**: Redux Toolkit or Zustand for complex state, React hooks for local state
4. **API Integration**: Connect to existing backend API endpoints
5. **Routing**: React Router for navigation between screens
6. **UI Components**: Create reusable components based on the design system
7. **Form Handling**: React Hook Form with validation
8. **HTTP Client**: Axios or Fetch API for backend communication

## Implementation Guidelines:
- Follow the exact design specifications from the provided template
- Implement all screens mentioned in the document
- Create a consistent component library with:
  - Header/Navigation components
  - Form components (inputs, buttons, dropdowns)
  - Data display components (tables, cards, lists)
  - Modal/Dialog components
  - Loading states and error handling
- Implement proper error boundaries and loading states
- Add authentication/authorization if required by backend API
- Include environment configuration for different deployment environments

## API Integration:
- Create API service layer with proper error handling
- Implement request/response interceptors for authentication
- Add proper TypeScript interfaces for API responses
- Handle loading states, success, and error scenarios
- Implement API endpoint configuration via environment variables

## GCP Deployment with GitHub Actions:
Create a complete CI/CD pipeline that includes:

1. **GitHub Actions Workflow** (.github/workflows/deploy.yml):
   - Trigger on push to main branch
   - Node.js setup and dependency installation
   - Build the React application
   - Run tests and linting
   - Build Docker container
   - Deploy to Google Cloud Run or App Engine
   - Update Cloud CDN if using static hosting

2. **Infrastructure Setup**:
   - Dockerfile for containerization
   - GCP service account with proper permissions
   - Cloud Build configuration if needed
   - Environment variables setup for different stages (dev, staging, prod)

3. **Security & Best Practices**:
   - Store API URLs and sensitive configs in GitHub Secrets
   - Implement proper CORS handling
   - Add security headers
   - Optimize build for production (code splitting, lazy loading)

## Project Structure: