# Deployment Guide

**Complete deployment guide for Fincore Platform on Google Cloud Platform**

---

## 📋 Overview

The Fincore Platform is deployed on **Google Cloud Platform (GCP)** using Cloud Run for both frontend and backend services. This guide covers both manual and automated deployment processes.

---

## 🏗️ Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│              (Source Code + GitHub Actions)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ Git Push (main branch)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Actions CI/CD                        │
│  • Run Tests (E2E + Unit)                                   │
│  • Build Docker Image                                       │
│  • Push to Artifact Registry / GCR                          │
│  • Deploy to Cloud Run                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│  Artifact Reg.   │    │   GCR (Backend)  │
│   (Frontend)     │    │                  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   Cloud Run      │    │   Cloud Run      │
│ (fincore-webui)  │◄───┤ (fincore-api)    │
│   Port: 80       │    │   Port: 8080     │
│  Region: EU-W2   │    │  Region: EU-W2   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │   Cloud SQL      │
         │              │   (MySQL 8.0)    │
         │              │  Region: EU-W2   │
         └──────────────►                  │
                        └──────────────────┘
```

---

## 🌍 Environment Details

### GCP Project
- **Project ID**: `994490239798`
- **Project Name**: `project-07a61357-b791-4255-a9e`
- **Region**: `europe-west2` (London)
- **Billing Account**: `015B82-6BAF14-3A135F`

### Frontend Service (fincore-webui)
- **Service Name**: `fincore-webui`
- **URL**: `https://fincore-webui-lfd6ooarra-nw.a.run.app`
- **Container Registry**: Artifact Registry (europe-west2-docker.pkg.dev)
- **Port**: 80 (Nginx)
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 100

### Backend Service (fincore-api)
- **Service Name**: `fincore-npe-api`
- **URL**: `https://fincore-npe-api-lfd6ooarra-nw.a.run.app`
- **Container Registry**: GCR (gcr.io)
- **Port**: 8080 (Spring Boot)
- **Min Instances**: 0
- **Max Instances**: 100

### Database
- **Type**: Cloud SQL (MySQL 8.0)
- **Instance Name**: `fincore-mysql-instance`
- **Region**: `europe-west2`
- **Connection**: Unix socket (for Cloud Run) or Public IP

---

## 🚀 Automated Deployment (CI/CD)

### Prerequisites

#### 1. Enable Required GCP APIs
```powershell
gcloud config set project 994490239798

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

#### 2. Create Service Account
```powershell
# Create service account
gcloud iam service-accounts create fincore-cloudrun \
  --display-name="Fincore Cloud Run Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding 994490239798 \
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding 994490239798 \
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding 994490239798 \
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com
```

#### 3. Configure GitHub Secrets

Go to **Repository Settings → Secrets → Actions** and add:

**For Frontend (fincore_WebUI)**:
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `994490239798` | GCP Project ID |
| `GCP_SA_KEY` | `{contents of gcp-key.json}` | Service account key |
| `GCP_REGION` | `europe-west2` | Deployment region |
| `REACT_APP_API_URL` | `https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api` | Backend API URL |

**For Backend (userManagementApi)**:
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `994490239798` | GCP Project ID |
| `GCP_SA_KEY` | `{contents of gcp-key.json}` | Service account key |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql:///fincore_db?cloudSqlInstance=...` | Database connection |
| `SPRING_DATASOURCE_USERNAME` | `fincore_user` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `{DB password}` | DB password |
| `JWT_SECRET` | `{your-jwt-secret}` | JWT signing key |

---

### Frontend Deployment Workflow

**File**: `.github/workflows/deploy-gcp.yml`

```yaml
name: Deploy Frontend to GCP Cloud Run

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: europe-west2
  SERVICE_NAME: fincore-webui
  ARTIFACT_REGISTRY: europe-west2-docker.pkg.dev

jobs:
  test:
    name: Run E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Playwright tests
        run: npm test
        env:
          REACT_APP_MOCK_AUTH: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
      
      - name: Fail if tests failed
        if: failure()
        run: exit 1

  deploy:
    name: Deploy to Cloud Run
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker for Artifact Registry
        run: |
          gcloud auth configure-docker ${{ env.GCP_REGION }}-docker.pkg.dev
      
      - name: Build Docker image
        run: |
          docker build \
            --build-arg REACT_APP_API_URL=${{ secrets.REACT_APP_API_URL }} \
            -t ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/fincore-webui/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            -t ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/fincore-webui/${{ env.SERVICE_NAME }}:latest \
            .
      
      - name: Push Docker image
        run: |
          docker push ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/fincore-webui/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/fincore-webui/${{ env.SERVICE_NAME }}:latest
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/fincore-webui/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.GCP_REGION }} \
            --allow-unauthenticated \
            --port=80 \
            --memory=512Mi \
            --min-instances=0 \
            --max-instances=100 \
            --set-env-vars="REACT_APP_API_URL=${{ secrets.REACT_APP_API_URL }}"
      
      - name: Get service URL
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} --region=${{ env.GCP_REGION }} --format='value(status.url)')
          echo "Service deployed to: $SERVICE_URL"
```

### Backend Deployment Workflow

**File**: `.github/workflows/deploy-npe.yml`

```yaml
name: Deploy Backend to Cloud Run NPE

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: europe-west2
  SERVICE_NAME: fincore-npe-api

jobs:
  test:
    name: Run Backend Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      
      - name: Run Maven tests
        run: mvn clean test
      
      - name: Generate coverage report
        run: mvn jacoco:report
      
      - name: Fail if tests failed
        if: failure()
        run: exit 1

  deploy:
    name: Deploy to Cloud Run
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker for GCR
        run: |
          gcloud auth configure-docker
      
      - name: Build Docker image
        run: |
          docker build \
            -t gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            -t gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest \
            .
      
      - name: Push Docker image
        run: |
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.GCP_REGION }} \
            --allow-unauthenticated \
            --port=8080 \
            --memory=1Gi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=100 \
            --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
            --set-secrets="SPRING_DATASOURCE_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest" \
            --add-cloudsql-instances=${{ secrets.CLOUD_SQL_INSTANCE }}
      
      - name: Get service URL
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} --region=${{ env.GCP_REGION }} --format='value(status.url)')
          echo "Service deployed to: $SERVICE_URL"
```

---

## 🛠️ Manual Deployment

### Frontend Manual Deployment

```powershell
# 1. Navigate to project directory
cd C:\Development\git\fincore_WebUI

# 2. Authenticate with GCP
gcloud auth login
gcloud config set project 994490239798

# 3. Build Docker image
docker build -t fincore-webui:local .

# 4. Tag for Artifact Registry
docker tag fincore-webui:local europe-west2-docker.pkg.dev/994490239798/fincore-webui/fincore-webui:manual

# 5. Configure Docker authentication
gcloud auth configure-docker europe-west2-docker.pkg.dev

# 6. Push image
docker push europe-west2-docker.pkg.dev/994490239798/fincore-webui/fincore-webui:manual

# 7. Deploy to Cloud Run
gcloud run deploy fincore-webui `
  --image=europe-west2-docker.pkg.dev/994490239798/fincore-webui/fincore-webui:manual `
  --platform=managed `
  --region=europe-west2 `
  --allow-unauthenticated `
  --port=80 `
  --memory=512Mi `
  --set-env-vars="REACT_APP_API_URL=https://fincore-npe-api-lfd6ooarra-nw.a.run.app/api"

# 8. Get service URL
gcloud run services describe fincore-webui --region=europe-west2 --format='value(status.url)'
```

### Backend Manual Deployment

```powershell
# 1. Navigate to project directory
cd C:\Development\git\userManagementApi

# 2. Build application
mvn clean package -DskipTests

# 3. Build Docker image
docker build -t fincore-api:local .

# 4. Tag for GCR
docker tag fincore-api:local gcr.io/994490239798/fincore-npe-api:manual

# 5. Configure Docker for GCR
gcloud auth configure-docker

# 6. Push image
docker push gcr.io/994490239798/fincore-npe-api:manual

# 7. Deploy to Cloud Run
gcloud run deploy fincore-npe-api `
  --image=gcr.io/994490239798/fincore-npe-api:manual `
  --platform=managed `
  --region=europe-west2 `
  --allow-unauthenticated `
  --port=8080 `
  --memory=1Gi `
  --cpu=1 `
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod" `
  --set-secrets="SPRING_DATASOURCE_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest"

# 8. Get service URL
gcloud run services describe fincore-npe-api --region=europe-west2 --format='value(status.url)'
```

---

## 🗄️ Database Management

### Create Cloud SQL Instance

```powershell
# Create MySQL instance
gcloud sql instances create fincore-mysql-instance `
  --database-version=MYSQL_8_0 `
  --tier=db-f1-micro `
  --region=europe-west2 `
  --root-password=<STRONG_PASSWORD> `
  --storage-size=10GB `
  --storage-auto-increase

# Create database
gcloud sql databases create fincore_db `
  --instance=fincore-mysql-instance

# Create user
gcloud sql users create fincore_user `
  --instance=fincore-mysql-instance `
  --password=<USER_PASSWORD>
```

### Connect to Database

```powershell
# Via Cloud SQL Proxy (local development)
cloud_sql_proxy -instances=project-07a61357-b791-4255-a9e:europe-west2:fincore-mysql-instance=tcp:3306

# Direct connection
gcloud sql connect fincore-mysql-instance --user=root
```

### Run Migrations

```powershell
# Using Flyway (recommended)
mvn flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/fincore_db

# Or manually
gcloud sql connect fincore-mysql-instance --user=fincore_user
mysql> USE fincore_db;
mysql> SOURCE migrations/V1__initial_schema.sql;
```

---

## 🔐 Secrets Management

### Create Secrets in Secret Manager

```powershell
# Create JWT secret
echo -n "your-super-secret-jwt-key-min-256-bits" | gcloud secrets create jwt-secret --data-file=-

# Create DB password
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding jwt-secret `
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding db-password `
  --member="serviceAccount:fincore-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

---

## 🔄 Rollback Procedures

### Rollback to Previous Version

```powershell
# List revisions
gcloud run revisions list --service=fincore-webui --region=europe-west2

# Rollback to specific revision
gcloud run services update-traffic fincore-webui `
  --region=europe-west2 `
  --to-revisions=fincore-webui-00005-xyz=100

# Or rollback to latest stable tag
gcloud run deploy fincore-webui `
  --image=europe-west2-docker.pkg.dev/994490239798/fincore-webui/fincore-webui:stable `
  --region=europe-west2
```

### Emergency Rollback

If deployment fails, GitHub Actions can rollback automatically:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    # Get previous revision
    PREV_REVISION=$(gcloud run revisions list --service=${{ env.SERVICE_NAME }} --region=${{ env.GCP_REGION }} --format='value(name)' --limit=2 | tail -n1)
    
    # Rollback traffic
    gcloud run services update-traffic ${{ env.SERVICE_NAME }} \
      --region=${{ env.GCP_REGION }} \
      --to-revisions=$PREV_REVISION=100
```

---

## 📊 Monitoring & Logging

### View Logs

```powershell
# Frontend logs
gcloud run services logs read fincore-webui --region=europe-west2 --limit=50

# Backend logs
gcloud run services logs read fincore-npe-api --region=europe-west2 --limit=50

# Follow logs in real-time
gcloud run services logs tail fincore-npe-api --region=europe-west2
```

### Monitor Performance

```powershell
# View service details
gcloud run services describe fincore-webui --region=europe-west2

# Check metrics
gcloud monitoring dashboards list
```

### Set Up Alerts

```powershell
# Create alert for 5xx errors
gcloud alpha monitoring policies create `
  --notification-channels=<CHANNEL_ID> `
  --display-name="High Error Rate" `
  --condition-display-name="5xx errors > 10" `
  --condition-threshold-value=10 `
  --condition-threshold-duration=60s
```

---

## ✅ Health Checks

### Frontend Health Check
```bash
curl https://fincore-webui-lfd6ooarra-nw.a.run.app/
# Expected: 200 OK with HTML
```

### Backend Health Check
```bash
curl https://fincore-npe-api-lfd6ooarra-nw.a.run.app/actuator/health
# Expected: {"status":"UP"}
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. **Container Exits Immediately**
**Symptom**: Container starts but exits after a few seconds

**Solution**:
```dockerfile
# Ensure nginx runs in foreground (not as daemon)
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. **429 Rate Limit Errors**
**Symptom**: All requests return 429

**Cause**: Nginx exiting, Cloud Run restarting container repeatedly

**Solution**: Fix Dockerfile CMD directive (see above)

#### 3. **Database Connection Timeout**
**Symptom**: Backend can't connect to Cloud SQL

**Solution**:
```powershell
# Ensure Cloud SQL instance is connected
gcloud run services update fincore-npe-api `
  --add-cloudsql-instances=project-07a61357-b791-4255-a9e:europe-west2:fincore-mysql-instance `
  --region=europe-west2
```

#### 4. **Billing Error**
**Symptom**: "API method requires billing to be enabled"

**Solution**:
```powershell
# Link billing account
gcloud beta billing projects link 994490239798 `
  --billing-account=015B82-6BAF14-3A135F

# Verify billing enabled
gcloud beta billing projects describe 994490239798
```

---

## 📚 Additional Resources

- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Artifact Registry**: https://cloud.google.com/artifact-registry/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
- **Secret Manager**: https://cloud.google.com/secret-manager/docs

---

**Deployment Method**: CI/CD (GitHub Actions)  
**Platform**: Google Cloud Platform  
**Services**: Cloud Run, Cloud SQL, Artifact Registry  
**Last Updated**: March 16, 2026
