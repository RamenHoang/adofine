import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

const Portfolio = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('TẤT CẢ');
    const [items, setItems] = useState([]);
    const [config, setConfig] = useState({});
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Items
                const response = await fetch(`${API_URL}/api/gemstones`);
                const data = await response.json();
                setItems(data);

                // Fetch Categories
                const categoriesRes = await fetch(`${API_URL}/api/gemstone-categories`);
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData);

                // Fetch Config
                const settingsRes = await fetch(`${API_URL}/api/settings`);
                const settingsData = await settingsRes.json();
                setConfig(settingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Helper to format price to currency string if needed, assuming API returns formatted string or number
    // API returns formatted string "50.000.000 ₫" based on earlier schema insert


    const filteredItems = filter === 'TẤT CẢ' ? items : items.filter(item => {
        // Filter by category name or gemstone_category_id
        if (item.gemstone_category_id) {
            const category = categories.find(cat => cat.id === item.gemstone_category_id);
            return category && category.name === filter;
        }
        return item.category && item.category.toUpperCase() === filter;
    });

    // Distribute items into 4 columns vertically
    const distributeIntoColumns = (items, numColumns = 4) => {
        const columns = Array.from({ length: numColumns }, () => []);
        items.forEach((item, index) => {
            const columnIndex = index % numColumns;
            columns[columnIndex].push(item);
        });
        return columns;
    };

    // Defaults
    const sectionTitle = config.GEM_SECTION_TITLE || 'CÁC LOẠI ĐÁ';
    const sectionDesc = config.GEM_SECTION_DESC || 'Khám phá vẻ đẹp vĩnh cửu của những viên đá quý thiên nhiên';
    const sectionBg = config.GEM_SECTION_BG || 'https://placehold.co/1920x1080/111/FFF?text=Parallax+BG';
    const numColumns = parseInt(config.GEM_GRID_COLUMNS) || 4; // Number of columns (default: 4)

    const columnsToDisplay = distributeIntoColumns(filteredItems, numColumns);
    const columnWidth = (100 / numColumns).toFixed(2);

    return (
        <section className="portfolio" id="gallery">
            <div className="container text-center">
                <h2 className="section-title">{sectionTitle}</h2>
                <p className="section-subtitle" style={{ whiteSpace: 'pre-line' }}>{sectionDesc}</p>

                <div className="filters">
                    <button
                        key="TẤT CẢ"
                        className={`btn ${filter === 'TẤT CẢ' ? 'active' : ''}`}
                        onClick={() => setFilter('TẤT CẢ')}
                    >
                        TẤT CẢ
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`btn ${filter === cat.name ? 'active' : ''}`}
                            onClick={() => setFilter(cat.name)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="grid">
                    {columnsToDisplay.map((column, colIndex) => (
                        <div key={colIndex} className="column" style={{ maxWidth: `${columnWidth}%` }}>
                            {column.map(item => (
                                <div key={item.id} className="grid-item">
                                    <div className="frame">
                                        <img src={item.image} alt={item.category} />
                                        <div className="overlay">
                                            <div className="icons">
                                                <Link to={`/portfolio/${item.id}`} className="icon-btn">🔗</Link>
                                                <a href="#" className="icon-btn">🔍</a>
                                            </div>
                                            <div className="details">
                                                <h3>{t('gemstones.title').toUpperCase()}</h3>
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
            <style jsx>{`
        .portfolio {
          padding: 80px 0;
          background-image: url('${sectionBg}');
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          position: relative;
        }
        .portfolio::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7); /* Dark overlay */
            pointer-events: none;
        }
        .container {
            position: relative;
            z-index: 1;
        }
        .filters {
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
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
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            background: rgba(211, 30, 68, 0.85); /* Red/Pink overlay */
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
            width: 40px; height: 40px;
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex; /* Centering emoji/icon */
            align-items: center; justify-content: center;
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

export default Portfolio;
