# 📘 Manager API Documentation

## Tổng Quan

Manager API cho phép quản lý tài khoản manager trong hệ thống. **Tất cả các endpoint đều yêu cầu quyền Admin**.

| Thông tin | Giá trị |
|-----------|---------|
| **Base URL** | `/api/managers` |
| **Authentication** | Bearer Token (JWT) |
| **Required Role** | `admin` |

```
Authorization: Bearer <access_token>
```

---

## 📋 Data Types

### Manager Object

```typescript
{
  // ========== Manager Info (from managers table) ==========
  id: number;                    // Manager ID
  user_id: number;               // User ID
  name: string;                  // Tên hiển thị
  description?: string;          // Mô tả
  expertise?: string;            // Chuyên môn
  rating: number;                // Rating trung bình (0-5)
  rating_count: number;          // Số lượng đánh giá
  is_given_set: boolean;         // Thuộc "The Given Set"
  status: string;                // "active" | "pending" | "suspended"
  created_at: string;            // ISO 8601 datetime

  // ========== User Info ==========
  email: string;                 // Email đăng nhập
  role: "manager";               // Role cố định

  // ========== Manager Image ==========
  image_url?: string;            // URL ảnh đại diện manager (e.g., '/uploads/managers/alice.jpg')

  // ========== Location Info ==========
  lat?: number;                  // Latitude
  lng?: number;                  // Longitude
  geo_id?: number;               // ID vị trí địa lý
  city?: string;                 // Thành phố
  country?: string;              // Quốc gia

  // ========== Profile Info (from profiles table) ==========
  first_name?: string;           // Tên
  last_name?: string;            // Họ
  title?: string;                // Chức danh
  function?: string;             // Chức năng/công việc
  location?: string;             // Địa điểm (text)
  avatar_id?: number;            // ID file avatar (profile)
  avatar_url?: string;           // URL avatar (profile)
  pen_name?: string;             // Bút danh

  // ========== Related Data (optional) ==========
  functions?: ManagerFunction[]; // Danh sách functions (khi include_functions=true)
  problems?: ManagerProblem[];   // Danh sách problems (khi include_problems=true)

  // ========== Computed Fields ==========
  distance_km?: number;          // Khoảng cách km (chỉ khi search theo location)
}
```

### ManagerFunction Object

```typescript
{
  id: number;
  name: string;
  description?: string;
  category?: string;
}
```

### ManagerProblem Object

```typescript
{
  id: number;
  name: string;
  description?: string;
  category?: string;
}
```

---

## 🔗 Endpoints

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 1 | POST | `/api/managers` | Tạo manager mới |
| 2 | GET | `/api/managers/search` | Tìm kiếm managers |
| 3 | GET | `/api/managers/{id}` | Lấy thông tin manager |
| 4 | PUT/PATCH | `/api/managers/{id}` | Cập nhật manager |
| 5 | DELETE | `/api/managers/{id}` | Xóa manager |
| 6 | GET | `/api/managers/{id}/rating` | Lấy đánh giá manager |
| 7 | POST | `/api/managers/{id}/rating` | Thêm/cập nhật đánh giá |
| 8 | DELETE | `/api/managers/{id}/rating` | Xóa đánh giá |

### Project Identification Endpoints

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 9 | GET | `/api/ratings/project-identification` | Lấy danh sách Project ID |
| 10 | POST | `/api/ratings/project-identification` | Tạo Project ID mới |
| 11 | GET | `/api/ratings/project-identification/{projectId}` | Lấy chi tiết Project ID |
| 12 | DELETE | `/api/ratings/project-identification/{projectId}` | Xóa Project ID |

---

### 1. Tạo Manager Mới

**POST** `/api/managers`

Tạo một tài khoản manager mới.

#### Request Body

```json
{
  "email": "manager@example.com",
  "password": "securePassword123",
  "name": "Nguyen Van A",
  "description": "Experienced project manager with 10+ years...",
  "expertise": "Project Management, Agile, Scrum",
  "status": "active",
  "is_given_set": true,
  "image_url": "/uploads/managers/nguyen-van-a.jpg",
  "lat": 21.0285,
  "lng": 105.8542,
  "geo_id": 1,
  "profile": {
    "first_name": "Nguyen",
    "last_name": "Van A",
    "title": "Senior Manager",
    "function": "Operations",
    "location": "Ho Chi Minh City",
    "avatar_id": 5,
    "pen_name": "NVA"
  },
  "function_ids": [1, 2, 3],
  "problem_ids": [1, 2]
}
```

#### Request Body Fields

| Field | Type | Required | Default | Description |
|-------|------|:--------:|---------|-------------|
| `email` | string | ✅ **Yes** | - | Email đăng nhập (unique) |
| `password` | string | ✅ **Yes** | - | Mật khẩu |
| `name` | string | ✅ **Yes** | - | Tên hiển thị của manager |
| `description` | string | No | `null` | Mô tả về manager |
| `expertise` | string | No | `null` | Chuyên môn/kỹ năng |
| `status` | string | No | `"active"` | Trạng thái: `"active"`, `"pending"`, `"suspended"` |
| `is_given_set` | boolean | No | `false` | Thuộc "The Given Set" |
| `image_url` | string | No | `null` | URL ảnh đại diện (e.g., '/uploads/managers/photo.jpg') |
| `lat` | number | No | `null` | Latitude |
| `lng` | number | No | `null` | Longitude |
| `geo_id` | number | No | `null` | ID vị trí địa lý (từ geopoints) |
| `profile` | object | No | `null` | Thông tin profile (xem bảng dưới) |
| `function_ids` | number[] | No | `[]` | Danh sách ID functions để liên kết |
| `problem_ids` | number[] | No | `[]` | Danh sách ID problems để liên kết |

#### Profile Object Fields

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `first_name` | string | No | Tên |
| `last_name` | string | No | Họ |
| `title` | string | No | Chức danh |
| `function` | string | No | Chức năng/công việc |
| `location` | string | No | Địa điểm (text) |
| `avatar_id` | number | No | ID file avatar |
| `pen_name` | string | No | Bút danh |

#### Response

**201 Created**

```json
{
  "id": 42,
  "user_id": 100,
  "email": "manager@example.com",
  "role": "manager",
  "name": "Nguyen Van A",
  "description": "Experienced project manager with 10+ years...",
  "expertise": "Project Management, Agile, Scrum",
  "rating": 0,
  "rating_count": 0,
  "is_given_set": true,
  "status": "active",
  "created_at": "2026-01-01T10:30:00.000Z",
  "image_url": "/uploads/managers/nguyen-van-a.jpg",
  "lat": 21.0285,
  "lng": 105.8542,
  "city": "Hà Nội",
  "country": "Vietnam",
  "first_name": "Nguyen",
  "last_name": "Van A",
  "title": "Senior Manager",
  "function": "Operations",
  "avatar_id": 5,
  "avatar_url": "/uploads/avatar.jpg",
  "functions": [
    { "id": 1, "name": "Software Development", "category": "Development" },
    { "id": 2, "name": "IT Consulting", "category": "Consulting" }
  ],
  "problems": [
    { "id": 1, "name": "Remote Employee Management", "category": "Management" }
  ]
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `email and password are required` | Thiếu email hoặc password |
| 400 | `name is required` | Thiếu name |
| 401 | `No token provided` | Không có token |
| 403 | `Insufficient permissions` | Không phải admin |
| 409 | `Email already exists` | Email đã tồn tại |
| 500 | `Internal server error` | Lỗi server |

---

### 2. Tìm Kiếm Managers (Advanced Search)

**GET** `/api/managers/search`

Tìm kiếm và lọc danh sách managers với nhiều điều kiện.

#### Query Parameters

##### BROWSE Section - Text Search

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `q` | string | No | - | Tìm kiếm chung (name, email, description, expertise) |
| `managers` | string | No | - | Tìm theo tên manager |
| `problems` | string | No | - | Tìm theo problems đã liên kết |
| `functions` | string | No | - | Tìm theo functions đã liên kết |
| `expertise` | string | No | - | Tìm theo expertise |
| `descriptions` | string | No | - | Tìm theo description |

##### Operations Section

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `operation` | string | No | `"or"` | Kiểu tìm kiếm: `"exact"`, `"and"`, `"or"` |

**Operation modes:**
- `exact`: Tìm chính xác chuỗi
- `and`: Tất cả điều kiện phải match
- `or`: Bất kỳ điều kiện nào match

##### Ratings Section

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `rating` | string | No | - | Shorthand: `"5"`, `"4"`, `"3"`, `"below2"` |
| `rating_min` | number | No | - | Rating tối thiểu (0-5) |
| `rating_max` | number | No | - | Rating tối đa (0-5) |

**Rating mapping:**
- `"5"` → rating >= 4.5
- `"4"` → rating >= 3.5 AND < 4.5
- `"3"` → rating >= 2.5 AND < 3.5
- `"below2"` → rating < 2.5

##### The Given Set Section

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `given_set` | boolean | No | - | `true` = chỉ lấy manager trong Given Set |

##### Location By Section

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `near_city` | string | No | - | Tìm gần thành phố (theo tên) |
| `city_id` | number | No | - | Tìm gần thành phố (theo ID) |
| `lat` | number | No | - | Latitude (dùng cùng với `lng`) |
| `lng` | number | No | - | Longitude (dùng cùng với `lat`) |
| `radius` | number | No | `50` | Bán kính tìm kiếm (km) |

##### Alphabet Filter (A-Z Sidebar)

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `starts_with` | string | No | - | Lọc theo chữ cái đầu (A-Z) |

##### Pagination & Sorting

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `page` | number | No | `1` | Số trang |
| `limit` | number | No | `20` | Số kết quả/trang (max: 100) |
| `sort_by` | string | No | `"created_at"` | Sắp xếp: `"name"`, `"rating"`, `"created_at"`, `"distance"` |
| `sort_order` | string | No | `"desc"` | `"asc"` hoặc `"desc"` |

##### Other Filters

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `status` | string | No | - | Filter status: `"active"`, `"pending"`, `"suspended"` |
| `include_functions` | boolean | No | `false` | Include functions trong response |
| `include_problems` | boolean | No | `false` | Include problems trong response |

#### Request Examples

```bash
# Tìm kiếm cơ bản
GET /api/managers/search?q=nguyen&page=1&limit=10

# Tìm với AND operation
GET /api/managers/search?managers=nguyen&expertise=agile&operation=and

# Tìm Exact Phrase
GET /api/managers/search?q=senior developer&operation=exact

# Filter theo Rating
GET /api/managers/search?rating=5
GET /api/managers/search?rating_min=4&rating_max=5

# Filter theo Given Set
GET /api/managers/search?given_set=true

# Tìm theo Location
GET /api/managers/search?near_city=Ho Chi Minh&radius=30
GET /api/managers/search?lat=10.8231&lng=106.6297&radius=50

# Filter theo Alphabet
GET /api/managers/search?starts_with=N

# Combined Search
GET /api/managers/search?managers=nguyen&functions=development&operation=and&rating_min=4&near_city=hanoi&starts_with=N&page=1&limit=20&sort_by=rating&sort_order=desc&include_functions=true
```

#### Response

**200 OK**

```json
{
  "managers": [
    {
      "id": 42,
      "user_id": 100,
      "email": "nguyen.manager@example.com",
      "role": "manager",
      "name": "Nguyen Van A",
      "description": "Experienced project manager...",
      "expertise": "Project Management, Agile",
      "rating": 4.8,
      "rating_count": 25,
      "is_given_set": true,
      "status": "active",
      "created_at": "2026-01-01T10:30:00.000Z",
      "image_url": "/uploads/managers/nguyen-van-a.jpg",
      "lat": 21.0285,
      "lng": 105.8542,
      "city": "Hà Nội",
      "country": "Vietnam",
      "first_name": "Nguyen",
      "last_name": "Van A",
      "title": "Senior Manager",
      "function": "Operations",
      "avatar_id": 5,
      "avatar_url": "/uploads/avatar.jpg",
      "distance_km": 12.5,
      "functions": [
        { "id": 1, "name": "Software Development" }
      ],
      "problems": [
        { "id": 1, "name": "Remote Employee Management" }
      ]
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "filters": {
    "managers": "nguyen",
    "functions": "development",
    "operation": "and",
    "rating_min": 4,
    "near_city": "hanoi",
    "starts_with": "N"
  },
  "aggregations": {
    "total_managers": 94,
    "total_with_problems": 1820,
    "total_with_functions": 673,
    "total_with_expertise": 94,
    "total_with_descriptions": 155,
    "by_rating": {
      "5": 45,
      "4": 67,
      "3": 32,
      "below2": 12
    },
    "total_in_given_set": 34,
    "by_alphabet": {
      "A": 12,
      "B": 8,
      "C": 15,
      "D": 10,
      "N": 23
    }
  }
}
```

---

### 3. Lấy Thông Tin Manager

**GET** `/api/managers/{id}`

Lấy thông tin chi tiết của một manager theo ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Response

**200 OK**

```json
{
  "id": 42,
  "user_id": 100,
  "email": "manager@example.com",
  "role": "manager",
  "name": "Nguyen Van A",
  "description": "Experienced project manager with 10+ years...",
  "expertise": "Project Management, Agile, Scrum",
  "rating": 4.8,
  "rating_count": 25,
  "is_given_set": true,
  "status": "active",
  "created_at": "2026-01-01T10:30:00.000Z",
  "image_url": "/uploads/managers/nguyen-van-a.jpg",
  "lat": 21.0285,
  "lng": 105.8542,
  "city": "Hà Nội",
  "country": "Vietnam",
  "geo_id": 1,
  "first_name": "Nguyen",
  "last_name": "Van A",
  "title": "Senior Manager",
  "function": "Operations",
  "location": "Ho Chi Minh City",
  "avatar_id": 5,
  "avatar_url": "/uploads/avatar.jpg",
  "pen_name": "NVA",
  "functions": [
    { "id": 1, "name": "Software Development", "description": "...", "category": "Development" },
    { "id": 2, "name": "IT Consulting", "description": "...", "category": "Consulting" }
  ],
  "problems": [
    { "id": 1, "name": "Remote Employee Management", "description": "...", "category": "Management" }
  ]
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 404 | `Manager not found` | Không tìm thấy manager |

---

### 4. Cập Nhật Manager

**PUT/PATCH** `/api/managers/{id}`

Cập nhật thông tin manager.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Request Body

```json
{
  "name": "Nguyen Van B",
  "description": "Updated description...",
  "expertise": "Project Management, Agile, Leadership",
  "status": "suspended",
  "password": "newSecurePassword",
  "is_given_set": false,
  "image_url": "/uploads/managers/updated-photo.jpg",
  "lat": 10.7769,
  "lng": 106.7009,
  "geo_id": 2,
  "profile": {
    "first_name": "Nguyen",
    "last_name": "Van B",
    "title": "Director",
    "function": "Management",
    "location": "Ha Noi",
    "avatar_id": 10,
    "pen_name": "NVB"
  },
  "function_ids": [1, 3, 5],
  "problem_ids": [2, 4]
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `name` | string | No | Tên hiển thị |
| `description` | string | No | Mô tả |
| `expertise` | string | No | Chuyên môn |
| `status` | string | No | Trạng thái |
| `password` | string | No | Mật khẩu mới |
| `is_given_set` | boolean | No | Thuộc Given Set |
| `image_url` | string | No | URL ảnh đại diện mới |
| `lat` | number | No | Latitude |
| `lng` | number | No | Longitude |
| `geo_id` | number | No | ID vị trí địa lý |
| `profile` | object | No | Thông tin profile |
| `function_ids` | number[] | No | **Thay thế toàn bộ** functions liên kết |
| `problem_ids` | number[] | No | **Thay thế toàn bộ** problems liên kết |

> **⚠️ Note:** 
> - Chỉ cần gửi các field muốn cập nhật. Các field không gửi sẽ giữ nguyên.
> - `function_ids` và `problem_ids` sẽ **thay thế toàn bộ** liên kết hiện tại (không phải append).

#### Response

**200 OK** - Trả về Manager object đầy đủ sau khi cập nhật.

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 404 | `Manager not found` | Không tìm thấy manager |

---

### 5. Xóa Manager

**DELETE** `/api/managers/{id}`

Xóa một manager khỏi hệ thống (bao gồm user account và tất cả dữ liệu liên quan).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Response

**204 No Content** (Không có response body)

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |

---

### 6. Lấy Đánh Giá Manager

**GET** `/api/managers/{id}/rating`

Lấy thông tin tổng hợp đánh giá của một manager. Form rating gồm 4 bước: About User, About Manager, About Function And Problem, About Feedback.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `my_rating` | boolean | No | Nếu `true`, chỉ trả về rating của user hiện tại |

#### Response

**200 OK**

```json
{
  "averageRating": 4.5,
  "ratingCount": 25,
  "ratings": [
    {
      "id": 1,
      "manager_id": 42,
      "user_id": 100,
      
      "reviewer_name": "Nguyen Van A",
      "reviewer_full_name": "Nguyen Van A",
      "reviewer_email": "user@example.com",
      "reviewer_phone": "+84123456789",
      "reviewer_address": "123 Street, District 1, HCMC",
      
      "manager_name": "Tran Van B",
      "manager_user_name": "tranvanb",
      "manager_location": "Ha Noi",
      "job_location": "Ho Chi Minh City",
      "manager_url": "https://example.com/manager/42",
      
      "function_name": "Software Development",
      "function_manager": "Tran Van B",
      "used_function_from_manager": true,
      "function_execution_date": "2026-01-01",
      "problem_solver_manager_name": "Tran Van B",
      "problem_to_be_solved": "Build a web application",
      "manager_helped_identify_problem": true,
      "function_solved_problem": true,
      "problem_existed_before_function": true,
      "problem_existed_after_function": false,
      "function_provided_solved_problem": true,
      
      "provided_feedback_after_function": true,
      "manager_applied_feedback": true,
      
      "rating": 5,
      "comment": "Excellent manager, very helpful!",
      "created_at": "2026-01-01T10:30:00.000Z",
      "updated_at": "2026-01-01T10:30:00.000Z",
      "user_email": "user@example.com",
      "user_name": "Nguyen Van A"
    }
  ]
}
```

#### Rating Object Fields

##### Step 1: About User (Reviewer Info)

| Field | Type | Description |
|-------|------|-------------|
| `reviewer_name` | string | User Name - Tên người đánh giá |
| `reviewer_full_name` | string | Full Name - Họ tên đầy đủ |
| `reviewer_email` | string | Email Address - Địa chỉ email |
| `reviewer_phone` | string | Phone Number - Số điện thoại |
| `reviewer_address` | string | Address (Optional) - Địa chỉ |

##### Step 2: About Manager

| Field | Type | Description |
|-------|------|-------------|
| `manager_name` | string | Manager name - Tên manager |
| `manager_user_name` | string | User Name - Username của manager |
| `manager_location` | string | Manager Location - Vị trí manager |
| `job_location` | string | Job Location - Vị trí công việc |
| `manager_url` | string | Manager URL - URL profile manager |

##### Step 3: About Function And Problem

| Field | Type | Description |
|-------|------|-------------|
| `function_name` | string | Function Name - Tên function |
| `function_manager` | string | Function Manager - Manager của function |
| `used_function_from_manager` | boolean | Did you use the function from the Manager? |
| `function_execution_date` | string | Function Execution Date (ISO date) |
| `problem_solver_manager_name` | string | Manager name who helped you solve the problem? |
| `problem_to_be_solved` | string | Problem to be solved by the function executed by the Manager |
| `manager_helped_identify_problem` | boolean | Did the manager help you identify the problem properly? |
| `function_solved_problem` | boolean | Did the function solve the problem? |
| `problem_existed_before_function` | boolean | Did the problem exist before the function executed by the Manager? |
| `problem_existed_after_function` | boolean | Did the problem exist after the function executed by the Manager? |
| `function_provided_solved_problem` | boolean | Is the function provided by the Manager solved the problem? |

##### Step 4: About Feedback

| Field | Type | Description |
|-------|------|-------------|
| `provided_feedback_after_function` | boolean | Did you provide feedback to the Manager after function executed to help the function executed properly to solve the problem? |
| `manager_applied_feedback` | boolean | Did the Manager apply the feedback to help solve the problem? |

##### Legacy/Computed Fields

| Field | Type | Description |
|-------|------|-------------|
| `rating` | number | Overall rating (1-5, optional) |
| `comment` | string | Additional comments |
| `created_at` | string | Thời gian tạo (ISO 8601) |
| `updated_at` | string | Thời gian cập nhật (ISO 8601) |
| `user_email` | string | Email của user đánh giá |
| `user_name` | string | Tên của user đánh giá |

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 404 | `Manager not found` | Không tìm thấy manager |

---

### 7. Thêm/Cập Nhật Đánh Giá Manager

**POST** `/api/managers/{id}/rating`

Thêm hoặc cập nhật đánh giá của user hiện tại cho manager. Form rating gồm 4 bước với nhiều trường thông tin chi tiết. Mỗi user chỉ có thể đánh giá một manager một lần, nếu đánh giá lại sẽ cập nhật đánh giá cũ.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Request Body

```json
{
  "reviewer_name": "Nguyen Van A",
  "reviewer_full_name": "Nguyen Van A",
  "reviewer_email": "user@example.com",
  "reviewer_phone": "+84123456789",
  "reviewer_address": "123 Street, District 1, HCMC",
  
  "manager_name": "Tran Van B",
  "manager_user_name": "tranvanb",
  "manager_location": "Ha Noi",
  "job_location": "Ho Chi Minh City",
  "manager_url": "https://example.com/manager/42",
  
  "function_name": "Software Development",
  "function_manager": "Tran Van B",
  "used_function_from_manager": true,
  "function_execution_date": "2026-01-01",
  "problem_solver_manager_name": "Tran Van B",
  "problem_to_be_solved": "Build a web application",
  "manager_helped_identify_problem": true,
  "function_solved_problem": true,
  "problem_existed_before_function": true,
  "problem_existed_after_function": false,
  "function_provided_solved_problem": true,
  
  "provided_feedback_after_function": true,
  "manager_applied_feedback": true,
  
  "rating": 5,
  "comment": "Excellent manager, very professional!"
}
```

#### Request Body Fields

##### Step 1: About User (Reviewer Info)

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `reviewer_name` | string | No | User Name - Tên người đánh giá |
| `reviewer_full_name` | string | No | Full Name - Họ tên đầy đủ |
| `reviewer_email` | string | No | Email Address - Địa chỉ email |
| `reviewer_phone` | string | No | Phone Number - Số điện thoại |
| `reviewer_address` | string | No | Address (Optional) - Địa chỉ |

##### Step 2: About Manager

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `manager_name` | string | No | Manager name - Tên manager |
| `manager_user_name` | string | No | User Name - Username của manager |
| `manager_location` | string | No | Manager Location - Vị trí manager |
| `job_location` | string | No | Job Location - Vị trí công việc |
| `manager_url` | string | No | Manager URL - URL profile manager |

##### Step 3: About Function And Problem

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `function_name` | string | No | Function Name - Tên function |
| `function_manager` | string | No | Function Manager - Manager của function |
| `used_function_from_manager` | boolean | No | Did you use the function from the Manager? |
| `function_execution_date` | string | No | Function Execution Date (ISO date: YYYY-MM-DD) |
| `problem_solver_manager_name` | string | No | Manager name who helped you solve the problem? |
| `problem_to_be_solved` | string | No | Problem to be solved by the function executed by the Manager |
| `manager_helped_identify_problem` | boolean | No | Did the manager help you identify the problem properly? |
| `function_solved_problem` | boolean | No | Did the function solve the problem? |
| `problem_existed_before_function` | boolean | No | Did the problem exist before the function executed by the Manager? |
| `problem_existed_after_function` | boolean | No | Did the problem exist after the function executed by the Manager? |
| `function_provided_solved_problem` | boolean | No | Is the function provided by the Manager solved the problem? |

##### Step 4: About Feedback

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `provided_feedback_after_function` | boolean | No | Did you provide feedback to the Manager after function executed? |
| `manager_applied_feedback` | boolean | No | Did the Manager apply the feedback to help solve the problem? |

##### Legacy/Optional Fields

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `rating` | number | No | Overall rating (1-5) |
| `comment` | string | No | Additional comments |

#### Response

**200 OK** - Trả về rating summary sau khi cập nhật

```json
{
  "averageRating": 4.6,
  "ratingCount": 26,
  "ratings": [
    {
      "id": 50,
      "manager_id": 42,
      "user_id": 102,
      "reviewer_name": "Current User",
      "reviewer_full_name": "Current User Full Name",
      "reviewer_email": "current.user@example.com",
      "function_name": "Software Development",
      "function_solved_problem": true,
      "rating": 5,
      "comment": "Excellent manager, very professional!",
      "created_at": "2026-01-03T09:15:00.000Z",
      "updated_at": "2026-01-03T09:15:00.000Z"
    }
  ]
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 400 | `Rating must be between 1 and 5` | Rating không hợp lệ |
| 401 | `Unauthorized` | Chưa đăng nhập |
| 404 | `Manager not found` | Không tìm thấy manager |

---

### 8. Xóa Đánh Giá Manager

**DELETE** `/api/managers/{id}/rating`

Xóa đánh giá của user hiện tại cho manager.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Response

**200 OK**

```json
{
  "message": "Rating deleted successfully",
  "averageRating": 4.4,
  "ratingCount": 24
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 401 | `Unauthorized` | Chưa đăng nhập |
| 404 | `Manager not found` | Không tìm thấy manager |

---

## 🆔 Project Identification API

Project Identification là mã UUID duy nhất dùng để theo dõi và quản lý các đánh giá (ratings). Mỗi user có thể tạo nhiều Project ID để sử dụng khi đánh giá managers/providers.

### 9. Lấy Danh Sách Project Identification

**GET** `/api/ratings/project-identification`

Lấy danh sách tất cả Project ID của user hiện tại.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `page` | number | No | `1` | Số trang |
| `limit` | number | No | `20` | Số kết quả/trang (max: 100) |
| `used` | boolean | No | - | Filter: `true` = đã sử dụng, `false` = chưa sử dụng |

#### Response

**200 OK**

```json
{
  "items": [
    {
      "id": 1,
      "user_id": 100,
      "project_id": "277CA003-06I0-478F-9385-4D2732771EBE",
      "used": true,
      "manager_id": 42,
      "created_at": "2026-01-01T10:30:00.000Z",
      "used_at": "2026-01-02T14:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 100,
      "project_id": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
      "used": false,
      "created_at": "2026-01-03T09:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Project Identification Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID trong database |
| `user_id` | number | ID của user sở hữu |
| `project_id` | string | UUID duy nhất (e.g., "277CA003-06I0-478F-9385-4D2732771EBE") |
| `used` | boolean | Đã sử dụng để rating chưa |
| `manager_id` | number | ID manager được rating (nếu đã dùng) |
| `provider_id` | number | ID provider được rating (nếu đã dùng) |
| `created_at` | string | Thời gian tạo (ISO 8601) |
| `used_at` | string | Thời gian sử dụng (ISO 8601) |

---

### 10. Tạo Project Identification Mới

**POST** `/api/ratings/project-identification`

Tạo một Project ID mới (Generate Project Identification).

#### Request Body

Không cần body - API tự động generate UUID.

#### Response

**201 Created**

```json
{
  "id": 3,
  "user_id": 100,
  "project_id": "F9E8D7C6-B5A4-3210-9876-543210FEDCBA",
  "used": false,
  "created_at": "2026-01-04T08:00:00.000Z"
}
```

---

### 11. Lấy Chi Tiết Project Identification

**GET** `/api/ratings/project-identification/{projectId}`

Lấy thông tin chi tiết của một Project ID theo UUID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `projectId` | string | ✅ **Yes** | UUID của Project ID |

#### Response

**200 OK**

```json
{
  "id": 1,
  "user_id": 100,
  "project_id": "277CA003-06I0-478F-9385-4D2732771EBE",
  "used": true,
  "manager_id": 42,
  "created_at": "2026-01-01T10:30:00.000Z",
  "used_at": "2026-01-02T14:00:00.000Z"
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid project ID` | Project ID không hợp lệ |
| 404 | `Project identification not found` | Không tìm thấy hoặc không thuộc user |

---

### 12. Xóa Project Identification

**DELETE** `/api/ratings/project-identification/{projectId}`

Xóa một Project ID. **Chỉ có thể xóa Project ID chưa được sử dụng**.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `projectId` | string | ✅ **Yes** | UUID của Project ID |

#### Response

**200 OK**

```json
{
  "message": "Project identification deleted successfully"
}
```

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid project ID` | Project ID không hợp lệ |
| 400 | `Cannot delete a used project identification` | Không thể xóa Project ID đã sử dụng |
| 404 | `Project identification not found` | Không tìm thấy hoặc không thuộc user |

---

## 🔐 Authentication & Authorization

### Headers Required

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

| Header | Required | Description |
|--------|:--------:|-------------|
| `Authorization` | ✅ **Yes** | Bearer token (JWT) |
| `Content-Type` | ✅ **Yes** (POST/PUT) | `application/json` |

### Error Responses (Authentication)

| Status | Message | Mô tả |
|--------|---------|-------|
| 401 | `No token provided` | Không có Authorization header |
| 401 | `Invalid token` | Token không hợp lệ hoặc hết hạn |
| 401 | `User not found` | User không tồn tại |
| 401 | `Account not activated` | Tài khoản chưa kích hoạt |
| 403 | `Insufficient permissions` | User không có quyền admin |

---

## 📝 Code Examples

### JavaScript/Fetch

```javascript
const API_BASE = '/api/managers';

// Tạo manager mới
const createManager = async (token, data) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Required fields
      email: 'new.manager@example.com',
      password: 'SecurePass123!',
      name: 'John Doe',
      
      // Optional fields
      description: 'Experienced manager...',
      expertise: 'Project Management, Agile',
      is_given_set: true,
      image_url: '/uploads/managers/john-doe.jpg',
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        title: 'Regional Manager'
      },
      function_ids: [1, 2],
      problem_ids: [1]
    })
  });
  return response.json();
};

// Tìm kiếm managers với advanced filters
const searchManagers = async (token, filters = {}) => {
  const params = new URLSearchParams();
  
  // Add non-empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/search?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Lấy thông tin manager
const getManager = async (token, id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Cập nhật manager
const updateManager = async (token, id, updates) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Xóa manager
const deleteManager = async (token, id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.status === 204;
};

// Lấy đánh giá manager
const getManagerRatings = async (token, id) => {
  const response = await fetch(`${API_BASE}/${id}/rating`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Thêm/cập nhật đánh giá manager (4-step form)
const rateManager = async (token, id, ratingData) => {
  const response = await fetch(`${API_BASE}/${id}/rating`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ratingData)
  });
  return response.json();
};

// Lấy rating của user hiện tại
const getMyRating = async (token, id) => {
  const response = await fetch(`${API_BASE}/${id}/rating?my_rating=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Xóa đánh giá manager
const deleteManagerRating = async (token, id) => {
  const response = await fetch(`${API_BASE}/${id}/rating`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ============================================
// USAGE EXAMPLES
// ============================================

// Search với rating 5 sao
const fiveStarManagers = await searchManagers(token, {
  rating: '5',
  sort_by: 'rating',
  sort_order: 'desc'
});

// Search managers trong Given Set gần Hà Nội
const givenSetNearHanoi = await searchManagers(token, {
  given_set: true,
  near_city: 'Hà Nội',
  radius: 50,
  include_functions: true
});

// Search với AND operation
const specificManagers = await searchManagers(token, {
  managers: 'nguyen',
  expertise: 'agile',
  functions: 'development',
  operation: 'and'
});

// Filter theo alphabet
const managersStartWithN = await searchManagers(token, {
  starts_with: 'N'
});

// Lấy đánh giá của manager
const ratings = await getManagerRatings(token, 42);
console.log(`Average: ${ratings.averageRating}, Total: ${ratings.ratingCount}`);

// Đánh giá manager với 4-step form
const newRating = await rateManager(token, 42, {
  // Step 1: About User
  reviewer_name: 'Nguyen Van A',
  reviewer_full_name: 'Nguyen Van A',
  reviewer_email: 'user@example.com',
  reviewer_phone: '+84123456789',
  
  // Step 2: About Manager
  manager_name: 'Tran Van B',
  manager_location: 'Ha Noi',
  job_location: 'Ho Chi Minh City',
  
  // Step 3: About Function And Problem
  function_name: 'Software Development',
  used_function_from_manager: true,
  function_execution_date: '2026-01-01',
  problem_to_be_solved: 'Build web app',
  function_solved_problem: true,
  
  // Step 4: About Feedback
  provided_feedback_after_function: true,
  manager_applied_feedback: true,
  
  // Optional
  rating: 5,
  comment: 'Excellent manager!'
});
console.log('New average:', newRating.averageRating);

// Lấy rating của mình cho manager
const myRating = await getMyRating(token, 42);
console.log('My rating:', myRating);

// Xóa đánh giá của mình
const result = await deleteManagerRating(token, 42);
console.log('Rating deleted, new average:', result.averageRating);

// ============================================
// PROJECT IDENTIFICATION API
// ============================================

// Lấy danh sách Project IDs
const getProjectIdentifications = async (token, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/ratings/project-identification?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Generate Project Identification mới
const generateProjectId = async (token) => {
  const response = await fetch('/api/ratings/project-identification', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Lấy chi tiết Project ID
const getProjectIdDetail = async (token, projectId) => {
  const response = await fetch(`/api/ratings/project-identification/${projectId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Xóa Project ID (chỉ khi chưa used)
const deleteProjectId = async (token, projectId) => {
  const response = await fetch(`/api/ratings/project-identification/${projectId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// USAGE: Generate và view Project IDs
const newProjectId = await generateProjectId(token);
console.log('New Project ID:', newProjectId.project_id);
// Output: "277CA003-06I0-478F-9385-4D2732771EBE"

// Lấy tất cả Project IDs
const allProjectIds = await getProjectIdentifications(token);
console.log('Total:', allProjectIds.total);

// Lấy chỉ những Project ID chưa dùng
const unusedProjectIds = await getProjectIdentifications(token, { used: 'false' });
console.log('Unused:', unusedProjectIds.items);

// Copy to clipboard (browser)
navigator.clipboard.writeText(newProjectId.project_id);
```

### cURL

```bash
# Tạo manager (với required fields)
curl -X POST http://localhost:3000/api/managers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "Pass123!",
    "name": "Test Manager",
    "description": "Test description",
    "expertise": "Testing, QA",
    "is_given_set": true,
    "image_url": "/uploads/managers/test-manager.jpg",
    "function_ids": [1, 2],
    "problem_ids": [1]
  }'

# Tìm kiếm cơ bản
curl "http://localhost:3000/api/managers/search?q=nguyen&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tìm kiếm với nhiều filters
curl "http://localhost:3000/api/managers/search?managers=nguyen&operation=and&rating=5&given_set=true&near_city=hanoi&radius=50&starts_with=N&include_functions=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy thông tin
curl http://localhost:3000/api/managers/42 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cập nhật
curl -X PUT http://localhost:3000/api/managers/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "suspended",
    "is_given_set": false,
    "image_url": "/uploads/managers/updated-photo.jpg",
    "function_ids": [1, 3, 5]
  }'

# Xóa
curl -X DELETE http://localhost:3000/api/managers/42 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy đánh giá manager
curl http://localhost:3000/api/managers/42/rating \
  -H "Authorization: Bearer YOUR_TOKEN"

# Thêm/cập nhật đánh giá (4-step form)
curl -X POST http://localhost:3000/api/managers/42/rating \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer_name": "Nguyen Van A",
    "reviewer_full_name": "Nguyen Van A",
    "reviewer_email": "user@example.com",
    "reviewer_phone": "+84123456789",
    "manager_name": "Tran Van B",
    "manager_location": "Ha Noi",
    "job_location": "Ho Chi Minh City",
    "function_name": "Software Development",
    "used_function_from_manager": true,
    "function_execution_date": "2026-01-01",
    "problem_to_be_solved": "Build web app",
    "function_solved_problem": true,
    "provided_feedback_after_function": true,
    "manager_applied_feedback": true,
    "rating": 5,
    "comment": "Excellent manager, very professional!"
  }'

# Lấy rating của user hiện tại
curl "http://localhost:3000/api/managers/42/rating?my_rating=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xóa đánh giá của mình
curl -X DELETE http://localhost:3000/api/managers/42/rating \
  -H "Authorization: Bearer YOUR_TOKEN"

# ============================================
# PROJECT IDENTIFICATION API
# ============================================

# Generate Project Identification mới
curl -X POST http://localhost:3000/api/ratings/project-identification \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy danh sách tất cả Project IDs
curl "http://localhost:3000/api/ratings/project-identification" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy danh sách Project IDs chưa sử dụng
curl "http://localhost:3000/api/ratings/project-identification?used=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy chi tiết một Project ID
curl "http://localhost:3000/api/ratings/project-identification/277CA003-06I0-478F-9385-4D2732771EBE" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xóa Project ID (chỉ khi chưa used)
curl -X DELETE "http://localhost:3000/api/ratings/project-identification/277CA003-06I0-478F-9385-4D2732771EBE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,      -- Required, unique
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',         -- 'manager' cho managers
  status VARCHAR(20) DEFAULT 'pending',    -- 'active', 'pending', 'suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `profiles`

```sql
CREATE TABLE profiles (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,  -- Required (PK)
  first_name VARCHAR(255),
  last_name VARCHAR(48),
  title VARCHAR(120),
  function VARCHAR(120),
  location VARCHAR(255),
  geo_id BIGINT,
  avatar_id BIGINT,
  pen_name VARCHAR(120),
  PRIMARY KEY (user_id)
);
```

### Table: `managers`

```sql
CREATE TABLE managers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Required
  name VARCHAR(255) NOT NULL,                                       -- Required
  description TEXT,
  expertise TEXT,
  -- Image: Lưu URL trực tiếp thay vì ID
  -- Ví dụ: '/uploads/managers/alice.jpg' hoặc 'https://cdn.example.com/alice.jpg'
  image_url VARCHAR(500),
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  rating_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_given_set BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

### Table: `manager_ratings`

```sql
CREATE TABLE manager_ratings (
  id BIGSERIAL PRIMARY KEY,
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Step 1: About User (Reviewer Info)
  reviewer_name VARCHAR(255),                    -- User Name
  reviewer_full_name VARCHAR(255),               -- Full Name
  reviewer_email VARCHAR(255),                   -- Email Address
  reviewer_phone VARCHAR(50),                    -- Phone Number
  reviewer_address TEXT,                         -- Address (Optional)
  
  -- Step 2: About Manager
  manager_name VARCHAR(255),                     -- Manager name
  manager_user_name VARCHAR(255),                -- User Name (of manager)
  manager_location VARCHAR(255),                 -- Manager Location
  job_location VARCHAR(255),                     -- Job Location
  manager_url VARCHAR(500),                      -- Manager URL
  
  -- Step 3: About Function And Problem
  function_name VARCHAR(255),                    -- Function Name
  function_manager VARCHAR(255),                 -- Function Manager
  used_function_from_manager BOOLEAN,            -- Did you use the function from the Manager?
  function_execution_date DATE,                  -- Function Execution Date
  problem_solver_manager_name VARCHAR(255),      -- Manager name who helped you solve the problem?
  problem_to_be_solved TEXT,                     -- Problem to be solved
  manager_helped_identify_problem BOOLEAN,       -- Did the manager help you identify the problem properly?
  function_solved_problem BOOLEAN,               -- Did the function solve the problem?
  problem_existed_before_function BOOLEAN,       -- Did the problem exist before the function executed?
  problem_existed_after_function BOOLEAN,        -- Did the problem exist after the function executed?
  function_provided_solved_problem BOOLEAN,      -- Is the function provided by the Manager solved the problem?
  
  -- Step 4: About Feedback
  provided_feedback_after_function BOOLEAN,      -- Did you provide feedback after function executed?
  manager_applied_feedback BOOLEAN,              -- Did the Manager apply the feedback?
  
  -- Legacy/Computed Fields
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Overall computed rating (optional)
  comment TEXT,                                  -- Additional comments
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (manager_id, user_id)
);
```

### Table: `manager_functions`

```sql
CREATE TABLE manager_functions (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,  -- Required
  function_id BIGINT NOT NULL REFERENCES functions(id) ON DELETE CASCADE, -- Required
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, function_id)
);
```

### Table: `manager_problems`

```sql
CREATE TABLE manager_problems (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,  -- Required
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,  -- Required
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, problem_id)
);
```

### Table: `project_identifications`

```sql
CREATE TABLE project_identifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(36) UNIQUE NOT NULL,  -- UUID format: "277CA003-06I0-478F-9385-4D2732771EBE"
  used BOOLEAN DEFAULT false,              -- Has this ID been used for a rating?
  manager_id BIGINT REFERENCES managers(id) ON DELETE SET NULL,   -- If used for manager rating
  provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL, -- If used for provider rating
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP  -- When the ID was used
);

-- Indexes
CREATE INDEX idx_project_identifications_user_id ON project_identifications(user_id);
CREATE INDEX idx_project_identifications_project_id ON project_identifications(project_id);
CREATE INDEX idx_project_identifications_used ON project_identifications(used);
```

---

## 📈 Aggregations Response

Response từ search API bao gồm `aggregations` để hiển thị counts trên UI:

```json
{
  "aggregations": {
    "total_managers": 94,           // Tổng số managers
    "total_with_problems": 1820,    // Managers có problems
    "total_with_functions": 673,    // Managers có functions
    "total_with_expertise": 94,     // Managers có expertise
    "total_with_descriptions": 155, // Managers có description
    "by_rating": {
      "5": 45,      // Rating >= 4.5
      "4": 67,      // Rating 3.5 - 4.5
      "3": 32,      // Rating 2.5 - 3.5
      "below2": 12  // Rating < 2.5
    },
    "total_in_given_set": 34,       // Managers trong Given Set
    "by_alphabet": {                // Đếm theo chữ cái đầu
      "A": 12,
      "B": 8,
      "C": 15,
      "N": 23
      // ...
    }
  }
}
```

---

## 📋 Quick Reference - Required Fields Summary

### POST `/api/managers` (Create)

| Field | Required |
|-------|:--------:|
| `email` | ✅ |
| `password` | ✅ |
| `name` | ✅ |
| All other fields | ❌ |

### GET `/api/managers/{id}` (Get)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |

### PUT `/api/managers/{id}` (Update)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |
| All body fields | ❌ |

### DELETE `/api/managers/{id}` (Delete)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |

### GET `/api/managers/search` (Search)

| Parameter | Required |
|-----------|:--------:|
| All query params | ❌ |

### GET `/api/managers/{id}/rating` (Get Ratings)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |

### POST `/api/managers/{id}/rating` (Add/Update Rating)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |
| `rating` (body) | ✅ |
| `comment` (body) | ❌ |

### DELETE `/api/managers/{id}/rating` (Delete Rating)

| Parameter | Required |
|-----------|:--------:|
| `id` (path) | ✅ |

### GET `/api/ratings/project-identification` (List Project IDs)

| Parameter | Required |
|-----------|:--------:|
| All query params | ❌ |

### POST `/api/ratings/project-identification` (Generate Project ID)

| Parameter | Required |
|-----------|:--------:|
| No body required | - |

### GET `/api/ratings/project-identification/{projectId}` (Get Project ID)

| Parameter | Required |
|-----------|:--------:|
| `projectId` (path) | ✅ |

### DELETE `/api/ratings/project-identification/{projectId}` (Delete Project ID)

| Parameter | Required |
|-----------|:--------:|
| `projectId` (path) | ✅ |

### All Endpoints

| Header | Required |
|--------|:--------:|
| `Authorization` | ✅ |
| `Content-Type` | ✅ (POST/PUT only) |

