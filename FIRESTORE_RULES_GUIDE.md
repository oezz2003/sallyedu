# Firestore Security Rules - Deployment Guide

## Overview
This document provides comprehensive Firestore security rules for the sallyedu educational platform, supporting both student and admin dashboard functionality with role-based access control.

## Security Model

### User Roles and Permissions
1. **Students (role: 'user')**
   - Access their own profile and data
   - Read published courses
   - Manage their own enrollments and progress
   - View their own payments and certificates
   - Create support tickets

2. **Admins (role: 'admin')**
   - Full access to all user management
   - Complete course management (CRUD operations)
   - Enrollment and payment management
   - Analytics and reporting access
   - System settings configuration

3. **Editors (role: 'editor')**
   - Similar to admin but with restricted permissions
   - Cannot modify other admin accounts
   - Limited system settings access

### Access Control Logic
- **Age-based restrictions**: Users under 18 cannot access admin functions
- **Account type verification**: Student accounts are denied admin access
- **Role hierarchy**: Admin > Editor > User
- **Self-ownership**: Users can always access their own data

## Collection Security Rules

### Users Collection
```
/users/{userId}
```
- **Read**: Own document OR admin access
- **Write**: Own document OR admin (with role change restrictions)
- **Create**: Admin only (for user management)
- **Admin restrictions**: Cannot change own role, cannot modify other admin roles

### Courses Collection
```
/courses/{courseId}
```
- **Read**: Published courses (public) OR admin access OR enrolled students
- **Write**: Admin only
- **Status-based access**: Draft courses only visible to admins

### Enrollments Collection
```
/enrollments/{enrollmentId}
```
- **Read**: Own enrollments OR admin access
- **Create**: Students (own enrollments) OR admin
- **Update**: Progress updates (students) OR full management (admin)

### Payments Collection
```
/payments/{paymentId}
```
- **Read**: Own payments OR admin access
- **Create**: Students during checkout
- **Update**: Status updates during processing OR admin refund management

### Additional Collections
- **Certificates**: Student completion records
- **Analytics**: Admin-only dashboard data
- **Settings**: Public read, admin write
- **Notifications**: User-specific messaging
- **Support**: Customer service tickets
- **Logs**: Admin-only audit trails

## Deployment Instructions

### 1. Deploy to Firebase Console
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

### 2. Deploy via Firebase CLI in Project
```bash
# From the project root directory
cd "c:\Users\Nero\Documents\GitHub\sallyedu"

# Deploy rules
firebase deploy --only firestore:rules --project lms-ibsra
```

### 3. Manual Deployment via Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `lms-ibsra`
3. Navigate to Firestore Database > Rules
4. Copy and paste the rules from `firestore.rules`
5. Click "Publish"

## Testing the Rules

### Test Cases to Verify

1. **Student Access**
   ```javascript
   // Should succeed
   firestore.doc('users/studentUserId').get()
   firestore.collection('courses').where('status', '==', 'published').get()
   
   // Should fail
   firestore.collection('users').get() // All users
   firestore.doc('courses/courseId').update({status: 'draft'}) // Course modification
   ```

2. **Admin Access**
   ```javascript
   // Should succeed
   firestore.collection('users').get() // All users
   firestore.doc('courses/courseId').update({title: 'New Title'}) // Course management
   firestore.collection('analytics').get() // Dashboard data
   
   // Should fail (self-role change)
   firestore.doc('users/adminUserId').update({role: 'user'}) // Own role change
   ```

3. **Unauthenticated Access**
   ```javascript
   // Should succeed
   firestore.collection('courses').where('status', '==', 'published').get()
   firestore.doc('settings/publicSetting').get()
   
   // Should fail
   firestore.doc('users/anyUserId').get() // User data
   firestore.collection('enrollments').get() // Private data
   ```

## Security Considerations

### Best Practices Applied
1. **Principle of Least Privilege**: Users only get minimum required access
2. **Defense in Depth**: Multiple validation layers for critical operations
3. **Data Validation**: Required fields and value constraints
4. **Audit Trail**: Admin actions are logged (via Cloud Functions)
5. **Self-Ownership Protection**: Users cannot escalate their own privileges

### Additional Recommendations
1. **Enable Firestore Security Rules Simulator** for testing
2. **Set up monitoring** for rule violations and suspicious activity
3. **Regular security audits** of user roles and permissions
4. **Implement rate limiting** for sensitive operations
5. **Use Cloud Functions** for complex business logic and server-side validation

## Troubleshooting

### Common Issues
1. **"Permission denied" errors**
   - Check user authentication status
   - Verify user role and account type
   - Ensure proper document ownership

2. **Admin dashboard not loading**
   - Confirm user has admin/editor role
   - Check age requirements (>= 18)
   - Verify account type is 'adult' for non-admin roles

3. **Student enrollment issues**
   - Ensure course is published
   - Check enrollment document structure
   - Verify user authentication

### Debug Commands
```bash
# Test rules locally
firebase emulators:start --only firestore

# Check rule coverage
firebase firestore:rules:test --project lms-ibsra
```

## Maintenance

### Regular Tasks
1. **Review user roles** quarterly
2. **Audit admin access** monthly
3. **Update rules** as features evolve
4. **Monitor performance** of complex rules
5. **Clean up inactive users** according to data retention policy

### Version Control
- Keep rules in version control (`firestore.rules`)
- Document changes in commit messages
- Test rules in staging environment before production deployment
- Maintain backup of working rules before major changes

## Support
For issues with these security rules, contact the development team or review the Firebase documentation at https://firebase.google.com/docs/firestore/security/rules-conditions