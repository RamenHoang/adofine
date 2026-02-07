import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import { useLoading } from '../context/LoadingContext';
import Button from './Button';

const HeroSkeleton = () => (
  <div className="hero-skeleton">
    <div className="skeleton-content">
      <div className="skeleton-line subtitle"></div>
      <div className="skeleton-line title"></div>
      <div className="skeleton-line title-2"></div>
      <div className="skeleton-line button"></div>
    </div>
    <style>{`
            .hero-skeleton {
                height: 100vh;
                background: #111;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .skeleton-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                width: 100%;
            }
            .skeleton-line {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                animation: pulse 1.5s infinite;
            }
            .subtitle { width: 300px; height: 20px; }
            .title { width: 500px; height: 80px; }
            .title-2 { width: 400px; height: 80px; }
            .button { width: 200px; height: 50px; margin-top: 30px; }

            @keyframes pulse {
                0% { opacity: 0.3; }
                50% { opacity: 0.6; }
                100% { opacity: 0.3; }
            }
        `}</style>
  </div>
);

const Hero = () => {
  const { t } = useTranslation();
  const { showLoading, hideLoading } = useLoading();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSettings, setHeroSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setHeroSettings(data);

          // Inject Google Fonts
          const fontConfigs = [
            { key: 'HERO_TITLE_FONT_SOURCE', urlKey: 'HERO_TITLE_GOOGLE_FONT_URL', id: 'hero-title-font' },
            { key: 'HERO_SUBTITLE_FONT_SOURCE', urlKey: 'HERO_SUBTITLE_GOOGLE_FONT_URL', id: 'hero-subtitle-font' },
            { key: 'HERO_BUTTON_FONT_SOURCE', urlKey: 'HERO_BUTTON_GOOGLE_FONT_URL', id: 'hero-button-font' }
          ];

          fontConfigs.forEach(config => {
            if (data[config.key] === 'google' && data[config.urlKey]) {
              if (!document.getElementById(config.id)) {
                const link = document.createElement('link');
                link.id = config.id;
                link.rel = 'stylesheet';
                link.href = data[config.urlKey];
                document.head.appendChild(link);
              }
            }
          });

          // Inject Custom Fonts
          const customFontConfigs = [
            { key: 'HERO_TITLE_FONT_SOURCE', urlKey: 'HERO_TITLE_CUSTOM_FONT_URL', nameKey: 'HERO_TITLE_FONT', id: 'hero-title-custom-font' },
            { key: 'HERO_SUBTITLE_FONT_SOURCE', urlKey: 'HERO_SUBTITLE_CUSTOM_FONT_URL', nameKey: 'HERO_SUBTITLE_FONT', id: 'hero-subtitle-custom-font' },
            { key: 'HERO_BUTTON_FONT_SOURCE', urlKey: 'HERO_BUTTON_CUSTOM_FONT_URL', nameKey: 'HERO_BUTTON_FONT', id: 'hero-button-custom-font' }
          ];

          customFontConfigs.forEach(config => {
            if (data[config.key] === 'custom' && data[config.urlKey]) {
              if (!document.getElementById(config.id)) {
                const style = document.createElement('style');
                style.id = config.id;
                style.textContent = `
                      @font-face {
                          font-family: '${data[config.nameKey]}';
                          src: url('${data[config.urlKey]}');
                      }
                  `;
                document.head.appendChild(style);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      showLoading();
      try {
        const [res] = await Promise.all([
          fetch(`${API_URL}/api/hero-slides`),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSlides(data);
          }
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        hideLoading();
      }
    };
    fetchSlides();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Default Fallback content if no slides
  const defaultSlide = {
    image_url: 'https://placehold.co/1920x1080/222/FFF?text=Hero+Image',
    title: t('hero.subtitle'),
    subtitle: t('hero.welcome'),
    link: ''
  };

  const activeSlide = slides.length > 0 ? slides[currentSlide] : defaultSlide;

  // Helper to render title with Split style
  const renderTitle = (title) => {
    if (!title) return null;
    if (title.includes('&')) {
      const parts = title.split('&');
      return (
        <>
          <span className="outline">{parts[0].trim()}</span> & <br />
          <span className="filled">{parts[1].trim()}</span>
        </>
      );
    }
    return <span className="filled">{title}</span>;
  };



  return (
    <div className="hero" id="home">
      <div className="hero-content">
        <p className="hero-intro fade-in-up">
          {activeSlide.subtitle}
        </p>

        <h1 className="hero-title fade-in-up" key={currentSlide}>
          {renderTitle(activeSlide.title)}
        </h1>

        {activeSlide.link && (
          <div style={{ marginTop: 30 }} className="fade-in-up">
            <Button
              as="link"
              to={activeSlide.link}
              variant="default"
              size="large"
            >
              KHÁM PHÁ NGAY
            </Button>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button className="nav-arrow left" onClick={prevSlide}>&lt;</button>
          <button className="nav-arrow right" onClick={nextSlide}>&gt;</button>

          <div className="hero-dots">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              ></span>
            ))}
          </div>
        </>
      )}

      <style>{`
        .hero {
          height: 100vh;
          background: url('${activeSlide.image_url}') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #fff;
          text-align: center;
          transition: background-image 1s ease-in-out;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
        }
        .hero-content {
          position: relative;
          z-index: 1;
        }
        .hero-intro {
          color: #888;
          font-size: 1rem;
          letter-spacing: 2px;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .text-white { color: #fff; }
        .hero-title {
          font-size: 5rem;
          line-height: 1.1;
          font-weight: 100;
        }
        .hero-title .outline {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.5);
        }
        .hero-title .filled {
          font-weight: bold;
          text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
          color: #fff;
        }

        /* Dynamic Font Application */
        .hero-title {
            font-family: ${heroSettings.HERO_TITLE_FONT ? `"${heroSettings.HERO_TITLE_FONT}", sans-serif` : 'inherit'};
        }
        .hero-intro {
            font-family: ${heroSettings.HERO_SUBTITLE_FONT ? `"${heroSettings.HERO_SUBTITLE_FONT}", sans-serif` : 'inherit'};
        }
        .btn-hero {
            font-family: ${heroSettings.HERO_BUTTON_FONT ? `"${heroSettings.HERO_BUTTON_FONT}", sans-serif` : 'inherit'};
        }

        .btn-hero {
            display: inline-block;
            padding: 12px 30px;
            border: 1px solid #fff;
            color: #fff;
            text-decoration: none;
            letter-spacing: 2px;
            font-size: 0.9rem;
            transition: all 0.3s;
            text-transform: uppercase;
        }
        .btn-hero:hover {
            background: #fff;
            color: #000;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          z-index: 2;
          transition: background 0.3s;
        }
        .nav-arrow:hover { background: #d31e44; }
        .nav-arrow.left { left: 30px; }
        .nav-arrow.right { right: 30px; }

        .hero-dots {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 2;
        }
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            cursor: pointer;
        }
        .dot.active {
            background: #fff;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
            animation: fadeInUp 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Hero;
