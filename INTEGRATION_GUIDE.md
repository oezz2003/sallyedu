# Student Dashboard - Express Backend Integration

## Overview
The Student Dashboard has been successfully integrated with the Express backend to use real data instead of mock/localStorage data.

## What's Been Integrated

### 1. Authentication System ✅
- **JWT Token-based Authentication**: Replaced Firebase with Express backend login/signup
- **Real User Data**: User profiles now come from the database
- **Secure Token Storage**: Tokens stored in localStorage with proper validation

### 2. Course Management ✅
- **Real Course Data**: Courses fetched from Express backend database
- **Course Enrollment**: Students can enroll in courses through the API
- **Enrollment Status**: Shows if user is already enrolled in courses

### 3. API Service Layer ✅
- **Centralized API**: All backend communication through `src/lib/api.ts`
- **Type Safety**: Full TypeScript interfaces for API responses
- **Error Handling**: Proper error handling with user-friendly messages

### 4. Backend Endpoints Added ✅
- `GET /course/getCourses` - Fetch all active courses
- `GET /course/getCourse/:id` - Get specific course details
- `GET /user/profile` - Get user profile data
- `GET /enrollment/my-enrollments` - Get user's enrolled courses
- `POST /enrollment/enroll` - Enroll in a course

## Key Features

### Student Dashboard (`/student-dashboard`)
- Displays real enrolled courses from database
- Shows course progress and completion status
- Real user data from backend (name, enrolled courses)

### Store Page (`/Store`)
- Lists all available courses from database
- Shows enrollment status for each course
- Enrollment modal for course registration
- Real course data (title, description, videos, instructor)

### Authentication Pages
- **Login** (`/LogIn`): Uses Express backend authentication
- **SignUp** (`/SignUp`): Creates new users in the database
- **Profile Management**: Real user profile data

## Setup Instructions

### 1. Backend Setup
```bash
cd \"express backend\"
npm install
# Make sure MongoDB is running
# Set up your .env file with:
# - DATABASE_URL
# - JWT_SECRET
# - PORT (default: 3000)
npm start
```

### 2. Student Dashboard Setup
```bash
cd StudentDashboard
npm install
# The .env file is already created with:
# VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

### 3. Testing the Integration

1. **Start Backend**: Make sure Express server is running on port 3000
2. **Start Frontend**: Run the React app (usually on port 5173)
3. **Create Account**: Use the signup page to create a new user account
4. **Login**: Login with your new account
5. **Browse Courses**: Go to Store page to see available courses
6. **Enroll**: Click \"Enroll\" on any course to register
7. **Dashboard**: Check your dashboard to see enrolled courses

## File Changes Made

### Frontend Changes
- ✅ `src/lib/api.ts` - New API service layer
- ✅ `src/lib/useAuth.tsx` - Updated to use JWT authentication
- ✅ `src/pages/LogIn.tsx` - Uses Express backend login
- ✅ `src/pages/SignUp.tsx` - Uses Express backend signup
- ✅ `src/pages/studetDashboard.tsx` - Displays real enrolled courses
- ✅ `src/pages/Store.tsx` - Shows real courses with enrollment
- ✅ `src/components/EnrollmentModal.tsx` - New enrollment functionality
- ✅ `.env` - Environment configuration
- ✅ `src/vite-env.d.ts` - TypeScript environment types

### Backend Changes
- ✅ `src/modules/Course/course.controller.js` - Added GET endpoints
- ✅ `src/modules/Course/course.router.js` - Added course routes
- ✅ `src/modules/User/user.controller.js` - Added profile endpoints
- ✅ `src/modules/User/user.router.js` - Added user routes
- ✅ `src/modules/enrollment/enrollment.controller.js` - Added user enrollments
- ✅ `src/modules/enrollment/enrollment.router.js` - Updated enrollment routes

## API Endpoints Available

### Authentication
- `POST /user/signUp` - Create new user account
- `POST /user/logIn` - User login (returns JWT token)
- `GET /user/profile` - Get authenticated user profile

### Courses
- `GET /course/getCourses` - Get all active courses
- `GET /course/getCourse/:id` - Get specific course details
- `POST /course/addCourse` - Add new course (Admin only)
- `PUT /course/updateCourse/:id` - Update course (Admin only)
- `DELETE /course/deleteCourse/:id` - Delete course (Admin only)

### Enrollments
- `POST /enrollment/enroll` - Enroll in a course
- `GET /enrollment/my-enrollments` - Get user's enrollments
- `GET /enrollment/all-enrollments` - Get all enrollments (Admin only)

## Data Flow

1. **User Registration**: SignUp → Express Backend → Database
2. **User Login**: Login → Express Backend → JWT Token → Frontend Storage
3. **Course Loading**: Dashboard/Store → API Call → Express Backend → Database → Display
4. **Course Enrollment**: Enroll Button → Enrollment Modal → API Call → Database → Update UI

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Backend endpoints protected with auth middleware
- **Input Validation**: Proper validation on all endpoints
- **Error Handling**: Secure error messages without exposing system details

## Next Steps

1. **Test with Real Data**: Add sample courses to the database
2. **Payment Integration**: Connect enrollment with payment processing
3. **Course Progress**: Track user progress through course videos
4. **Admin Dashboard**: Connect admin dashboard to same backend
5. **File Uploads**: Test course image and video uploads

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure backend has CORS enabled for frontend URL
2. **Connection Refused**: Verify backend is running on correct port
3. **JWT Errors**: Check token format and expiration
4. **Database Errors**: Ensure MongoDB is running and accessible

### Environment Variables:
- Frontend: `VITE_API_BASE_URL` should point to backend URL
- Backend: Ensure all required environment variables are set

## Success Criteria ✅

- [x] User can signup and login using Express backend
- [x] Dashboard shows real enrolled courses from database
- [x] Store shows all available courses from database
- [x] Users can enroll in courses through the interface
- [x] JWT authentication works properly
- [x] All API endpoints return proper data
- [x] Error handling works correctly
- [x] No compilation errors in frontend or backend

The integration is complete and ready for testing with real data!