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
                    {posts.map(post => (
                        <Link to={`/news/${post.id}`} key={post.id} className="blog-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="blog-card">
                                <div className="blog-image">
                                    <img src={post.image_url || 'https://placehold.co/600x400/222/FFF?text=News'} alt={post.title} />
                                </div>
                                <div className="blog-content">
                                    <h3 className="blog-title">{post.title}</h3>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <span className="read-more">{t('blog.readMore').toUpperCase()} &rarr;</span>
                                </div>
                            </div>
                        </Link>
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
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                    margin-top: 40px;
                    padding: 0 20px;
                }
                .blog-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    text-align: left;
                    transition: transform 0.3s;
                    cursor: pointer;
                }
                .blog-card:hover {
                    transform: translateY(-5px);
                    border-color: #d31e44;
                }
                .blog-image {
                    height: 200px;
                    overflow: hidden;
                }
                .blog-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                .blog-card:hover .blog-image img {
                    transform: scale(1.1);
                }
                .blog-content {
                    padding: 20px;
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
                .read-more {
                    font-size: 0.8rem;
                    font-weight: bold;
                    color: #d31e44;
                    text-transform: uppercase;
                    letter-spacing: 1px;
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
