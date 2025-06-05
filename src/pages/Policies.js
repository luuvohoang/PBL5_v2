import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Policies.css';

const policyContent = {
    privacy: {
        title: "Chính Sách Bảo Mật",
        content: `<h2>THÔNG BÁO TỪ TTGShop.vn</h2>
                <p>Khi truy cập hệ thống trang web TTGShop.vn, nghĩa là quý khách đồng ý chấp nhận thực hiện những mô tả trong Quy định bảo mật.</p>

                <h3>1. Mục đích thu thập thông tin cá nhân</h3>
                <p>TTGShop.vn sử dụng thông tin thu thập từ khách hàng để:</p>
                <ul>
                    <li>Phát triển website ngày càng phong phú hơn</li>
                    <li>Cung cấp dịch vụ phù hợp với nhu cầu</li>
                    <li>Xử lý đơn hàng và giao dịch</li>
                </ul>

                <h3>2. Phạm vi sử dụng thông tin</h3>
                <ul>
                    <li>Nâng cao trải nghiệm mua sắm của khách hàng</li>
                    <li>Thực hiện chương trình khuyến mại</li>
                    <li>Xác nhận thông tin giao dịch</li>
                </ul>

                <div class="contact-section">
                    <h3>Thông Tin Liên Hệ</h3>
                    <p><strong>Công ty:</strong> TTGShop</p>
                    <p><strong>Địa chỉ:</strong> 123 ABC, Quận X, TP.HCM</p>
                    <p><strong>Email:</strong> contact@ttgshop.vn</p>
                    <p><strong>Điện thoại:</strong> 1900 xxxx</p>
                </div>`
    },
    terms: {
        title: "Điều Khoản Dịch Vụ",
        content: `<div class="policy-section">
                <h2>Điều Khoản & Điều Kiện</h2>

                <h3>1. Điều kiện sử dụng</h3>
                <p>Bằng việc truy cập và sử dụng website này, bạn đồng ý và tuân thủ các điều khoản và điều kiện sau:</p>
                <ul>
                    <li>Tuân thủ các quy định pháp luật hiện hành</li>
                    <li>Không sử dụng website cho mục đích bất hợp pháp</li>
                    <li>Không can thiệp vào hoạt động bình thường của website</li>
                </ul>

                <h3>2. Tài khoản người dùng</h3>
                <p>- Bạn phải đăng ký tài khoản với thông tin chính xác.</p>
                <p>- Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.</p>

                <h3>3. Giá cả và thanh toán</h3>
                <p>- Giá sản phẩm có thể thay đổi mà không cần báo trước.</p>
                <p>- Chúng tôi chấp nhận nhiều hình thức thanh toán khác nhau.</p>
            </div>`
    },
    warranty: {
        title: "Chính Sách Bảo Hành",
        content: `<div class="policy-section">
                <h2>Chính Sách Bảo Hành Sản Phẩm</h2>

                <h3>1. Thời gian bảo hành</h3>
                <p>- CPU, GPU: 36 tháng</p>
                <p>- Mainboard: 36 tháng</p>
                <p>- RAM: 36 tháng</p>

                <h3>2. Điều kiện bảo hành</h3>
                <ul>
                    <li>Sản phẩm còn trong thời hạn bảo hành</li>
                    <li>Tem bảo hành còn nguyên vẹn</li>
                    <li>Lỗi do nhà sản xuất</li>
                </ul>

                <h3>3. Không bảo hành</h3>
                <ul>
                    <li>Sản phẩm hết hạn bảo hành</li>
                    <li>Sản phẩm bị va đập, ngấm nước</li>
                    <li>Sản phẩm bị can thiệp phần cứng trái phép</li>
                </ul>
            </div>`
    },
    shipping: {
        title: "Chính Sách Vận Chuyển",
        content: `<div class="policy-section">
                <h2>Chính Sách Vận Chuyển</h2>

                <h3>1. Phí vận chuyển</h3>
                <p>- Nội thành: Miễn phí cho đơn hàng từ 1.000.000đ</p>
                <p>- Ngoại thành: Tính phí theo khu vực</p>

                <h3>2. Thời gian giao hàng</h3>
                <ul>
                    <li>Nội thành: 1-2 ngày</li>
                    <li>Ngoại thành: 2-4 ngày</li>
                    <li>Tỉnh thành khác: 3-7 ngày</li>
                </ul>

                <h3>3. Cam kết</h3>
                <ul>
                    <li>Đóng gói cẩn thận, an toàn</li>
                    <li>Giao hàng đúng hẹn</li>
                    <li>Cho phép kiểm tra hàng trước khi nhận</li>
                </ul>
            </div>`
    }
};

const Policies = () => {
    const { type } = useParams();
    const policy = policyContent[type] || {
        title: "Không tìm thấy chính sách",
        content: "Chính sách bạn yêu cầu không tồn tại."
    };

    return (
        <div className="policy-container">
            <h1>{policy.title}</h1>
            <div 
                className="policy-content"
                dangerouslySetInnerHTML={{ __html: policy.content }}
            />
        </div>
    );
};

export default Policies;
