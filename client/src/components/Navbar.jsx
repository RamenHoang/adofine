import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [logoSettings, setLogoSettings] = useState({
    LOGO_IMAGE: '',
    LOGO_TEXT_PREFIX: 'red',
    LOGO_TEXT_SUFFIX: 'ART',
    LOGO_SUBTITLE: 'TRANG SỨC ĐÁ QUÝ'
  });
  const [collections, setCollections] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pages/public`);
        if (res.ok) {
          const data = await res.json();
          setPages(data);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };
    fetchPages();
  }, []);

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

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(`${API_URL}/api/collections`);
        if (res.ok) {
          const data = await res.json();
          setCollections(data.filter(c => c.is_visible));
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
    fetchCollections();
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
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('nav.home').toUpperCase()}</Link></li>
          {/* <li><a href="#pages">TRANG</a></li> */}
          <li className="dropdown">
            <Link to="#" className={location.pathname.startsWith('/pages') ? 'active' : ''}>PAGES</Link>
            {pages.length > 0 && (
              <ul className="dropdown-menu">
                {pages.map(page => (
                  <li key={page.id}>
                    <Link to={`/pages/${page.slug}`}>{page.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="dropdown">
            <Link to="/collections" className={location.pathname.startsWith('/collections') ? 'active' : ''}>{t('nav.collections').toUpperCase()}</Link>
            {collections.length > 0 && (
              <ul className="dropdown-menu">
                {collections.map(collection => (
                  <li key={collection.id}>
                    <Link to={`/collections/${collection.id}`}>{collection.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* <li><a href="#gallery">CÁC LOẠI ĐÁ</a></li> */}
          <li><Link to="/news" className={location.pathname.startsWith('/news') ? 'active' : ''}>{t('nav.news').toUpperCase()}</Link></li>
          {/* <li><a href="#contact">LIÊN HỆ</a></li> */}
          {/* <li><a href="#shop">CỬA HÀNG</a></li> */}
          {/* <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''} style={{ color: location.pathname.startsWith('/admin') ? '#d31e44' : 'inherit' }}>ADMIN</Link></li> */}
        </ul>
      </div>
      <style jsx>{`
        .navbar {
          padding: 30px 0;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          // background: rgba(0,0,0,0.8);
          // backdrop-filter: blur(5px);
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
          font-weight: bold;
        }
        .nav-links > li > a {
          padding: 10px 0;
          display: inline-block;
        }
        .nav-links a.active {
          color: var(--primary-color);
        }
        .dropdown {
          position: relative;
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          min-width: 200px;
          padding: 15px 0;
          margin-top: 0;
          border-radius: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          list-style: none;
          z-index: 1001;
        }
        .dropdown:hover .dropdown-menu {
          display: block;
        }
        .dropdown-menu li {
          padding: 0;
        }
        .dropdown-menu a {
          display: block;
          padding: 10px 20px;
          color: #333;
          text-decoration: none;
          // font-size: 0.75rem;
          // font-weight: 500;
          transition: all 0.3s ease;
          text-transform: none;
        }
        .dropdown-menu a:hover {
          // background: rgba(211, 30, 68, 0.1);
          color: var(--primary-color);
          // padding-left: 25px;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
