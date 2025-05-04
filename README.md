# SURA (Smart Unified Resource & Administration)

SURA is a super app designed to streamline resource and administration management for Indian Police Departments, supporting both District and Commissionerate Police hierarchies. It provides tools to manage officers, vehicles, complaints, evidence storage (Malkhana), duty rosters, grievances, and real-time vehicle tracking. Built with a modular and multi-tenant architecture, SURA ensures flexibility, scalability, and security for diverse police department needs.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
SURA offers a comprehensive set of features to enhance police department operations:

### Core Modules
- **Officers**: Manage officer profiles, ranks, and hierarchies (e.g., Constable to DGP).
- **Vehicles**: Track vehicle assignments, maintenance schedules, and usage history.

### Non-Core Modules
- **Complaints Register**: Handle complaint forms (e.g., Form 56, 59, 1301) with status tracking.
- **Malkhana**: Manage evidence storage with barcode scanning for efficient item tracking.
- **Duty Roster**: Schedule shifts, manage leaves, and track overtime with calendar views.
- **Grievance Management**: Address public and internal grievances with resolution workflows.
- **Real-Time Vehicle Tracking**: Monitor vehicle locations using GPS integration.

### Technical Features
- **Modular Architecture**: Enable/disable modules based on department requirements.
- **Multi-Tenant Architecture**: Isolate data for each police department securely.
- **Security**: Role-based access control (RBAC), JWT authentication, and data encryption.
- **Offline Support**: Mobile app supports offline operations with data syncing.
- **Scalability**: Designed to handle large datasets and high user loads.

## Architecture
SURA follows a modular and multi-tenant architecture:
- **Backend**: RESTful APIs built with NestJs, using TypeORM for PostgreSQL interactions.
- **Frontend**: Web interface built with React and Vite; mobile app developed with Flutter.
- **Database**: PostgreSQL with tenant-specific schemas for data isolation.
- **Containerization**: Docker for consistent deployment across environments.
- **CI/CD**: GitHub Actions for automated building, testing, and deployment.
- **Hosting**: Deployed on a Virtual Private Server (VPS) with SSL for secure access.

## Tech Stack
- **Backend**: NestJs (Node.js framework with TypeScript)
- **Frontend (Web)**: React with Vite, Tailwind CSS
- **Frontend (Mobile)**: Flutter (cross-platform for Android and iOS)
- **Database**: PostgreSQL with TypeORM
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: VPS (e.g., AWS EC2, DigitalOcean)
- **Other**: GPS APIs for vehicle tracking, barcode scanning libraries for Malkhana

## Installation
Follow these steps to set up SURA locally for development or testing.

### Prerequisites
- Node.js (v22 or higher)
- PostgreSQL (v17 or higher)
- Docker
- Flutter
- Git

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/asman1337/sura.git
   cd sura
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     pnpm install
     ```
   - Set up environment variables in `backend/.env`:
     ```env
     DATABASE_URL=postgresql://user:password@localhost:5432/sura
     JWT_SECRET=your_jwt_secret
     PORT=3000
     ```
   - Initialize the database:
     ```bash
     pnpm run typeorm:migration:run
     ```
   - Start the backend:
     ```bash
     pnpm run start:dev
     ```

3. **Frontend (Web) Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend/web
     ```
   - Install dependencies:
     ```bash
     pnpm install
     ```
   - Start the development server:
     ```bash
     pnpm run dev
     ```

4. **Frontend (Mobile) Setup**:
   - Navigate to the mobile directory:
     ```bash
     cd frontend/mobile
     ```
   - Install dependencies:
     ```bash
     flutter pub get
     ```
   - Run the app on a connected device/emulator:
     ```bash
     flutter run
     ```

5. **Docker Setup** (Optional):
   - Build and run containers:
     ```bash
     docker-compose up --build
     ```

## Configuration
- **Database**: Configure tenant-specific schemas in PostgreSQL. Update `DATABASE_URL` in the backend `.env` file.
- **Modules**: Enable/disable modules by modifying the configuration file (`backend/config/modules.json`):
  ```json
  {
    "modules": {
      "officers": true,
      "vehicles": true,
      "complaints": true,
      "malkhana": false,
      "dutyRoster": true,
      "grievances": true,
      "vehicleTracking": true
    }
  }
  ```
- **Security**: Generate a secure `JWT_SECRET` and configure RBAC roles in the backend.
- **GPS Integration**: Set up API keys for GPS providers in the backend `.env` file.
- **Barcode Scanning**: Ensure mobile devices have camera access for Malkhana barcode scanning.

## Usage
- **Web Access**: Open `http://localhost:5173` (or the deployed URL) to access the web interface.
- **Mobile Access**: Install the Flutter app on Android/iOS devices.
- **Roles**:
  - **Admins**: Manage officers, vehicles, and module configurations.
  - **Officers**: View duty rosters, log complaints, and scan Malkhana items.
  - **Public Users**: Submit grievances via a public portal.
- **Features**:
  - Register complaints using predefined forms (e.g., Form 56).
  - Scan barcodes for Malkhana items using the mobile app.
  - Track vehicles in real-time via a map interface.

## Development
- **Backend**: Use NestJs CLI to generate modules, controllers, and services:
  ```bash
  nest generate module new-module
  ```
- **Frontend (Web)**: Organize React components in `frontend/web/src/components`.
- **Frontend (Mobile)**: Use Flutter’s widget-based architecture in `frontend/mobile/lib`.
- **Testing**: Write unit and integration tests using Jest (backend/web) and Flutter’s testing framework (mobile).
- **Database Migrations**: Manage schema changes with TypeORM:
  ```bash
  pnpm run typeorm:migration:generate -- -n MigrationName
  ```

## Deployment
- **VPS Setup**:
  - Configure a VPS with Ubuntu, Nginx, and Docker.
  - Set up SSL using Let’s Encrypt for secure access.
- **Docker**:
  - Build images for backend, web frontend, and database:
    ```bash
    docker build -t sura-backend ./backend
    ```
  - Use `docker-compose.yml` to orchestrate services.
- **CI/CD**:
  - Configure GitHub Actions in `.github/workflows/deploy.yml` for automated testing and deployment.
- **Monitoring**:
  - Use Prometheus for performance monitoring and ELK Stack for logging.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact
For support or inquiries, contact the SURA development team at support@sura.police.gov.in.

---
*Built with ❤️ for Indian Police Departments*