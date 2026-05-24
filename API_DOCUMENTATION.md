# College ERP - API Documentation

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.collegeerp.com/api/v1
```

## Authentication

All API requests require JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from the login endpoint and expire after 24 hours.

---

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "roleId": 6
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### Courses

#### Get All Courses
```
GET /courses?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Courses fetched",
  "data": [
    {
      "id": 1,
      "courseName": "BCA",
      "courseCode": "BCA001",
      "courseType": "UG",
      "duration": "3 Years",
      "fees": "100000",
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

#### Get Course by ID
```
GET /courses/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Course fetched",
  "data": {
    "id": 1,
    "courseName": "BCA",
    ...
  }
}
```

#### Create Course
```
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseName": "BCA",
  "courseCode": "BCA001",
  "courseType": "UG",
  "slug": "bca",
  "duration": "3 Years",
  "eligibility": "12th Pass",
  "fees": "100000",
  "description": "Bachelor of Computer Applications"
}

Response:
{
  "success": true,
  "message": "Course created successfully",
  "data": { id: 1, ... }
}
```

#### Update Course
```
PUT /courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseName": "Updated BCA",
  ...
}

Response:
{
  "success": true,
  "message": "Course updated successfully"
}
```

#### Delete Course
```
DELETE /courses/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### Departments

#### Get All Departments
```
GET /departments
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Computer Science",
      "slug": "cs",
      "description": "...",
      "hodId": 5
    }
  ]
}
```

### Faculty

#### Get Faculty by Department
```
GET /faculty?departmentId=1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Smith",
      "photo": "https://...",
      "qualification": "PhD",
      "email": "smith@college.edu"
    }
  ]
}
```

### Inquiries

#### Submit Inquiry
```
POST /inquiries
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "phone": "+919876543210",
  "email": "jane@example.com",
  "courseId": 1,
  "city": "Mumbai",
  "message": "Interested in BCA course",
  "source": "Website"
}

Response:
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": { id: 1, ... }
}
```

#### Get All Inquiries (Admin)
```
GET /inquiries?page=1&limit=20&status=new
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "Jane Doe",
      "phone": "+919876543210",
      "courseId": 1,
      "status": "new",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Update Inquiry Status
```
PUT /inquiries/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called student",
  "assignedTo": 5
}

Response:
{
  "success": true,
  "message": "Inquiry updated successfully"
}
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

### Error Response

```
{
  "success": false,
  "message": "Error message here",
  "errors": null
}
```

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Rate limit headers included in responses

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Pagination

For paginated endpoints:

```
GET /endpoint?page=1&limit=10&sort=createdAt&order=desc
```

Response includes:
```
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use pagination** for list endpoints to improve performance
3. **Validate request data** on client side before sending
4. **Handle token expiration** and refresh automatically
5. **Use appropriate HTTP methods**: GET, POST, PUT, DELETE
6. **Check response status** and handle errors gracefully

---

## Example cURL Requests

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Get Courses
```bash
curl -X GET http://localhost:5000/api/v1/courses \
  -H "Authorization: Bearer <token>"
```

### Create Inquiry
```bash
curl -X POST http://localhost:5000/api/v1/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"John Doe",
    "email":"john@example.com",
    "phone":"+91...",
    "courseId":1,
    "source":"Website"
  }'
```

---

## Webhooks (Future)

Webhooks for events:
- `inquiry.created`
- `user.registered`
- `course.updated`
- `admission.approved`

---

## Support

For API issues, contact: api-support@collegeerp.com
