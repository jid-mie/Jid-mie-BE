# Backend API Chuẩn SEO cho Jid-mie (với MongoDB)

Đây là mã nguồn backend cho dự án Jid-mie, được xây dựng với kiến trúc ưu tiên cho SEO (SEO-First) và sử dụng MongoDB làm cơ sở dữ liệu.

## Hướng dẫn cài đặt

1.  **Cài đặt Node.js và MongoDB**:
    * Đảm bảo bạn đã cài đặt Node.js (phiên bản 16.x trở lên).
    * Cài đặt MongoDB trên máy của bạn hoặc sử dụng một dịch vụ cloud như MongoDB Atlas.

2.  **Cấu hình biến môi trường**:
    * Tạo một file tên là `.env` trong thư mục gốc.
    * Sao chép nội dung của file `.env.example` (nếu có) hoặc dùng nội dung bên dưới và chỉnh sửa chuỗi kết nối MongoDB.

3.  **Cài đặt các thư viện**:
    * Mở terminal và chạy lệnh: `npm install`

4.  **Chạy dự án**:
    * Chế độ phát triển: `npm run dev`
    * Chế độ production: `npm start`

    Server sẽ khởi động tại địa chỉ `http://localhost:3001`.

## Cách sử dụng các API

### API Công khai

* **Lấy nội dung của một trang**: `GET /api/pages/{slug}`
* **Sitemap**: `GET /api/sitemap.xml`
* **Robots.txt**: `GET /robots.txt`

### API Quản trị (Admin)

**Lưu ý**: Tất cả các yêu cầu đến `/api/admin` phải đính kèm header `x-api-key`.

#### Quản lý Trang Dịch vụ
* `GET /api/admin/service-pages`
* `POST /api/admin/service-pages`
* `PUT /api/admin/service-pages/:id`
* `DELETE /api/admin/service-pages/:id`

#### Quản lý Bài viết Blog
* `GET /api/admin/blog-posts`
* `POST /api/admin/blog-posts`
* `PUT /api/admin/blog-posts/:id`
* `DELETE /api/admin/blog-posts/:id`

#### Quản lý Chuyển hướng
* `GET /api/admin/redirects`
* `POST /api/admin/redirects`
* `DELETE /api/admin/redirects/:id`