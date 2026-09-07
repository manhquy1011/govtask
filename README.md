# GovTask - Hệ Thống Quản Lý & Điều Hành Công Việc Cơ Quan

Ứng dụng quản lý công việc và điều hành toàn diện Cơ quan Ủy ban MTTQ Việt Nam tỉnh Bắc Ninh.

## 🚀 Hướng dẫn triển khai lên Vercel (Deploy to Vercel)

Ứng dụng đã được cấu hình tối ưu sẵn cho **Vercel** thông qua tệp `vercel.json` (hỗ trợ Vite React SPA và điều hướng Single Page Application không bị lỗi 404 khi tải lại trang).

### Cách 1: Đưa code lên GitHub và kết nối với Vercel (Khuyên dùng)
1. Trong giao diện AI Studio, chọn **Export to GitHub** (hoặc tải mã nguồn ZIP về rồi đẩy lên GitHub cá nhân/tổ chức).
2. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập.
3. Chọn **Add New...** -> **Project**.
4. Chọn repository GitHub vừa tạo và bấm **Import**.
5. Cấu hình tự động nhận diện:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. (Tùy chọn) Thêm biến môi trường nếu cần:
   - `GEMINI_API_KEY`: Khóa API Google Gemini (nếu dùng các tác vụ AI mở rộng).
7. Bấm **Deploy**. Sau khoảng 1-2 phút, ứng dụng của bạn sẽ có một đường link tên miền chính thức `.vercel.app`.

### Cách 2: Triển khai bằng Vercel CLI (Dòng lệnh)
1. Cài đặt Vercel CLI (nếu chưa có):
   ```bash
   npm install -g vercel
   ```
2. Mở thư mục dự án và chạy:
   ```bash
   vercel
   ```
3. Khi sẵn sàng phát hành production:
   ```bash
   vercel --prod
   ```

---

## 🛠 Lệnh phát triển cục bộ (Local Development)
- Cài đặt thư viện: `npm install`
- Khởi chạy môi trường dev: `npm run dev` (mặc định tại cổng 3000)
- Kiểm tra kiểu dữ liệu & lint: `npm run lint`
- Đóng gói sản phẩm: `npm run build`
- Xem trước bản build: `npm run preview`
