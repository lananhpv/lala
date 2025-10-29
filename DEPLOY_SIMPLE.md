# 🚀 Hướng Dẫn Deploy Website Đơn Giản (Cho Người Không Biết Kỹ Thuật)

## 🎯 Cách Nhanh Nhất: Sử Dụng Replit (Khuyến Nghị)

**Replit** là nền tảng cho phép bạn chạy website trực tiếp trên trình duyệt, không cần cài đặt gì!

### Bước 1: Tạo Tài Khoản Replit

1. Truy cập: https://replit.com
2. Click **"Sign up"** (Đăng ký)
3. Đăng ký bằng Google/GitHub hoặc Email
4. **MIỄN PHÍ** - không cần thẻ tín dụng

### Bước 2: Tạo Project Mới

1. Sau khi đăng nhập, click **"+ Create Repl"**
2. Chọn **"Import from GitHub"**
3. Hoặc chọn **"Node.js"** template

### Bước 3: Upload Source Code

**Option A: Nếu có GitHub**
1. Upload file `news_tracker_final.tar.gz` lên GitHub repository của bạn
2. Import từ GitHub vào Replit

**Option B: Upload Trực Tiếp**
1. Trong Replit, click vào icon **"Files"** (3 chấm ngang)
2. Click **"Upload file"**
3. Chọn file `news_tracker_final.tar.gz`
4. Đợi upload xong
5. Trong Shell (terminal), gõ lệnh:
   ```bash
   tar -xzf news_tracker_final.tar.gz
   mv news_tracker_final/* .
   ```

### Bước 4: Cấu Hình API Key

1. Click vào icon **"Secrets"** (ổ khóa) ở sidebar trái
2. Click **"+ New Secret"**
3. Thêm 2 secrets:

**Secret 1:**
- Key: `OPENAI_API_KEY`
- Value: `sk-your-openai-api-key-here`

**Secret 2:**
- Key: `OPENAI_BASE_URL`
- Value: `https://api.openai.com/v1`

**Lấy OpenAI API Key:**
- Truy cập: https://platform.openai.com/api-keys
- Đăng ký tài khoản (miễn phí $5 credit)
- Click **"Create new secret key"**
- Copy key và paste vào Replit

### Bước 5: Chạy Website

1. Click nút **"Run"** (màu xanh lá) ở trên cùng
2. Đợi 1-2 phút để cài đặt
3. Website sẽ tự động mở trong tab bên phải
4. URL sẽ có dạng: `https://your-project.your-username.repl.co`

### Bước 6: Sử Dụng

1. Click tab **"Tóm tắt"**
2. Click **"Tạo tóm tắt"**
3. Đợi 30-60 giây
4. Xem kết quả!

---

## 🎯 Cách Thay Thế: Sử Dụng Railway (Dễ Hơn Vercel)

**Railway** tự động deploy, không cần config phức tạp.

### Bước 1: Tạo Tài Khoản

1. Truy cập: https://railway.app
2. Click **"Login with GitHub"**
3. Đăng nhập bằng GitHub

### Bước 2: Upload Code Lên GitHub

1. Tạo repository mới trên GitHub
2. Upload file `news_tracker_final.tar.gz`
3. Giải nén trên GitHub hoặc local rồi push

### Bước 3: Deploy Trên Railway

1. Trong Railway, click **"+ New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository vừa tạo
4. Railway sẽ tự động detect và deploy

### Bước 4: Thêm Environment Variables

1. Click vào project vừa tạo
2. Chọn tab **"Variables"**
3. Click **"+ New Variable"**
4. Thêm:
   - `OPENAI_API_KEY` = `sk-your-key`
   - `OPENAI_BASE_URL` = `https://api.openai.com/v1`
   - `NODE_ENV` = `production`

### Bước 5: Lấy URL

1. Sau khi deploy xong (2-3 phút)
2. Click tab **"Settings"**
3. Scroll xuống **"Domains"**
4. Click **"Generate Domain"**
5. Copy URL và chia sẻ!

---

## 🎯 Cách Đơn Giản Nhất: Chạy Trên Máy Tính Của Bạn

Nếu bạn chỉ muốn dùng cá nhân, không cần public:

### Bước 1: Tải Node.js

1. Truy cập: https://nodejs.org
2. Tải bản **"LTS"** (khuyến nghị)
3. Cài đặt (next, next, finish)

### Bước 2: Giải Nén Source Code

1. Giải nén file `news_tracker_final.tar.gz`
2. Mở thư mục vừa giải nén

### Bước 3: Cài Đặt

1. **Windows**: Click chuột phải trong thư mục → chọn **"Open in Terminal"**
2. **Mac**: Click chuột phải → **"New Terminal at Folder"**
3. Gõ lệnh:
   ```bash
   npm install -g pnpm
   pnpm install
   ```
4. Đợi 2-3 phút

### Bước 4: Tạo File API Key

1. Tạo file tên `.env` trong thư mục
2. Mở bằng Notepad
3. Gõ vào:
   ```
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```
4. Lưu lại

### Bước 5: Chạy

1. Trong Terminal, gõ:
   ```bash
   pnpm build
   pnpm start
   ```
2. Mở trình duyệt, vào: `http://localhost:3000`

---

## 📝 So Sánh Các Cách

| Cách | Độ Khó | Miễn Phí | Public URL | Khuyến Nghị |
|------|--------|----------|------------|-------------|
| **Replit** | ⭐ Dễ nhất | ✅ Có | ✅ Có | ⭐⭐⭐⭐⭐ Tốt nhất cho người mới |
| **Railway** | ⭐⭐ Trung bình | ✅ Có (500h/tháng) | ✅ Có | ⭐⭐⭐⭐ Tốt cho production |
| **Chạy Local** | ⭐⭐ Trung bình | ✅ Hoàn toàn | ❌ Không | ⭐⭐⭐ Chỉ dùng cá nhân |
| **Vercel** | ⭐⭐⭐ Khó | ✅ Có | ✅ Có | ⭐⭐ Cần config nhiều |

---

## 🎁 Khuyến Nghị Của Tôi

### Cho Người Hoàn Toàn Mới:
👉 **Dùng Replit** - Chỉ cần kéo thả file, click Run, xong!

### Cho Người Muốn Website Chuyên Nghiệp:
👉 **Dùng Railway** - Tự động deploy, có domain đẹp, ổn định

### Cho Người Chỉ Dùng Cá Nhân:
👉 **Chạy Local** - Không cần internet, không tốn tiền

---

## 🆘 Cần Giúp Đỡ?

Nếu bạn gặp khó khăn ở bất kỳ bước nào:

1. **Replit**: Có chat support trực tiếp
2. **Railway**: Có Discord community
3. **Local**: Gửi screenshot lỗi cho tôi

---

## 🎉 Video Hướng Dẫn (Nếu Cần)

Tôi có thể tạo video hướng dẫn chi tiết từng bước nếu bạn cần!

Chúc bạn deploy thành công! 🚀
