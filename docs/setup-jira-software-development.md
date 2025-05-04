# Setup jira software development
## Định nghĩa Issue Types và Workflow

### 1. Issue Types
- **Epic**: Tập hợp các feature lớn.  
- **Story/Task**: Chức năng cụ thể.  
- **Bug**: Sửa lỗi.  
- **Sub-task**: Phân nhỏ công việc.  
- **Custom Fields**: Ví dụ như Client Approval, QA Checklist.

### 2. Tùy biến Workflow
- Thiết kế Workflow (Dev → Code Review → QA → UAT → Done) bằng Workflow Designer để phản ánh đúng quy trình nội bộ và đảm bảo traceability.

### 3. Scrum Board
- Dùng để chạy Sprint (thường 1–2 tuần), bao gồm các hoạt động: Backlog Grooming, Sprint Planning, Daily Stand-up, Sprint Review & Retrospective.

### 4. Báo cáo và Dashboard
- Cấu hình Dashboards với các gadget như Burndown Chart, Velocity Chart, Cumulative Flow Diagram để PM, Account Manager và khách hàng theo dõi tiến độ real-time.

### 5. Tích hợp với Confluence, Git và CI/CD
- **Jira ↔ Confluence**: Quản lý tài liệu yêu cầu, thiết kế.  
- **Jira ↔ Bitbucket/GitHub**: Tự động chuyển trạng thái issue khi merge code.  
- **Jira ↔ Jenkins/GitLab CI**: Trigger build, deploy và cập nhật ticket status.

### 6. Jira Automation & Ticket Templates
- Thiết lập Automation Rules (ví dụ: khi chuyển sang “Done” → tự động thông báo Slack cho khách).

### 7. Quản lý Quyền và SLA
- **Permission Scheme**: Định nghĩa quyền cho team nội bộ (Developer, QA, PM) và client (Viewer, Commenter).  
- **SLA**: Cấu hình SLA (ví dụ: Time to First Response, Time to Resolution) trong Jira Service Management để đảm bảo chất lượng dịch vụ.

---

## Epic, Story, Task Relationship

### 1. Epic – Dự án/Chức năng lớn
- **Định nghĩa**: Tập hợp nhiều User Stories liên quan, mô tả một tính năng lớn hoặc mục tiêu kinh doanh quan trọng.  
- **Khi nào dùng**: Khi công việc quá lớn để hoàn thành trong một Sprint và cần chia nhỏ thành nhiều phần nhỏ hơn (Stories).  
- **Ví dụ**:  
  - **Epic**: Xây dựng hệ thống đăng nhập  
    - **Story 1**: Đăng nhập bằng email/mật khẩu  
    - **Story 2**: Đăng nhập bằng Google  
    - **Story 3**: Reset mật khẩu  

### 2. Story (User Story) – Tính năng nhỏ có thể bàn giao
- **Định nghĩa**: Mô tả một yêu cầu hoặc chức năng cụ thể mà người dùng cần, thường được viết dưới dạng:  
  👉 “Là [loại người dùng], tôi muốn [mục tiêu] để [lợi ích]”.  
- **Đặc điểm**:  
  - Có thể hoàn thành trong 1 Sprint.  
  - Mang lại giá trị cụ thể cho người dùng.  
- **Ví dụ**:  
  “Là người dùng, tôi muốn đăng nhập bằng Google để không cần nhớ mật khẩu.”

### 3. Task – Công việc kỹ thuật cụ thể
- **Định nghĩa**: Công việc kỹ thuật cụ thể để thực hiện một phần của Story hoặc công việc không gắn trực tiếp với người dùng (ví dụ: cấu hình server, viết test, tạo tài liệu).  
- **Thường dùng để**:  
  - Chia nhỏ Story cho nhiều người cùng làm.  
  - Giao việc kỹ thuật nội bộ (DevOps, QA...).  
- **Ví dụ**:  
  - **Task 1**: Thiết kế giao diện đăng nhập  
  - **Task 2**: Tạo API xác thực người dùng  
  - **Task 3**: Viết unit test cho API  

---

## Tech Lead Responsibilities

### 1. Phân tích và phân rã task (Task Breakdown)
- **Hiểu rõ yêu cầu**: Đọc kỹ mô tả task, acceptance criteria và mẫu input/output do PM cung cấp.  
- **Xác định phụ thuộc**: Kiểm tra task có phụ thuộc API, database, third-party service hay không.  
- **Phân rã thành subtasks**: Chia nhỏ task thành các bước kỹ thuật (thiết kế schema, API endpoint, UI component, migrations, v.v.).  
- **Ước tính**: Đưa ra story points hoặc giờ thực hiện cho từng subtask dựa trên độ phức tạp.

✅ Các đầu việc cần chuẩn bị (tốn thời gian):
Đầu việc	Ước lượng thời gian
Viết mô tả Jira rõ ràng, có mục tiêu và AC	10–20 phút
Tạo sơ đồ (luồng xử lý, UI mock, DB)	10–30 phút
Soạn input/output mẫu	5–10 phút
Kiểm tra phụ thuộc kỹ thuật, thảo luận với BA nếu cần	10–30 phút

🎯 Lưu ý:
Bạn không cần làm tất cả từ đầu mỗi lần: Có thể tái sử dụng template, sơ đồ cũ hoặc viết guideline mẫu.

Ưu tiên clarity hơn độ dài: Mô tả ngắn nhưng rõ thì tốt hơn dài mà rối.

Task càng phức tạp → chuẩn bị càng kỹ, vì càng giúp tiết kiệm thời gian về sau (ít bị hỏi lại, ít bug).

### 2. Định hướng kiến trúc và thiết kế (Architecture & Design)
- **Chốt giải pháp tổng thể**: Chọn framework, pattern (MVC, Hexagonal, Microservices), thư viện, và công nghệ phù hợp.  
- **Thiết kế API và contract**: Soạn OpenAPI spec/GraphQL schema, xác định request/response structure.  
- **Quy chuẩn coding**: Thiết lập guideline (naming conventions, error handling, logging) và đảm bảo nhất quán với các module khác.  
- **Xem xét scalability & security**: Đánh giá performance, caching, authentication/authorization, rate-limit.

### 3. Thực thi và kiểm soát chất lượng (Implementation & QA)
- **Phân công & hỗ trợ dev**: Gán subtask cho các thành viên, hỗ trợ pair-programming khi cần.  
- **Code review**: Đặt tiêu chuẩn review (coverage, complexity, security), phản hồi nhanh và mang tính xây dựng.  
- **Viết và kiểm tra test**: Đảm bảo có unit tests, integration tests, và e2e tests nếu cần.  
- **Triển khai CI/CD**: Kiểm tra pipeline, đảm bảo lint, build, test tự động trước khi merge.

### 4. Hướng dẫn, mentoring và chia sẻ kiến thức (Mentoring & Knowledge Sharing)
- **Giải đáp kỹ thuật**: Luôn sẵn sàng hỗ trợ giải quyết blockers và trả lời câu hỏi kiến trúc.  
- **Mentor & pair-programming**: Hỗ trợ junior qua pair-programming, code labs, workshop nội bộ.  
- **Tổ chức tech-share**: Chia sẻ best-practices, lessons learned và hướng dẫn sử dụng các công cụ mới.

### 5. Phối hợp với PM và các bên liên quan (Coordination & Communication)
- **Cập nhật tiến độ**: Báo cáo status, vấn đề phát sinh và điều chỉnh kế hoạch khi cần.  
- **Giải trình kỹ thuật**: Giải thích trade-offs, rủi ro, và chi phí kỹ thuật cho PM/khách hàng.  
- **Quản lý thay đổi**: Đánh giá impact khi scope thay đổi và đưa ra estimate lại.

### 6. Cải tiến quy trình và tự động hóa (Process Improvement & Automation)
- **Xây dựng template & automation**: Tạo Jira ticket template, script deploy tự động, checks.  
- **Refactor & technical debt**: Lên backlog cho công việc refactor, cleanup codebase.  
- **Rà soát quy trình**: Đề xuất cải tiến workflow (Dev → Review → QA → Release) dựa trên retrospectives.

---

## Tech Lead Handover Meeting

### 1. Chuẩn bị trước khi bàn giao
- **Rà soát mô tả task**: Kiểm tra lại “Mục đích”, “Acceptance Criteria”, “Input/Output mẫu” để chắc không thiếu thông tin.  
- **Xác định phụ thuộc**: Liệt kê rõ những service, API, database, thư viện hoặc credentials cần dùng.  
- **Soạn thêm tài liệu phụ trợ**: Diagram luồng dữ liệu, sơ đồ component, mẫu payload JSON, link spec API (OpenAPI/Swagger).

### 2. Cuộc họp bàn giao (Handover Meeting)
- **Giới thiệu mục tiêu chung**: Nhấn mạnh “Vì sao task này quan trọng” và “kết quả cuối cùng mong muốn”.  
- **Review từng acceptance criterion**: Cùng đọc và làm rõ từng điều kiện để tránh hiểu sai.  
- **Đi qua flow end-to-end**: Minh họa luồng xử lý: từ request vào → xử lý logic → trả về response.  
- **Phân rã sub-tasks (nếu cần)**: Chia thành 2–3 sub-task và assign rõ ràng.  
- **Q&A trực tiếp**: Khuyến khích dev đặt câu hỏi ngay, ghi chú lại mọi thắc mắc.

### 3. Cung cấp hỗ trợ trong quá trình thực thi
- **Lập kênh liên lạc nhanh**: Slack/Teams, tag trực tiếp khi gặp block.  
- **Pair-programming hoặc code review sớm**: Dành 30–60 phút pair-programming ở giai đoạn đầu; review stub code ngay khi có branch đầu tiên.  
- **Monitoring & Checkpoint**: Thiết lập checkpoint (daily stand-up, end-of-day update) để nắm tình hình và hỗ trợ kịp thời.

### 4. Theo dõi và đảm bảo chất lượng
- **Review code thường xuyên**: Chú trọng guideline naming, error handling, logging, test coverage.  
- **Test chung**: Chạy hand-off demo khi dev hoàn thành; đối chiếu với acceptance criteria.  
- **Feedback nhanh**: Ghi nhận những chỗ cần cải thiện, khen ngợi đúng lúc khi làm tốt.

### 5. Các nguyên tắc giao tiếp hiệu quả
- **Minh bạch**: Không để developer đoán ý; mọi yêu cầu đều rõ ràng, có ví dụ.  
- **Kịp thời**: Giải đáp thắc mắc trong ngày, tránh dev bị block lâu.  
- **Trách nhiệm**: Tech Lead chịu trách nhiệm về giải pháp, nhưng khuyến khích dev tự chủ trong thực thi.  
- **Tôn trọng & hỗ trợ**: Lắng nghe ý kiến, sẵn sàng điều chỉnh spec nếu cần.

