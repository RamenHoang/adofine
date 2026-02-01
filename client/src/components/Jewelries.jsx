import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import PortfolioGrid from './PortfolioGrid';

const Frames = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [frames, setFrames] = useState([]);
  const [filters, setFilters] = useState(['ALL']);

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
      } catch (error) {
        console.error('Error fetching jewelry:', error);
      }
    };
    fetchData();
  }, []);

  const visibleFrames = activeFilter === 'ALL'
    ? frames
    : frames.filter(f => (f.category_name || '').toUpperCase() === activeFilter);

  return (
    <PortfolioGrid
      items={visibleFrames}
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sectionTitle="LOẠI TRANG SỨC"
      sectionSubtitle="Các mẫu thiết kế độc đáo và sang trọng"
      sectionBg="https://placehold.co/1920x1080/111/FFF?text=Jewelry+BG"
      categoryLabel="TRANG SỨC"
      linkBasePath="/jewelry"
      numColumns={4}
    />
  );
};

export default Frames;
