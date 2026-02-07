import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import PortfolioGrid from './PortfolioGrid';

const Frames = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'ALL');
  const [frames, setFrames] = useState([]);
  const [filters, setFilters] = useState(['ALL']);
  const [config, setConfig] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jewelry items
        const jewelryResponse = await fetch(`${API_URL}/api/jewelry`);
        const jewelryData = await jewelryResponse.json();
        setFrames(jewelryData);

        // Fetch jewelry categories for filters
        const categoriesResponse = await fetch(`${API_URL}/api/jewelry-categories`);
        const categoriesData = await categoriesResponse.json();

        // Create filters array with "ALL" first, then category names
        const categoryFilters = categoriesData.map(cat => cat.name.toUpperCase());
        setFilters(['ALL', ...categoryFilters]);

        // Fetch section configuration
        const settingsRes = await fetch(`${API_URL}/api/settings`);
        const settingsData = await settingsRes.json();
        setConfig(settingsData);
      } catch (error) {
        console.error('Error fetching jewelry:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    } else {
      setActiveFilter('ALL');
    }
  }, [searchParams]);

  const visibleFrames = activeFilter === 'ALL'
    ? frames
    : frames.filter(f => (f.category_name || '').toUpperCase() === activeFilter);

  // Use configuration with fallback defaults
  const sectionTitle = config.JEWELRY_SECTION_TITLE || 'LOẠI TRANG SỨC';
  const sectionDesc = config.JEWELRY_SECTION_DESC || 'Các mẫu thiết kế độc đáo và sang trọng';
  const sectionBg = config.JEWELRY_SECTION_BG || 'https://placehold.co/1920x1080/111/FFF?text=Jewelry+BG';
  const numColumns = parseInt(config.JEWELRY_GRID_COLUMNS) || 4;

  return (
    <PortfolioGrid
      items={visibleFrames}
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sectionTitle={sectionTitle}
      sectionSubtitle={sectionDesc}
      sectionBg={sectionBg}
      categoryLabel="TRANG SỨC"
      linkBasePath="/jewelry"
      numColumns={numColumns}
    />
  );
};

export default Frames;
