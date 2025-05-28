# SURA Project CI/CD Workflows

This document describes the GitHub Actions CI/CD workflows for the SURA project, which includes both backend and frontend applications.

## Overview

The project uses separate CI/CD workflows for backend and frontend applications to ensure efficient builds and deployments. Each workflow is triggered only when relevant code changes occur in their respective directories.

## Workflows

### 1. Backend CI/CD (`backend-ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches (when backend code changes)
- Pull requests to `main` or `develop` branches (when backend code changes)
- Manual workflow dispatch with environment selection

**Jobs:**

#### Test Job
- **Node.js**: 22.x
- **Package Manager**: pnpm 9.x
- **Steps**:
  - Code checkout
  - Node.js and pnpm setup
  - Dependency caching
  - Install dependencies
  - Run linting (`pnpm run lint`)
  - Run type checking (`pnpm run build`)
  - Run unit tests (`pnpm run test`)
  - Run e2e tests (`pnpm run test:e2e`)
  - Generate test coverage (`pnpm run test:cov`)
  - Upload coverage to Codecov

#### Build and Push Job
- **Runs**: Only on push events (not PRs)
- **Dependencies**: Requires test job to pass
- **Steps**:
  - Docker Buildx setup
  - Login to GitHub Container Registry (ghcr.io)
  - Extract metadata for tagging
  - Build multi-platform Docker image (linux/amd64, linux/arm64)
  - Push to registry as `ghcr.io/[owner]/sura-backend`

#### Deploy Job
- **Runs**: Only on main branch or manual dispatch
- **Dependencies**: Requires build-and-push job to pass
- **Environment**: Configurable (development/staging/production)
- **Steps**:
  - Deploy to specified environment
  - Run health checks

#### Notify Job
- **Runs**: Always after all jobs complete
- **Purpose**: Send deployment status notifications

### 2. Frontend CI/CD (`frontend-ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches (when frontend code changes)
- Pull requests to `main` or `develop` branches (when frontend code changes)
- Manual workflow dispatch with environment selection

**Jobs:**

#### Test Job
- **Node.js**: 22.x
- **Package Manager**: pnpm 9.x
- **Steps**:
  - Code checkout
  - Node.js and pnpm setup
  - Dependency caching
  - Install dependencies
  - Run linting (`pnpm run lint`)
  - Run type checking and build (`pnpm run build`)
  - Analyze bundle size
  - Upload build artifacts

#### Build and Push Job
- **Runs**: Only on push events (not PRs)
- **Dependencies**: Requires test job to pass
- **Steps**:
  - Docker Buildx setup
  - Login to GitHub Container Registry (ghcr.io)
  - Extract metadata for tagging
  - Build multi-platform Docker image (linux/amd64, linux/arm64)
  - Push to registry as `ghcr.io/[owner]/sura-frontend`

#### Deploy Job
- **Runs**: Only on main branch or manual dispatch
- **Dependencies**: Requires build-and-push job to pass
- **Environment**: Configurable (development/staging/production)
- **Steps**:
  - Deploy to specified environment
  - Run accessibility tests
  - Run performance tests
  - Run health checks

#### Notify Job
- **Runs**: Always after all jobs complete
- **Purpose**: Send deployment status notifications

## Path-Based Triggering

Both workflows use path-based triggering to ensure they only run when relevant code changes:

- **Backend workflow** triggers on changes to:
  - `backend/**`
  - `.github/workflows/backend-ci-cd.yml`

- **Frontend workflow** triggers on changes to:
  - `frontend/**`
  - `.github/workflows/frontend-ci-cd.yml`

## Manual Deployment

Both workflows support manual triggering via `workflow_dispatch` with environment selection:

1. Go to **Actions** tab in GitHub repository
2. Select the desired workflow
3. Click **Run workflow**
4. Choose target environment (development/staging/production)
5. Click **Run workflow**

## Environment Configuration

### Development
- **Backend URL**: `https://api-dev.sura.example.com`
- **Frontend URL**: `https://app-dev.sura.example.com`

### Staging
- **Backend URL**: `https://api-staging.sura.example.com`
- **Frontend URL**: `https://app-staging.sura.example.com`

### Production
- **Backend URL**: `https://api.sura.example.com`
- **Frontend URL**: `https://app.sura.example.com`

## Docker Images

### Backend Image: `ghcr.io/[owner]/sura-backend`
- **Base**: `node:22-alpine`
- **Exposed Port**: 3000
- **Health Check**: `/health` endpoint

### Frontend Image: `ghcr.io/[owner]/sura-frontend`
- **Base**: `nginx:alpine`
- **Exposed Port**: 80
- **Static Files**: Served via Nginx

## Caching Strategy

- **pnpm Store**: Cached per platform and lockfile hash
- **Docker Layers**: GitHub Actions cache for build optimization
- **Build Artifacts**: Retained for 7 days

## Security

- **Registry**: GitHub Container Registry (ghcr.io)
- **Authentication**: GitHub Token (automatic)
- **Permissions**: Read for contents, write for packages
- **Multi-platform**: Supports AMD64 and ARM64 architectures

## Monitoring and Notifications

- **Test Coverage**: Uploaded to Codecov
- **Build Artifacts**: Available for download
- **Deployment Status**: Configurable notifications
- **Health Checks**: Automated post-deployment verification

## Prerequisites

### Repository Secrets
No additional secrets required - uses GitHub's built-in `GITHUB_TOKEN`.

### Repository Settings
1. Enable GitHub Packages
2. Configure environments (development, staging, production)
3. Set up branch protection rules for `main` branch

## Usage Examples

### Automatic Deployment
```bash
# Make changes to backend
git add backend/
git commit -m "feat: add new API endpoint"
git push origin main
# Backend workflow will automatically trigger

# Make changes to frontend
git add frontend/
git commit -m "feat: add new component"
git push origin main
# Frontend workflow will automatically trigger
```

### Manual Deployment
1. Navigate to repository → Actions
2. Select "Backend CI/CD" or "Frontend CI/CD"
3. Click "Run workflow"
4. Select environment and confirm

### Local Development
```bash
# Backend
cd backend
pnpm install
pnpm run dev

# Frontend
cd frontend
pnpm install
pnpm run dev
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify pnpm lockfile is up to date
   - Review linting errors

2. **Docker Build Issues**
   - Verify Dockerfile syntax
   - Check .dockerignore configuration
   - Review build context size

3. **Deployment Failures**
   - Verify environment configuration
   - Check health check endpoints
   - Review deployment logs

### Debug Steps

1. Review workflow logs in GitHub Actions
2. Check individual job outputs
3. Verify Docker image builds locally
4. Test deployment commands manually

## Contributing

When contributing to the project:

1. Ensure your changes pass local tests
2. Update relevant documentation
3. Test Docker builds locally
4. Submit PR for review

The CI/CD workflows will automatically validate your changes and provide feedback.
