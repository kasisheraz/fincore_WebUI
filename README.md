# FinCore Web UI

A modern React-based financial application built with TypeScript, Material-UI, and designed with the Fuji theme. This application provides a comprehensive platform for managing financial applications, portfolios, and reports.

## 🚀 Features

- **Modern UI/UX**: Built with Material-UI and custom Fuji-inspired theme
- **TypeScript**: Full TypeScript support for better development experience
- **Responsive Design**: Mobile-first responsive design
- **Dashboard Analytics**: Comprehensive dashboard with key metrics
- **Application Management**: Complete CRUD operations for financial applications
- **User Profiles**: User management and profile customization
- **Reports & Analytics**: Advanced reporting capabilities
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
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

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