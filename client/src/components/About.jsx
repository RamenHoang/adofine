import React from 'react';

const About = () => {
    return (
        <section className="about-section" id="about">
            <div className="container d-flex align-center">
                <div className="about-image">
                    <img src="https://placehold.co/400x500/222/FFF?text=Artist+John" alt="Artist" />
                </div>
                <div className="about-content">
                    <h2 className="section-title" style={{ textAlign: 'left' }}>VỀ CHÚNG TÔI</h2>
                    <p className="section-subtitle" style={{ textAlign: 'left' }}>Nghệ nhân Kim hoàn & Thiết kế Đá quý</p>
                    <p className="about-text">
                        Chúng tôi chuyên cung cấp các loại đá quý tự nhiên và trang sức cao cấp. Mỗi tác phẩm là sự kết hợp tinh tế giữa vẻ đẹp thiên nhiên và bàn tay tài hoa của nghệ nhân.
                    </p>
                    <p className="about-text">
                        Cam kết chất lượng chuẩn quốc tế, kiểm định uy tín. Mang đến cho khách hàng sự an tâm và hài lòng tuyệt đối.
                    </p>
                    <button className="btn btn-primary">XEM THÊM</button>
                </div>
            </div>
            <style jsx>{`
        .about-section {
            padding: 100px 0;
            background: #111;
            color: #fff;
        }
        .container {
            gap: 60px;
        }
        .about-image {
            flex: 1;
        }
        .about-image img {
            width: 100%;
            height: auto;
            box-shadow: -20px 20px 0 rgba(255,255,255,0.05);
        }
        .about-content {
            flex: 1;
        }
        .about-text {
            color: #ccc;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
             .section-title, .section-subtitle {
                text-align: center !important;
            }
        }
      `}</style>
        </section>
    );
};

export default About;
