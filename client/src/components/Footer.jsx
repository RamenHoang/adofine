import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

const Footer = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        FOOTER_CONTACT_TITLE: '',
        FOOTER_ADDRESS: '',
        FOOTER_PHONE: '',
        FOOTER_EMAIL: '',
        FOOTER_ABOUT_TITLE: '',
        FOOTER_ABOUT_TEXT: '',
        SOCIAL_FB: '',
        SOCIAL_TW: '',
        SOCIAL_IG: '',
        FOOTER_COPYRIGHT: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-title">{settings.FOOTER_CONTACT_TITLE || t('footer.contact').toUpperCase()}</h3>
                        <p>{settings.FOOTER_ADDRESS || t('footer.address')}</p>
                        <p>{settings.FOOTER_PHONE || t('footer.phone')}</p>
                        <p>{settings.FOOTER_EMAIL || t('footer.email')}</p>
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
                        <h3 className="footer-title">{settings.FOOTER_ABOUT_TITLE || t('footer.followUs').toUpperCase()}</h3>
                        <p>{settings.FOOTER_ABOUT_TEXT || t('footer.aboutText')}</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Email" />
                            <Link to="/contact" className="btn btn-primary">{t('common.contactUs').toUpperCase()}</Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{settings.FOOTER_COPYRIGHT || t('footer.copyright')}</p>
                    <div className="social-links">
                        {settings.SOCIAL_FB && <a href={settings.SOCIAL_FB} target="_blank" rel="noopener noreferrer">FB</a>}
                        {settings.SOCIAL_TW && <a href={settings.SOCIAL_TW} target="_blank" rel="noopener noreferrer">TW</a>}
                        {settings.SOCIAL_IG && <a href={settings.SOCIAL_IG} target="_blank" rel="noopener noreferrer">IG</a>}
                        {!settings.SOCIAL_FB && !settings.SOCIAL_TW && !settings.SOCIAL_IG && (
                            <>
                                <a href="#">FB</a>
                                <a href="#">TW</a>
                                <a href="#">IG</a>
                            </>
                        )}
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
        .social-links a {
            color: inherit;
            text-decoration: none;
        }
        .social-links a:hover {
            color: #d31e44;
        }
      `}</style>
        </footer>
    );
};

export default Footer;
