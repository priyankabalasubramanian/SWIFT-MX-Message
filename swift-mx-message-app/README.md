# SWIFT MX Message Portal (ISO 20022 Financial Messaging Engine)

A full-stack banking portal for creating, validating, persisting, and querying ISO 20022 SWIFT MX messages (`pacs.008.001.08`, `pacs.009`, etc.). Built with **React + Vite** on the frontend, **Spring Boot 3.3 (Java 17/21/25)** on the backend, and **MySQL 8.0** for data persistence.

---

## 1. Architecture Overview

```text
swift-mx-message-app/
├── database/
│   ├── init.sql               # MySQL creation and table schema script
│   └── sample-pacs008.xml     # Reference ISO 20022 pacs.008 XML payload
├── backend/
│   ├── pom.xml                # Maven dependencies (Spring Boot, JPA, Security, JJWT, MySQL)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-local.properties.example
│   └── src/main/java/com/swiftmx/app/
│       ├── SwiftMxApplication.java
│       ├── config/            # SecurityConfig (JWT + BCrypt), CorsConfig, DataInitializer
│       ├── controller/        # AuthController, MessageController
│       ├── dto/               # LoginRequest, LoginResponse, MessageCreateRequest, MessageResponse
│       ├── model/             # User, Message entities
│       ├── repository/        # UserRepository, MessageRepository
│       └── service/           # AuthService, MessageService, XmlGeneratorService
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── services/api.js    # JWT API Client
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── MessageCreation.jsx
        │   └── MessageInquiry.jsx
        └── utils/xmlGenerator.js
```

---

## 2. Prerequisites

- **Java JDK**: 17, 21, or 25 installed
- **Node.js**: v18+ and npm installed
- **MySQL Server**: 8.0 running on port 3306
- **Apache Maven**: 3.9+ (or local tools Maven wrapper)

---

## 3. MySQL Database Setup

1. Open your terminal or MySQL command-line client:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

2. Run the initialization script located in `database/init.sql`:
   ```sql
   source c:/Users/HP/OneDrive/Desktop/SWIFT MX Message Creation/swift-mx-message-app/database/init.sql;
   ```
   *(Or execute the SQL commands in MySQL Workbench).*

3. The script creates:
   - Database: `swift_mx_db`
   - Table `users`: Stores login credentials with BCrypt password hashes.
   - Table `messages`: Stores payment fields, unique Message IDs, and `LONGTEXT` XML payloads.
   - Pre-seeded users:
     - `operator@swiftmx.bank` (Password: `password123`)
     - `admin@swiftmx.bank` (Password: `password123`)

---

## 4. Environment Variables & Credentials

Set database credentials via system environment variables or PowerShell prior to launching the backend:

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "swift_mx_db"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password_here"   # Enter your local MySQL password
```

> **Security Note:** Real database passwords are never committed to version control. `backend/.gitignore` excludes all `.env` and `application-local.properties` files.

---

## 5. Running the Backend (Spring Boot)

1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd "c:\Users\HP\OneDrive\Desktop\SWIFT MX Message Creation\swift-mx-message-app\backend"
   ```

2. Run the Spring Boot application using Maven:
   ```powershell
   & "C:\Users\HP\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
   ```
   *(Or build the JAR via `mvn package -DskipTests` and run with `java -jar target/swift-mx-backend-0.1.0-SNAPSHOT.jar`).*

3. The REST API will be active at `http://localhost:8080`.

---

## 6. Running the Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd "c:\Users\HP\OneDrive\Desktop\SWIFT MX Message Creation\swift-mx-message-app\frontend"
   ```

2. Start the Vite development server:
   ```powershell
   npm run dev
   ```

3. Open **`http://localhost:5173`** in your browser.

---

## 7. REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates operator, verifies BCrypt hash, returns JWT | No |
| `POST` | `/api/auth/logout` | Terminates active operator session | No |
| `POST` | `/api/messages` | Validates, generates/escapes XML, saves message in MySQL | Yes (Bearer JWT) |
| `GET` | `/api/messages` | Retrieves all saved messages sorted by creation date | Yes (Bearer JWT) |
| `GET` | `/api/messages/{id}` | Retrieves a message by ID or Message ID string with its XML | Yes (Bearer JWT) |
| `GET` | `/api/messages/search?q={query}` | Searches saved messages by ID, BIC, counterparty, or type | Yes (Bearer JWT) |

---

## 8. Verification & Testing Workflow

1. **Sign In**:
   - Access `http://localhost:5173`.
   - Log in using Email Address: `operator@swiftmx.bank` and Password: `password123`.
   - The backend validates the credentials against MySQL and returns a JWT token.

2. **Create and Persist a Message**:
   - Fill in message fields (e.g. `MSG-2026-9001`, `SCBLUS33XXX`, `EMBKDEFFXXX`, `50000.00 USD`).
   - Click **Save & Preview XML**.
   - The backend validates the inputs, escapes special characters (`&`, `<`, `>`, `"`, `'`), generates the `pacs.008` XML payload, and stores the record in MySQL.
   - The preview card appears with **Copy XML** and **Download XML** actions.

3. **Inquiry & Search**:
   - Navigate to the **Message Inquiry** tab.
   - The frontend retrieves saved records from `GET /api/messages`.
   - Search by BIC (`SCBL`) or currency (`USD`) to test server-side queries.
   - Click **View Details** to inspect counterparty breakdowns and view the saved XML payload.
