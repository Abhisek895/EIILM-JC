# Frontend Setup & Quick Start Guide

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

```bash
# Copy environment variables
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=College ERP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
src/
├── api/              # API clients and endpoints
├── assets/           # Images, fonts, static files
├── components/       # Reusable UI components
├── dashboard/        # Dashboard-specific components
├── hooks/            # Custom React hooks
├── layouts/          # Page layouts (Main, Dashboard)
├── pages/            # Next.js pages and routes
├── store/            # Redux state management
├── styles/           # Global CSS and Tailwind
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Key Technologies

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Language**: TypeScript

## Features Implemented

### Phase 1
- ✅ Authentication (login/register pages)
- ✅ Redux store setup with auth slice
- ✅ API client with interceptors
- ✅ Main layout with navigation and footer
- ✅ Dashboard layout with sidebar
- ✅ Home page with hero section
- ✅ Basic styling with Tailwind CSS

### Available Pages

- **`/`** - Home page with hero and features
- **`/auth/login`** - Login page
- **`/dashboard`** - Admin dashboard

## Using the Auth System

### Login Example

```typescript
import { useAuth } from '@hooks/useAuth';

export default function MyComponent() {
  const { login, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      // User logged in
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Using API Client

```typescript
import { courseApi } from '@api/endpoints';

// Fetch courses
const courses = await courseApi.getAll(1, 10);

// Create course
const newCourse = await courseApi.create({
  courseName: 'BCA',
  courseCode: 'BCA001',
  courseType: 'UG',
  // ...
});

// Update course
await courseApi.update(1, { courseName: 'Updated BCA' });

// Delete course
await courseApi.delete(1);
```

## Creating New Pages

### 1. Create Page File

```typescript
// src/pages/courses.tsx
import MainLayout from '@layouts/MainLayout';

export default function CoursesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Courses</h1>
        {/* Course content */}
      </div>
    </MainLayout>
  );
}
```

### 2. Create Dashboard Page

```typescript
// src/pages/dashboard/courses.tsx
import DashboardLayout from '@layouts/DashboardLayout';
import { courseApi } from '@api/endpoints';
import { useState, useEffect } from 'react';

export default function DashboardCoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    courseApi.getAll().then(setCourses);
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Course Management</h1>
        {/* Course list and management */}
      </div>
    </DashboardLayout>
  );
}
```

## Adding Redux State

```typescript
// 1. Create slice
export const slice = createSlice({
  name: 'courses',
  initialState,
  reducers: { /* ... */ }
});

// 2. Add to store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
  }
});

// 3. Use in component
const courses = useSelector(state => state.courses.list);
const dispatch = useDispatch();
```

## Build & Deployment

### Build for Production

```bash
npm run build
```

### Export Static Site

```bash
npm run export
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | No |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | No |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary setup | No |

## Performance Optimization

- Lazy loading pages with `next/dynamic`
- Image optimization with `next/image`
- CSS-in-JS with Tailwind
- Code splitting by default
- Static generation where possible

## Development Guidelines

1. **Folder Structure**: Keep related files together
2. **Components**: Make them small, reusable, and well-typed
3. **Styling**: Use Tailwind utility classes
4. **State**: Use Redux for global state, local hooks for components
5. **API**: Use centralized `apiClient` and `endpoints`
6. **Types**: Define interfaces for all data structures

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### API Connection Issues

- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Ensure backend is running on correct port
- Check browser console for CORS errors

## Next Steps

1. Create course management pages
2. Implement inquiry form
3. Add media upload functionality
4. Create admin dashboard pages
5. Implement analytics
6. Add search functionality
7. Set up SEO optimizations

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [TypeScript](https://www.typescriptlang.org/docs/)
