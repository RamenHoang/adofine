import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CollectionDetail.css';
import { API_URL } from '../config';
import PageHeader from './PageHeader';

const CollectionDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [collection, setCollection] = useState(null);

    // Helper for masonry layout (Gemstones)
    const distributeIntoColumns = (items, numColumns = 4) => {
        const columns = Array.from({ length: numColumns }, () => []);
        items.forEach((item, index) => {
            const columnIndex = index % numColumns;
            columns[columnIndex].push(item);
        });
        return columns;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCollection = async () => {
            try {
                const res = await fetch(`${API_URL}/api/collections/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCollection(data);
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
            }
        };
        fetchCollection();
    }, [id]);



    if (!collection) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="collection-detail-page">
            <PageHeader
                title={t('nav.collections').toUpperCase()}
                breadcrumbs={[
                    { label: t('nav.collections').toUpperCase(), link: '/collections' },
                    { label: collection.title }
                ]}
            />
            {/* Hero */}
            <div className="coll-hero" style={{ backgroundImage: `url(${collection.image})`, marginTop: 0 }}>
                <div className="coll-overlay">
                    <div className="container text-center">
                        <h1 className="coll-title">{collection.title}</h1>
                        <p className="coll-desc-hero">{collection.description}</p>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="container" style={{ padding: '80px 0' }}>
                {/* Gemstones Section */}
                {collection.items && collection.items.filter(item => item.type === 'gemstone').length > 0 && (
                    <div style={{ marginBottom: '80px' }}>
                        <h2 className="section-title" style={{ marginBottom: '40px', fontSize: '2rem', textAlign: 'left' }}>
                            {t('gemstones.title').toUpperCase()}
                        </h2>



                        <div className="gem-grid">
                            {distributeIntoColumns(collection.items.filter(item => item.type === 'gemstone'), 4).map((column, colIndex) => (
                                <div key={colIndex} className="gem-column">
                                    {column.map(item => (
                                        <div key={item.id} className="grid-item">
                                            <div className="gem-frame">
                                                <img src={item.image || 'https://placehold.co/400x400/333/FFF?text=Product'} alt={item.title} />
                                                <div className="gem-overlay">
                                                    <div className="gem-icons">
                                                        <Link to={`/portfolio/${item.id}`} className="gem-icon-btn">🔗</Link>
                                                        <a href="#" className="gem-icon-btn">🔍</a>
                                                    </div>
                                                    <div className="gem-details">
                                                        <h3>{item.title}</h3>
                                                        <div className="gem-meta">
                                                            <span>{item.price ? `${Number(item.price).toLocaleString()} USD` : t('common.contactUs')}</span>
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
                )}

                {/* Jewelry Section */}
                {collection.items && collection.items.filter(item => item.type === 'jewelry').length > 0 && (
                    <div style={{ marginBottom: '80px' }}>
                        <h2 className="section-title" style={{ marginBottom: '40px', fontSize: '2rem', textAlign: 'left' }}>
                            {t('jewelry.title').toUpperCase()}
                        </h2>



                        <div className="jewelry-gallery">
                            {collection.items.filter(item => item.type === 'jewelry').map(item => (
                                <div key={`${item.type}-${item.id}`} className="jewelry-frame">
                                    <Link to={`/jewelry/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <img src={item.image || 'https://placehold.co/400x400/333/FFF?text=Product'} alt={item.title} />
                                        <div className="jewelry-info">
                                            {item.title} <br />
                                            <span className="jewelry-price">{item.price ? `${Number(item.price).toLocaleString()} USD` : t('common.contactUs')}</span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!collection.items || collection.items.length === 0) && (
                    <p className="text-center" style={{ color: '#888' }}>{t('common.noData')}</p>
                )}
            </div>

        </div>
    );
};

export default CollectionDetail;
