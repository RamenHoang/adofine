import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CollectionsSection.css';
import { API_URL } from '../config';

const CollectionsSection = () => {
    const { t } = useTranslation();
    const [collections, setCollections] = useState([]);

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

    if (collections.length === 0) return null;

    return (
        <section className="collections-section" id="collections">
            <div className="container">
                <h2 className="section-title text-center" style={{ marginBottom: '60px' }}>{t('collections.title').toUpperCase()}</h2>

                {collections.map((col, index) => (
                    <div key={col.id} className={`collection-row ${index % 2 !== 0 ? 'reverse' : ''}`}>
                        <div className="col-image">
                            <img src={col.image || 'https://placehold.co/800x600/111/FFF?text=Collection'} alt={col.title} />
                        </div>
                        <div className="col-content">
                            <h3 className="col-title">{col.title}</h3>
                            <p className="col-desc">{col.description}</p>
                            <Link to={`/collections/${col.id}`} className="btn-explore">{t('collections.viewCollection').toUpperCase()}</Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CollectionsSection;
