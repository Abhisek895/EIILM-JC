# Complete Project Setup & Development Guide

## Directory Structure

```
EIILM-JC/
├── README.md
├── ARCHITECTURE.md          # High-level architecture blueprint
├── backend/                 # Node.js + Express backend
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── dockerfile
│   ├── SETUP.md
│   └── .env.example
├── frontend/                # Next.js + React frontend
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── SETUP.md
│   └── .env.local.example
├── database/                # Database schemas
│   └── schema.sql
└── docs/                    # Additional documentation
```

## Quick Start (5 Minutes)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Backend runs at http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### Database

```bash
# Create database
mysql -u root -p < database/schema.sql

# Verify connection from backend
# You should see "✓ Database connected successfully" in backend logs
```

## Development Workflow

### 1. Backend Development

The backend follows enterprise architecture:
- **Controller** → receives requests
- **Service** → business logic
- **Repository** → data access
- **Model** → database schema

#### Adding New Endpoint

1. Create model in `src/models/`
2. Create repository in `src/repositories/`
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Add routes in `src/routes/v1/`

#### Example: Course API

```typescript
// 1. Model already exists
// 2. Repository
class CourseRepository extends BaseRepository<Course> {
  async findByType(type: string) {
    return this.findAll({ where: { courseType: type } });
  }
}

// 3. Service
class CourseService {
  private repo = new CourseRepository();
  async getAllCourses() {
    return this.repo.findAll();
  }
}

// 4. Controller
class CourseController {
  private service = new CourseService();
  async getAll(req, res) {
    const courses = await this.service.getAllCourses();
    ApiResponse.success(res, 200, 'Courses fetched', courses);
  }
}

// 5. Routes
router.get('/courses', (req, res) => controller.getAll(req, res));
```

### 2. Frontend Development

The frontend uses Next.js with TypeScript, Redux, and Tailwind.

#### Adding New Page

1. Create page in `src/pages/`
2. Use existing layouts (MainLayout or DashboardLayout)
3. Use API client to fetch data
4. Build components in `src/components/`

#### Example: Courses Page

```typescript
// src/pages/courses.tsx
import { courseApi } from '@api/endpoints';
import { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    courseApi.getAll().then(setCourses);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-8">
        {courses.map(course => (
          <div key={course.id} className="card mb-4">
            <h2>{course.courseName}</h2>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
```

## Key Concepts

### Service/Repository Pattern

```
Request
   ↓
Controller (receives request)
   ↓
Service (business logic)
   ↓
Repository (database operations)
   ↓
Database
```

**Benefits:**
- Separation of concerns
- Easy testing
- Reusable business logic
- Clean code

### Redux State Management

```typescript
// Action → Reducer → Store → Component
dispatch(loginStart());         // Trigger action
// → Reducer updates state
// → Component re-renders with new state
```

**Usage:**
```typescript
const auth = useSelector(state => state.auth);
const dispatch = useDispatch();
dispatch(loginSuccess(data));
```

### API Client Interceptors

Automatically:
- Attaches JWT token to requests
- Handles 401 (redirect to login)
- Manages errors
- Logs requests in dev mode

## Database Schema

Core tables:
- `users` - User accounts
- `roles` - User roles (Super Admin, Admin, etc.)
- `permissions` - Module-level permissions
- `courses` - Course information
- `departments` - Department information
- `faculty` - Faculty profiles
- `inquiries` - Student inquiries
- `site_settings` - Dynamic configuration
- `audit_logs` - Activity tracking
- `media_library` - File management

## Project Phases

### Phase 1: Foundation ✅
- [x] Authentication system
- [x] Database setup
- [x] Backend structure
- [x] Frontend structure
- [x] API client

### Phase 2: Core Modules (Next)
- [ ] Course Management API
- [ ] Department Management API
- [ ] Faculty Management API
- [ ] Course listing pages
- [ ] Department pages
- [ ] Faculty pages

### Phase 3: CMS Features
- [ ] Dynamic homepage
- [ ] Page builder
- [ ] Inquiry management
- [ ] Media library UI
- [ ] SEO settings

### Phase 4: Admin Features
- [ ] Dashboard analytics
- [ ] User management
- [ ] Role permissions UI
- [ ] Activity logs
- [ ] Settings panel

### Phase 5: ERP Integration
- [ ] Student portal
- [ ] Attendance system
- [ ] Grades management
- [ ] Fee management
- [ ] Notifications

## Important Files

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System design and requirements |
| `database/schema.sql` | Database structure |
| `backend/SETUP.md` | Backend installation guide |
| `frontend/SETUP.md` | Frontend installation guide |
| `.env.example` | Environment variables template |
| `package.json` | Project dependencies |
| `tsconfig.json` | TypeScript configuration |

## Security Best Practices

✅ Already Implemented:
- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation ready (Joi)

🔐 To Implement:
- Database encryption for sensitive fields
- API key management
- Session tracking
- Audit logging
- File upload validation
- SQL injection prevention (via ORM)

## Performance Tips

- ✅ Database connection pooling
- ✅ Middleware pagination
- ✅ Lazy loading on frontend
- ✅ Image optimization with Next.js
- 🔜 Redis caching (to implement)
- 🔜 Elasticsearch for search (future)

## Deployment

### Backend (Render/AWS)
1. Push code to GitHub
2. Connect to Render/AWS
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Connect GitHub to Vercel
2. Set environment variables
3. Auto-deploy on push

### Database (AWS RDS/PlanetScale)
1. Create RDS instance
2. Update `DB_HOST` in backend `.env`
3. Run migrations

## Monitoring & Logs

- Backend logs to `logs/app.log` and `logs/error.log`
- Winston logger configured
- Request logging middleware active
- Error handler with stack traces

## Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## Troubleshooting Checklist

- [ ] Backend and frontend `.env` files configured?
- [ ] MySQL server running?
- [ ] Ports 5000 and 3000 available?
- [ ] `npm install` completed for both?
- [ ] Database schema imported?
- [ ] Backend shows "✓ Database connected"?
- [ ] Frontend shows page at localhost:3000?

## Next Actions

1. ✅ Architecture blueprint created
2. ✅ Backend scaffolding done
3. ✅ Frontend scaffolding done
4. ✅ Database schema provided
5. **Next**: Run local setup and test authentication
6. **Then**: Implement course management endpoints
7. **Then**: Create dashboard pages

## Support & Documentation

- Architecture: See `ARCHITECTURE.md`
- Backend: See `backend/SETUP.md`
- Frontend: See `frontend/SETUP.md`
- Database: See `database/schema.sql`
- API Design: RESTful endpoints in backend routes
- TypeScript: Strict mode enabled in both projects

---

**Ready to develop?** Follow the Quick Start above, then refer to appropriate SETUP.md file for detailed guidance.
