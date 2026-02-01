import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const PortfolioGrid = ({
  items = [],
  filters = [],
  activeFilter = 'TẤT CẢ',
  onFilterChange,
  sectionTitle = '',
  sectionSubtitle = '',
  sectionBg = 'https://placehold.co/1920x1080/111/FFF?text=BG',
  categoryLabel = 'PORTFOLIO',
  linkBasePath = '/portfolio',
  numColumns = 4
}) => {
  
  // Distribute items into columns vertically
  const distributeIntoColumns = (items, numColumns) => {
    const columns = Array.from({ length: numColumns }, () => []);
    items.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });
    return columns;
  };

  const columnsToDisplay = distributeIntoColumns(items, numColumns);
  const columnWidth = (100 / numColumns).toFixed(2);

  return (
    <section className="portfolio-section">
      <div className="container text-center">
        
        {/* Header */}
        <h2 className="section-title">{sectionTitle}</h2>
        <p className="section-subtitle">{sectionSubtitle}</p>

        {/* Filters */}
        <div className="filters">
          {filters.map(filter => (
            <Button
              key={filter}
              variant="default"
              size="small"
              active={activeFilter === filter}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid">
          {columnsToDisplay.map((column, colIndex) => (
            <div key={colIndex} className="column" style={{ maxWidth: `${columnWidth}%` }}>
              {column.map(item => (
                <div key={item.id} className="grid-item">
                  <div className="frame">
                    <img src={item.image} alt={item.title} />
                    <div className="overlay">
                      <div className="icons">
                        <Link to={`${linkBasePath}/${item.id}`} className="icon-btn">🔗</Link>
                        {/* <a href="#" className="icon-btn">🔍</a> */}
                      </div>
                      <div className="details">
                        <h3>{categoryLabel}</h3>
                        <div className="meta">
                          <span>{item.title}, {item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
      <style>{`
        .portfolio-section {
          padding: 80px 0;
          background-image: url('${sectionBg}');
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          position: relative;
          color: #fff;
        }
        .portfolio-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          pointer-events: none;
        }
        .container {
          position: relative;
          z-index: 1;
        }
        .text-center { 
          text-align: center; 
        }
        
        .filters {
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .btn {
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 6px;
          color: #fff;
          padding: 10px 25px;
          text-transform: uppercase;
          font-size: 0.85rem;
          cursor: pointer;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        .btn:hover {
          border-color: #d31e44;
        }
        .btn.active {
          background: #d31e44;
          border-color: #d31e44;
        }
        .btn.active:hover {
          opacity: 0.9;
        }

        .grid {
          display: flex;
          gap: 30px;
          justify-content: center;
        }
        .column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 30px;
          justify-content: center;
        }
        .grid-item {
          width: 100%;
        }
        .frame {
          padding: 10px;
          background: #fff;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .frame img {
          width: 100%;
          height: auto;
          display: block;
        }
        .frame:hover .overlay {
          opacity: 1;
        }
        .overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          background: rgba(211, 30, 68, 0.85);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
        }
        .icons {
          display: flex;
          gap: 15px;
        }
        .icon-btn {
          width: 40px;
          height: 40px;
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.2rem;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .icon-btn:hover {
          background: #fff;
          color: var(--primary-color);
          transform: scale(1.1);
        }
        .details {
          text-align: right;
          border-right: 2px solid #fff;
          padding-right: 15px;
          color: #fff;
        }
        .details h3 {
          font-size: 1.5rem;
          margin-bottom: 5px;
          font-weight: 300;
          letter-spacing: 1px;
        }
        .meta {
          font-size: 0.9rem;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .grid {
            gap: 20px;
          }
          .column {
            max-width: 50%;
          }
        }
        @media (max-width: 768px) {
          .column {
            max-width: 100%;
          }
          .grid {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
};

export default PortfolioGrid;
