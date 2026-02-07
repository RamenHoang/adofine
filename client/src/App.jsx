import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogSection from './components/BlogSection';
import Section from './components/Section';
import Gemstones from './components/Gemstones';
import About from './components/About';
import Jewelries from './components/Jewelries';
import Footer from './components/Footer';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import CollectionsSection from './components/CollectionsSection';
import CollectionDetail from './components/CollectionDetail';
import PortfolioDetail from './components/GemstoneDetail';
import DynamicPage from './components/DynamicPage';
import ContactPage from './components/ContactPage';
import { LoadingProvider } from './context/LoadingContext';
import LoadingOverlay from './components/LoadingOverlay';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Hero />
      <Gemstones />
      <BlogSection />
      <Jewelries />
      {/* <About /> */}
      <Footer />
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <Router>
        <div className="App">
          <LoadingOverlay />
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
            <Route path="/gemstones" element={
              <>
                <Navbar />
                <div style={{ paddingTop: '80px' }}>
                  <Gemstones />
                </div>
                <Footer />
              </>
            } />
            <Route path="/jewelries" element={
              <>
                <Navbar />
                <div style={{ paddingTop: '80px' }}>
                  <Jewelries />
                </div>
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar />
                <ContactPage />
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
    </LoadingProvider>
  );
}

export default App;
