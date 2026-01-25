import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

const Frames = () => {
  const [activeFilter, setActiveFilter] = useState('TẤT CẢ');
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('${API_URL}/api/jewelry');
        const data = await response.json();
        setFrames(data);
      } catch (error) {
        console.error('Error fetching jewelry:', error);
      }
    };
    fetchData();
  }, []);

  const filters = ['TẤT CẢ', 'NHẪN', 'DÂY CHUYỀN', 'BÔNG TAI', 'VÒNG TAY'];

  // Mock data replaced by API fetch
  // New API returns: { id, title, image, price, description, category_name }
  // We need to map 'category_name' -> 'type' for filtering to work
  // And provide defaults for style/color which are no longer in DB

  const visibleFrames = activeFilter === 'TẤT CẢ'
    ? frames
    : frames.filter(f => (f.category_name || '').toUpperCase() === activeFilter);

  return (
    <section className="frames-section" id="frames">
      <div className="container">

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="section-title">LOẠI TRANG SỨC</h2>
          <p className="section-subtitle">Các mẫu thiết kế độc đáo và sang trọng</p>
          <div className="divider">◈</div>
        </div>

        <div className="frames-content">
          {/* Gallery area */}
          <div className="frames-gallery">
            {visibleFrames.map(frame => (
              <div key={frame.id} className="framed-item" style={{
                borderWidth: '10px',
                borderStyle: 'solid', // Default style
                borderColor: '#d31e44', // Default brand color or dynamic if needed
                backgroundColor: '#fff',
                padding: '5px'
              }}>
                <Link to={`/jewelry/${frame.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={frame.image} alt={frame.title} />
                  <div style={{ textAlign: 'center', color: '#000', padding: '5px 0', fontWeight: 'bold' }}>
                    {frame.title} <br />
                    <span style={{ fontSize: '0.8em', color: '#666' }}>{frame.price}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Filters area */}
          <div className="frames-filters">
            {filters.map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

      </div>
      <style jsx>{`
        .frames-section {
          padding: 80px 0;
          background: #000;
          color: #fff;
          overflow: hidden;
        }
        .text-center { text-align: center; }
        .mb-5 { margin-bottom: 50px; }
        
        .divider {
          color: #333;
          margin-top: 10px;
          font-size: 1.2rem;
        }

        .frames-content {
          display: flex;
          align-items: flex-start;
          gap: 50px;
        }

        .frames-gallery {
          flex: 2;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }

        .framed-item {
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          transition: transform 0.3s;
        }
        .framed-item:hover {
          transform: scale(1.02);
          z-index: 10;
        }
        .framed-item img {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .frames-filters {
          flex: 1;
          display: flex;
          flex-direction: column; /* Fallback for small screens or strict verticality */
          gap: 15px;
          align-items: flex-start;
          padding-top: 50px;
        }
        
        .frames-filters {
           display: grid;
           grid-template-columns: repeat(2, 1fr) 1fr; /* layout like the image: some rows have 2, some 1? Or just a cluster. */
           /* Actually image shows a row of buttons. Let's try to match the image layout: */
           /* Image shows filters on the RIGHT side, aligned somewhat horizontally or wrapped */
           display: flex;
           flex-direction: row;
           flex-wrap: wrap;
           align-content: center;
        }


        .filter-btn {
          background: #d31e44; /* Default pinkish red in image */
          border: none;
          color: #fff;
          padding: 10px 25px;
          font-family: inherit;
          text-transform: uppercase;
          font-size: 0.85rem;
          cursor: pointer;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        
        .filter-btn:nth-child(1) { background: #fff; color: #000; } /* ALL button is white */

        .filter-btn:hover, .filter-btn.active {
          opacity: 0.8;
        }

        @media (max-width: 900px) {
          .frames-content {
            flex-direction: column;
            align-items: center;
          }
          .frames-filters {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default Frames;
