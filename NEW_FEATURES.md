# Tính Năng Mới - Tóm Tắt Tin Tức Theo Ngày

## 🎉 Các Tính Năng Đã Thêm

### 1. Tab "Tóm Tắt" Mới
- Giao diện chuyên dụng để xem tóm tắt tin tức theo ngày
- Phân loại theo region: Việt Nam, Hoa Kỳ, Trung Quốc
- Hiển thị số lượng bài viết cho mỗi ngày

### 2. Tóm Tắt Tự Động Bằng AI
- Tự động tóm tắt tin tức trong ngày thành 1-3 dòng ngắn gọn
- Phân tích tác động đến thị trường chứng khoán
- Sử dụng LLM để đánh giá sentiment

### 3. Phân Loại Sentiment Với Màu Sắc
- **🟢 Tích cực (Positive)**: Màu xanh lá - Tin tức có tác động tích cực đến thị trường
  - Ví dụ: Tăng trưởng kinh tế, chính sách hỗ trợ, tin tốt về doanh nghiệp
- **🔴 Tiêu cực (Negative)**: Màu đỏ - Tin tức có tác động tiêu cực đến thị trường
  - Ví dụ: Suy thoái, lạm phát cao, chính sách thắt chặt, rủi ro
- **🟡 Trung lập (Neutral)**: Màu vàng - Tin tức không có tác động rõ ràng
  - Ví dụ: Tin tức thông tin, không ảnh hưởng trực tiếp

### 4. Biểu Đồ Xu Hướng Sentiment
- Biểu đồ thanh ngang (stacked bar chart) hiển thị phân bố sentiment theo ngày
- Hiển thị 30 ngày gần nhất
- Dễ dàng nhận ra xu hướng tin tức qua thời gian
- Màu sắc tương ứng với sentiment: xanh/đỏ/vàng

### 5. Thống Kê Sentiment
- Tổng số ngày có tóm tắt
- Số ngày có sentiment tích cực
- Số ngày có sentiment tiêu cực
- Số ngày có sentiment trung lập

### 6. Nút "Tạo Tóm Tắt"
- Tự động tạo tóm tắt cho nhiều ngày (mặc định 7 ngày)
- Xử lý song song cho tất cả regions
- Hiển thị tiến độ và kết quả

## 🗄️ Thay Đổi Database

### Bảng Mới: `daily_summaries`
```sql
CREATE TABLE daily_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,              -- Format: YYYY-MM-DD
  region TEXT NOT NULL,             -- vietnam, us, china
  summary TEXT NOT NULL,            -- 1-3 dòng tóm tắt
  sentiment TEXT NOT NULL,          -- positive, negative, neutral
  articleCount INTEGER DEFAULT 0,   -- Số bài viết trong ngày
  createdAt INTEGER NOT NULL,
  UNIQUE(date, region)
);
```

## 📡 API Endpoints Mới

### 1. `summary.list` - Lấy danh sách tóm tắt
```typescript
trpc.summary.list.useQuery({
  limit: 30,
  startDate: '2025-01-01',  // optional
  endDate: '2025-01-31'      // optional
})
```

### 2. `summary.generate` - Tạo tóm tắt cho một ngày
```typescript
trpc.summary.generate.useMutation({
  date: '2025-01-15',
  region: 'vietnam'
})
```

### 3. `summary.generateAll` - Tạo tóm tắt cho nhiều ngày
```typescript
trpc.summary.generateAll.useMutation({
  days: 7  // Số ngày gần đây
})
```

## 🎨 Components Mới

### `Summary.tsx`
- Component chính cho tab Tóm tắt
- Hiển thị biểu đồ và danh sách tóm tắt
- Tích hợp với tRPC để fetch dữ liệu

## 🚀 Cách Sử Dụng

### 1. Truy cập Tab "Tóm Tắt"
- Mở ứng dụng
- Click vào nút "Tóm tắt" ở header
- Chọn region muốn xem (Việt Nam, Hoa Kỳ, Trung Quốc)

### 2. Tạo Tóm Tắt Tự Động
- Click nút "Tạo tóm tắt" ở góc phải trên
- Hệ thống sẽ tự động:
  - Lấy tất cả bài viết trong 7 ngày gần đây
  - Phân tích và tóm tắt bằng AI
  - Đánh giá sentiment
  - Lưu vào database

### 3. Xem Biểu Đồ Xu Hướng
- Biểu đồ tự động hiển thị sau khi có dữ liệu
- Hover vào từng thanh để xem chi tiết
- Màu sắc giúp nhận biết nhanh xu hướng

### 4. Đọc Tóm Tắt Chi Tiết
- Scroll xuống để xem danh sách tóm tắt
- Mỗi card hiển thị:
  - Ngày và thứ
  - Sentiment với icon và màu sắc
  - Số lượng bài viết
  - Nội dung tóm tắt 1-3 dòng

## 🔧 Cấu Hình

### Thay Đổi Số Ngày Tạo Tóm Tắt
Trong file `client/src/pages/Summary.tsx`:
```typescript
const [days, setDays] = useState<number>(7); // Thay đổi số ngày ở đây
```

### Thay Đổi Số Ngày Hiển Thị Biểu Đồ
Trong file `client/src/pages/Summary.tsx`, tìm dòng:
```typescript
.slice(-30); // Thay đổi số ngày hiển thị ở đây
```

### Tùy Chỉnh Prompt AI
Trong file `server/routers.ts`, tìm phần `system` message để chỉnh sửa prompt:
```typescript
content: `Bạn là chuyên gia phân tích tin tức tài chính...`
```

## 📊 Ví Dụ Kết Quả

### Tóm Tắt Tích Cực (Green)
> "Ngân hàng Nhà nước giảm lãi suất điều hành 0.5%, tạo điều kiện thuận lợi cho doanh nghiệp vay vốn. Thị trường chứng khoán phản ứng tích cực với thanh khoản tăng mạnh."

### Tóm Tắt Tiêu Cực (Red)
> "Lạm phát tăng cao lên 4.2%, vượt mục tiêu của Chính phủ. Các chuyên gia cảnh báo rủi ro thắt chặt tiền tệ có thể ảnh hưởng đến tăng trưởng kinh tế."

### Tóm Tắt Trung Lập (Yellow)
> "Tỷ giá USD/VND ổn định quanh mức 24,500. Các chỉ số kinh tế vĩ mô duy trì ổn định, chưa có biến động đáng kể."

## 🐛 Xử Lý Lỗi

### Không có dữ liệu tóm tắt
- Click nút "Tạo tóm tắt" để tạo dữ liệu mới
- Đảm bảo đã có bài viết trong database

### Lỗi khi tạo tóm tắt
- Kiểm tra kết nối internet
- Kiểm tra API key LLM trong file `.env`
- Xem log server để biết chi tiết lỗi

### Biểu đồ không hiển thị
- Cần có ít nhất 1 ngày có dữ liệu
- Refresh trang sau khi tạo tóm tắt

## 📝 Ghi Chú Kỹ Thuật

### Cách AI Đánh Giá Sentiment
1. Phân tích nội dung tất cả bài viết trong ngày
2. Xem xét từ khóa và ngữ cảnh
3. Đánh giá tác động tổng thể đến thị trường chứng khoán
4. Trả về JSON với `summary` và `sentiment`

### Xử Lý Dữ Liệu Theo Ngày
- Sử dụng `date(collectedDate/1000, 'unixepoch')` để group theo ngày
- Format ngày: YYYY-MM-DD (ISO 8601)
- Timezone: UTC

### Performance
- Tóm tắt được cache trong database
- Không tạo lại tóm tắt cho ngày đã có
- Có thể update tóm tắt bằng cách gọi lại API

## 🎯 Roadmap Tương Lai

- [ ] Export tóm tắt sang PDF/Excel
- [ ] Email notification cho tóm tắt hàng ngày
- [ ] Tích hợp với Telegram/Slack bot
- [ ] Biểu đồ line chart cho sentiment score
- [ ] So sánh sentiment giữa các regions
- [ ] Tìm kiếm và filter tóm tắt theo từ khóa

---

**Phát triển bởi**: Manus AI Assistant
**Ngày cập nhật**: 29/10/2025
