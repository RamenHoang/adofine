import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const PortfolioDetail = ({ type }) => { // type: 'gemstone' or 'jewelry'
    const { id } = useParams();
    const [item, setItem] = useState(null);

    // Scroll to top
    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const endpoint = type === 'jewelry' ? `/api/jewelry-items/${id}` : `/api/gemstones/${id}`;
                const response = await fetch(`http://localhost:3000${endpoint}`);
                if (response.ok) {
                    const data = await response.json();
                    setItem(data);
                } else {
                    console.error('Item not found');
                }
            } catch (error) {
                console.error('Error fetching detail:', error);
            }
        };
        fetchDetail();
    }, [id, type]);

    if (!item) return <div className="text-white text-center py-5">Loading...</div>;

    // Handle different fields between Gemstone/Jewelry if needed
    // Gemstone: detail_client, detail_author...
    // Jewelry: composition (array of {id, name})

    // Normalize Details for Display
    const detailsList = [];
    if (type === 'gemstone') {
        if (item.price) detailsList.push({ icon: '💲', text: item.price });
        if (item.weight) detailsList.push({ icon: '⚖️', text: `Trọng lượng: ${item.weight} ct` });
        if (item.dimensions) detailsList.push({ icon: '📐', text: `Kích thước: ${item.dimensions}` });
        if (item.color) detailsList.push({ icon: '🎨', text: `Màu sắc: ${item.color}` });
        if (item.clarity) detailsList.push({ icon: '✨', text: `Độ tinh khiết: ${item.clarity}` });
        if (item.cut) detailsList.push({ icon: '💎', text: `Giác cắt: ${item.cut}` });
        if (item.origin) detailsList.push({ icon: '🌍', text: `Xuất xứ: ${item.origin}` });

        // Keep category if available
        if (item.category_name) detailsList.push({ icon: '🏷️', text: `Loại đá: ${item.category_name}` });
    } else if (type === 'jewelry') {
        // Jewelry specific details
        if (item.category_name) detailsList.push({ icon: '💍', text: `Loại: ${item.category_name}` });
        if (item.price) detailsList.push({ icon: '💲', text: item.price });
        if (item.composition && item.composition.length > 0) {
            detailsList.push({ icon: '💎', text: `Đá chủ: ${item.composition.map(c => c.name).join(', ')}` });
        }
    }

    // Gallery Images (excluding main image if needed, or just all from gallery)
    // The backend returns `gallery` array.
    const galleryImages = item.gallery || [];

    return (
        <div className="portfolio-detail">
            <div className="detail-hero">
                <img src={item.image} alt={item.title} />
            </div>

            <div className="container detail-content">
                <div className="content-left">
                    <h1 className="detail-title">{item.title}</h1>
                    <div className="detail-desc" dangerouslySetInnerHTML={{ __html: item.description }}></div>
                    {item.category_name && (
                        <div className="detail-tags"><span className="tag-icon">⛯</span> {item.category_name}</div>
                    )}
                </div>

                <div className="content-right">
                    <h2 className="details-header">THÔNG TIN CHI TIẾT</h2>
                    <ul className="details-list">
                        {detailsList.map((d, i) => (
                            <li key={i}><span className="icon">{d.icon}</span> {d.text}</li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '30px' }}>
                        <a href="tel:0912345678" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                            LIÊN HỆ TƯ VẤN NGAY
                        </a>
                    </div>
                </div>
            </div>

            {/* GALLERY SECTION */}
            {galleryImages.length > 0 && (
                <div className="container" style={{ marginBottom: '80px' }}>
                    <h2 className="section-title text-center mb-5">HÌNH ẢNH CHI TIẾT</h2>
                    <div className="gallery-grid">
                        {galleryImages.map((img, index) => (
                            <div key={index} className="gallery-item">
                                <img src={img.url} alt={`Detail ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="container" style={{ marginBottom: '50px' }}>
                <Link to="/" className="btn btn-primary">&larr; QUAY LẠI TRANG CHỦ</Link>
            </div>

            <style jsx>{`
        .portfolio-detail { background: #000; color: #888; min-height: 100vh; }
        .detail-hero { width: 100%; height: 50vh; overflow: hidden; margin-bottom: 60px; }
        .detail-hero img { width: 100%; height: 100%; object-fit: cover; }
        .detail-content { display: flex; gap: 60px; margin-bottom: 80px; }
        .content-left { flex: 2; }
        .content-right { flex: 1; }
        .detail-title { font-size: 2rem; color: #fff; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; }
        .detail-desc p { margin-bottom: 25px; line-height: 1.8; font-size: 0.95rem; }
        .detail-desc img, .detail-desc figure { max-width: 100%; height: auto; display: block; margin: 20px 0; border-radius: 4px; }
        .detail-desc figure.image { margin: 0; }
        .detail-desc blockquote { border-left: 4px solid #333; margin: 20px 0; padding-left: 15px; font-style: italic; color: #aaa; }
        .detail-tags { margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; font-weight: bold; color: #fff; }
        .details-header { color: #fff; font-size: 1.2rem; margin-bottom: 30px; text-transform: uppercase; }
        .details-list { list-style: none; padding: 0; border-top: 1px solid #222; }
        .details-list li { padding: 15px 0; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 15px; font-size: 0.9rem; }
        .details-list li .icon { width: 25px; text-align: center; }
        
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .gallery-item img {
            width: 100%;
            height: auto;
            border-radius: 4px;
            transition: transform 0.3s;
        }
        .gallery-item img:hover { transform: scale(1.02); }

        @media (max-width: 768px) {
            .detail-content { flex-direction: column; }
        }
      `}</style>
        </div>
    );
};

export default PortfolioDetail;
