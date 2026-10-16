# Hướng dẫn cho agent

## 1. Bối cảnh dự án

Dự án là một trang web gia đình để cùng học HTML và các nội dung học tập. Ưu tiên giải pháp đơn giản, dễ hiểu, phù hợp cho người mới học và dễ duy trì.

## 2. Cấu trúc thư mục

```text
MyFamilyWeb_v1.0/
├── css/
│   └── main.css
├── data/
│   ├── icons/
│   ├── images/
│   └── JSON/
│       └── hiragana.json
├── features/
│   ├── <feature-name>/
│   │   ├── <feature-name>.html
│   │   ├── <feature-name>.js
│   │   └── <feature-name>.css
│   └── ...
├── js/
│   ├── utils/
│   │   └── helpers.js
│   └── app.js
├── index.html
└── README.md
```

## 3. Vai trò của các phần chính

- `index.html`: trang chính và điểm vào ứng dụng.
- `features/`: từng tính năng độc lập; ví dụ bảng Hiragana và bài luyện tập Hiragana.
- `data/JSON/`: dữ liệu dạng JSON dùng bởi các tính năng.
- `data/images/` và `data/icons/`: hình ảnh và biểu tượng của ứng dụng.
- `css/main.css`: kiểu dáng dùng chung toàn trang.
- `js/app.js`: logic khởi tạo và điều phối ứng dụng.
- `js/utils/`: hàm tiện ích có thể tái sử dụng.

## 4. Quy tắc khi thay đổi mã nguồn

- Trước khi chỉnh sửa, xem các tệp liên quan và làm theo cách tổ chức, quy ước hiện có.
- Giữ phạm vi thay đổi gọn; không sửa hoặc xóa nội dung ngoài yêu cầu.
- Mỗi tính năng mới nên nằm trong thư mục riêng dưới `features/`, gồm HTML, JavaScript và CSS riêng khi cần.
- Chỉ đưa kiểu dáng dùng chung vào `css/main.css`; kiểu dáng riêng của tính năng đặt trong thư mục tính năng.
- Đặt dữ liệu có cấu trúc trong `data/JSON/`, không nhúng dữ liệu lớn trực tiếp vào mã giao diện.
- Tái sử dụng các hàm phù hợp trong `js/utils/helpers.js`; tránh tạo bản sao logic không cần thiết.
- Dùng tên tệp và thư mục rõ nghĩa, nhất quán với các phần hiện có.
- Giữ HTML ngữ nghĩa, JavaScript dễ đọc và giao diện thuận tiện trên màn hình nhỏ.
- Không thêm thư viện hoặc công cụ bên ngoài nếu chưa thực sự cần thiết.

## 5. Kiểm tra sau khi sửa

- Kiểm tra các đường dẫn tương đối đến CSS, JavaScript, dữ liệu và tài nguyên.
- Với thay đổi giao diện hoặc hành vi, kiểm tra thủ công trang và luồng liên quan nếu môi trường hỗ trợ.
- Nếu không thể chạy hoặc kiểm tra, nêu rõ phần nào chưa được xác minh.
- Không tuyên bố đã kiểm tra những gì chưa thực sự chạy.

## 6. Tài liệu

Khi cấu trúc thư mục, tính năng hoặc cách chạy dự án thay đổi, cập nhật `README.md` để phản ánh trạng thái hiện tại.
