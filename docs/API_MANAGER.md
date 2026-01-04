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
  image_id?: number;             // ID ảnh đại diện manager
  image_url?: string;            // URL ảnh đại diện manager

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
  "image_id": 15,
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
| `image_id` | number | No | `null` | ID ảnh đại diện (từ file_assets) |
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
  "image_id": 15,
  "image_url": "/uploads/manager_image.jpg",
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
      "image_id": 15,
      "image_url": "/uploads/manager_image.jpg",
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
  "image_id": 15,
  "image_url": "/uploads/manager_image.jpg",
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
  "image_id": 20,
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
| `image_id` | number | No | ID ảnh đại diện mới |
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

Lấy thông tin tổng hợp đánh giá của một manager.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

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
      "rating": 5,
      "comment": "Excellent manager, very helpful!",
      "created_at": "2026-01-01T10:30:00.000Z",
      "user_email": "user@example.com",
      "user_name": "Nguyen Van A"
    },
    {
      "id": 2,
      "manager_id": 42,
      "user_id": 101,
      "rating": 4,
      "comment": "Good communication skills",
      "created_at": "2026-01-02T14:20:00.000Z",
      "user_email": "user2@example.com",
      "user_name": "Tran Van B"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `averageRating` | number | Rating trung bình (0-5) |
| `ratingCount` | number | Tổng số đánh giá |
| `ratings` | array | Danh sách chi tiết các đánh giá |
| `ratings[].id` | number | ID của đánh giá |
| `ratings[].manager_id` | number | ID của manager |
| `ratings[].user_id` | number | ID của user đánh giá |
| `ratings[].rating` | number | Điểm đánh giá (1-5) |
| `ratings[].comment` | string | Bình luận (optional) |
| `ratings[].created_at` | string | Thời gian đánh giá (ISO 8601) |
| `ratings[].user_email` | string | Email của user đánh giá |
| `ratings[].user_name` | string | Tên của user đánh giá (optional) |

#### Error Responses

| Status | Message | Mô tả |
|--------|---------|-------|
| 400 | `Invalid manager id` | ID không hợp lệ |
| 404 | `Manager not found` | Không tìm thấy manager |

---

### 7. Thêm/Cập Nhật Đánh Giá Manager

**POST** `/api/managers/{id}/rating`

Thêm hoặc cập nhật đánh giá của user hiện tại cho manager. Mỗi user chỉ có thể đánh giá một manager một lần, nếu đánh giá lại sẽ cập nhật đánh giá cũ.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | number | ✅ **Yes** | Manager ID |

#### Request Body

```json
{
  "rating": 5,
  "comment": "Excellent manager, very professional!"
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `rating` | number | ✅ **Yes** | Điểm đánh giá (1-5) |
| `comment` | string | No | Bình luận (optional) |

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
      "rating": 5,
      "comment": "Excellent manager, very professional!",
      "created_at": "2026-01-03T09:15:00.000Z",
      "user_email": "current.user@example.com",
      "user_name": "Current User"
    }
    // ... other ratings
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
      image_id: 15,
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

// Thêm/cập nhật đánh giá manager
const rateManager = async (token, id, rating, comment) => {
  const response = await fetch(`${API_BASE}/${id}/rating`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rating, comment })
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

// Đánh giá manager
const newRating = await rateManager(token, 42, 5, 'Excellent manager!');
console.log('New average:', newRating.averageRating);

// Xóa đánh giá của mình
const result = await deleteManagerRating(token, 42);
console.log('Rating deleted, new average:', result.averageRating);
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
    "image_id": 15,
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
    "image_id": 20,
    "function_ids": [1, 3, 5]
  }'

# Xóa
curl -X DELETE http://localhost:3000/api/managers/42 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy đánh giá manager
curl http://localhost:3000/api/managers/42/rating \
  -H "Authorization: Bearer YOUR_TOKEN"

# Thêm/cập nhật đánh giá
curl -X POST http://localhost:3000/api/managers/42/rating \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent manager, very professional!"
  }'

# Xóa đánh giá của mình
curl -X DELETE http://localhost:3000/api/managers/42/rating \
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
  image_id BIGINT REFERENCES file_assets(id),
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
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,  -- Required
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,        -- Required
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),           -- Required
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

### All Endpoints

| Header | Required |
|--------|:--------:|
| `Authorization` | ✅ |
| `Content-Type` | ✅ (POST/PUT only) |

