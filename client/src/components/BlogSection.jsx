import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

const BlogSection = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.slice(0, 3)); // Limit to 3 latest
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    if (posts.length === 0) return null; // Don't show if no posts

    return (
        <section className="blog-section" id="news">
            <div className="container">
                <h2 className="section-title">{t('blog.title').toUpperCase()}</h2>
                <p className="section-subtitle">{t('blog.title')}</p>

                <div className="blog-grid">
                    {posts.map((post, index) => (
                        <div key={post.id} className={`blog-card ${index % 2 === 1 ? 'reverse' : ''}`}>
                            <div className="blog-image">
                                <img src={post.image_url || 'https://placehold.co/600x400/222/FFF?text=News'} alt={post.title} />
                            </div>
                            <div className="blog-content">
                                <h3 className="blog-title">{post.title}</h3>
                                <p className="blog-excerpt">{post.excerpt}</p>
                                <Link to={`/news/${post.id}`} className="btn-read-more">{t('blog.readMore').toUpperCase()}</Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '50px' }}>
                    <Link to="/news" className="btn btn-primary-outline">{t('blog.title').toUpperCase()}</Link>
                </div>
            </div>
            <style jsx>{`
                .blog-section {
                    padding: 80px 0;
                    background: #111;
                    color: #fff;
                    text-align: center;
                }
                .blog-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    margin-top: 40px;
                    padding: 0;
                    max-width: 1200px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .blog-card {
                    display: flex;
                    text-align: left;
                    overflow: hidden;
                }
                .blog-card.reverse {
                    flex-direction: row-reverse;
                }
                .blog-image {
                    flex: 0 0 50%;
                    height: 300px;
                    overflow: hidden;
                    position: relative;
                }
                .blog-image::before {
                    content: '';
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    border: 2px solid #fff;
                    pointer-events: none;
                    z-index: 1;
                }
                .blog-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                @media (max-width: 768px) {
                    .blog-card, .blog-card.reverse {
                        flex-direction: column;
                    }
                    .blog-image {
                        flex: 0 0 auto;
                        height: 200px;
                    }
                }
                .blog-content {
                    flex: 1;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .blog-title {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    line-height: 1.4;
                    color: #fff;
                }
                .blog-excerpt {
                    font-size: 0.9rem;
                    color: #aaa;
                    margin-bottom: 20px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .btn-read-more {
                    display: inline-block;
                    padding: 12px 30px;
                    border: 1px solid #d31e44;
                    color: #d31e44;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .btn-read-more:hover {
                    background: #d31e44;
                    color: #fff;
                }
                .btn-primary-outline {
                    display: inline-block;
                    padding: 12px 30px;
                    border: 1px solid #fff;
                    color: #fff;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                .btn-primary-outline:hover {
                    background: #fff;
                    color: #000;
                }
            `}</style>
        </section>
    );
};

export default BlogSection;
