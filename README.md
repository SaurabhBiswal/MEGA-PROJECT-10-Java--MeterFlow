# MeterFlow – Usage-Based API Billing Platform

MeterFlow is a full-stack SaaS platform that allows developers to proxy their APIs, generate secure API keys, track request usage, apply rate limiting, and calculate billing based on usage. It serves as a dynamic API Gateway layer.

## 🚀 Live Demo & Links

- **Frontend Deployment (Vercel):** [INSERT VERCEL LINK HERE]
- **Backend Deployment (Render/Railway):** [INSERT BACKEND LINK HERE]
- **Demo Video:** [INSERT DEMO VIDEO LINK HERE]

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots from your app)*

### Dashboard Analytics
![Dashboard Screenshot](link-to-dashboard-image)

### API Management & Key Generation
![API Management Screenshot](link-to-api-image)

### Secure Authentication
![Login Screenshot](link-to-login-image)

---

## 🧱 Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend:** Java 17, Spring Boot 3.2.x, Spring Security (JWT), Spring Data JPA, Hibernate
- **Database:** PostgreSQL
- **Architecture:** API Gateway Pattern, RESTful Architecture

---

## 🏗️ Core Features

1. **API Gateway Layer (Killer Feature):** 
   - Instead of calling APIs directly, end-users call the MeterFlow Gateway (`/gateway/**`). 
   - MeterFlow validates the custom `X-API-KEY`, logs the request latency and status, and transparently proxies the request to the target API (e.g., PokeAPI).
2. **Usage Tracking & Analytics:**
   - Every request is logged asynchronously.
   - Real-time dashboard showing total requests, active API keys, and dynamic area charts.
3. **Billing Engine:**
   - Calculates usage dynamically based on a Free Tier (1000 requests) and a Pro Tier ($0.50 per 100 requests).
4. **API Key Management:**
   - Developers can register target APIs and generate unique, secure UUID keys to distribute to their clients.

---

## ⚙️ How to Run Locally

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL running on port 5432 (Database name: `meterflow`, User: `postgres`, Password: `password`)

### Backend Setup
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the application using the Maven Wrapper (this downloads Maven automatically if you don't have it installed globally):
   - **Windows:** `.\mvnw spring-boot:run`
   - **Mac/Linux:** `./mvnw spring-boot:run`

### Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 💼 Developer Information
Developed for the Full Stack Assessment. This project highlights a mid-to-senior level architectural pattern by implementing a custom API Gateway and interceptor logic rather than simple CRUD operations.
