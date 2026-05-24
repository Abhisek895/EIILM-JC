# Backend Setup & Quick Start Guide

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
# Copy and configure environment variables
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=college_erp_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE college_erp_db;
EXIT;

# Run migrations (when implemented)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

## Project Structure

```
src/
├── app.ts                 # Main application entry
├── config/
│   ├── database.ts       # Database connection
│   └── environment.ts    # Configuration variables
├── controllers/          # Request handlers
├── services/             # Business logic
├── repositories/         # Data access layer
├── models/               # Sequelize models
├── routes/               # API routes
├── middlewares/          # Express middlewares
├── validators/           # Input validation
├── helpers/              # Utility functions
├── utils/                # Logger, responses
└── uploads/              # File upload directory
```

## Key Features Implemented

### Authentication
- User registration and login
- JWT token generation
- Password hashing with bcrypt
- Token refresh mechanism

### Service Layer Architecture
- Separation of concerns (Controller → Service → Repository)
- Reusable BaseRepository
- Type-safe operations with TypeScript

### Middleware
- Error handling
- Request logging
- Authentication middleware
- Authorization (RBAC ready)

## API Endpoints

### Authentication
```
POST /api/v1/auth/register    - Register new user
POST /api/v1/auth/login       - User login
POST /api/v1/auth/logout      - User logout
```

## Adding New Features

### 1. Create Model
```typescript
// src/models/NewModel.ts
import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class NewModel extends Model { }

NewModel.init({
  // attributes
}, { sequelize: db, tableName: 'new_models' });

export { NewModel };
```

### 2. Create Repository
```typescript
// src/repositories/NewModelRepository.ts
import { NewModel } from '@models/NewModel';
import { BaseRepository } from './BaseRepository';

export class NewModelRepository extends BaseRepository<NewModel> {
  constructor() {
    super(NewModel);
  }
  // Custom methods
}
```

### 3. Create Service
```typescript
// src/services/NewModelService.ts
import { NewModelRepository } from '@repositories/NewModelRepository';

export class NewModelService {
  private repo: NewModelRepository;
  
  constructor() {
    this.repo = new NewModelRepository();
  }
  // Business logic
}
```

### 4. Create Controller
```typescript
// src/controllers/NewModelController.ts
export class NewModelController {
  async getAll(req: Request, res: Response) {
    // Use service and return response
  }
}
```

### 5. Create Routes
```typescript
// src/routes/v1/newModel.ts
import { Router } from 'express';
import { NewModelController } from '@controllers/NewModelController';

const router = Router();
const controller = new NewModelController();

router.get('/', (req, res) => controller.getAll(req, res));

export default router;
```

## Running Tests

```bash
npm run test
npm run test:watch
```

## Building for Production

```bash
npm run build
npm run start
```

## Docker Support

```bash
# Build image
docker build -t college-erp-backend .

# Run container
docker run -p 5000:5000 --env-file .env college-erp-backend
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module Resolution Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

## Next Steps

1. Implement Sequelize migrations
2. Add validation schemas (Joi)
3. Implement file upload (Multer + Cloudinary/S3)
4. Add Redis caching
5. Implement audit logging
6. Add email notifications
7. Create more resource endpoints (Courses, Departments, etc.)
