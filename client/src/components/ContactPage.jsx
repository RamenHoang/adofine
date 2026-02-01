import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import { useLoading } from '../context/LoadingContext';
import Button from './Button';
import './ContactPage.css';

const ContactPage = () => {
  const { t } = useTranslation();
  const { showLoading, hideLoading } = useLoading();
  
  // Form state
  const [formData, setFormData] = useState({
    salutation: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    selected_gemstones: [],
    selected_jewelry: []
  });

  // Available options
  const [gemstones, setGemstones] = useState([]);
  const [jewelry, setJewelry] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch gemstones and jewelry on mount
  useEffect(() => {
    const fetchData = async () => {
      showLoading();
      try {
        const [gemstonesRes, jewelryRes] = await Promise.all([
          fetch(`${API_URL}/api/gemstones`),
          fetch(`${API_URL}/api/jewelry-items`)
        ]);

        if (gemstonesRes.ok) {
          const gemstonesData = await gemstonesRes.json();
          setGemstones(gemstonesData);
        }

        if (jewelryRes.ok) {
          const jewelryData = await jewelryRes.json();
          setJewelry(jewelryData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        hideLoading();
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle gemstone selection
  const handleGemstoneToggle = (gemstone) => {
    setFormData(prev => {
      const isSelected = prev.selected_gemstones.some(g => g.id === gemstone.id);
      if (isSelected) {
        return {
          ...prev,
          selected_gemstones: prev.selected_gemstones.filter(g => g.id !== gemstone.id)
        };
      } else {
        return {
          ...prev,
          selected_gemstones: [...prev.selected_gemstones, {
            id: gemstone.id,
            title: gemstone.title,
            price: gemstone.price
          }]
        };
      }
    });
  };

  // Handle jewelry selection
  const handleJewelryToggle = (item) => {
    setFormData(prev => {
      const isSelected = prev.selected_jewelry.some(j => j.id === item.id);
      if (isSelected) {
        return {
          ...prev,
          selected_jewelry: prev.selected_jewelry.filter(j => j.id !== item.id)
        };
      } else {
        return {
          ...prev,
          selected_jewelry: [...prev.selected_jewelry, {
            id: item.id,
            title: item.title,
            price: item.price
          }]
        };
      }
    });
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.errors.phoneRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.errors.subjectRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.messageRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/contact-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          salutation: '',
          phone: '',
          email: '',
          subject: '',
          message: '',
          selected_gemstones: [],
          selected_jewelry: []
        });
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        console.error('Error submitting form:', errorData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </div>

      <div className="contact-container">
        {submitStatus === 'success' && (
          <div className="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('contact.successMessage')}</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{t('contact.errorMessage')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>{t('contact.basicInfo')}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salutation">{t('contact.salutation')}</label>
                <input
                  type="text"
                  id="salutation"
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  placeholder={t('contact.salutationPlaceholder')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  {t('contact.phone')} <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('contact.phonePlaceholder')}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  {t('contact.email')} <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('contact.emailPlaceholder')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                {t('contact.subject')} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('contact.subjectPlaceholder')}
                className={errors.subject ? 'error' : ''}
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                {t('contact.message')} <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.messagePlaceholder')}
                rows="6"
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
          </div>

          {/* Gemstone Selection */}
          <div className="form-section">
            <h2>{t('contact.selectGemstones')}</h2>
            <p className="section-description">{t('contact.selectGemstonesDesc')}</p>
            
            {gemstones.length === 0 ? (
              <p className="no-items">{t('contact.noGemstones')}</p>
            ) : (
              <div className="selection-grid">
                {gemstones.map(gemstone => {
                  const isSelected = formData.selected_gemstones.some(g => g.id === gemstone.id);
                  return (
                    <div
                      key={gemstone.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleGemstoneToggle(gemstone)}
                    >
                      <div className="card-image">
                        <img src={gemstone.image || 'https://placehold.co/300x200/333/FFF?text=No+Image'} alt={gemstone.title} />
                        <div className="card-overlay">
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card-content">
                        <h3>{gemstone.title}</h3>
                        {gemstone.price && <p className="price">{gemstone.price}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.selected_gemstones.length > 0 && (
              <div className="selected-items">
                <h3>{t('contact.selectedGemstones')}: {formData.selected_gemstones.length}</h3>
                <div className="selected-tags">
                  {formData.selected_gemstones.map(g => (
                    <span key={g.id} className="tag">
                      {g.title}
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleGemstoneToggle(g)}
                        className="tag-remove"
                      >
                        ×
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Jewelry Selection */}
          <div className="form-section">
            <h2>{t('contact.selectJewelry')}</h2>
            <p className="section-description">{t('contact.selectJewelryDesc')}</p>
            
            {jewelry.length === 0 ? (
              <p className="no-items">{t('contact.noJewelry')}</p>
            ) : (
              <div className="selection-grid">
                {jewelry.map(item => {
                  const isSelected = formData.selected_jewelry.some(j => j.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleJewelryToggle(item)}
                    >
                      <div className="card-image">
                        <img src={item.image || 'https://placehold.co/300x200/333/FFF?text=No+Image'} alt={item.title} />
                        <div className="card-overlay">
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card-content">
                        <h3>{item.title}</h3>
                        {item.price && <p className="price">{item.price}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.selected_jewelry.length > 0 && (
              <div className="selected-items">
                <h3>{t('contact.selectedJewelry')}: {formData.selected_jewelry.length}</h3>
                <div className="selected-tags">
                  {formData.selected_jewelry.map(j => (
                    <span key={j.id} className="tag">
                      {j.title}
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleJewelryToggle(j)}
                        className="tag-remove"
                      >
                        ×
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <Button
              type="submit"
              variant="gradient"
              size="large"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? t('contact.submitting') : t('contact.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
