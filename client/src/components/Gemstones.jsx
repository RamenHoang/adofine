import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import PortfolioGrid from './PortfolioGrid';

const Portfolio = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [filter, setFilter] = useState(searchParams.get('filter') || 'ALL');
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

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setFilter(filterParam);
        } else {
            setFilter('ALL');
        }
    }, [searchParams]);

    const filteredItems = filter === 'ALL' ? items : items.filter(item => {
        // Filter by category name or gemstone_category_id
        if (item.gemstone_category_id) {
            const category = categories.find(cat => cat.id === item.gemstone_category_id);
            return category && category.name === filter;
        }
        return item.category && item.category.toUpperCase() === filter;
    });

    // Defaults
    const sectionTitle = config.GEM_SECTION_TITLE || 'CÁC LOẠI ĐÁ';
    const sectionDesc = config.GEM_SECTION_DESC || 'Khám phá vẻ đẹp vĩnh cửu của những viên đá quý thiên nhiên';
    const sectionBg = config.GEM_SECTION_BG || 'https://placehold.co/1920x1080/111/FFF?text=Parallax+BG';
    const numColumns = parseInt(config.GEM_GRID_COLUMNS) || 4;

    const filters = ['ALL', ...categories.map(cat => cat.name)];

    return (
        <PortfolioGrid
            items={filteredItems}
            filters={filters}
            activeFilter={filter}
            onFilterChange={setFilter}
            sectionTitle={sectionTitle}
            sectionSubtitle={sectionDesc}
            sectionBg={sectionBg}
            categoryLabel={t('gemstones.title').toUpperCase()}
            linkBasePath="/portfolio"
            numColumns={numColumns}
        />
    );
};

export default Portfolio;
