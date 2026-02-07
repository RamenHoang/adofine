import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import BlogRows from './BlogRows';

const BlogSection = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts?limit=3&offset=0`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts);
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
            <h2 className="section-title">{t('blog.title').toUpperCase()}</h2>
            <div>
                <BlogRows posts={posts} showButton={true} />
            </div>
            <style>{`
                .blog-section {
                    padding: 80px 0;
                    background: #111;
                    color: #fff;
                    text-align: center;
                }
            `}</style>
        </section>
    );
};

export default BlogSection;
