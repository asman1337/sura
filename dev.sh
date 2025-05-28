#!/bin/bash

# SURA Development Helper Script
# This script provides common development tasks for the SURA project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if pnpm is installed
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first:"
        echo "npm install -g pnpm"
        exit 1
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Install dependencies for all projects
install_deps() {
    print_header "Installing Dependencies"
    
    print_status "Installing backend dependencies..."
    cd backend && pnpm install && cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend && pnpm install && cd ..
    
    print_status "Dependencies installed successfully!"
}

# Start development servers
start_dev() {
    print_header "Starting Development Servers"
    
    print_status "Starting backend in development mode..."
    cd backend
    pnpm run dev &
    BACKEND_PID=$!
    cd ..
    
    print_status "Starting frontend in development mode..."
    cd frontend
    pnpm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_status "Development servers started!"
    print_status "Backend: http://localhost:3000"
    print_status "Frontend: http://localhost:5173"
    
    # Wait for Ctrl+C
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    print_status "Running backend tests..."
    cd backend
    pnpm run test
    pnpm run test:e2e
    cd ..
    
    print_status "Running frontend tests..."
    cd frontend
    pnpm run lint
    pnpm run build
    cd ..
    
    print_status "All tests completed!"
}

# Build projects
build_projects() {
    print_header "Building Projects"
    
    print_status "Building backend..."
    cd backend && pnpm run build && cd ..
    
    print_status "Building frontend..."
    cd frontend && pnpm run build && cd ..
    
    print_status "Build completed successfully!"
}

# Start with Docker
start_docker() {
    print_header "Starting with Docker"
    check_docker
    
    print_status "Building and starting Docker containers..."
    docker-compose up --build -d
    
    print_status "Containers started successfully!"
    print_status "Backend: http://localhost:3000"
    print_status "Frontend: http://localhost:80"
    print_status "Database: localhost:5432"
    print_status "Redis: localhost:6379"
    
    print_status "Use 'docker-compose logs -f' to view logs"
    print_status "Use 'docker-compose down' to stop containers"
}

# Stop Docker containers
stop_docker() {
    print_header "Stopping Docker Containers"
    check_docker
    
    docker-compose down
    print_status "Containers stopped successfully!"
}

# Clean up Docker
clean_docker() {
    print_header "Cleaning Docker Resources"
    check_docker
    
    print_warning "This will remove all containers, volumes, and images related to SURA"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker system prune -f
        print_status "Docker resources cleaned successfully!"
    else
        print_status "Operation cancelled."
    fi
}

# Lint code
lint_code() {
    print_header "Linting Code"
    
    print_status "Linting backend..."
    cd backend && pnpm run lint && cd ..
    
    print_status "Linting frontend..."
    cd frontend && pnpm run lint && cd ..
    
    print_status "Linting completed!"
}

# Database operations
db_reset() {
    print_header "Resetting Database"
    
    print_warning "This will reset the database and lose all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        pnpm run typeorm:schema:drop
        pnpm run typeorm:migration:run
        pnpm run seed
        cd ..
        print_status "Database reset completed!"
    else
        print_status "Operation cancelled."
    fi
}

# Show help
show_help() {
    print_header "SURA Development Helper"
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install dependencies for all projects"
    echo "  dev         Start development servers"
    echo "  test        Run all tests"
    echo "  build       Build all projects"
    echo "  docker      Start with Docker"
    echo "  docker-stop Stop Docker containers"
    echo "  docker-clean Clean Docker resources"
    echo "  lint        Lint all code"
    echo "  db-reset    Reset database (with confirmation)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh install"
    echo "  ./dev.sh dev"
    echo "  ./dev.sh docker"
}

# Main script logic
main() {
    check_pnpm
    
    case "${1:-help}" in
        "install")
            install_deps
            ;;
        "dev")
            start_dev
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_projects
            ;;
        "docker")
            start_docker
            ;;
        "docker-stop")
            stop_docker
            ;;
        "docker-clean")
            clean_docker
            ;;
        "lint")
            lint_code
            ;;
        "db-reset")
            db_reset
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
