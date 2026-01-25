import React from 'react';

const Section = ({ title, subtitle, description, buttonText, image, reverse, dark }) => {
    return (
        <section className={`section ${dark ? 'dark' : ''}`}>
            <div className={`container d-flex align-center ${reverse ? 'reverse' : ''}`}>
                <div className="section-content">
                    <h2 className="section-title">{title}</h2>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                    {description && <p className="section-desc">{description}</p>}
                    {buttonText && <button className="btn btn-primary">{buttonText}</button>}
                </div>
                <div className="section-image">
                    {/* Placeholder if no image provided */}
                    {image ? <img src={image} alt={title} /> : <div className="img-placeholder"></div>}
                </div>
            </div>
            <style jsx>{`
        .section {
          padding: 80px 0;
          background: #000;
          color: #fff;
        }
        .container {
          gap: 50px;
        }
        .reverse {
          flex-direction: row-reverse;
        }
        .section-content {
          flex: 1;
          text-align: left;
        }
        .section-image {
          flex: 1;
        }
        .section-desc {
          margin-bottom: 2rem;
          line-height: 1.6;
          color: #ccc;
        }
        .img-placeholder {
          width: 100%;
          height: 300px;
          background: #222;
        }
        img {
          width: 100%;
          height: auto;
          display: block;
        }
        @media (max-width: 768px) {
          .container {
            flex-direction: column !important;
          }
           .section-content {
            text-align: center;
          }
        }
      `}</style>
        </section>
    );
};

export default Section;
