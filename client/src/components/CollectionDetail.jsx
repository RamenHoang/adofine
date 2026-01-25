import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CollectionDetail.css';
import { API_URL } from '../config';

const CollectionDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [collection, setCollection] = useState(null);

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
            {/* Hero */}
            <div className="coll-hero" style={{ backgroundImage: `url(${collection.image})` }}>
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
                        <div className="items-grid">
                            {collection.items.filter(item => item.type === 'gemstone').map(item => (
                                <div key={`${item.type}-${item.id}`} className="item-card">
                                    <Link to={`/portfolio/${item.id}`} className="item-link">
                                        <div className="item-image">
                                            <img src={item.image || 'https://placehold.co/400x400/333/FFF?text=Product'} alt={item.title} />
                                        </div>
                                        <div className="item-info">
                                            <h3 className="item-title">{item.title}</h3>
                                            <p className="item-price">{item.price ? `${Number(item.price).toLocaleString()} USD` : t('common.contactUs')}</p>
                                        </div>
                                    </Link>
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
                        <div className="items-grid">
                            {collection.items.filter(item => item.type === 'jewelry').map(item => (
                                <div key={`${item.type}-${item.id}`} className="item-card">
                                    <Link to={`/jewelry/${item.id}`} className="item-link">
                                        <div className="item-image">
                                            <img src={item.image || 'https://placehold.co/400x400/333/FFF?text=Product'} alt={item.title} />
                                        </div>
                                        <div className="item-info">
                                            <h3 className="item-title">{item.title}</h3>
                                            <p className="item-price">{item.price ? `${Number(item.price).toLocaleString()} USD` : t('common.contactUs')}</p>
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
