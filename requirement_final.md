6.1. Chức năng tại Publisher (Trung tâm)

Publisher đóng vai trò quản lý tập trung, tiếp nhận dữ liệu từ các node và cung cấp thông tin tổng hợp toàn hệ thống.

6.1.1. Quản lý danh mục chi nhánh

- Mô tả:
  Publisher cho phép quản trị viên tạo mới, cập nhật và quản lý danh sách chi nhánh.
- Luồng hoạt động:

* Quản trị viên nhập thông tin chi nhánh.

* Hệ thống kiểm tra mã chi nhánh có bị trùng hay không.

* Nếu hợp lệ, hệ thống lưu dữ liệu vào cơ sở dữ liệu trung tâm.

* Sau khi lưu thành công, dữ liệu chi nhánh được đánh dấu để đồng bộ xuống các node.

* Các node nhận dữ liệu và cập nhật danh sách chi nhánh cục bộ.

  6.1.2. Quản lý danh mục chức vụ

- Mô tả:
  Quản lý danh sách chức vụ dùng chung toàn hệ thống, phục vụ cho việc gán chức vụ và tính lương.
- Luồng hoạt động:

* Quản trị viên nhập thông tin chức vụ (tên, hệ số lương).

* Hệ thống kiểm tra dữ liệu hợp lệ.

* Lưu vào cơ sở dữ liệu trung tâm.

* Đánh dấu dữ liệu cần đồng bộ.

* Đồng bộ xuống các node để sử dụng thống nhất.

  6.1.3. Quản lý loại hợp đồng

- Mô tả:
  Quản lý các loại hợp đồng lao động áp dụng trong toàn doanh nghiệp.
- Luồng hoạt động:

* Nhập thông tin loại hợp đồng.

* Kiểm tra dữ liệu.

* Lưu vào hệ thống.

* Đồng bộ xuống các node để sử dụng khi tạo hợp đồng.

  6.1.4. Quản lý tài khoản và phân quyền

- Mô tả:
  Tạo và quản lý tài khoản người dùng, phân quyền truy cập theo vai trò và chi nhánh.
- Luồng hoạt động:

* Quản trị viên tạo tài khoản và gán role.

* Hệ thống lưu thông tin tài khoản.

* Khi người dùng đăng nhập:

- Hệ thống xác thực thông tin
- Kiểm tra role và chi nhánh

* Hệ thống chỉ cho phép truy cập các chức năng phù hợp với quyền hạn.

  6.1.5. Tiếp nhận dữ liệu từ node

- Mô tả:
  Publisher nhận dữ liệu thay đổi từ các node để cập nhật dữ liệu toàn hệ thống.
- Luồng hoạt động:

* Node gửi dữ liệu thay đổi lên Publisher.

* Publisher nhận dữ liệu.

* Kiểm tra dữ liệu đã tồn tại hay chưa.

* Nếu chưa có → thêm mới.

* Nếu đã có → cập nhật.

* Ghi nhận thời gian đồng bộ.

  6.1.6. Tra cứu dữ liệu toàn công ty

- Mô tả:
  Cho phép xem thông tin nhân sự toàn hệ thống.
- Luồng hoạt động:

Người dùng nhập điều kiện tìm kiếm.

Hệ thống truy vấn dữ liệu đã đồng bộ.

Trả về kết quả.

6.1.7. Báo cáo tổng hợp

- Mô tả:
  Cung cấp các báo cáo tổng hợp toàn công ty.
- Luồng hoạt động:

Người dùng chọn loại báo cáo.

Hệ thống lấy dữ liệu từ database trung tâm.

Thực hiện tổng hợp (đếm, tính toán).

Hiển thị kết quả.

6.1.8. Giám sát đồng bộ

- Mô tả:
  Theo dõi trạng thái hoạt động của các node.
- Luồng hoạt động:

Hệ thống lấy thời gian đồng bộ gần nhất của từng node.

So sánh với thời gian hiện tại.

Nếu vượt ngưỡng → đánh dấu mất kết nối.

Hiển thị trạng thái cho người quản trị.

6.2. Chức năng tại Node chi nhánh

Node chịu trách nhiệm xử lý nghiệp vụ và lưu trữ dữ liệu cục bộ.

6.2.1. Quản lý nhân viên

- Mô tả:
  Quản lý toàn bộ thông tin nhân viên tại chi nhánh.
- Luồng hoạt động:

Người dùng nhập thông tin nhân viên.

Hệ thống kiểm tra dữ liệu hợp lệ.

Gán chi nhánh hiện tại.

Lưu vào cơ sở dữ liệu cục bộ.

Ghi nhận thay đổi để đồng bộ.

6.2.2. Quản lý hợp đồng

- Mô tả:
  Quản lý hợp đồng lao động của nhân viên.
- Luồng hoạt động:

Nhập thông tin hợp đồng.

Kiểm tra nhân viên tồn tại.

Lưu hợp đồng.

Ghi log đồng bộ.

6.2.3. Chấm công

- Mô tả:
  Ghi nhận thời gian làm việc của nhân viên.
- Luồng hoạt động:

Nhân viên thực hiện check-in.

Hệ thống ghi nhận giờ vào.

Nhân viên check-out.

Hệ thống ghi nhận giờ ra.

Xác định trạng thái (đi muộn, đủ giờ).

Lưu dữ liệu và ghi log đồng bộ.

6.2.4. Nghỉ phép

- Mô tả:
  Quản lý quy trình xin nghỉ phép.
- Luồng hoạt động:

Nhân viên tạo đơn nghỉ.

Hệ thống lưu trạng thái “chờ duyệt”.

Quản lý xem danh sách đơn.

Duyệt hoặc từ chối.

Cập nhật trạng thái và đồng bộ.

6.2.5. Quản lý lương

- Mô tả:
  Tính toán và quản lý lương tại chi nhánh.
- Luồng hoạt động:

Hệ thống lấy dữ liệu chấm công.

Lấy hệ số lương từ chức vụ.

Tính toán lương.

Lưu kết quả.

Đồng bộ dữ liệu.

6.2.6. Tra cứu và báo cáo cục bộ

- Mô tả:
  Cho phép tra cứu dữ liệu trong phạm vi chi nhánh.
- Luồng hoạt động:

Nhập điều kiện tìm kiếm.

Truy vấn database cục bộ.

Hiển thị kết quả.

6.3. Chức năng đồng bộ dữ liệu

6.3.1. Ghi nhận thay đổi

- Mô tả:
  Ghi lại các thay đổi dữ liệu tại node.
- Luồng hoạt động:

Khi có thao tác thêm/sửa/xóa

Hệ thống ghi thông tin vào SyncLog

6.3.2. Đồng bộ từ Node lên Publisher

- Mô tả:
  Gửi dữ liệu từ node lên hệ thống trung tâm.
- Luồng hoạt động:

Hệ thống lấy dữ liệu chưa đồng bộ.

Gửi lên Publisher.

Publisher xử lý và phản hồi.

Cập nhật trạng thái đồng bộ.

- 6.3.3. Đồng bộ từ Publisher xuống Node
- Mô tả:
  Cập nhật dữ liệu dùng chung.
- Luồng hoạt động:

Publisher gửi dữ liệu.

Node nhận dữ liệu.

Cập nhật database cục bộ.

6.3.4. Đồng bộ khi mất kết nối

- Mô tả:
  Đảm bảo hệ thống vẫn hoạt động khi offline.
- Luồng hoạt động:

Node hoạt động độc lập khi mất kết nối.

Ghi nhận thay đổi vào SyncLog.

Khi có kết nối lại → thực hiện đồng bộ.

6.3.5. Xử lý xung đột dữ liệu

- Mô tả:
  Xử lý khi dữ liệu bị cập nhật đồng thời.
- Luồng hoạt động:

Phát hiện xung đột.

So sánh thời gian cập nhật.

Chọn bản phù hợp.

Cập nhật dữ liệu cuối cùng.
