import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CollectionDetail.css';
import { API_URL } from '../config';
import PageHeader from './PageHeader';
import PortfolioGrid from './PortfolioGrid';
import { useLoading } from '../context/LoadingContext';

const CollectionDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const { showLoading, hideLoading } = useLoading();
    const [collection, setCollection] = useState(null);
    const [config, setConfig] = useState({});
    const [gemstoneFilter, setGemstoneFilter] = useState('ALL');
    const [jewelryFilter, setJewelryFilter] = useState('ALL');

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCollection = async () => {
            showLoading();
            try {
                const [res, settingsRes] = await Promise.all([
                    fetch(`${API_URL}/api/collections/${id}`),
                    fetch(`${API_URL}/api/settings`),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);

                if (res.ok) {
                    const data = await res.json();
                    setCollection(data);
                }
                
                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setConfig(settingsData);
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                hideLoading();
            }
        };
        fetchCollection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!collection) return null;

    // Get number of columns from config with fallback
    const numColumns = parseInt(config.COLLECTION_GRID_COLUMNS) || 4;
    
    // Filter items by type
    const allGemstones = collection.items ? collection.items.filter(item => item.type === 'gemstone') : [];
    const allJewelry = collection.items ? collection.items.filter(item => item.type === 'jewelry') : [];

    // Apply category filter
    const gemstones = gemstoneFilter === 'ALL' 
        ? allGemstones 
        : allGemstones.filter(item => item.category_name && item.category_name.toUpperCase() === gemstoneFilter);
    
    const jewelry = jewelryFilter === 'ALL' 
        ? allJewelry 
        : allJewelry.filter(item => item.category_name && item.category_name.toUpperCase() === jewelryFilter);

    // Use categories from API response
    const gemstoneCategories = collection.gemstone_categories || [];
    const jewelryCategories = collection.jewelry_categories || [];
    
    // Create filters arrays
    const gemstoneFilters = gemstoneCategories.length > 0 ? ['ALL', ...gemstoneCategories.map(cat => cat.toUpperCase())] : ['ALL'];
    const jewelryFilters = jewelryCategories.length > 0 ? ['ALL', ...jewelryCategories.map(cat => cat.toUpperCase())] : ['ALL'];

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

            {/* Gemstones Section */}
            {allGemstones.length > 0 && (
                <div style={{ marginTop: '80px' }}>
                    <PortfolioGrid
                        items={gemstones}
                        filters={gemstoneFilters}
                        activeFilter={gemstoneFilter}
                        onFilterChange={setGemstoneFilter}
                        sectionTitle={t('gemstones.title').toUpperCase()}
                        sectionSubtitle=""
                        sectionBg=""
                        categoryLabel={t('gemstones.title').toUpperCase()}
                        linkBasePath="/portfolio"
                        numColumns={numColumns}
                    />
                </div>
            )}

            {/* Jewelry Section */}
            {allJewelry.length > 0 && (
                <div style={{ marginTop: allGemstones.length > 0 ? '80px' : '80px' }}>
                    <PortfolioGrid
                        items={jewelry}
                        filters={jewelryFilters}
                        activeFilter={jewelryFilter}
                        onFilterChange={setJewelryFilter}
                        sectionTitle={t('jewelry.title').toUpperCase()}
                        sectionSubtitle=""
                        sectionBg=""
                        categoryLabel={t('jewelry.title').toUpperCase()}
                        linkBasePath="/jewelry"
                        numColumns={numColumns}
                    />
                </div>
            )}

            {/* No Items */}
            {(!collection.items || collection.items.length === 0) && (
                <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>{t('common.noData')}</p>
                </div>
            )}
        </div>
    );
};

export default CollectionDetail;
