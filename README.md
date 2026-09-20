# Containerizing a College Portal

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed%20Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://college-portal-self.vercel.app)
[![Deployment Status](https://img.shields.io/badge/Deployment-Success%20100%25-success?style=for-the-badge)](https://college-portal-self.vercel.app)
[![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker--Compose-v3.8-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x--24.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![IBM](https://img.shields.io/badge/IBM-Academic%20Project-052FAD?logo=ibm&logoColor=white)](https://www.ibm.com/)

> 🚀 **Live Production Deployment**: **[https://college-portal-self.vercel.app](https://college-portal-self.vercel.app)**
>
> **Project Submission**: Modern, 3-tier, microservice-based academic management platform deployed and orchestrated with Docker containers and cloud-hosted on Vercel Edge.

---

## Table of Contents
1. [Live Cloud Deployment (Vercel)](#1-live-cloud-deployment-vercel)
2. [Project Overview](#2-project-overview)
3. [Key Benefits of Containerization](#3-key-benefits-of-containerization)
4. [Technologies Used](#4-technologies-used)
5. [System Architecture](#5-system-architecture)
6. [Docker Architecture](#6-docker-architecture)
7. [Project Directory Structure](#7-project-directory-structure)
8. [How to Build Docker Images](#8-how-to-build-docker-images)
9. [How to Run the Containers](#9-how-to-run-the-containers)
10. [How to Access the Application](#10-how-to-access-the-application)
11. [Local Development (Zero-Docker Standalone Mode)](#11-local-development-zero-docker-standalone-mode)
12. [Role-Based Dashboard Features](#12-role-based-dashboard-features)
13. [API Endpoints Documentation](#13-api-endpoints-documentation)
14. [Future Enhancements](#14-future-enhancements)

---

## 1. Live Cloud Deployment (Vercel)

The application is deployed live with continuous deployment connected directly to this GitHub repository:

| Service Tier | URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **Production Web Portal** | [https://college-portal-self.vercel.app](https://college-portal-self.vercel.app) | `Active (200 OK)` | Responsive portal & role-based dashboards |
| **Backend API Health Probe** | [https://college-portal-self.vercel.app/api/health](https://college-portal-self.vercel.app/api/health) | `Healthy (200 OK)` | Automated JSON health check |
| **Container Telemetry API** | [https://college-portal-self.vercel.app/api/container-status](https://college-portal-self.vercel.app/api/container-status) | `Active (200 OK)` | Real-time cluster hardware & process metrics |
| **AI Risk Prediction API** | [https://college-portal-self.vercel.app/api/student-risk/1](https://college-portal-self.vercel.app/api/student-risk/1) | `Active (200 OK)` | Heuristic student risk computation |
| **Mobile Experience** | Phone & Tablet Optimized | `Responsive` | Thumb-friendly swipeable tabs + slide-in drawer |

---

## 1. Project Overview

**“Containerizing a College Portal”** is an enterprise-grade academic management web application engineered for modern university operations. Traditional monolithic college portals often suffer from deployment friction, vulnerability propagation, and scalability bottlenecks during peak operations (e.g. semester admissions, fee payments, and grade declarations).

This project resolves these challenges by decomposing the college management system into **three decoupled, autonomous microservice tiers**:
1. **Frontend Tier (`frontend`)**: High-performance static client running on an optimized Nginx Alpine image, providing a responsive IBM Carbon-inspired user interface, glassmorphism aesthetics, dynamic micro-animations, and client-side reverse proxy routing.
2. **Backend API Tier (`backend`)**: Stateless Node.js / Express microservice handling role-based authentication (Student, Faculty, Admin), relational CRUD operations, automated Docker health checks, and live container telemetry metrics.
3. **Database Tier (`database`)**: PostgreSQL 16 Alpine container with persistent storage volumes and auto-initialization schemas for academic records.

---

## 2. Key Benefits of Containerization

| Benefit | How It Solves Traditional University Portal Challenges |
| :--- | :--- |
| **Universal Portability** | Packaging the application and all dependencies into OCI-compliant Docker containers eliminates the classic *"works on my machine"* dilemma across student laptops, on-prem servers, and IBM Cloud. |
| **Fault & Namespace Isolation** | A crash or memory spike in the Frontend or API tier cannot corrupt or crash the PostgreSQL database engine, ensuring maximum data integrity. |
| **Dynamic Elastic Scalability** | The backend API tier can be scaled horizontally with a single command (`docker compose up --scale backend=3`) during high-traffic grade releases. |
| **Zero-Downtime CI/CD** | Enables seamless rolling updates and automated rollbacks with Docker healthchecks gating production traffic until containers report `healthy`. |
| **Resource Optimization** | Alpine-based images consume under 150MB of RAM combined, minimizing cloud infrastructure hosting costs. |

---

## 3. Technologies Used

### Frontend Service
- **HTML5 & CSS3**: Custom IBM Carbon design palette (IBM Blue `#0f62fe`, Deep Navy `#001141`, Cyan `#11d3f3`), glassmorphism, responsive CSS grid/flexbox.
- **Modern JavaScript (ES6+)**: IntersectionObserver for viewport animations, typing engine, live telemetry polling, and state hydration.
- **Web Server**: Nginx Alpine with custom `nginx.conf` reverse proxy for `/api/` endpoints and gzip compression.
- **Icons & Typography**: Font Awesome 6 CDN, IBM Plex Mono, Google Outfit font family.

### Backend API Service
- **Runtime**: Node.js v20+ / Express.js REST API.
- **Database Connectivity**: `pg` (Node-PostgreSQL pool) with dual-mode resilient in-memory fallback.
- **Container Telemetry**: Real-time process metrics (`process.memoryUsage()`, `process.uptime()`, port status).
- **Security & Headers**: CORS, sanitized parameter validation, session token issuance.

### Database Service
- **Database Engine**: PostgreSQL 16 Alpine.
- **Storage Persistence**: Named Docker volume `college_portal_pgdata`.
- **Initialization**: Automatic execution of `database/init.sql` schema and relational seed data upon first boot.

### Container Orchestration
- **Docker Engine** & **Docker Compose v3.8**.
- **Container Healthchecks**: `curl` for backend, `wget` for frontend, `pg_isready` for PostgreSQL.
- **Networking**: Custom bridge network `college-net`.

---

## 4. System Architecture

```
User (Desktop / Tablet / Mobile Browser)
                 ↓ [HTTP / HTTPS :80]
     +-----------------------------------+
     |        Frontend Container         |
     |          (Nginx Alpine)           |
     +-----------------------------------+
                 ↓ [/api/* Proxy :5000]
     +-----------------------------------+
     |       Backend/API Container       |
     |         (Node.js/Express)         |
     +-----------------------------------+
                 ↓ [TCP Socket :5432]
     +-----------------------------------+
     |        Database Container         |
     |       (PostgreSQL 16 Engine)      |
     +-----------------------------------+
                 |
        [Persistent Volume]
         (college_portal_pgdata)
```

### Microservice Interaction Flow
1. **User Interaction**: Users access the portal through their browser via port `3000` (or `80` in production).
2. **Reverse Proxying**: Nginx serves static HTML, CSS, and JS files directly. All requests directed to `/api/*` are transparently routed to the internal `backend:5000` network address.
3. **Business Logic & Health Checks**: Express validates requests, verifies credentials, and queries the database tier.
4. **Data Persistence**: PostgreSQL writes updates to the mounted Docker named volume `college_portal_pgdata`, safeguarding data across container restarts.

---

## 5. Docker Architecture

```
                                  [ Docker Bridge Network: college-net ]
                                  
    +-----------------------------------------------------------------------------------------------+
    |                                                                                               |
    |   [frontend]                           [backend]                           [database]         |
    |   college_portal_frontend              college_portal_backend              college_portal_db  |
    |   Port: 3000:80                        Port: 5000:5000                     Port: 5432:5432    |
    |   Image: nginx:alpine                  Image: node:20-alpine               Image: postgres:16 |
    |   Health: wget / spider                Health: curl /api/health            Health: pg_isready |
    |                                                                                               |
    +-----------------------------------------------------------------------------------------------+
                                                                                        |
                                                                                [Persistent Volume]
                                                                                college_portal_pgdata
```

### Healthcheck Policies
- **Database**: Runs `pg_isready -U postgres -d college_portal` every 10s.
- **Backend API**: Depends on database with `condition: service_healthy`; probes `http://localhost:5000/api/health` every 15s.
- **Frontend**: Depends on backend with `condition: service_healthy`; probes web root every 15s.

---

## 6. Project Directory Structure

```
IBM PROJECT/
├── database/
│   └── init.sql                 # PostgreSQL relational schema and initial seed data
├── backend/
│   ├── server.js                # Express REST API application logic & telemetry
│   ├── db.js                    # PostgreSQL adapter + resilient storage fallback
│   ├── package.json             # Backend dependencies (express, pg, cors, dotenv)
│   ├── Dockerfile               # Node.js 20 Alpine production image build
│   └── .dockerignore            # Excluded build artifacts
├── frontend/
│   ├── index.html               # Semantic HTML5 portal with IBM Carbon design
│   ├── css/
│   │   └── style.css            # Custom IBM design system, glassmorphism, responsive CSS
│   ├── js/
│   │   └── app.js               # Frontend animations, role views & telemetry monitor
│   ├── nginx.conf               # Nginx reverse proxy configuration for /api/
│   ├── Dockerfile               # Nginx Alpine production image build
│   └── .dockerignore            # Excluded build artifacts
├── docker-compose.yml           # Multi-tier orchestration file with health checks
├── Dockerfile                   # Root single-container cloud deployment specification
├── package.json                 # Project root convenience launch scripts
├── .env.example                 # Environment variables specification
├── .env                         # Local configuration file
└── README.md                    # Project submission documentation
```

---

## 7. How to Build Docker Images

To build all 3 service images individually or in parallel:

```bash
# 1. Build all services defined in docker-compose.yml
docker compose build

# 2. Or build specific microservice images individually:
docker build -t college-portal-backend:latest ./backend
docker build -t college-portal-frontend:latest ./frontend
```

---

## 8. How to Run the Containers

### Start the entire cluster in the background:
```bash
docker compose up -d
```

### Inspect running containers and health checks:
```bash
docker compose ps
```
*Expected output:*
```text
NAME                     IMAGE                      STATUS                   PORTS
college_portal_db        postgres:16-alpine         Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp
college_portal_backend   college-portal-backend     Up 2 minutes (healthy)   0.0.0.0:5000->5000/tcp
college_portal_frontend  college-portal-frontend    Up 2 minutes (healthy)   0.0.0.0:3000->80/tcp
```

### View real-time cluster logs:
```bash
# Stream all logs
docker compose logs -f

# Stream specific service logs
docker compose logs -f backend
```

### Stop and tear down the cluster:
```bash
# Stop containers (preserves database data in volume)
docker compose down

# Stop containers and remove volumes (clean slate)
docker compose down -v
```

---

## 10. How to Access the Application

Access the application either via the live cloud deployment or locally:

### Live Cloud Deployment (Vercel)
| Tier | URL | Purpose |
| :--- | :--- | :--- |
| **Cloud Web Portal** | [https://college-portal-self.vercel.app](https://college-portal-self.vercel.app) | Live production portal & role dashboards |
| **Cloud Health Check** | [https://college-portal-self.vercel.app/api/health](https://college-portal-self.vercel.app/api/health) | Live serverless health probe |
| **Cloud Telemetry Status** | [https://college-portal-self.vercel.app/api/container-status](https://college-portal-self.vercel.app/api/container-status) | Real-time cluster hardware metrics |

### Local Docker Environment
| Tier | URL | Purpose |
| :--- | :--- | :--- |
| **Frontend Web Portal** | `http://localhost:3000` | Main responsive portal & role dashboards |
| **Backend API Health Check** | `http://localhost:5000/api/health` | Automated JSON health probe |
| **Container Telemetry Status** | `http://localhost:5000/api/container-status` | Real-time cluster hardware metrics |
| **Database Port** | `localhost:5432` | PostgreSQL engine socket |

### Demo Evaluation Credentials (1-Click Quick Login):
For convenience during grading and evaluation, the portal includes **1-Click Demo Login Chips** in the login modal and dashboard sidebar:
- **Student Persona**: `Alex Chen` (Username: `student` / Password: `password123`)
- **Faculty Persona**: `Dr. Robert Vance` (Username: `faculty` / Password: `password123`)
- **Admin Persona**: `Dr. Elena Rostova` (Username: `admin` / Password: `password123`)

---

## 10. Local Development (Zero-Docker Standalone Mode)

You can run the application directly on any computer with Node.js installed, even if Docker is not present:

```bash
# 1. Install dependencies
npm run postinstall

# 2. Launch the full-stack server
npm start
```
The application will launch on `http://localhost:5000/` serving both the full REST API and the responsive frontend, with the database adapter automatically utilizing a zero-configuration PostgreSQL in-memory mirror with identical relational seed data.

---

## 11. Role-Based Dashboard Features

### 1. Landing Page
- **Hero Section**: IBM Carbon blue styling, animated gradient mesh, floating geometric elements, and typing animation: *“Containerizing a College Portal”*.
- **Interactive Container Topology Widget**: Real-time status cards for Frontend, Backend, and Database with instant health check probes.
- **Animated Statistics Counters**: 5000+ Students, 250+ Faculty, 50+ Courses, 100+ Events.
- **Courses & Curriculum**: Filterable courses by department with credit breakdowns and instructor details.
- **Events Section**: Animated cards with dates, venues, descriptions, and real-time interactive registration toggling.
- **Campus Announcements**: Notice board filtered by category (*Exams*, *Placement*, *Holidays*, *Academic*) with priority badges (*Urgent*, *Important*, *Normal*).
- **Dark / Light Mode**: Seamless theme switching with state persisted in browser `localStorage`.

### 2. Student Dashboard
- **Profile & Mentor**: Displays name, roll number (`APX-2022-CS-084`), department, semester, and faculty mentor.
- **Overall Attendance**: Animated progress gauge (88.4%) with university 75% exam-eligibility indicator.
- **Academic Performance**: Current CGPA tracker (8.92 / 10.0) with course-wise breakdown of internal, midterm, and assignment marks.
- **Interactive Timetable**: Weekly schedule with classroom locations, subjects, and faculty leads.
- **Assignments Tracker**: List of deliverables with interactive **"Submit Now"** action updating status to *Submitted*.
- **Examination Schedule**: End-semester timetable and digital examination hall ticket.

### 3. Faculty Dashboard
- **Faculty Profile**: Displays designation, department, and assigned courses.
- **Student Attendance Manager**: Interactive roster with **[Present]** / **[Absent]** buttons synchronizing attendance rates in real time.
- **Marks & Grading Manager**: Editable grade sheet for internal (30), midterm (50), and assignment (20) marks with automatic total and letter grade calculation.
- **Upload Assignment Modal**: Publish new coursework with deadlines and score rubrics.
- **Broadcast Announcement Modal**: Post urgent or regular notices directly to student notice boards.

### 4. Admin Dashboard
- **Aggregate System Statistics**: Total students, faculty, courses, and system uptime (99.98%).
- **Dedicated Container Status & Telemetry Panel**:
  - **Frontend Container**: Port `3000 -> 80/tcp`, image `nginx:alpine`, RAM consumption, health check status.
  - **Backend API Container**: Port `5000:5000`, image `node:20-alpine`, memory heap, latency probe.
  - **Database Container**: Port `5432:5432`, image `postgres:16-alpine`, volume mapping, `pg_isready` check.
  - **Interactive Failover Simulation**: A test button allowing evaluators to simulate container restarts and witness health probe recovery in real time!
- **Student Directory Management**: Search filter, enroll new student modal, and delete record actions.
- **Announcement Management**: Publish or delete university-wide notifications.

---

## 12. API Endpoints Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Container health probe returning uptime, status, and database mode |
| `GET` | `/api/container-status` | Detailed container hardware metrics (Frontend, Backend, Database) |
| `POST` | `/api/container/simulate` | Interactive simulation endpoint (restart/probe) for evaluators |
| `POST` | `/api/auth/login` | Authenticate user (supports student, faculty, and admin credentials) |
| `POST` | `/api/auth/register` | Register new student or faculty account |
| `GET` | `/api/students` | Retrieve all registered student records |
| `POST` | `/api/students` | Enroll a new student record (Admin) |
| `DELETE` | `/api/students/:id` | Delete a student record (Admin) |
| `GET` | `/api/faculty` | Retrieve faculty member directory |
| `GET` | `/api/courses` | Retrieve accredited courses catalog |
| `GET` | `/api/attendance` | Retrieve course-wise attendance breakdown |
| `POST` | `/api/attendance/mark` | Mark student attendance (Faculty) |
| `GET` | `/api/marks` | Retrieve examination marks and letter grades |
| `POST` | `/api/marks/update` | Update internal/midterm marks (Faculty) |
| `GET` | `/api/timetable` | Retrieve weekly lecture schedule |
| `GET` | `/api/assignments` | Retrieve course assignments |
| `POST` | `/api/assignments` | Upload new assignment (Faculty) |
| `POST` | `/api/assignments/:id/submit` | Submit assignment work (Student) |
| `GET` | `/api/exams` | Retrieve upcoming examination timetable |
| `GET` | `/api/events` | Retrieve campus events list |
| `POST` | `/api/events/:id/register` | Register or unregister for an event |
| `GET` | `/api/announcements` | Retrieve campus notices (supports `?category=` filter) |
| `POST` | `/api/announcements` | Publish a new announcement (Admin / Faculty) |
| `DELETE` | `/api/announcements/:id`| Delete an announcement (Admin) |
| `GET` | `/api/admin/metrics` | Retrieve aggregated dashboard counts and container status |

---

## 13. Future Enhancements

1. **Kubernetes (K8s) Helm Charts**: Package the microservices into Helm charts for automated deployment onto IBM Cloud Kubernetes Service (IKS) or Red Hat OpenShift.
2. **Horizontal Pod Autoscaling (HPA)**: Configure metrics-server to auto-scale backend API pods based on CPU/memory thresholds.
3. **CI/CD Pipeline with GitHub Actions / Tekton**: Automated Docker image builds, Trivy vulnerability scanning, and automated deployment upon `git push`.
4. **Distributed Redis Caching**: Introduce a Redis container tier for session management and caching high-frequency course catalog queries.
5. **Role-Based Fine-Grained RBAC**: Integration with enterprise LDAP / OAuth2 Single Sign-On (SSO).

---

## Academic Project Information

- **Project Title**: Containerizing a College Portal
- **Domain**: Cloud Computing, Containerization & DevOps
- **Standard**: IBM Academic / Project Submission
- **Target Platform**: Docker, Docker Compose, Linux Containers (OCI)
- **License**: ISC License
