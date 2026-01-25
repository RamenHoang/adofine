import React from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();
    return (
        <section className="about-section" id="about">
            <div className="container d-flex align-center">
                <div className="about-image">
                    <img src="https://placehold.co/400x500/222/FFF?text=Artist+John" alt="Artist" />
                </div>
                <div className="about-content">
                    <h2 className="section-title" style={{ textAlign: 'left' }}>{t('about.title').toUpperCase()}</h2>
                    <p className="section-subtitle" style={{ textAlign: 'left' }}>{t('about.description')}</p>
                    <p className="about-text">
                        {t('about.visionText')}
                    </p>
                    <p className="about-text">
                        {t('about.missionText')}
                    </p>
                    <button className="btn btn-primary">{t('common.learnMore').toUpperCase()}</button>
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
