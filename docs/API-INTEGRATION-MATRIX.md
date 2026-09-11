# API Integration Matrix: Frontend ↔ Backend

| Module | Frontend Function | HTTP Method | Backend URL Path | Auth Required | Role / Permission Required | Request Payload | Response Schema |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Auth** | `authApi.login` | `POST` | `/api/v1/auth/login` | No | None (Public) | `{ email, password }` | `{ success: true, data: { user, token, refreshToken } }` |
| **Auth** | `authApi.register` | `POST` | `/api/v1/auth/register` | No | None (Forces `role: student`) | `{ name, email, password }` | `{ success: true, data: { id, name, email, roleId } }` |
| **Auth** | `authApi.logout` | `POST` | `/api/v1/auth/logout` | No | None | `{}` | `{ success: true, message: 'Logged out' }` |
| **Auth** | `authApi.me` | `GET` | `/api/v1/auth/me` | Yes | Valid Token | None | `{ success: true, data: SafeUser }` |
| **Auth** | `authApi.refreshToken` | `POST` | `/api/v1/auth/refresh` | No | Valid Refresh Token | `{ refreshToken }` | `{ success: true, data: { token, refreshToken } }` |
| **Auth** | `authApi.requestPasswordChangeOtp` | `POST` | `/api/v1/auth/change-password/request-otp` | Yes | Valid Token | `{}` | `{ success: true, message: 'OTP sent' }` |
| **Auth** | `authApi.verifyPasswordChangeOtp` | `POST` | `/api/v1/auth/change-password/verify-otp` | Yes | Valid Token | `{ otpCode, newPassword }` | `{ success: true, message: 'Password changed' }` |
| **Auth** | `authApi.requestForgotPasswordOtp` | `POST` | `/api/v1/auth/forgot-password/request-otp` | No | None | `{ email }` | `{ success: true, message: 'OTP sent if email exists' }` |
| **Auth** | `authApi.verifyForgotPasswordOtp` | `POST` | `/api/v1/auth/forgot-password/verify-otp` | No | None | `{ email, otpCode, newPassword }` | `{ success: true, message: 'Password reset' }` |
| **Auth** | `authApi.setupPassword` | `POST` | `/api/v1/auth/setup-password` | No | Valid setup token | `{ token, password }` | `{ success: true, message: 'Password setup' }` |
| **Users** | `userApi.getAll` | `GET` | `/api/v1/users` | Yes | `users.read` | Query: `?page=1&limit=20` | `{ success: true, data: SafeUser[] }` |
| **Users** | `userApi.getById` | `GET` | `/api/v1/users/:id` | Yes | `users.read` | None | `{ success: true, data: SafeUser }` |
| **Users** | `userApi.create` | `POST` | `/api/v1/users` | Yes | `users.write` (Non-super_admin cannot create Admin) | `{ name, email, password?, roleId?, permissions? }` | `{ success: true, data: SafeUser }` |
| **Users** | `userApi.update` | `PUT` | `/api/v1/users/:id` | Yes | `users.write` (Non-super_admin cannot edit Admin) | `{ name?, email?, roleId?, permissions?, status? }` | `{ success: true, data: SafeUser }` |
| **Users** | `userApi.remove` | `DELETE` | `/api/v1/users/:id` | Yes | `users.delete` (Cannot delete self or Admin) | None | `{ success: true, message: 'User deleted' }` |
| **Courses** | `courseApi.getAll` | `GET` | `/api/v1/courses` | Optional | Public (`published`) / Admin (`all`) | Query: `?page=1&limit=20&search=` | `{ success: true, data: Course[], pagination: {...} }` |
| **Courses** | `courseApi.getBySlug` | `GET` | `/api/v1/courses/:idOrSlug` | No | None (Public) | None | `{ success: true, data: Course }` |
| **Courses** | `courseApi.getById` | `GET` | `/api/v1/courses/:idOrSlug` | No | None (Public) | None | `{ success: true, data: Course }` |
| **Courses** | `courseApi.create` | `POST` | `/api/v1/courses` | Yes | `courses.write` | `{ courseName, courseType, ... }` | `{ success: true, data: Course }` |
| **Courses** | `courseApi.update` | `PUT` | `/api/v1/courses/:id` | Yes | `courses.write` | `{ courseName?, ... }` | `{ success: true, message: 'Updated' }` |
| **Courses** | `courseApi.remove` | `DELETE` | `/api/v1/courses/:id` | Yes | `courses.delete` | None | `{ success: true, message: 'Deleted' }` |
| **Departments** | `departmentApi.getAll` | `GET` | `/api/v1/departments` | No | None (Public) | Query: `?page=1&limit=50` | `{ success: true, data: Department[], pagination: {...} }` |
| **Departments** | `departmentApi.getBySlug`| `GET` | `/api/v1/departments/:slugOrId`| No | None (Public) | None | `{ success: true, data: Department }` |
| **Departments** | `departmentApi.getById` | `GET` | `/api/v1/departments/:slugOrId`| No | None (Public) | None | `{ success: true, data: Department }` |
| **Departments** | `departmentApi.create` | `POST` | `/api/v1/departments` | Yes | `departments.write` | `{ name, code, ... }` | `{ success: true, data: Department }` |
| **Departments** | `departmentApi.update` | `PUT` | `/api/v1/departments/:id` | Yes | `departments.write` | `{ name?, ... }` | `{ success: true, message: 'Updated' }` |
| **Departments** | `departmentApi.remove` | `DELETE` | `/api/v1/departments/:id` | Yes | `departments.delete` | None | `{ success: true, message: 'Deleted' }` |
| **Faculty** | `facultyApi.getAll` | `GET` | `/api/v1/faculty` | No | None (Public) | Query: `?departmentId=&search=` | `{ success: true, data: Faculty[], pagination: {...} }` |
| **Inquiries** | `inquiryApi.getAll` | `GET` | `/api/v1/inquiries` | Yes | `inquiries.read` | Query: `?page=1&limit=10&status=` | `{ success: true, data: Inquiry[], pagination: {...} }` |
| **Inquiries** | `inquiryApi.create` | `POST` | `/api/v1/inquiries` | No | None (Public website lead) | `{ fullName, email, phone, message, ... }` | `{ success: true, data: Inquiry }` |
| **Inquiries** | `inquiryApi.updateStatus` | `PATCH`| `/api/v1/inquiries/:id/status` | Yes | `inquiries.write` | `{ status, notes? }` | `{ success: true, data: Inquiry }` |
| **Chatbot** | `chatbotApi.sendMessage` | `POST` | `/api/v1/chatbot/chat` | No | None (Public Student/Visitor) | `{ message, sessionId? }` | `{ success: true, response: string, sessionId }` |
| **Chatbot** | `chatbotApi.getAllKnowledge` | `GET` | `/api/v1/chatbot/knowledge` | Yes | `admin` or `super_admin` | None | `{ success: true, data: ChatKnowledgeBase[] }` |
| **Chatbot** | `chatbotApi.createKnowledge` | `POST` | `/api/v1/chatbot/knowledge` | Yes | `admin` or `super_admin` | `{ category, question, answer, keywords? }` | `{ success: true, data: ChatKnowledgeBase }` |
| **Chatbot** | `chatbotApi.deleteKnowledge` | `DELETE`| `/api/v1/chatbot/knowledge/:id` | Yes | `admin` or `super_admin` | None | `{ success: true, message: 'Deleted' }` |
| **Chatbot** | `chatbotApi.uploadDocument` | `POST` | `/api/v1/chatbot/upload` | Yes | `admin` or `super_admin` | Multipart `file` (.pdf, .docx, .txt) | `{ success: true, message: 'Extracted X chunks' }` |
| **Chatbot** | `chatbotApi.getAnalytics` | `GET` | `/api/v1/chatbot/analytics` | Yes | `admin` or `super_admin` | None | `{ success: true, data: { totalSessions, totalMessages } }` |
| **Media** | `mediaApi.upload` | `POST` | `/api/v1/media/upload` | Yes | `media.write` | Multipart `file` (Image, Video, Document) | `{ success: true, data: { url, fileName, fileType } }` |
| **Student** | `studentApi.getProfile` | `GET` | `/api/v1/student/profile` | Yes | `student` role (scoped to `req.user.id`) | None | `{ success: true, data: StudentProfile }` |
| **Student** | `studentApi.getGrades` | `GET` | `/api/v1/student/grades` | Yes | `student` role (scoped to `req.user.id`) | None | `{ success: true, data: Grade[] }` |
| **Student** | `studentApi.getFees` | `GET` | `/api/v1/student/fees` | Yes | `student` role (scoped to `req.user.id`) | None | `{ success: true, data: FeeRecord[] }` |
| **Dashboard** | `dashboardApi.getStats` | `GET` | `/api/v1/dashboard/stats` | Yes | `dashboard.read` | None | `{ success: true, data: { totalUsers, totalStudents, ... } }` |
| **Dashboard** | `dashboardApi.track` | `POST` | `/api/v1/dashboard/track` | No | None (Public anonymous telemetry) | `{ path }` | `{ success: true }` |
