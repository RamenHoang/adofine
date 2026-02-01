
import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoadingOverlay = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="spinner"></div>
                <div className="loading-text">ADOFINE JEWELRY</div>
            </div>
            <style jsx>{`
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #000000;
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .loading-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #333;
                    border-top: 3px solid #d31e44;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .loading-text {
                    color: #fff;
                    font-family: 'PT Sans Narrow', 'Arial Narrow', Arial, sans-serif;
                    letter-spacing: 3px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default LoadingOverlay;
