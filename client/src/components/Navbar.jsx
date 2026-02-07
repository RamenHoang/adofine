import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoSettings, setLogoSettings] = useState({
    LOGO_IMAGE: '',
    LOGO_TEXT_PREFIX: 'red',
    LOGO_TEXT_SUFFIX: 'ART',
    LOGO_SUBTITLE: 'TRANG SỨC ĐÁ QUÝ'
  });
  const [collections, setCollections] = useState([]);
  const [pages, setPages] = useState([]);
  const [navbarItems, setNavbarItems] = useState([]);
  const [gemstoneCategories, setGemstoneCategories] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

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

          // Inject Google Font if configured
          if (data.NAVBAR_FONT_SOURCE === 'google' && data.NAVBAR_GOOGLE_FONT_URL) {
            // Remove existing navbar font link if any
            const existingLink = document.getElementById('navbar-google-font');
            if (existingLink) {
              existingLink.remove();
            }

            // Add new Google Font link
            const link = document.createElement('link');
            link.id = 'navbar-google-font';
            link.rel = 'stylesheet';
            link.href = data.NAVBAR_GOOGLE_FONT_URL;
            document.head.appendChild(link);
          }

          // Inject custom font if configured
          if (data.NAVBAR_FONT_SOURCE === 'custom' && data.NAVBAR_FONT && data.NAVBAR_CUSTOM_FONT_URL) {
            if (!document.getElementById('navbar-custom-font')) {
              const style = document.createElement('style');
              style.id = 'navbar-custom-font';
              style.textContent = `
                    @font-face {
                        font-family: '${data.NAVBAR_FONT}';
                        src: url('${data.NAVBAR_CUSTOM_FONT_URL}');
                    }
                `;
              document.head.appendChild(style);
            }
          }

          // Update CSS variable for navbar font
          if (data.NAVBAR_FONT) {
            document.documentElement.style.setProperty('--navbar-font', data.NAVBAR_FONT);
          }

          // Update CSS variables for font sizes
          if (data.NAV_FONT_SIZE) {
            document.documentElement.style.setProperty('--nav-font-size', data.NAV_FONT_SIZE);
          }
          if (data.FILTER_FONT_SIZE) {
            document.documentElement.style.setProperty('--filter-font-size', data.FILTER_FONT_SIZE);
          }
          if (data.HERO_TITLE_FONT_SIZE) {
            document.documentElement.style.setProperty('--hero-title-font-size', data.HERO_TITLE_FONT_SIZE);
          }
          if (data.HERO_SUBTITLE_FONT_SIZE) {
            document.documentElement.style.setProperty('--hero-intro-font-size', data.HERO_SUBTITLE_FONT_SIZE);
          }

          // --- GLOBAL FONT CONFIGURATION ---
          const fallbackStack = "'PT Sans Narrow', 'Arial Narrow', Arial, sans-serif";

          if (data.GLOBAL_FONT_SOURCE === 'custom' && data.GLOBAL_FONT && data.GLOBAL_CUSTOM_FONT_URL) {
            // Inject Global Custom Font if not already present
            if (!document.getElementById('global-custom-font')) {
              const style = document.createElement('style');
              style.id = 'global-custom-font';
              style.textContent = `
                    @font-face {
                        font-family: '${data.GLOBAL_FONT}';
                        src: url('${data.GLOBAL_CUSTOM_FONT_URL}');
                    }
                `;
              document.head.appendChild(style);
            }
            document.body.style.fontFamily = `'${data.GLOBAL_FONT}', ${fallbackStack}`;
          } else {
            // Revert to system default stack for body
            document.body.style.fontFamily = fallbackStack;
          }
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [gemRes, jewelryRes] = await Promise.all([
          fetch(`${API_URL}/api/gemstone-categories`),
          fetch(`${API_URL}/api/jewelry-categories`)
        ]);

        if (gemRes.ok) {
          const gemData = await gemRes.json();
          setGemstoneCategories(gemData);
        }

        if (jewelryRes.ok) {
          const jewelryData = await jewelryRes.json();
          setJewelryCategories(jewelryData);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNavbarItems = async () => {
      try {
        const res = await fetch(`${API_URL}/api/navbar-items`);
        if (res.ok) {
          const data = await res.json();
          setNavbarItems(data);
        }
      } catch (error) {
        console.error('Error fetching navbar items:', error);
      }
    };
    fetchNavbarItems();
  }, []);

  const renderNavItem = (item) => {
    // Handle fixed items
    if (item.type === 'fixed') {
      switch (item.identifier) {
        case 'home':
          return (
            <li key={item.id}>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
            </li>
          );
        case 'news':
          return (
            <li key={item.id}>
              <Link to="/news" className={location.pathname.startsWith('/news') ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
            </li>
          );
        case 'pages':
          return (
            <li key={item.id} className="dropdown">
              <Link to="#" className={location.pathname.startsWith('/pages') ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
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
          );
        case 'collections':
          return (
            <li key={item.id} className="dropdown">
              <Link to="#" className={location.pathname.startsWith('/collections') ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
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
          );
        case 'gemstones':
          return (
            <li key={item.id} className="dropdown">
              <Link to="/gemstones" className={location.pathname.startsWith('/gemstones') ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
              {gemstoneCategories.length > 0 && (
                <ul className="dropdown-menu">
                  {gemstoneCategories.map(cat => (
                    <li key={cat.id}>
                      <Link to={`/gemstones?filter=${encodeURIComponent(cat.name.toUpperCase())}`}>{cat.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        case 'jewelries':
          return (
            <li key={item.id} className="dropdown">
              <Link to="/jewelries" className={location.pathname.startsWith('/jewelries') ? 'active' : ''}>
                {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
                {item.label}
              </Link>
              {jewelryCategories.length > 0 && (
                <ul className="dropdown-menu">
                  {jewelryCategories.map(cat => (
                    <li key={cat.id}>
                      <Link to={`/jewelries?filter=${encodeURIComponent(cat.name.toUpperCase())}`}>{cat.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        default:
          return null;
      }
    }

    // Handle custom items
    if (item.type === 'custom') {
      const hasChildren = item.children && item.children.length > 0;
      const isExternal = item.url?.startsWith('http');
      const linkProps = item.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

      if (hasChildren) {
        return (
          <li key={item.id} className="dropdown">
            <Link to={item.url || '#'} {...linkProps}>
              {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
              {item.label}
            </Link>
            <ul className="dropdown-menu">
              {item.children.map(child => (
                <li key={child.id}>
                  {child.url?.startsWith('http') ? (
                    <a
                      href={child.url}
                      {...(child.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {child.icon && <span style={{ marginRight: '5px' }}>{child.icon}</span>}
                      {child.label}
                    </a>
                  ) : (
                    <Link
                      to={child.url || '#'}
                      {...(child.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {child.icon && <span style={{ marginRight: '5px' }}>{child.icon}</span>}
                      {child.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>
        );
      }

      // Single custom item without children
      if (isExternal) {
        return (
          <li key={item.id}>
            <a href={item.url} {...linkProps}>
              {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
              {item.label}
            </a>
          </li>
        );
      }

      return (
        <li key={item.id}>
          <Link to={item.url || '#'} {...linkProps}>
            {item.icon && <span style={{ marginRight: '5px' }}>{item.icon}</span>}
            {item.label}
          </Link>
        </li>
      );
    }

    // Handle separator
    if (item.type === 'separator') {
      return <li key={item.id} className="nav-separator"></li>;
    }

    return null;
  };

  return (
    <nav className="navbar">
      <div className="container d-flex align-center justify-between">
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
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`nav-links d-flex ${isMenuOpen ? 'show' : ''}`}>
          {navbarItems.map(item => renderNavItem(item))}
        </ul>
      </div>
      <style>{`
        .navbar {
          padding: 20px 0;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
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
          gap: 10px;
          font-weight: bold;
          font-family: var(--navbar-font, 'PT Sans Narrow', 'Arial Narrow', Arial, sans-serif);
          flex-grow: 1;
          justify-content: space-evenly;
        }
        .nav-links > li > a {
          padding: 10px 0;
          display: inline-block;
          font-size: var(--nav-font-size, 0.9rem);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .nav-links a.active {
          color: var(--primary-color);
        }
        .nav-separator {
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          height: 20px;
          margin: 0 10px;
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
        .dropdown-menu a {
          display: block;
          padding: 10px 20px;
          color: #333;
          text-decoration: none;
          transition: all 0.3s ease;
          text-transform: none;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }
        .dropdown-menu a:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--primary-color);
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
          z-index: 1001;
        }
        .hamburger {
          display: block;
          width: 25px;
          height: 2px;
          background: #fff;
          position: relative;
          transition: all 0.3s ease;
        }
        .hamburger::before,
        .hamburger::after {
          content: '';
          position: absolute;
          width: 25px;
          height: 2px;
          background: #fff;
          left: 0;
          transition: all 0.3s ease;
        }
        .hamburger::before { top: -8px; }
        .hamburger::after { top: 8px; }
        .hamburger.open { background: transparent; }
        .hamburger.open::before { transform: rotate(45deg); top: 0; }
        .hamburger.open::after { transform: rotate(-45deg); top: 0; }

        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: block;
          }
          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            height: 100vh;
            background: #000;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            transition: all 0.4s ease;
            margin: 0;
            padding: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .nav-links > li:nth-child(1) {
            padding-top: 40px;
          }
          .nav-links.show {
            right: 0;
          }
          .nav-links > li > a {
            font-size: min(var(--nav-font-size, 0.9rem), 1.5rem);
          }
          .nav-separator {
            display: none;
          }
          .dropdown-menu {
            position: static;
            display: block;
            background: none;
            box-shadow: none;
            padding: 0;
            text-align: center;
            min-width: unset;
          }
          .dropdown-menu a {
            padding: 8px 10px;
            font-size: 0.8rem;
            color: #fff;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
