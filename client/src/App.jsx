import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
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
import DynamicPage from './components/DynamicPage';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Hero />
      <Portfolio />
      <BlogSection />
      <Frames />
      <About />
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
          <Route path="/pages/:slug" element={
            <>
              <Navbar />
              <DynamicPage />
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
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
