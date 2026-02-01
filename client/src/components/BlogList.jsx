import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import PageHeader from './PageHeader';
import BlogRows from './BlogRows';

import { useLoading } from '../context/LoadingContext';

const BlogList = () => {
    const { t } = useTranslation();
    const { showLoading, hideLoading } = useLoading();
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    useEffect(() => {
        const fetchPosts = async () => {
            showLoading();
            try {
                const offset = (currentPage - 1) * postsPerPage;
                // Minimum loading time for premium feel
                const [res] = await Promise.all([
                    fetch(`${API_URL}/api/posts?limit=${postsPerPage}&offset=${offset}`),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);

                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts);
                    setTotal(data.total);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                hideLoading();
            }
        };
        fetchPosts();
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const totalPages = Math.ceil(total / postsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="blog-page">
            <PageHeader
                title={t('blog.title').toUpperCase()}
                breadcrumbs={[{ label: t('blog.title').toUpperCase() }]}
            />
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                <BlogRows posts={posts} showButton={false} />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="page-btn"
                        >
                            &lt; PREV
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="page-btn"
                        >
                            NEXT &gt;
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                .blog-page {
                    background: #000;
                    min-height: 100vh;
                    color: #fff;
                }
                
                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 60px;
                    flex-wrap: wrap;
                }
                .page-btn {
                    padding: 10px 18px;
                    background: transparent;
                    border: 1px solid #333;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                }
                .page-btn:hover:not(:disabled) {
                    border-color: #d31e44;
                    color: #d31e44;
                }
                .page-btn.active {
                    background: #d31e44;
                    border-color: #d31e44;
                    color: #fff;
                }
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
            `}</style>
        </div >
    );
};

export default BlogList;
