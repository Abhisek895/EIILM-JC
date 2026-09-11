# Complete API Audit Matrix

This matrix documents every backend route implemented in the College ERP platform, tracing its authentication, authorization, tenant isolation, validation, backend pipeline, database operation, and frontend integration.

---

## 1. Authentication & Identity (`/api/v1/auth`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | None (Public) | None | Ignored (Client `roleId` rejected) | Name, valid email, password min 6 chars | `AuthController.register` → `UserService.createUser` | `users` | `authApi.register` | `{ name, email, password }` | 201 Created `{ id, name, email, roleId: 4 }` | **PASS** |
| `POST` | `/api/v1/auth/login` | None (Public) | None | None | Email, password required | `AuthController.login` → `UserService.authenticateUser` | `users` | `authApi.login` | `{ email, password }` | 200 OK `{ user, token, refreshToken }` | **PASS** |
| `POST` | `/api/v1/auth/refresh` | None | Refresh Token Secret | None | `refreshToken` required | `AuthController.refresh` → `UserService.verifyRefreshToken` | `users` | `authApi.refreshToken` | `{ refreshToken }` | 200 OK `{ token, refreshToken, user }` | **PASS** |
| `GET` | `/api/v1/auth/me` | Bearer Token | Any authenticated user | None | Header `Authorization` | `AuthController.me` → `UserService.getUserById` | `users` | `authApi.me` | None | 200 OK `{ id, name, email, role, status }` | **PASS** |
| `POST` | `/api/v1/auth/logout` | Optional | None | None | None | `AuthController.logout` | None | `authApi.logout` | `{}` | 200 OK `{ message: 'Logout successful' }` | **PASS** |
| `POST` | `/api/v1/auth/change-password/request-otp` | Bearer Token | Authenticated user | None | User exists | `AuthController.requestChangePasswordOtp` → `EmailService` | `users` | `authApi.requestPasswordChangeOtp` | `{}` | 200 OK OTP dispatched | **PASS** |
| `POST` | `/api/v1/auth/change-password/verify-otp` | Bearer Token | Authenticated user | None | `otpCode`, `newPassword` | `AuthController.verifyChangePasswordOtp` | `users` | `authApi.verifyPasswordChangeOtp` | `{ otpCode, newPassword }` | 200 OK password updated | **PASS** |
| `POST` | `/api/v1/auth/forgot-password/request-otp` | None (Public) | None | None | `email` required | `AuthController.requestForgotPasswordOtp` | `users` | `authApi.requestForgotPasswordOtp` | `{ email }` | 200 OK (Generic success message) | **PASS** |
| `POST` | `/api/v1/auth/forgot-password/verify-otp` | None (Public) | None | None | `email`, `otpCode`, `newPassword` | `AuthController.verifyForgotPasswordOtp` | `users` | `authApi.verifyForgotPasswordOtp` | `{ email, otpCode, newPassword }` | 200 OK password reset | **PASS** |
| `POST` | `/api/v1/auth/setup-password` | None (Public) | Setup JWT Token | None | `token`, `password` | `AuthController.setupPassword` | `users` | `authApi.setupPassword` | `{ token, password }` | 200 OK password established | **PASS** |

---

## 2. User Management (`/api/v1/users`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/users` | Bearer Token | `users.read` | None | Pagination query | `UserController.list` → `UserService.listUsers` | `users`, `roles` | `userApi.getAll` | `?page=1&limit=20` | 200 OK `SafeUser[]` | **PASS** |
| `GET` | `/api/v1/users/:id` | Bearer Token | `users.read` | None | Numeric ID | `UserController.get` → `UserService.getUserById` | `users`, `roles` | `userApi.getById` | Path `id` | 200 OK `SafeUser` | **PASS** |
| `POST` | `/api/v1/users` | Bearer Token | `users.write` (Non-super_admin cannot create Admin) | None | `name`, `email` required | `UserController.create` → `UserService.createUser` | `users`, `roles` | `userApi.create` | `{ name, email, roleId?, permissions? }` | 201 Created `SafeUser` | **PASS** |
| `PUT` | `/api/v1/users/:id` | Bearer Token | `users.write` (Non-super_admin cannot edit Admin) | None | Numeric ID | `UserController.update` → `UserService.updateUser` | `users`, `roles` | `userApi.update` | `{ name?, email?, status?, permissions? }` | 200 OK `SafeUser` | **PASS** |
| `DELETE` | `/api/v1/users/:id` | Bearer Token | `users.delete` (Cannot delete self or Admin) | None | Numeric ID | `UserController.delete` → `UserService.deleteUser` | `users`, `audit_logs`, `media_library` | `userApi.remove` | Path `id` | 200 OK `{ message: 'User deleted' }` | **PASS** |

---

## 3. Academic Courses (`/api/v1/courses`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/courses` | Optional Token | Public (`published`) / Admin (`all`) | None | Query pagination | `CourseController.list` → `CourseService.listCourses` | `courses` | `courseApi.getAll` | `?page=1&limit=20&status=&search=` | 200 OK `{ data: Course[], pagination }` | **PASS** |
| `GET` | `/api/v1/courses/:id` | None (Public) | None | None | Numeric ID or String Slug | `CourseController.getById` → `CourseService.getCourseById/Slug` | `courses`, `specializations` | `courseApi.getById` / `getBySlug` | Path `id` or `slug` | 200 OK `Course` | **PASS** |
| `POST` | `/api/v1/courses` | Bearer Token | `courses.write` | None | `courseName`, `courseType` | `CourseController.create` → `CourseService.createCourse` | `courses` | `courseApi.create` | `{ courseName, courseType, duration, ... }` | 201 Created `Course` | **PASS** |
| `PUT` | `/api/v1/courses/:id` | Bearer Token | `courses.write` | None | Numeric ID | `CourseController.update` → `CourseService.updateCourse` | `courses` | `courseApi.update` | `{ courseName?, fees?, ... }` | 200 OK `Course` | **PASS** |
| `DELETE` | `/api/v1/courses/:id` | Bearer Token | `courses.delete` | None | Numeric ID | `CourseController.delete` → `CourseService.deleteCourse` | `courses` | `courseApi.remove` | Path `id` | 200 OK `{ message: 'Course deleted' }` | **PASS** |

---

## 4. Departments (`/api/v1/departments`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/departments` | None (Public) | None | None | Query pagination | `DepartmentController.getAll` → `DepartmentService.getAll` | `departments`, `faculty` | `departmentApi.getAll` | `?page=1&limit=50` | 200 OK `{ data: Department[], pagination }` | **PASS** |
| `GET` | `/api/v1/departments/:slug` | None (Public) | None | None | Slug or numeric ID | `DepartmentController.getBySlug` → `DepartmentService.getBySlug/Id` | `departments`, `faculty` | `departmentApi.getBySlug` | Path `slug` or `id` | 200 OK `Department` | **PASS** |
| `POST` | `/api/v1/departments` | Bearer Token | `departments.write` | None | `name` required | `DepartmentController.create` → `DepartmentService.create` | `departments` | `departmentApi.create` | `{ name, description, ... }` | 201 Created `Department` | **PASS** |
| `PUT` | `/api/v1/departments/:id` | Bearer Token | `departments.write` | None | Numeric ID | `DepartmentController.update` → `DepartmentService.update` | `departments` | `departmentApi.update` | `{ name?, description?, ... }` | 200 OK `Department` | **PASS** |
| `DELETE` | `/api/v1/departments/:id` | Bearer Token | `departments.delete` | None | Numeric ID | `DepartmentController.delete` → `DepartmentService.delete` | `departments` | `departmentApi.remove` | Path `id` | 200 OK `{ message: 'Department deleted' }` | **PASS** |

---

## 5. Faculty Management (`/api/v1/faculty`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/faculty` | None (Public) | None | None | Query pagination | `FacultyController.getAll` → `FacultyService.getAll` | `faculty`, `departments` | `facultyApi.getAll` | `?page=1&limit=50&departmentId=&search=` | 200 OK `{ data: Faculty[], pagination }` | **PASS** |
| `GET` | `/api/v1/faculty/:id` | None (Public) | None | None | Numeric ID | `FacultyController.getById` → `FacultyService.getById` | `faculty`, `departments` | `facultyApi.getById` | Path `id` | 200 OK `Faculty` | **PASS** |
| `POST` | `/api/v1/faculty` | Bearer Token | `faculty.write` | None | `name` required | `FacultyController.create` → `FacultyService.create` | `faculty` | `facultyApi.create` | `{ name, departmentId, designation, ... }` | 201 Created `Faculty` | **PASS** |
| `PUT` | `/api/v1/faculty/:id` | Bearer Token | `faculty.write` | None | Numeric ID | `FacultyController.update` → `FacultyService.update` | `faculty` | `facultyApi.update` | `{ name?, designation?, ... }` | 200 OK `Faculty` | **PASS** |
| `DELETE` | `/api/v1/faculty/:id` | Bearer Token | `faculty.delete` | None | Numeric ID | `FacultyController.delete` → `FacultyService.delete` | `faculty` | `facultyApi.remove` | Path `id` | 200 OK `{ message: 'Faculty deleted' }` | **PASS** |

---

## 6. Student Portal (`/api/v1/student`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/student/me` | Bearer Token | `student` role | Scoped to `req.user.id` | None | `StudentController.me` → `UserService.getUserById` | `users` | `studentApi.me` | None | 200 OK `{ id, name, email, role, status }` | **PASS** |
| `GET` | `/api/v1/student/courses` | Bearer Token | `student` role | None | Query pagination | `StudentController.courses` → `CourseService.listCourses` | `courses` | `studentApi.courses` | `?page=1&limit=10` | 200 OK Course catalog list | **PASS** |
| `GET` | `/api/v1/student/grades` | Bearer Token | `student` role | Scoped to `req.user.id` | None | `StudentController.grades` | `grades` | `studentApi.grades` | None | 200 OK `Grade[]` | **PASS** |
| `GET` | `/api/v1/student/fees` | Bearer Token | `student` role | Scoped to `req.user.id` | None | `StudentController.fees` | `fee_records` | `studentApi.fees` | None | 200 OK `FeeRecord[]` | **PASS** |
| `POST` | `/api/v1/student/fees/pay` | Bearer Token | `student` role | Scoped to `req.user.id` | `feeId` required | `StudentController.payFee` | `fee_records` | `studentApi.payFee` | `{ feeId }` | 200 OK Fee marked Paid (Mock) | **PASS** |

---

## 7. Inquiries & CRM (`/api/v1/inquiries`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/inquiries` | None (Public lead) | None | None | `fullName` required | `InquiryController.create` | `inquiries` | `inquiryApi.create` | `{ fullName, email, phone, ... }` | 201 Created `Inquiry` | **PASS** |
| `GET` | `/api/v1/inquiries` | Bearer Token | `inquiries.read` | None | Query pagination | `InquiryController.list` | `inquiries`, `courses` | `inquiryApi.getAll` | `?page=1&limit=20&search=&status=` | 200 OK `{ data: Inquiry[], pagination }` | **PASS** |
| `PUT` | `/api/v1/inquiries/:id` | Bearer Token | `inquiries.write` | None | Numeric ID | `InquiryController.update` | `inquiries` | `inquiryApi.update` | `{ status?, notes?, assignedTo? }` | 200 OK `Inquiry` | **PASS** |

---

## 8. Notices (`/api/v1/notices`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/notices` | None (Public) | None | None | Query pagination | `NoticeController.getAll` → `NoticeService.getAll` | `notices` | `noticeApi.getAll` | `?page=1&limit=20` | 200 OK `{ data: Notice[], pagination }` | **PASS** |
| `GET` | `/api/v1/notices/:id` | None (Public) | None | None | Numeric ID | `NoticeController.getById` → `NoticeService.getById` | `notices` | `noticeApi.getById` | Path `id` | 200 OK `Notice` | **PASS** |
| `POST` | `/api/v1/notices` | Bearer Token | `notices.write` | None | `title` required | `NoticeController.create` → `NoticeService.create` | `notices` | `noticeApi.create` | `{ title, description, priority, ... }` | 201 Created `Notice` | **PASS** |
| `PUT` | `/api/v1/notices/:id` | Bearer Token | `notices.write` | None | Numeric ID | `NoticeController.update` → `NoticeService.update` | `notices` | `noticeApi.update` | `{ title?, status?, ... }` | 200 OK `Notice` | **PASS** |
| `DELETE` | `/api/v1/notices/:id` | Bearer Token | `notices.delete` | None | Numeric ID | `NoticeController.delete` → `NoticeService.delete` | `notices` | `noticeApi.remove` | Path `id` | 200 OK `{ message: 'Notice deleted' }` | **PASS** |

---

## 9. Events (`/api/v1/events`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/events` | None (Public) | None | None | Query pagination | `EventController.getAll` → `EventService.getAll` | `events` | `eventApi.getAll` | `?page=1&limit=20` | 200 OK `{ data: Event[], pagination }` | **PASS** |
| `GET` | `/api/v1/events/:id` | None (Public) | None | None | Numeric ID | `EventController.getById` → `EventService.getById` | `events` | `eventApi.getById` | Path `id` | 200 OK `Event` | **PASS** |
| `POST` | `/api/v1/events` | Bearer Token | `events.write` | None | `title` required | `EventController.create` → `EventService.create` | `events` | `eventApi.create` | `{ title, description, startDate, ... }` | 201 Created `Event` | **PASS** |
| `PUT` | `/api/v1/events/:id` | Bearer Token | `events.write` | None | Numeric ID | `EventController.update` → `EventService.update` | `events` | `eventApi.update` | `{ title?, banner?, ... }` | 200 OK `Event` | **PASS** |
| `DELETE` | `/api/v1/events/:id` | Bearer Token | `events.delete` | None | Numeric ID | `EventController.delete` → `EventService.delete` | `events` | `eventApi.remove` | Path `id` | 200 OK `{ message: 'Event deleted' }` | **PASS** |

---

## 10. Site Settings (`/api/v1/site-settings`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/site-settings/map` | None (Public) | None | None | None | `SiteSettingController.getMap` | `site_settings` | `siteSettingsApi.getMap` | None | 200 OK `{ key: value, ... }` | **PASS** |
| `GET` | `/api/v1/site-settings` | Bearer Token | `site_settings.read` | None | None | `SiteSettingController.getAll` | `site_settings` | `siteSettingsApi.getAll` | None | 200 OK `SiteSetting[]` | **PASS** |
| `PUT` | `/api/v1/site-settings/bulk` | Bearer Token | `site_settings.write` | None | Array of `{ key, value }` | `SiteSettingController.bulkUpdate` | `site_settings` | `siteSettingsApi.bulkUpdate` | `{ settings: [...] }` | 200 OK `{ updated: number }` | **PASS** |
| `PUT` | `/api/v1/site-settings/:key` | Bearer Token | `site_settings.write` | None | `value` required | `SiteSettingController.set` | `site_settings` | `siteSettingsApi.update` | `{ value }` | 200 OK `SiteSetting` | **PASS** |

---

## 11. CMS Page Sections (`/api/v1/cms/page-sections`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/cms/page-sections` | None (Public) | None | None | `pageKey` query | `PageSectionController.getByPage` | `page_sections` | `cmsApi.getPageSections` | `?pageKey=home` | 200 OK `PageSection[]` | **PASS** |
| `GET` | `/api/v1/cms/page-sections/all`| Bearer Token | `site_settings.read` | None | Query pagination | `PageSectionController.getAll` | `page_sections` | `cmsApi.getAllSections` | `?page=1&limit=50` | 200 OK `{ data: PageSection[], pagination }` | **PASS** |
| `POST` | `/api/v1/cms/page-sections` | Bearer Token | `site_settings.write`| None | `pageKey`, `sectionKey` | `PageSectionController.upsert` | `page_sections` | `cmsApi.upsertSection` | `{ pageKey, sectionKey, config }` | 200 OK `PageSection` | **PASS** |
| `PUT` | `/api/v1/cms/page-sections/:id`| Bearer Token| `site_settings.write`| None | Numeric ID | `PageSectionController.update` | `page_sections` | `cmsApi.updateSection` | `{ config?, sortOrder? }` | 200 OK `PageSection` | **PASS** |
| `DELETE`| `/api/v1/cms/page-sections/:id`| Bearer Token| `site_settings.delete`| None | Numeric ID | `PageSectionController.delete` | `page_sections` | `cmsApi.deleteSection` | Path `id` | 200 OK `{ message: 'Deleted' }` | **PASS** |

---

## 12. Media Library (`/api/v1/media`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/media` | Bearer Token | `media.read` | None | Query pagination | `mediaRoutes (inline)` | `media_library` | `mediaApi.getAll` | `?page=1&limit=30` | 200 OK `{ data: MediaLibrary[], pagination }` | **PASS** |
| `POST` | `/api/v1/media/upload` | Bearer Token | `media.write` | None | File size 50MB, MIME & Ext whitelist | `mediaRoutes` → `uploadCloud` | `media_library` | `mediaApi.upload` | Multipart `file` | 200 OK `{ url, filename, mimetype, size }` | **PASS** |
| `PUT` | `/api/v1/media/:id/replace` | Bearer Token | `media.write` | None | File size 50MB, MIME & Ext whitelist | `mediaRoutes` → `uploadCloud` | `media_library` | `mediaApi.replace` | Multipart `file` | 200 OK `MediaLibrary` | **PASS** |
| `DELETE` | `/api/v1/media/:id` | Bearer Token | `media.delete` | None | Numeric ID | `mediaRoutes` | `media_library` | `mediaApi.remove` | Path `id` | 200 OK `{ message: 'Media deleted' }` | **PASS** |

---

## 13. Infrastructures (`/api/v1/infrastructures`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/infrastructures` | None (Public) | None | None | Query pagination & category | `InfrastructureController.getAll` | `infrastructures` | `infrastructureApi.getAll` | `?page=1&limit=50&category=` | 200 OK `{ data: Infrastructure[], pagination }` | **PASS** |
| `GET` | `/api/v1/infrastructures/:id` | None (Public) | None | None | Numeric ID | `InfrastructureController.getById` | `infrastructures` | `infrastructureApi.getById` | Path `id` | 200 OK `Infrastructure` | **PASS** |
| `POST` | `/api/v1/infrastructures` | Bearer Token | `infrastructures.write` | None | `title` required | `InfrastructureController.create` | `infrastructures` | `infrastructureApi.create` | `{ title, description, imageUrl, ... }` | 201 Created `Infrastructure` | **PASS** |
| `PUT` | `/api/v1/infrastructures/:id` | Bearer Token | `infrastructures.write` | None | Numeric ID | `InfrastructureController.update` | `infrastructures` | `infrastructureApi.update` | `{ title?, imageUrl?, ... }` | 200 OK `Infrastructure` | **PASS** |
| `DELETE` | `/api/v1/infrastructures/:id` | Bearer Token | `infrastructures.delete` | None | Numeric ID | `InfrastructureController.delete` | `infrastructures` | `infrastructureApi.remove` | Path `id` | 200 OK `{ message: 'Infrastructure deleted' }` | **PASS** |

---

## 14. Placements (`/api/v1/placements`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/placements` | None (Public) | None | None | Query pagination | `PlacementController.getAll` | `placements` | `placementApi.getAll` | `?page=1&limit=50&status=&search=` | 200 OK `{ data: Placement[], pagination }` | **PASS** |
| `GET` | `/api/v1/placements/:id` | None (Public) | None | None | Numeric ID | `PlacementController.getById` | `placements` | `placementApi.getById` | Path `id` | 200 OK `Placement` | **PASS** |
| `POST` | `/api/v1/placements` | Bearer Token | `placements.write` | None | `studentName`, `companyName`, `package`, `year` | `PlacementController.create` | `placements` | `placementApi.create` | `{ studentName, companyName, package, year }` | 201 Created `Placement` | **PASS** |
| `PUT` | `/api/v1/placements/:id` | Bearer Token | `placements.write` | None | Numeric ID | `PlacementController.update` | `placements` | `placementApi.update` | `{ studentName?, package?, ... }` | 200 OK `Placement` | **PASS** |
| `DELETE` | `/api/v1/placements/:id` | Bearer Token | `placements.delete` | None | Numeric ID | `PlacementController.delete` | `placements` | `placementApi.remove` | Path `id` | 200 OK `{ message: 'Placement deleted' }` | **PASS** |

---

## 15. Dashboard & Analytics (`/api/v1/dashboard`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/dashboard/stats` | Bearer Token | `dashboard.read` | None | None | `DashboardController.getStats` → `DashboardService.getStats` | `users`, `inquiries`, `courses`, `page_views` | `dashboardApi.getStats` | None | 200 OK Summary stats and trends | **PASS** |
| `GET` | `/api/v1/dashboard/recent-inquiries` | Bearer Token | `dashboard.read` | None | Query `limit` | `DashboardController.getRecentInquiries` | `inquiries`, `courses` | `dashboardApi.getRecentInquiries` | `?limit=5` | 200 OK Recent lead list | **PASS** |
| `GET` | `/api/v1/dashboard/analytics` | Bearer Token | `analytics.read` | None | None | `DashboardController.getAnalytics` | `page_views` | `dashboardApi.getAnalytics` | None | 200 OK Traffic breakdown | **PASS** |
| `POST` | `/api/v1/dashboard/track` | None (Public telemetry) | None | None | `path` required | `DashboardController.trackPageView` | `page_views` | `dashboardApi.trackPageView` | `{ path }` | 200 OK `{ success: true }` | **PASS** |

---

## 16. AI Chatbot (`/api/v1/chatbot`)

| HTTP Method | URL | Authentication | Authorization | Tenant Requirement | Validation | Controller / Service | Database Table | Frontend Consumer | Expected Request | Actual Response | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/chatbot/chat` | None (Public) | None | None | `sessionId`, `message` required | `ChatbotController.chat` → `ChatbotService.processMessage` | `chat_knowledge_base`, `chat_sessions`, `chat_messages` | `chatbotApi.chat` | `{ sessionId, message }` | 200 OK `{ success: true, answer }` | **PASS** |
| `GET` | `/api/v1/chatbot/knowledge` | Bearer Token | `admin` or `super_admin` | None | None | `ChatbotController.getAllKnowledge` | `chat_knowledge_base` | `chatbotApi.getAllKnowledge` | None | 200 OK `ChatKnowledgeBase[]` | **PASS** |
| `POST` | `/api/v1/chatbot/knowledge` | Bearer Token | `admin` or `super_admin` | None | `question`, `answer` required | `ChatbotController.createKnowledge` | `chat_knowledge_base` | `chatbotApi.createKnowledge` | `{ category, question, answer, keywords? }` | 201 Created `ChatKnowledgeBase` | **PASS** |
| `PUT` | `/api/v1/chatbot/knowledge/:id` | Bearer Token | `admin` or `super_admin` | None | Numeric ID | `ChatbotController.updateKnowledge` | `chat_knowledge_base` | `chatbotApi.updateKnowledge` | `{ question?, answer?, ... }` | 200 OK `ChatKnowledgeBase` | **PASS** |
| `DELETE` | `/api/v1/chatbot/knowledge/:id` | Bearer Token | `admin` or `super_admin` | None | Numeric ID | `ChatbotController.deleteKnowledge` | `chat_knowledge_base` | `chatbotApi.deleteKnowledge` | Path `id` | 200 OK `{ message: 'Deleted' }` | **PASS** |
| `POST` | `/api/v1/chatbot/upload` | Bearer Token | `admin` or `super_admin` | None | File size 10MB, PDF/DOCX/TXT only | `ChatbotController.uploadDocument` → `ChatbotService` | `chat_knowledge_base` | `chatbotApi.uploadDocument` | Multipart `file` | 200 OK `{ message: 'Uploaded and ingested' }` | **PASS** |
| `GET` | `/api/v1/chatbot/analytics` | Bearer Token | `admin` or `super_admin` | None | None | `ChatbotController.getAnalytics` | `chat_sessions`, `chat_messages` | `chatbotApi.getAnalytics` | None | 200 OK `{ totalSessions, totalMessages, ... }` | **PASS** |
