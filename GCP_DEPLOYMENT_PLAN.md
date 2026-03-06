# GCP Deployment Plan - FinCore WebUI

## Overview
Deploy React-based FinCore WebUI to Google Cloud Platform with full CI/CD automation using GitHub Actions.

## Architecture

### Deployment Options
**Recommended: Cloud Run** (Serverless, auto-scaling, cost-effective)
- Container-based deployment
- Automatic HTTPS
- Pay-per-use pricing
- Built-in load balancing
- Zero server management

**Alternative: App Engine** (PaaS, simpler configuration)
- Automatic scaling
- Built-in version management
- Integrated monitoring

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                  (Source Code + Actions)                 │
└────────────────────┬────────────────────────────────────┘
                     │ Push to main
                     ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                     │
│  • Run Tests (Playwright)                               │
│  • Build Docker Image                                   │
│  • Push to Artifact Registry                            │
│  • Deploy to Cloud Run                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Google Artifact Registry                       │
│              (Docker Images)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Cloud Run Service                       │
│  • React App (Nginx)                                    │
│  • Auto-scaling (0-100 instances)                       │
│  • Custom Domain + SSL                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│            (External or Cloud Run)                       │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

### GCP Project Setup

✅ **Using Existing GCP Project** (Same as Backend API)

**Project Details:**
- **Project ID**: `project-07a61357-b791-4255-a9e`
- **Region**: `europe-west2` (London)
- **APIs**: Already enabled (Cloud Run, Cloud Build, Secret Manager)

1. **Set Active Project**
   ```bash
   gcloud config set project project-07a61357-b791-4255-a9e
   ```

2. **Create Artifact Registry for WebUI**
   ```bash
   # Create new repository for UI images (backend uses GCR)
   gcloud artifacts repositories create fincore-webui \
     --repository-format=docker \
     --location=europe-west2 \
     --description="FinCore WebUI Docker images" \
     --project=project-07a61357-b791-4255-a9e
   ```

   **Note**: Backend API uses GCR (`gcr.io`), we'll use Artifact Registry for WebUI.

### Service Account Setup

✅ **Reuse Existing Service Account** (Backend API service account)

```bash
# Service account already exists: fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com
# Already has required roles from backend setup

# Verify service account
gcloud iam service-accounts describe fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com

# Grant Artifact Registry access (if not already granted)
gcloud projects add-iam-policy-binding project-07a61357-b791-4255-a9e \
  --member="serviceAccount:fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# If you need a new key for GitHub Actions:
gcloud iam service-accounts keys create webui-github-key.json \
  --iam-account=fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com
```

**Note**: If using the same GitHub secrets as backend, you can skip key creation.

### GitHub Repository Secrets
Add these secrets in GitHub Settings → Secrets and variables → Actions:

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `GCP_PROJECT_ID` | GCP Project ID | `project-07a61357-b791-4255-a9e` |
| `GCP_SA_KEY` | Service Account JSON Key | Content of service account key (reuse backend key) |
| `GCP_REGION` | Deployment region | `europe-west2` |
| `API_BASE_URL` | Backend API URL | `https://fincore-npe-api-994490239798.europe-west2.run.app` |

Optional secrets:
| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK` | Deployment notifications |
| `SENTRY_DSN` | Error tracking |

## Deployment Configuration

### 1. Docker Configuration

**Dockerfile** (Multi-stage build for optimization)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf** (Updated for Cloud Run)
```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**.dockerignore**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
*.md
.env
.env.local
.env.*.local
tests
test-results
playwright-report
.github
```

### 2. Environment Configuration

**config/runtime-config.js** (Runtime environment variables)
```javascript
window.ENV = {
  API_BASE_URL: '${API_BASE_URL}',
  ENVIRONMENT: '${ENVIRONMENT}',
};
```

Update `public/index.html`:
```html
<script src="%PUBLIC_URL%/config/runtime-config.js"></script>
```

### 3. Cloud Run Configuration

**cloud-run.yaml**
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: fincore-webui-npe
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '0'
        autoscaling.knative.dev/maxScale: '10'
    spec:
      serviceAccountName: fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com
      containers:
      - image: europe-west2-docker.pkg.dev/project-07a61357-b791-4255-a9e/fincore-webui/app:latest
        ports:
        - containerPort: 8080
        env:
        - name: API_BASE_URL
          value: https://fincore-npe-api-994490239798.europe-west2.run.app
        - name: ENVIRONMENT
          value: npe
        resources:
          limits:
            memory: 512Mi
            cpu: 1000m
```

## GitHub Actions Workflows

### Workflow 1: CI/CD Pipeline (.github/workflows/deploy-gcp.yml)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
1. **Test** - Run Playwright tests
2. **Build** - Create Docker image
3. **Push** - Upload to Artifact Registry
4. **Deploy** - Deploy to Cloud Run
5. **Notify** - Send deployment status

**Features:**
- Automated testing before deployment
- Docker layer caching for faster builds
- Rollback capability
- Deployment notifications
- Production health checks

### Workflow 2: Test Automation (.github/workflows/test.yml)

**Triggers:**
- Pull requests
- Push to any branch
- Schedule (nightly)

**Jobs:**
1. Run unit tests
2. Run E2E tests (Playwright)
3. Generate test reports
4. Upload artifacts

## Deployment Process

### Automatic Deployment (Main Branch)
```
1. Developer pushes to main
2. GitHub Actions triggered
3. Tests run (Playwright)
4. Docker image built
5. Image pushed to Artifact Registry
6. Cloud Run service updated
7. Health check performed
8. Traffic shifted to new version
9. Slack notification sent
```

### Manual Deployment
```bash
# Via GitHub Actions
gh workflow run deploy-gcp.yml

# Via CLI
gcloud run deploy fincore-webui \
  --image us-central1-docker.pkg.dev/fincore-webui/fincore-webui/app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

## Monitoring & Logging

### Cloud Logging
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Real-time logs
gcloud run services logs tail fincore-webui --region=us-central1
```

### Cloud Monitoring
- **Metrics**: Request count, latency, error rate
- **Alerts**: High error rate, slow response times
- **Uptime Checks**: /health endpoint monitoring

### Application Performance
- **Lighthouse CI**: Automated performance testing
- **Web Vitals**: Core performance metrics
- **Error Tracking**: Sentry integration

## Cost Optimization

### Cloud Run Pricing (Estimated)
```
Monthly estimates (based on usage):
- 1M requests/month: ~$10-15
- 10M requests/month: ~$50-100
- Auto-scaling from 0 means pay only for actual usage
```

### Optimization Strategies
1. **Minimize cold starts**
   - Set min instances to 1 for production
   - Keep container size small (<100MB)

2. **Optimize build**
   - Multi-stage Docker builds
   - Aggressive tree-shaking
   - Lazy loading routes

3. **CDN Integration**
   - Cloud CDN for static assets
   - Cache-Control headers

## Security

### Best Practices
1. **Secrets Management**
   - Store sensitive data in Secret Manager
   - Never commit secrets to repository
   - Rotate service account keys quarterly

2. **Network Security**
   - Enable VPC connector for backend communication
   - Use IAM for authentication
   - Implement CORS properly

3. **Container Security**
   - Use official base images
   - Regular security scanning
   - Minimal container privileges

## Disaster Recovery

### Backup Strategy
- **Code**: Git repository
- **Images**: Artifact Registry retention (90 days)
- **Configs**: Infrastructure as Code

### Rollback Procedures
```bash
# List revisions
gcloud run revisions list --service=fincore-webui

# Rollback to previous revision
gcloud run services update-traffic fincore-webui \
  --to-revisions=fincore-webui-00002-abc=100
```

## Custom Domain Setup

### Configure Domain
```bash
# Add domain mapping
gcloud run domain-mappings create --service=fincore-webui \
  --domain=app.fincore.com \
  --region=us-central1

# Verify DNS records
gcloud run domain-mappings describe app.fincore.com \
  --region=us-central1
```

### SSL Certificate
- Automatic provisioning by Cloud Run
- Auto-renewal
- Free Let's Encrypt certificates

## Maintenance

### Regular Tasks
- **Weekly**: Review logs and metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit, rotate keys
- **Annually**: Review architecture and costs

### Update Process
1. Create feature branch
2. Make changes
3. Run tests locally
4. Create pull request
5. Automated tests run
6. Merge to main
7. Automatic deployment

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 2-4 hours | GCP project, service accounts, GitHub secrets |
| **Docker** | 1-2 hours | Create Dockerfile, test locally |
| **Workflows** | 2-3 hours | Create GitHub Actions, test pipeline |
| **Deploy** | 1 hour | First deployment, verify |
| **DNS** | 30 min | Configure custom domain |
| **Monitoring** | 1 hour | Set up alerts and dashboards |
| **Total** | **1 day** | End-to-end setup |

## Success Criteria

✅ Automated deployment on push to main  
✅ All tests passing before deployment  
✅ Zero-downtime deployments  
✅ Automatic rollback on failure  
✅ Health checks passing  
✅ Response time < 500ms  
✅ 99.9% uptime  
✅ Deployment notifications working  

## Next Steps

1. Review this plan
2. Set up GCP project and resources
3. Configure GitHub secrets
4. Create Docker and workflow files
5. Test deployment to staging
6. Deploy to production
7. Set up monitoring and alerts
