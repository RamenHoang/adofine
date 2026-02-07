import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import Button from './Button';

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
        SOCIAL_THREADS: '',
        SOCIAL_IG: '',
        FOOTER_COPYRIGHT: ''
    });
    const [posts, setPosts] = useState([]);

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
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts?limit=3&offset=0`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts); // Limit to 3 latest
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
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
                            {posts.map(post => (
                                <li key={post.id}>
                                    <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-title">{settings.FOOTER_ABOUT_TITLE || t('footer.followUs').toUpperCase()}</h3>
                        <p>{settings.FOOTER_ABOUT_TEXT || t('footer.aboutText')}</p>
                        <div className="newsletter-form">
                            {/* <input type="email" placeholder="Email" /> */}
                            {/* <Link to="/contact" className="btn btn-primary">{t('common.contactUs').toUpperCase()}</Link> */}
                            <Button
                                as="link"
                                to={`/contact`}
                                variant="outline"
                                size="small"
                            >
                                {t('common.contactUs').toUpperCase()}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{settings.FOOTER_COPYRIGHT || t('footer.copyright')}</p>
                    <div className="social-links">
                        {settings.SOCIAL_FB && (
                            <a href={settings.SOCIAL_FB} target="_blank" rel="noopener noreferrer" title="Facebook">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
                            </a>
                        )}
                        {settings.SOCIAL_IG && (
                            <a href={settings.SOCIAL_IG} target="_blank" rel="noopener noreferrer" title="Instagram">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
                            </a>
                        )}
                        {settings.SOCIAL_THREADS && (
                            <a href={settings.SOCIAL_THREADS} target="_blank" rel="noopener noreferrer" title="Threads">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M14.886 12.288c0-1.872-1.206-2.502-2.52-2.502-1.224 0-2.43.594-2.43 2.52 0 1.836 1.188 2.484 2.466 2.484 1.35 0 2.484-.684 2.484-2.502zm5.796 3.096c0 5.616-5.184 7.398-8.622 7.398-6.156 0-10.458-3.366-10.458-10.458 0-6.174 3.924-10.458 10.458-10.458 2.376 0 5.166.45 7.02 1.656.702.468.576 1.566-.18 2.016-.396.234-.828.234-1.242.018-1.548-.81-3.69-1.206-5.598-1.206-5.418 0-7.866 3.492-7.866 8.046 0 4.698 2.322 8.046 7.848 8.046 2.52 0 6.642-1.224 6.642-5.454v-3.474c-.018-1.044-.216-3.87-2.934-3.87-1.152 0-2.25.486-2.844 1.44h-.108c-.702-.918-1.89-1.44-3.528-1.44-2.61 0-5.166 1.602-5.166 5.058 0 3.33 2.502 5.022 5.256 5.022 1.764 0 2.898-.63 3.654-1.638h.108v.864h.018c0 .882.414 1.764 2.466 1.764 1.602 0 2.412-.99 2.412-2.394v-3.726c0-3.366 2.232-4.158 3.528-4.158.378 0 .81.036 1.152.126.684.18.99.792.99 1.458.018.018.018.396.018.522v3.726z" />
                                </svg>
                            </a>
                        )}
                        {!settings.SOCIAL_FB && !settings.SOCIAL_THREADS && !settings.SOCIAL_IG && (
                            <>
                                <a href="#" title="Facebook"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg></a>
                                <a href="#" title="Instagram"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg></a>
                                <a href="#" title="Threads">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M14.886 12.288c0-1.872-1.206-2.502-2.52-2.502-1.224 0-2.43.594-2.43 2.52 0 1.836 1.188 2.484 2.466 2.484 1.35 0 2.484-.684 2.484-2.502zm5.796 3.096c0 5.616-5.184 7.398-8.622 7.398-6.156 0-10.458-3.366-10.458-10.458 0-6.174 3.924-10.458 10.458-10.458 2.376 0 5.166.45 7.02 1.656.702.468.576 1.566-.18 2.016-.396.234-.828.234-1.242.018-1.548-.81-3.69-1.206-5.598-1.206-5.418 0-7.866 3.492-7.866 8.046 0 4.698 2.322 8.046 7.848 8.046 2.52 0 6.642-1.224 6.642-5.454v-3.474c-.018-1.044-.216-3.87-2.934-3.87-1.152 0-2.25.486-2.844 1.44h-.108c-.702-.918-1.89-1.44-3.528-1.44-2.61 0-5.166 1.602-5.166 5.058 0 3.33 2.502 5.022 5.256 5.022 1.764 0 2.898-.63 3.654-1.638h.108v.864h.018c0 .882.414 1.764 2.466 1.764 1.602 0 2.412-.99 2.412-2.394v-3.726c0-3.366 2.232-4.158 3.528-4.158.378 0 .81.036 1.152.126.684.18.99.792.99 1.458.018.018.018.396.018.522v3.726z" />
                                    </svg>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
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
            color: #fff;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.3s;
        }
        .social-links a:hover {
            color: #d31e44;
        }

        @media (max-width: 768px) {
            .footer {
                padding: 40px 0 20px;
                text-align: center;
            }
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .footer-bottom {
                flex-direction: column;
                gap: 20px;
            }
            .newsletter-form {
                justify-content: center;
            }
            .social-links {
                justify-content: center;
            }
        }
      `}</style>
        </footer>
    );
};

export default Footer;
