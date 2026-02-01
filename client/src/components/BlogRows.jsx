import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';

const BlogRows = ({ posts = [], showButton = true }) => {
    const { t } = useTranslation();

    if (posts.length === 0) return null;

    return (
        <>
            <div className="blog-rows">
                {posts.map((post, index) => (
                    <div key={post.id} className={`blog-row ${index % 2 === 1 ? 'reverse' : ''}`}>
                        <div className="blog-row-image">
                            <img src={post.image_url || 'https://placehold.co/800x600/222/FFF?text=News'} alt={post.title} />
                        </div>
                        <div className="blog-row-content">
                            <h3 className="blog-row-title">{post.title}</h3>
                            <p className="blog-row-excerpt">{post.excerpt}</p>
                            {showButton && (
                                <Button
                                    as="link"
                                    to={`/news/${post.id}`}
                                    variant="outline"
                                    size="small"
                                >
                                    {t('blog.readMore').toUpperCase()}
                                </Button>
                            )}
                            {!showButton && (
                                <Link to={`/news/${post.id}`} className="blog-row-link">
                                    {t('blog.readMore').toUpperCase()} &rarr;
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .blog-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .blog-row {
                    display: flex;
                    text-align: left;
                    overflow: hidden;
                    opacity: 0;
                    animation: fadeInUp 0.8s ease forwards;
                }
                .blog-row.reverse {
                    flex-direction: row-reverse;
                }
                .blog-row-image {
                    flex: 0 0 50%;
                    height: 300px;
                    overflow: hidden;
                    position: relative;
                }
                .blog-row-image::before {
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
                .blog-row-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                .blog-row:hover .blog-row-image img {
                    transform: scale(1.05);
                }
                .blog-row-content {
                    flex: 1;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .blog-row-title {
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    line-height: 1.3;
                    color: #fff;
                }
                .blog-row-excerpt {
                    font-size: 1rem;
                    color: #aaa;
                    margin-bottom: 25px;
                    line-height: 1.8;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-row-link {
                    display: inline-block;
                    padding: 12px 30px;
                    border: 1px solid #d31e44;
                    color: #d31e44;
                    text-decoration: none;
                    letter-spacing: 1px;
                    font-size: 0.85rem;
                    font-weight: bold;
                    transition: all 0.3s;
                    text-transform: uppercase;
                }
                .blog-row-link:hover {
                    background: #d31e44;
                    color: #fff;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .blog-row, .blog-row.reverse {
                        flex-direction: column;
                    }
                    .blog-row-image {
                        flex: 0 0 auto;
                        height: 250px;
                    }
                    .blog-row-title {
                        font-size: 1.2rem;
                    }
                    .blog-row-excerpt {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </>
    );
};

export default BlogRows;
