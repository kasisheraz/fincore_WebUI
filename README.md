# FinCore Web UI

A modern React-based financial application built with TypeScript, Material-UI, and designed with the Fuji theme. This application provides a comprehensive platform for managing financial applications, portfolios, and reports.

## 🚀 Features

- **Modern UI/UX**: Built with Material-UI and custom Fuji-inspired theme
- **TypeScript**: Full TypeScript support for better development experience
- **Responsive Design**: Mobile-first responsive design
- **Dynamic Data Architecture**: All dropdown values fetched dynamically from backend (zero hardcoded values)
- **Role-Based Access Control**: 4 business roles (Admin, Compliance, Operational, Business User) with data filtering
- **User Management**: Complete CRUD with dynamic role assignment and status management
- **Organization Management**: Multi-type organizations with dynamic enum-driven forms
  - **NEW**: One organization per user restriction with UI enforcement
  - **NEW**: Integrated KYC document upload during organization creation (7-step wizard)
  - **NEW**: Admin approval workflow with status-based button visibility and debugging
  - Multi-step organization creation form with validation
  - Required field validation preventing tab navigation
  - Submit for review capability with real-time status updates
- **KYC & Compliance**: Document verification with dynamic document types and status workflows
- **Dashboard Analytics**: Comprehensive dashboard with key metrics
- **Settings Management**: Comprehensive settings and preferences

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Yup validation
- **Charts**: Recharts for data visualization
- **Build Tool**: Create React App
- **Containerization**: Docker with Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Google Cloud Platform (Cloud Run)

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (for containerization)
- Google Cloud SDK (for deployment)

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fincore_WebUI
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:ci` - Build with CI settings (recommended for testing before commit)
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## 🏗️ Dynamic Architecture

### Enum Service
All dropdown values (user status, organization types, document types, etc.) are fetched dynamically from the backend via `/api/enums` endpoint. This eliminates hardcoded values and ensures UI stays in sync with backend.

```typescript
// services/enumService.ts
import apiService from './apiService';

// Fetches all enums once and caches them
export const getAllEnums = async () => {
  const response = await apiService.get('/enums');
  return response.data;
};

// Individual enum getters with caching
export const getUserStatus = async () => { /* ... */ };
export const getOrganizationType = async () => { /* ... */ };
export const getDocumentType = async () => { /* ... */ };
```

### Role Service
User roles are fetched dynamically from `/api/roles` endpoint, supporting database-driven role management.

```typescript
// services/roleService.ts
import apiService from './apiService';

export const getAllRoles = async () => {
  const response = await apiService.get('/roles');
  return response.data;
};
```

### Components Using Dynamic Data
- **UserForm**: Fetches roles and user statuses on mount
- **OrganizationForm**: Fetches organization types dynamically
- **UsersPage**: Dynamic status filters
- **OrganizationsPage**: Dynamic type and status dropdowns
- **KYCDocumentsPage**: Dynamic document types and verification statuses
- **KYCVerificationPage**: Dynamic verification status options

### Migration Notes
Previously hardcoded constants (STATUS_OPTIONS, ORGANIZATION_TYPE_OPTIONS, etc.) have been removed from `constants.ts`. All dropdown values now come from backend endpoints.

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t fincore-ui .
```

### Run Docker Container
```bash
docker run -p 80:80 fincore-ui
```

## ☁️ Google Cloud Platform Deployment

### Prerequisites
1. Create a GCP project
2. Enable Cloud Run API
3. Create a service account with appropriate permissions
4. Download service account key

### GitHub Secrets Configuration
Set the following secrets in your GitHub repository:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SERVICE_KEY`: Base64 encoded service account key JSON
- `REACT_APP_API_BASE_URL`: Your backend API URL

### Deployment Process
The application automatically deploys to GCP Cloud Run when code is pushed to the main branch through GitHub Actions.

---

## 🧪 UAT Environment

The UAT (User Acceptance Testing) environment mirrors production and is used to validate features before they go live.

### Architecture

| Component | Service Name | Trigger |
|-----------|-------------|---------|
| Frontend (UI) | `fincore-webui-uat` (Cloud Run) | Push to `uat` branch or manual dispatch |
| Backend (API) | `fincore-uat-api` (Cloud Run) | Deployed from the API repository |
| Database | `fincore-uat` (Cloud SQL PostgreSQL) | One-time manual setup |

### GitHub Secrets Required for UAT

Add the following secrets to the GitHub repository (scoped to the `uat` environment or prefixed with `UAT_`):

| Secret Name | Description |
|---|---|
| `UAT_GCP_PROJECT_ID` | GCP project ID (can be same project as NPE) |
| `UAT_GCP_REGION` | GCP region (e.g. `europe-west2`) |
| `UAT_GCP_SA_KEY` | Service account JSON key for CI/CD |
| `UAT_API_BASE_URL` | URL of the UAT API Cloud Run service |

### One-Time GCP Infrastructure Setup (Admin Task)

Before the pipeline can run, a GCP admin must complete these steps once:

1. **Cloud SQL** – Create a PostgreSQL instance named `fincore-uat` in the same region. Apply all DB migrations/seeds against the `uat` schema.
2. **Cloud Run (API)** – Deploy the `fincore-uat-api` Cloud Run service from the API repository, configured to connect to the `fincore-uat` database.
3. **Artifact Registry** – Re-use the existing `fincore-webui` repository. UAT images are tagged `uat-<sha>` and `uat-latest` to avoid overwriting NPE images.
4. **Service Account** – Ensure `fincore-github-actions@<project>.iam.gserviceaccount.com` has `roles/run.admin` and `roles/artifactregistry.writer`.
5. **GitHub Environment** – Create an environment named `uat` in repository Settings → Environments. Optionally add required reviewers for a manual approval gate before deployments proceed.

### Deploying to UAT

**Automatic:** Push commits to the `uat` branch:
```bash
git checkout uat
git merge main          # or cherry-pick specific commits
git push origin uat
```

**Manual (on-demand):** Trigger the workflow from the GitHub Actions UI:
- Go to **Actions → Deploy to UAT → Run workflow**
- Select the branch/tag to deploy

### UAT Pipeline Stages

```
Push to uat branch (or manual dispatch)
        ↓
Job 1: Run E2E Tests
        ↓ (pass)
[Optional: UAT approver reviews in GitHub Environment]
        ↓ (approved)
Job 2: Build Docker image (BUILD_ENV=uat) → push uat-<sha> tag
        ↓
Job 3: Deploy to Cloud Run fincore-webui-uat
        ↓
Job 4: Health check + smoke tests against live UAT URL
        ↓
Deployment summary
```

### Environment File

`.env.uat` in the repository root contains the UAT-specific configuration baked into the Docker image at build time. Update `REACT_APP_API_BASE_URL` to point to your UAT API URL before the first deployment.

### Docker Build with Environment Override

To build the UAT image locally:
```bash
docker build --build-arg BUILD_ENV=uat -t fincore-ui:uat .
```

To build the standard production image (default behaviour is unchanged):
```bash
docker build -t fincore-ui:latest .
```

## 📁 Project Structure

```
fincore_WebUI/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── layout/       # Layout components (Header, Sidebar)
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   ├── Profile.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── services/         # API services
│   ├── theme/           # Custom theme configuration
│   ├── types/           # TypeScript type definitions
│   ├── config/          # Configuration files
│   └── App.tsx          # Main application component
├── .github/workflows/   # GitHub Actions workflows
├── Dockerfile          # Docker configuration
├── nginx.conf         # Nginx configuration
└── package.json       # Project dependencies
```

## 🎨 Theme Customization

The application uses a custom Fuji-inspired theme with FinCore branding. The theme can be customized in `src/theme/finCoreTheme.ts`.

### Color Palette
- **Primary**: Blue (#1976d2) - Trust and stability
- **Secondary**: Red (#dc004e) - Energy and action
- **Background**: Light gray (#f5f5f5)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file based on `.env.example`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_NAME=FinCore
REACT_APP_VERSION=1.0.0
```

### API Integration
The application is configured to work with a backend API. Update the API base URL in the environment variables to connect to your backend service.

## 🧪 Testing

The project includes basic test setup with React Testing Library. Run tests with:

```bash
npm test
```

## 📚 API Documentation

The frontend expects the following API endpoints:

- `GET /api/applications` - Get applications list
- `POST /api/applications` - Create new application
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Dashboard with analytics
  - Application management
  - User profiles
  - Reports and settings
  - GCP deployment pipeline