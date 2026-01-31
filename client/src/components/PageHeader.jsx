
import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, breadcrumbs = [] }) => {
    return (
        <div className="page-header" style={{
            marginTop: '80px', // Navbar height offset
            padding: '20px 0',
            backgroundColor: '#000', // Matches theme
            borderBottom: '1px solid #333'
        }}>
            <div className="container d-flex justify-between align-center">
                {/* Left: Title */}
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '1px'
                }}>
                    {title}
                </h1>

                {/* Right: Breadcrumb */}
                <div className="breadcrumb" style={{
                    fontSize: '0.9rem',
                    color: '#888',
                    textTransform: 'uppercase'
                }}>
                    <Link to="/" style={{ color: '#888' }}>HOME</Link>
                    {breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                            <span style={{ margin: '0 10px' }}>/</span>
                            {item.link ? (
                                <Link to={item.link} style={{ color: '#888' }}>{item.label}</Link>
                            ) : (
                                <span style={{ color: '#d31e44', fontWeight: 'bold' }}>{item.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
