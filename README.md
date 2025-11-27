# SIAS - Student Information Access System

A secure, next-generation web-based platform for managing academic records with comprehensive access control models and advanced security features.

## 🎯 Project Overview

SIAS demonstrates the implementation of **five different access control models** working together to provide enterprise-grade security for student information management. Built for the Computer System Security course at Addis Ababa Science and Technology University.

## ✨ Key Features

### Security & Access Control
- ✅ **Multi-Factor Authentication (MFA)** - TOTP-based with Google Authenticator
- ✅ **Role-Based Access Control (RBAC)** - 5 distinct roles with specific permissions
- ✅ **Mandatory Access Control (MAC)** - 4 security levels (Public → Restricted)
- ✅ **Discretionary Access Control (DAC)** - Resource sharing with read/write permissions
- ✅ **Rule-Based Access Control (RuBAC)** - Time-based access restrictions
- ✅ **Attribute-Based Access Control (ABAC)** - Department-based dynamic access

### Authentication & Authorization
- ✅ **Password Security** - Bcrypt hashing, complexity requirements, strength validation
- ✅ **Email Verification** - Token-based verification with time limits
- ✅ **Bot Protection** - Google reCAPTCHA v3 integration
- ✅ **Account Lockout** - 5 failed attempts = 30 min lockout
- ✅ **Password Reset** - Secure email-based reset flow
- ✅ **Session Management** - HTTP-only, secure cookies

### Audit & Compliance
- ✅ **Encrypted Audit Logging** - AES-256-GCM encryption for all logs
- ✅ **Centralized Log Viewer** - Admin dashboard with search/filter
- ✅ **Comprehensive Tracking** - Login, logout, role changes, grade updates, DAC sharing
- ✅ **Automated Backups** - PostgreSQL pg_dump with timestamped files

### Role-Specific Features
- ✅ **Student** - View grades, download transcripts, GPA calculation
- ✅ **Instructor** - Grade management, student roster, course access
- ✅ **Department Head** - Department reports, analytics, GPA tracking
- ✅ **Registrar** - Enrollment management, enroll/drop students
- ✅ **Admin** - User/role management, audit logs, system configuration

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Custom (bcrypt, TOTP)

### Security Libraries
- `bcryptjs` - Password hashing
- `otplib` - TOTP generation
- `qrcode` - QR code generation
- `zxcvbn` - Password strength
- `react-google-recaptcha` - CAPTCHA
- `crypto` (Node.js) - Log encryption

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sias
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sias"
   
   # Authentication
   AUTH_SECRET="your-secret-key-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Email (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="noreply@sias.edu"
   
   # Google reCAPTCHA
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
   RECAPTCHA_SECRET_KEY="your-secret-key"
   
   # Log Encryption
   LOG_ENCRYPTION_KEY="your-32-byte-hex-key"
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npx drizzle-kit push
   
   # (Optional) Seed sample data
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Getting Started

1. **Sign Up** - Create an account at `/sign-up`
2. **Verify Email** - Click the verification link sent to your email
3. **Sign In** - Log in at `/sign-in`
4. **Setup MFA** (Optional) - Navigate to `/settings` to enable MFA
5. **Access Dashboard** - You'll be redirected to your role-specific dashboard

### User Roles

| Role | Default Route | Capabilities |
|------|--------------|--------------|
| **Student** | `/student` | View grades, transcripts, GPA |
| **Instructor** | `/instructor` | Manage grades, view roster |
| **Department Head** | `/department-head` | View department reports, analytics |
| **Registrar** | `/registrar` | Enroll/drop students, manage courses |
| **Admin** | `/admin` | User management, audit logs, system config |

### Admin Features

**User Management** (`/admin/users`)
- View all users
- Change user roles
- View MFA status

**Audit Logs** (`/admin/audit-logs`)
- Search and filter logs
- View encrypted log details
- Export logs

### Instructor Features

**Grade Management** (`/instructor/grades`)
- View enrolled students
- Enter/update grades
- Track submission status

### Student Features

**Transcripts** (`/student/transcripts`)
- View course history
- Calculate GPA automatically
- Download transcript

### Registrar Features

**Enrollment Management** (`/registrar/enrollments`)
- Enroll students in courses
- Drop students from courses
- View all enrollments

**Note**: Registrar access is restricted to business hours (Monday-Friday, 9 AM - 5 PM)

## 📚 API Documentation

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference with all endpoints, request/response formats, and authentication requirements.

## 🔒 Security Features

### Access Control Models

1. **MAC (Mandatory)** - System-enforced security levels
2. **DAC (Discretionary)** - Owner-controlled resource sharing
3. **RBAC (Role-Based)** - Permission based on user role
4. **RuBAC (Rule-Based)** - Context-based access (time, location)
5. **ABAC (Attribute-Based)** - Dynamic policy-based access

### Authentication Flow

```
Sign Up → Email Verification → Sign In → [MFA Challenge] → Dashboard
```

### Password Requirements

- Minimum 12 characters
- Complexity requirements enforced
- Strength validation with zxcvbn
- History tracking (prevents reuse)
- Bcrypt hashing with auto-salting

### Account Security

- **Lockout**: 5 failed attempts = 30 min lockout
- **Session**: HTTP-only, secure cookies
- **MFA**: TOTP with backup codes
- **Reset**: Email-based password reset

## 🗄️ Database Schema

Key tables:
- `users` - User accounts with roles and security levels
- `sessions` - Active user sessions
- `students`, `instructors` - Role-specific data
- `courses`, `enrollments`, `grades` - Academic records
- `audit_logs` - Encrypted activity logs
- `dac_shares` - Resource sharing permissions
- `password_history`, `password_resets` - Password management

## 🧪 Testing

```bash
# Run verification script
npm run verify

# Build for production
npm run build

# Run production server
npm start
```

## 📊 Backup & Restore

### Create Backup
```bash
npm run backup
```

This creates a timestamped SQL file in the `backups/` directory.

### Restore Backup
```bash
psql -U username -d sias < backups/backup-YYYYMMDD-HHMMSS.sql
```

## 🛠️ Development

### Project Structure
```
sias/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Role-specific dashboards
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/                # Utilities and helpers
│   │   ├── access-control.ts
│   │   ├── audit-logger.ts
│   │   ├── encryption.ts
│   │   └── ...
│   └── db/                 # Database schema
├── scripts/                # Utility scripts
│   ├── backup-db.ts
│   └── verify.ts
└── public/                 # Static assets
```

### Key Files
- `src/lib/access-control.ts` - All access control logic
- `src/lib/audit-logger.ts` - Audit logging with encryption
- `src/lib/encryption.ts` - AES-256-GCM encryption
- `src/middleware.ts` - Route protection and RuBAC
- `src/db/schema.ts` - Database schema definition

## 📝 Assignment Compliance

This project fully implements all requirements from the Computer System Security Project Two assignment:

✅ All 5 Access Control Models (MAC, DAC, RBAC, RuBAC, ABAC)  
✅ Comprehensive Audit Trails with Encryption  
✅ Automated Data Backups  
✅ Complete Authentication Suite (MFA, Email Verification, CAPTCHA)  
✅ Password Security (Policies, Hashing, Lockout, Reset)  
✅ Role-Specific Functionalities  

## 🤝 Contributing

This is an academic project. For questions or suggestions, please contact the project maintainer.

## 📄 License

This project is created for educational purposes as part of the Computer System Security course.

## 👥 Authors

- **Student Name** - Addis Ababa Science and Technology University
- **Course**: Computer System Security
- **Project**: Student Information Access System (SIAS)

## 🙏 Acknowledgments

- Addis Ababa Science and Technology University
- Department of Software Engineering
- Computer System Security Course Instructors

---

**Note**: This is a demonstration project for educational purposes. In a production environment, additional security measures and compliance requirements would need to be implemented.
