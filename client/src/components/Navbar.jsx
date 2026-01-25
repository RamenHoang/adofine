import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const Navbar = () => {
  const [logoSettings, setLogoSettings] = useState({
    LOGO_IMAGE: '',
    LOGO_TEXT_PREFIX: 'red',
    LOGO_TEXT_SUFFIX: 'ART',
    LOGO_SUBTITLE: 'TRANG SỨC ĐÁ QUÝ'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          // Merge defaults
          setLogoSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="navbar">
      <div className="container d-flex justify-between align-center">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {logoSettings.LOGO_IMAGE ? (
              <img src={logoSettings.LOGO_IMAGE} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
            ) : (
              <span className="logo-icon">V</span>
            )}

            {!logoSettings.LOGO_IMAGE && (
              <div>
                <span className="text-primary">{logoSettings.LOGO_TEXT_PREFIX}</span>{logoSettings.LOGO_TEXT_SUFFIX}
                <div className="logo-sub">{logoSettings.LOGO_SUBTITLE}</div>
              </div>
            )}

            {/* If Image exists, maybe still show text? Usually one or the other or side-by-side. 
                Let's simplify: 
                - If Image: Show Image.
                - If No Image: Show Text as before.
                User might want Image + Text. 
                Let's stick to the current "V red ART" style which is Text based.
                If they upload an Image, it likely replaces the "V". 
                Let's do: Image replaces "V" icon. Text remains.
            */}
          </Link>
        </div>
        <ul className="nav-links d-flex">
          <li><Link to="/" className="active">TRANG CHỦ</Link></li>
          <li><a href="#pages">TRANG</a></li>
          <li><a href="/#collections">BỘ SƯU TẬP</a></li>
          <li><a href="#gallery">CÁC LOẠI ĐÁ</a></li>
          <li><Link to="/news">TIN TỨC</Link></li>
          <li><a href="#contact">LIÊN HỆ</a></li>
          <li><a href="#shop">CỬA HÀNG</a></li>
        </ul>
      </div>
      <style jsx>{`
        .navbar {
          padding: 20px 0;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px);
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
        }
        .logo-sub {
          font-size: 0.4rem;
          letter-spacing: 2px;
          margin-top: 2px;
          color: #888;
        }
        .nav-links {
          list-style: none;
          gap: 30px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .nav-links a.active {
          color: var(--primary-color);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
