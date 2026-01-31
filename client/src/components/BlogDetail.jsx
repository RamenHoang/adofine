import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import PageHeader from './PageHeader';

const BlogDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };
        fetchPost();
    }, [id]);

    if (!post) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="blog-detail-page">
            <PageHeader
                title={t('blog.title').toUpperCase()}
                breadcrumbs={[
                    { label: t('blog.title').toUpperCase(), link: '/news' },
                    { label: post.title }
                ]}
            />
            <div className="blog-hero" style={{ backgroundImage: `url(${post.image_url})`, height: '50vh', marginTop: '0' }}>
                <div className="hero-overlay">
                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <h1 className="post-title">{post.title}</h1>
                        <div className="post-meta">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="post-content">
                    <div className="content-body" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                </div>

                <div className="post-footer text-center">
                    <Link to="/news" className="btn-back">&larr; {t('blog.backToList').toUpperCase()}</Link>
                </div>
            </div>

            <style jsx>{`
                .blog-detail-page {
                    background: #111;
                    min-height: 100vh;
                    color: #ddd;
                    padding-bottom: 80px;
                }
                .loading {
                    color: #fff;
                    text-align: center;
                    padding-top: 100px;
                }
                .blog-hero {
                    height: 60vh;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    margin-bottom: 60px;
                }
                .hero-overlay {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(17,17,17,1));
                    display: flex;
                    align-items: flex-end;
                    padding-bottom: 60px;
                }
                .post-title {
                    color: #fff;
                    font-size: 3rem;
                    text-align: center;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                }
                .post-meta {
                    color: #aaa;
                    text-align: center;
                    font-size: 1rem;
                    font-style: italic;
                }
                .post-content {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #1a1a1a;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .content-body {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #ccc;
                }
                .content-body h2, .content-body h3 {
                    color: #fff;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                .content-body p {
                    margin-bottom: 20px;
                }
                .content-body img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .content-body ul {
                    padding-left: 20px;
                    margin-bottom: 20px;
                }
                .content-body blockquote {
                    border-left: 4px solid #d31e44;
                    padding-left: 20px;
                    font-style: italic;
                    color: #aaa;
                    margin: 20px 0;
                }
                .post-footer {
                    margin-top: 60px;
                }
                .btn-back {
                    color: #d31e44;
                    text-decoration: none;
                    font-weight: bold;
                    border: 1px solid #d31e44;
                    padding: 10px 20px;
                    transition: all 0.3s;
                }
                .btn-back:hover {
                    background: #d31e44;
                    color: #fff;
                }
            `}</style>
        </div>
    );
};

export default BlogDetail;
