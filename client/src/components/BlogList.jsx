import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BlogList = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="blog-page">
            <div className="container">
                <h1 className="page-title text-center">TIN TỨC & SỰ KIỆN</h1>
                <p className="page-subtitle text-center">Cập nhật những xu hướng mới nhất về đá quý và trang sức</p>

                <div className="blog-grid">
                    {posts.map(post => (
                        <Link to={`/news/${post.id}`} key={post.id} className="blog-card-link">
                            <div className="blog-card">
                                <div className="blog-image">
                                    <img src={post.image_url || 'https://placehold.co/600x400/222/FFF?text=News'} alt={post.title} />
                                </div>
                                <div className="blog-content">
                                    <h3 className="blog-title">{post.title}</h3>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <span className="read-more">ĐỌC THÊM &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .blog-page {
                    padding: 120px 0 80px;
                    background: #000;
                    min-height: 100vh;
                    color: #fff;
                }
                .page-title {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .page-subtitle {
                    color: #888;
                    margin-bottom: 60px;
                }
                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 40px;
                }
                .blog-card-link {
                    text-decoration: none;
                    color: inherit;
                }
                .blog-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    transition: transform 0.3s, border-color 0.3s;
                    height: 100%;
                }
                .blog-card:hover {
                    transform: translateY(-5px);
                    border-color: #d31e44;
                }
                .blog-image {
                    height: 240px;
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
                    padding: 25px;
                }
                .blog-title {
                    font-size: 1.4rem;
                    margin-bottom: 15px;
                    line-height: 1.4;
                    color: #fff;
                }
                .blog-excerpt {
                    font-size: 0.95rem;
                    color: #aaa;
                    margin-bottom: 20px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.6;
                }
                .read-more {
                    font-size: 0.85rem;
                    font-weight: bold;
                    color: #d31e44;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}</style>
        </div>
    );
};

export default BlogList;
