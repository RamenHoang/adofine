import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogSection from './components/BlogSection';
import Section from './components/Section';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Frames from './components/Frames';
import Footer from './components/Footer';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import CollectionsSection from './components/CollectionsSection';
import CollectionDetail from './components/CollectionDetail';
import PortfolioDetail from './components/PortfolioDetail';
import Admin from './components/Admin';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <CollectionsSection />
      <BlogSection />

      <Section
        title="RUBY"
        description="Ruby (Hồng ngọc) là một trong 4 loại đá quý hiếm nhất thế giới. Sắc đỏ huyết bồ câu đặc trưng tượng trưng cho tình yêu nồng cháy và quyền lực vĩnh cửu."
        buttonText="XEM BỘ SƯU TẬP"
        reverse={true}
        image="https://placehold.co/600x400/111/FFF?text=Ruby"
      />

      <Section
        title="SAPPHIRE"
        description="Sapphire (Lam ngọc) mang sắc xanh biển sâu thẳm, biểu tượng của sự trung thành, niềm tin và hy vọng. Đây là loại đá quý được giới hoàng gia ưa chuộng."
        buttonText="XEM BỘ SƯU TẬP"
        image="https://placehold.co/600x400/111/FFF?text=Sapphire"
      />

      <Portfolio />

      <Section
        title="KIM CƯƠNG"
        description="Kim cương - Nữ hoàng của các loại đá quý. Với độ cứng tuyệt đối và vẻ đẹp lấp lánh vĩnh cửu, kim cương là biểu tượng của tình yêu bất diệt."
        buttonText="XEM BỘ SƯU TẬP"
        reverse={true}
        image="https://placehold.co/600x400/111/FFF?text=Diamond"
      />

      <Section
        title="NGỌC TRAI"
        description="Ngọc trai mang vẻ đẹp thuần khiết và sang trọng. Mỗi viên ngọc là một kiệt tác của thiên nhiên, tôn vinh vẻ đẹp dịu dàng của người phụ nữ."
        buttonText="XEM BỘ SƯU TẬP"
        image="https://placehold.co/600x400/111/FFF?text=Pearl"
      />

      <Frames />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/news" element={
            <>
              <Navbar />
              <BlogList />
              <Footer />
            </>
          } />
          <Route path="/news/:id" element={
            <>
              <Navbar />
              <BlogDetail />
              <Footer />
            </>
          } />
          <Route path="/collections/:id" element={
            <>
              <Navbar />
              <CollectionDetail />
              <Footer />
            </>
          } />
          <Route path="/portfolio/:id" element={
            <>
              <Navbar />
              <PortfolioDetail type="gemstone" />
              <Footer />
            </>
          } />
          <Route path="/jewelry/:id" element={
            <>
              <Navbar />
              <PortfolioDetail type="jewelry" />
              <Footer />
            </>
          } />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
