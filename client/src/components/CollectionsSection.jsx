import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import PortfolioGrid from './PortfolioGrid';

const CollectionsSection = () => {
    const [collections, setCollections] = useState([]);
    const [config, setConfig] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch collections
                const res = await fetch(`${API_URL}/api/collections`);
                if (res.ok) {
                    const data = await res.json();
                    setCollections(data.filter(c => c.is_visible));
                }

                // Fetch section configuration
                const settingsRes = await fetch(`${API_URL}/api/settings`);
                const settingsData = await settingsRes.json();
                setConfig(settingsData);
            } catch (error) {
                console.error('Error fetching collections:', error);
            }
        };
        fetchData();
    }, []);

    if (collections.length === 0) return null;

    // Use configuration with fallback defaults
    const sectionTitle = config.COLLECTION_SECTION_TITLE || 'BỘ SƯU TẬP';
    const sectionDesc = config.COLLECTION_SECTION_DESC || 'Những bộ sưu tập độc đáo và ấn tượng';
    const sectionBg = config.COLLECTION_SECTION_BG || 'https://placehold.co/1920x1080/111/FFF?text=Collections+BG';
    const numColumns = parseInt(config.COLLECTION_GRID_COLUMNS) || 4;

    return (
        <PortfolioGrid
            items={collections}
            filters={['ALL']}
            activeFilter="ALL"
            onFilterChange={() => {}}
            sectionTitle={sectionTitle}
            sectionSubtitle={sectionDesc}
            sectionBg={sectionBg}
            categoryLabel="BỘ SƯU TẬP"
            linkBasePath="/collections"
            numColumns={numColumns}
        />
    );
};

export default CollectionsSection;
