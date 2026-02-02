#!/bin/bash

# ============================================
# Deploy Script for Speak Logic Map Web
# ============================================
# Script này sẽ:
# 1. Pull code mới nhất từ git
# 2. Login vào Docker Hub
# 3. Pull Docker image mới nhất
# 4. Restart containers với image mới
# 5. Cleanup old images
# ============================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/speak-logic-map_web"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="production.env"
IMAGE_NAME="${DOCKERHUB_USER:-YOUR_DOCKERHUB_USER}/speak-logic-map-web:latest"

# Logging function
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    log_warn "Running as root. Consider using a non-root user with sudo privileges."
fi

# Navigate to project directory
log_info "Navigating to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || {
    log_error "Failed to navigate to $PROJECT_DIR"
    exit 1
}

# Step 1: Pull latest code from git
log_info "Step 1: Pulling latest code from git..."
if [ -d ".git" ]; then
    set +e  # Temporarily disable exit on error for git commands
    git fetch origin || log_warn "Git fetch failed, continuing..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
        log_warn "Git pull failed, continuing with existing code..."
    }
    set -e  # Re-enable exit on error
else
    log_warn "Not a git repository, skipping git pull..."
fi

# Step 2: Check if production.env exists
log_info "Step 2: Checking for production.env file..."
if [ ! -f "$ENV_FILE" ]; then
    log_error "File $ENV_FILE not found!"
    log_error "Please create $ENV_FILE with your production environment variables."
    exit 1
fi

# Step 3: Login to Docker Hub (if credentials provided)
log_info "Step 3: Logging into Docker Hub..."
if [ -n "$DOCKERHUB_USERNAME" ] && [ -n "$DOCKERHUB_TOKEN" ]; then
    echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin || {
        log_error "Docker login failed!"
        exit 1
    }
    log_info "Successfully logged into Docker Hub"
else
    log_warn "DOCKERHUB_USERNAME or DOCKERHUB_TOKEN not set, skipping Docker login..."
    log_warn "Make sure you're already logged in or images are publicly accessible"
fi

# Step 4: Pull latest Docker image
log_info "Step 4: Pulling latest Docker image: $IMAGE_NAME"
docker pull "$IMAGE_NAME" || {
    log_error "Failed to pull Docker image: $IMAGE_NAME"
    exit 1
}
log_info "Successfully pulled Docker image"

# Step 5: Stop existing containers (graceful shutdown)
log_info "Step 5: Stopping existing containers..."
set +e  # Temporarily disable exit on error
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || {
    log_warn "Some containers may not have stopped cleanly, continuing..."
}
set -e  # Re-enable exit on error

# Step 6: Start containers with new image
log_info "Step 6: Starting containers with new image..."
docker compose -f "$COMPOSE_FILE" up -d || {
    log_error "Failed to start containers!"
    exit 1
}

# Step 7: Wait for services to be healthy
log_info "Step 7: Waiting for services to be healthy..."
sleep 10

# Check if app container is running
if docker ps | grep -q "speak-logic-map-app"; then
    log_info "App container is running"
else
    log_error "App container is not running!"
    log_info "Checking logs..."
    docker compose -f "$COMPOSE_FILE" logs app --tail=50
    exit 1
fi

# Step 8: Health check
log_info "Step 8: Performing health check..."
HEALTH_CHECK_URL="http://localhost:1040/api/hello"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        log_info "Health check passed!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        log_warn "Health check failed, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 5
    else
        log_error "Health check failed after $MAX_RETRIES attempts!"
        log_info "Container logs:"
        docker compose -f "$COMPOSE_FILE" logs app --tail=50
        exit 1
    fi
done

# Step 9: Cleanup old Docker images
log_info "Step 9: Cleaning up old Docker images..."
set +e  # Temporarily disable exit on error
docker image prune -f 2>/dev/null || log_warn "Image cleanup had some issues, continuing..."
set -e  # Re-enable exit on error

# Step 10: Show running containers
log_info "Step 10: Current container status:"
docker compose -f "$COMPOSE_FILE" ps

# Success message
log_info "============================================"
log_info "Deployment completed successfully! 🎉"
log_info "============================================"
log_info "Application is running on: http://localhost:1040"
log_info "Adminer is running on: http://localhost:1041 (if enabled)"
log_info ""
log_info "To view logs: docker compose -f $COMPOSE_FILE logs -f"
log_info "To stop: docker compose -f $COMPOSE_FILE down"
log_info "============================================"

exit 0

