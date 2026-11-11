# HostelSync

Full-stack college hostel management: digital out-passes, maintenance complaints with photos, mess attendance and feedback.

## Tech stack
- Frontend: React 18, Vite, Axios, React Router, HTML5/CSS3
- Backend: Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA / Hibernate
- Database: MySQL 8
- Services: Cloudinary (complaint photos), Spring Mail (email alerts)
- Build: Apache Maven

## Architecture

```
React (Vite, :5173)
   |  Axios + "Authorization: Bearer <JWT>"
   v
Spring Boot REST API (:8080)
   JwtAuthFilter -> SecurityConfig (role rules, @PreAuthorize)
   Controllers -> Services -> Spring Data JPA repositories -> MySQL
                     |-> CloudinaryService (image upload, returns URL stored in DB)
                     |-> EmailService (async SMTP alerts)
```

## Roles
| Role | Can do |
|---|---|
| STUDENT | Apply for out-pass, log complaints (with photo), submit mess attendance/feedback |
| WARDEN | Approve/reject out-passes, manage rooms and allocation, view mess headcount and ratings, view complaints |
| TECHNICIAN | View complaints, set status Pending / In Progress / Resolved with a note |

Students self-register. Demo staff accounts are seeded on first run:
- warden@hostelsync.com / warden123
- tech@hostelsync.com / tech123

Change these before any real deployment.

## Setup

### 1. Database
Install MySQL and make sure it is running. The database `hostelsync` is created automatically.

### 2. Backend
Configure via environment variables (defaults are in `application.properties`):

```
DB_USER, DB_PASSWORD
JWT_SECRET                (32+ characters)
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
MAIL_USER, MAIL_PASSWORD  (Gmail: use an App Password)
```

```
cd backend
mvn spring-boot:run
```

Without Cloudinary credentials, complaints with a photo fail (without a photo they work). Without mail credentials, emails are logged as warnings and the app keeps working.

### 3. Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173.

## REST API (all except /auth require a JWT)
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/users/me | any |
| GET | /api/users/students | WARDEN |
| POST | /api/outpasses | STUDENT |
| GET | /api/outpasses/my | STUDENT |
| GET | /api/outpasses?status= | WARDEN |
| PUT | /api/outpasses/{id}/decision | WARDEN |
| POST | /api/complaints (multipart: category, description, image) | STUDENT |
| GET | /api/complaints/my | STUDENT |
| GET | /api/complaints?status= | WARDEN, TECHNICIAN |
| PUT | /api/complaints/{id}/status | TECHNICIAN |
| POST | /api/mess | STUDENT |
| GET | /api/mess/my | STUDENT |
| GET | /api/mess/report?date= | WARDEN |
| GET/POST | /api/rooms, GET /api/rooms/summary | WARDEN |
| POST | /api/rooms/{id}/allocate | WARDEN |

## Email alerts
Welcome on registration, out-pass submitted and decided, technicians notified of new complaints, students notified of complaint status changes.

## Project layout
```
backend/src/main/java/com/hostelsync/
  config/ controller/ dto/ model/ repository/ security/ service/
frontend/src/
  pages/ components/ api.js AuthContext.jsx
```
