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
                            {/* Static blurred background */}
                            <div
                                className="blog-row-bg"
                                style={{ backgroundImage: `url(${post.image_url || 'https://placehold.co/800x600/222/FFF?text=News'})` }}
                            ></div>
                            {/* Main image */}
                            <img
                                src={post.image_url || 'https://placehold.co/800x600/222/FFF?text=News'}
                                alt={post.title}
                                className="blog-row-img-main"
                            />
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
                    max-width: 100%; /* Full width */
                    width: 100vw;
                    margin: 0;
                }
                .blog-rows * {
                    box-sizing: border-box;
                }
                .blog-row {
                    display: flex;
                    text-align: left;
                    overflow: hidden;
                    opacity: 0;
                    width: 100%; /* Ensure row takes full width */
                    animation: fadeInUp 0.8s ease forwards;
                }
                .blog-row.reverse {
                    flex-direction: row-reverse;
                }
                .blog-row-image {
                    flex: 0 0 50%;
                    max-width: 50%;
                    height: 33.33vh; /* 1/3 Viewport Height */
                    overflow: hidden;
                    position: relative;
                }
                /* Blurred Background Layer */
                .blog-row-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: blur(20px) brightness(0.6);
                    z-index: 0;
                    transform: scale(1.1); /* Prevent blurred edges from leaking white */
                }

                /* Main Image */
                .blog-row-img-main {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    object-fit: contain; /* Ensure full image is visible */
                    z-index: 1;
                    transition: transform 0.5s;
                }
                .blog-row:hover .blog-row-img-main {
                    transform: scale(1.05);
                }
                .blog-row-content {
                    flex: 0 0 50%;
                    max-width: 50%;
                    height: 33.33vh; /* Match image height */
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    overflow-y: auto; /* Handle overflow if text is too long */
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


            `}</style>
        </>
    );
};

export default BlogRows;
