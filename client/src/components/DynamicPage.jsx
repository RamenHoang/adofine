
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';
import PageHeader from './PageHeader';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}/api/pages/slug/${slug}`);
                if (!res.ok) {
                    throw new Error('Page not found');
                }
                const data = await res.json();
                setPage(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="section" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Loading...
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="section" style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="section" style={{ minHeight: '80vh' }}>
            <PageHeader
                title={page.title}
                breadcrumbs={[{ label: 'PAGES', link: '#' }, { label: page.title }]}
            />
            <div className="container" style={{ paddingTop: '50px' }}>
                <div
                    className="page-content"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                    style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
                />
            </div>
            <style jsx>{`
                .page-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .page-content h2, .page-content h3 {
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                .page-content p {
                    margin-bottom: 20px;
                }
                .page-content ul, .page-content ol {
                    margin-bottom: 20px;
                    padding-left: 20px;
                }
            `}</style>
        </div>
    );
};

export default DynamicPage;
