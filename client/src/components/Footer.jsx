import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-title">{t('footer.contact').toUpperCase()}</h3>
                        <p>{t('footer.address')}</p>
                        <p>{t('footer.phone')}</p>
                        <p>{t('footer.email')}</p>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-title">{t('blog.title').toUpperCase()}</h3>
                        <ul className="footer-links">
                            <li><a href="#">{t('blog.title')}</a></li>
                            <li><a href="#">{t('blog.title')}</a></li>
                            <li><a href="#">{t('blog.title')}</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-title">{t('footer.followUs').toUpperCase()}</h3>
                        <p>{t('footer.aboutText')}</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Email" />
                            <button className="btn btn-primary">{t('common.contactUs').toUpperCase()}</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{t('footer.copyright')}</p>
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
