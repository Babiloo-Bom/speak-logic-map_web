# Function Provider Authentication System Setup

This guide will help you set up and test the complete authentication system with PostgreSQL database, JWT tokens, and role-based access control.

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- Git installed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

1. Create a new PostgreSQL database:
```sql
CREATE DATABASE function_provider;
```

2. Create a `.env.local` file in the project root with your database configuration:
```bash
# Copy from env.example and update with your values
cp env.example .env.local
```

3. Update `.env.local` with your settings:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=function_provider
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here-min-32-chars

# Email Configuration (optional for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Social Login Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### 3. Initialize Database Schema

1. Start the development server:
```bash
npm run dev
```

2. Initialize the database by making a POST request to:
```bash
curl -X POST http://localhost:3000/api/init-db
```

Or visit `http://localhost:3000/api/init-db` in your browser (will show error, but check console for success message).

## Testing the Authentication System

### 1. Register a New User

1. Navigate to: `http://localhost:3000/auth/sign-up`
2. Fill out the registration form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: TestPassword123
   - Confirm Password: TestPassword123
3. Click "Sign Up"
4. You'll see a success message (email verification is optional for testing)

### 2. Verify Email (Optional)

If email is configured, check your email for verification link. Otherwise, manually activate the user:

```sql
UPDATE users SET status = 'active' WHERE email = 'test@example.com';
```

### 3. Sign In

1. Navigate to: `http://localhost:3000/auth/sign-in`
2. Enter credentials:
   - Email: test@example.com
   - Password: TestPassword123
3. Click "Sign In"
4. You should be redirected to the main application

### 4. Test Profile Management

1. Navigate to: `http://localhost:3000/profile`
2. View your profile information
3. Click "Edit" to update profile details
4. Test the "Test Protected API" button
5. Change your role using the demo role buttons
6. Test the "Test Admin API" button (after changing to admin role)

### 5. Test Role-Based Access Control

1. In the profile page, change your role to different values:
   - `user` - Basic user access
   - `admin` - Full admin access
   - `moderator` - Moderator access
   - `premium` - Premium user access

2. Test API endpoints with different roles:
   - `/api/protected/demo` - Requires any authenticated user
   - `/api/protected/admin` - Requires admin role

### 6. Test Password Reset

1. Navigate to: `http://localhost:3000/auth/forgot-password`
2. Enter your email address
3. If email is configured, check for reset email
4. Follow the reset link to set a new password

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Sign in user
- `POST /api/auth/logout` - Sign out user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-role` - Change user role (demo)

### Protected Endpoints
- `GET /api/protected/demo` - Test protected endpoint
- `GET /api/protected/admin` - Test admin-only endpoint

## Database Schema

The system creates the following tables:
- `users` - User authentication data
- `profiles` - User profile information
- `user_tokens` - Email verification and password reset tokens
- `refresh_tokens` - JWT refresh tokens
- `geopoints` - Geographic location data
- `file_assets` - File upload metadata
- `user_locations` - User location tracking
- `live_sessions` - Live streaming sessions
- `simulation_settings` - User simulation preferences

## Features Implemented

✅ **User Registration & Authentication**
- Email/password registration
- JWT-based authentication
- Refresh token rotation
- Email verification (optional)
- Password reset functionality

✅ **Role-Based Access Control (RBAC)**
- User roles: user, admin, moderator, premium
- API endpoint protection by role
- Dynamic role changes (for demo)

✅ **User Profile Management**
- Profile creation and updates
- User information display
- Role management

✅ **Security Features**
- Password hashing with bcrypt
- JWT tokens with expiration
- HTTP-only refresh token cookies
- CSRF protection
- Input validation and sanitization

✅ **UI/UX Following Design System**
- Modern, clean interface
- Responsive design
- Loading states and error handling
- Form validation with user feedback
- Social login UI (ready for implementation)

## Next Steps

1. **Social Authentication**: Implement Google, Facebook, Apple login
2. **Email Service**: Configure SMTP for production email sending
3. **File Uploads**: Implement avatar upload functionality
4. **Advanced RBAC**: Add permission-based access control
5. **Audit Logging**: Track user actions and security events
6. **Rate Limiting**: Add API rate limiting for security
7. **Production Deployment**: Configure for production environment

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env.local`
- Verify database exists and user has proper permissions

### Authentication Issues
- Check JWT secrets are properly set
- Verify tokens in browser localStorage
- Check browser console for error messages

### Email Issues
- Verify SMTP configuration
- Check email provider app passwords
- Email functionality is optional for testing

For additional help, check the browser console and server logs for detailed error messages.
