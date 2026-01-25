import React from 'react';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-title">LIÊN HỆ</h3>
                        <p>123 Phố Đá Quý, Quận 1, TP.HCM</p>
                        <p>Điện thoại: +084 123 456 789</p>
                        <p>Email: contact@gemstone.com</p>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-title">BÀI VIẾT MỚI</h3>
                        <ul className="footer-links">
                            <li><a href="#">Cách chọn Ruby tự nhiên</a></li>
                            <li><a href="#">Bảo quản trang sức bền đẹp</a></li>
                            <li><a href="#">Xu hướng trang sức 2025</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-title">ĐĂNG KÝ NHẬN TIN</h3>
                        <p>Đăng ký để nhận ưu đãi mới nhất.</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Nhập email của bạn" />
                            <button className="btn btn-primary">ĐĂNG KÝ</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Red ART. All Rights Reserved.</p>
                    <div className="social-links">
                        <a href="#">FB</a>
                        <a href="#">TW</a>
                        <a href="#">IG</a>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .footer {
            background: #080808;
            color: #888;
            padding: 80px 0 20px;
            font-size: 0.9rem;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-bottom: 60px;
        }
        .footer-title {
            color: #fff;
            margin-bottom: 20px;
            font-size: 1.1rem;
        }
        .footer-links {
            list-style: none;
            padding: 0;
        }
        .footer-links li {
            margin-bottom: 10px;
        }
        .newsletter-form {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .newsletter-form input {
            background: #222;
            border: none;
            padding: 10px;
            color: #fff;
            flex: 1;
        }
        .footer-bottom {
            border-top: 1px solid #222;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .social-links {
            display: flex;
            gap: 20px;
        }
      `}</style>
        </footer>
    );
};

export default Footer;
