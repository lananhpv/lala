# 🚀 Hướng Dẫn Deploy News Tracker Với Tính Năng Tóm Tắt

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v18+ hoặc v20+
- **pnpm**: v8+ (hoặc npm/yarn)
- **RAM**: Tối thiểu 512MB
- **Disk**: Tối thiểu 500MB

## 🔧 Cài Đặt

### Bước 1: Giải Nén Source Code

```bash
tar -xzf news_tracker_final.tar.gz
cd news_tracker_final
```

### Bước 2: Cài Đặt Dependencies

```bash
pnpm install
```

Hoặc nếu dùng npm:

```bash
npm install
```

### Bước 3: Cấu Hình API Key (Tùy Chọn)

Nếu bạn muốn sử dụng OpenAI API của riêng mình, tạo file `.env`:

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Lưu ý**: Nếu không cấu hình, ứng dụng sẽ tự động sử dụng API key từ môi trường Manus (nếu có).

### Bước 4: Build Ứng Dụng

```bash
pnpm build
```

### Bước 5: Chạy Ứng Dụng

**Development mode:**
```bash
pnpm dev
```

**Production mode:**
```bash
NODE_ENV=production node dist/index.js
```

### Bước 6: Truy Cập Ứng Dụng

Mở trình duyệt và truy cập: `http://localhost:3000`

## 🎯 Sử Dụng Tính Năng Tóm Tắt

### 1. Thu Thập Tin Tức

- Click nút **"Làm mới"** ở header để thu thập tin tức mới
- Hoặc đợi scheduler tự động chạy (mỗi 60 phút)

### 2. Tạo Tóm Tắt

1. Click tab **"Tóm tắt"** ở header
2. Click nút **"Tạo tóm tắt"** ở góc phải trên
3. Đợi 30-60 giây để AI xử lý
4. Xem kết quả với màu sắc sentiment:
   - 🟢 **Xanh lá**: Tích cực - tác động tốt đến thị trường
   - 🔴 **Đỏ**: Tiêu cực - tác động xấu đến thị trường
   - 🟡 **Vàng**: Trung lập - không ảnh hưởng rõ ràng

### 3. Xem Biểu Đồ Xu Hướng

- Biểu đồ tự động hiển thị sau khi có dữ liệu
- Hover vào từng thanh để xem chi tiết
- Hiển thị 30 ngày gần nhất

### 4. Lọc Theo Region

- Click vào các tab: **Việt Nam** / **Hoa Kỳ** / **Trung Quốc**
- Xem tóm tắt và biểu đồ riêng cho từng region

## 🔐 Cấu Hình API Key Cho Production

### Option 1: Sử dụng Biến Môi Trường

```bash
export OPENAI_API_KEY="sk-your-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
NODE_ENV=production node dist/index.js
```

### Option 2: Sử dụng PM2 (Recommended)

Tạo file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'news-tracker',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      OPENAI_API_KEY: 'sk-your-key',
      OPENAI_BASE_URL: 'https://api.openai.com/v1',
      PORT: 3000
    }
  }]
};
```

Chạy với PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 3: Sử dụng Docker

Tạo file `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build và chạy:

```bash
docker build -t news-tracker .
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY="sk-your-key" \
  -e OPENAI_BASE_URL="https://api.openai.com/v1" \
  --name news-tracker \
  news-tracker
```

## 📊 Cấu Trúc Database

Ứng dụng sử dụng SQLite với 2 bảng chính:

1. **articles**: Lưu trữ tin tức
   - id, title, url, source, summary, region, category, collectedDate, score

2. **daily_summaries**: Lưu trữ tóm tắt theo ngày
   - id, date, region, summary, sentiment, articleCount, createdAt

Database file: `news_tracker.db` (tự động tạo khi khởi động)

## 🔧 Troubleshooting

### Lỗi: "OPENAI_API_KEY is not configured"

**Giải pháp**: Cấu hình API key theo hướng dẫn ở trên.

### Lỗi: "fetch failed" hoặc "ENOTFOUND"

**Nguyên nhân**: Không thể kết nối đến API endpoint.

**Giải pháp**: 
1. Kiểm tra kết nối internet
2. Đảm bảo `OPENAI_BASE_URL` đúng
3. Kiểm tra firewall/proxy

### Lỗi: "401 Unauthorized"

**Nguyên nhân**: API key không hợp lệ.

**Giải pháp**: Kiểm tra lại API key, đảm bảo key còn hiệu lực và có đủ credits.

### Không Thấy Tóm Tắt

**Nguyên nhân**: Chưa có tin tức trong database hoặc chưa tạo tóm tắt.

**Giải pháp**:
1. Click "Làm mới" để thu thập tin tức
2. Đợi vài phút để tin tức được lưu
3. Click "Tạo tóm tắt" trong tab Tóm tắt

## 📝 Cấu Hình Nâng Cao

### Thay Đổi Model AI

Mặc định sử dụng `gpt-4.1-mini`. Để thay đổi, sửa file `server/_core/llm.ts`:

```typescript
const payload: Record<string, unknown> = {
  model: "gpt-4.1-mini", // Đổi thành model khác
  messages: messages.map(normalizeMessage),
};
```

Các model được hỗ trợ:
- `gpt-4.1-mini` (nhanh, rẻ)
- `gpt-4.1-nano` (rất nhanh, rất rẻ)
- `gemini-2.5-flash` (nếu dùng Manus API)

### Thay Đổi Số Ngày Tóm Tắt

Mặc định tạo tóm tắt cho 7 ngày gần nhất. Để thay đổi, sửa trong `client/src/pages/Summary.tsx`:

```typescript
const [days, setDays] = useState<number>(7); // Đổi thành số ngày khác
```

### Thay Đổi Tần Suất Thu Thập Tin Tức

Mặc định thu thập mỗi 60 phút. Để thay đổi, sửa file `server/newsScheduler.ts`:

```typescript
const INTERVAL_MS = 60 * 60 * 1000; // Đổi thành interval khác (milliseconds)
```

## 🎨 Tùy Chỉnh Giao Diện

### Thay Đổi Màu Sentiment

Sửa file `client/src/pages/Summary.tsx`:

```typescript
const SENTIMENT_CONFIG = {
  positive: {
    color: "text-green-600",      // Đổi màu chữ
    bgColor: "bg-green-50",        // Đổi màu nền
    borderColor: "border-green-200", // Đổi màu viền
    icon: TrendingUp,
    label: "Tích cực"
  },
  // ... tương tự cho negative và neutral
};
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file `TROUBLESHOOTING.md`
2. Xem log server: `tail -f server.log`
3. Kiểm tra database: `sqlite3 news_tracker.db "SELECT * FROM daily_summaries LIMIT 10;"`

## 🎉 Chúc Mừng!

Bạn đã cài đặt thành công News Tracker với tính năng Tóm tắt AI! 

Enjoy! 🚀
