import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import PageHeader from './PageHeader';

import { useLoading } from '../context/LoadingContext';

// Memoized — won't re-render when lightboxSrc changes in BlogDetail
const PostContent = React.memo(({ content, onImageClick }) => (
    <div className="content-body" onClick={onImageClick} dangerouslySetInnerHTML={{ __html: content }} />
));

// Isolated component — zoom/pan state changes never propagate up to BlogDetail
const ImageLightbox = ({ src, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const zoomIn = () => setZoom(z => Math.min(5, parseFloat((z + 0.5).toFixed(1))));
    const zoomOut = () => setZoom(z => {
        const next = parseFloat((z - 0.5).toFixed(1));
        if (next <= 1) { setPan({ x: 0, y: 0 }); return 1; }
        return next;
    });

    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...pan };
    };
    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        setPan({
            x: panStart.current.x + (e.clientX - dragStart.current.x),
            y: panStart.current.y + (e.clientY - dragStart.current.y),
        });
    };
    const handleMouseUp = () => { isDragging.current = false; };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose}>&#x2715;</button>
            <div className="lightbox-controls" onClick={e => e.stopPropagation()}>
                <button className="lightbox-btn" onClick={zoomOut} disabled={zoom <= 1}>&#x2212;</button>
                <span className="lightbox-zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="lightbox-btn" onClick={zoomIn} disabled={zoom >= 5}>&#x2b;</button>
            </div>
            <div
                className="lightbox-img-wrap"
                onClick={e => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
            >
                <img
                    src={src}
                    className="lightbox-img"
                    style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
                    draggable={false}
                />
            </div>
        </div>
    );
};

const BlogDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const { showLoading, hideLoading } = useLoading();
    const [post, setPost] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPost = async () => {
            showLoading();
            try {
                const [res] = await Promise.all([
                    fetch(`${API_URL}/api/posts/${id}`),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);

                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                hideLoading();
            }
        };
        fetchPost();
    }, [id]);

    const handleContentClick = useCallback((e) => {
        if (e.target.tagName === 'IMG') {
            setLightboxSrc(e.target.src);
        }
    }, []);

    const closeLightbox = useCallback(() => setLightboxSrc(null), []);

    if (!post) return null;

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
                    <PostContent content={post.content} onImageClick={handleContentClick} />
                </div>

                <div className="post-footer text-center">
                    <Link to="/news" className="btn-back">&larr; {t('blog.backToList').toUpperCase()}</Link>
                </div>
            </div>

            {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}

            <style>{`
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
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(17, 17, 17, 1));
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
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
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
                .content-body figure.image {
    margin: 20px 0;
    max-width: 100%;
}
                .content-body img {
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
    border-radius: 4px;
    display: block;
    cursor: zoom-in;
}
                .lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}
                .lightbox-img-wrap {
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}
                .lightbox-img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    transition: transform 0.1s ease;
    user-select: none;
}
                .lightbox-close {
    position: fixed;
    top: 20px;
    right: 24px;
    background: none;
    border: none;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    z-index: 10000;
    line-height: 1;
    opacity: 0.8;
}
                .lightbox-close:hover { opacity: 1; }
                .lightbox-controls {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0,0,0,0.6);
    border-radius: 24px;
    padding: 8px 16px;
    z-index: 10000;
}
                .lightbox-btn {
    background: none;
    border: 1px solid rgba(255,255,255,0.5);
    color: #fff;
    font-size: 1.2rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background 0.2s;
}
                .lightbox-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
                .lightbox-btn:disabled { opacity: 0.3; cursor: default; }
                .lightbox-zoom-label {
    color: #fff;
    font-size: 0.85rem;
    min-width: 40px;
    text-align: center;
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

                @media (max-width: 768px) {
    .blog-detail-page {
        padding-bottom: 40px;
    }
    .blog-hero {
        height: 40vh;
        margin-bottom: 30px;
    }
    .post-title {
        font-size: 1.6rem;
    }
    .post-content {
        padding: 16px;
        border-radius: 4px;
    }
    .post-footer {
        margin-top: 30px;
    }
}
`}</style>
        </div>
    );
};

export default BlogDetail;
