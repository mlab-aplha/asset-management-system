import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HubLocation } from '../core/entities/Asset';
import './landing.css';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const hubs = [
        { id: 1, location: HubLocation.PTA, name: 'Pretoria' },
        { id: 2, location: HubLocation.JHB, name: 'Johannesburg' },
        { id: 3, location: HubLocation.CPT, name: 'Cape Town' },
        { id: 4, location: HubLocation.DBN, name: 'Durban' },
        { id: 5, location: HubLocation.BFN, name: 'Bloemfontein' },
    ];

    const features = [
        {
            icon: 'location_on',
            title: 'Real-time Tracking',
            description: 'Sub-meter accuracy tracking across all provincial hubs with active RFID and GPS integration.',
        },
        {
            icon: 'verified_user',
            title: 'Automated Compliance',
            description: 'Instant audit logs and regulatory reporting for government and enterprise-grade accountability.',
        },
        {
            icon: 'analytics',
            title: 'Lifecycle Analytics',
            description: 'Predictive maintenance and ROI modeling to maximize the lifespan of your technical infrastructure.',
        },
    ];

    const handleExploreAssets = () => {
        navigate('/login');
    };

    const handleContactAdmin = () => {
        window.location.href = 'mailto:admin@mlab.co.za?subject=AMS%20Demo%20Request';
    };

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <div className="landing-logo-icon">
                        <span className="material-icons">account_tree</span>
                    </div>
                    <h2 className="landing-logo-text">
                        mLab <span className="landing-logo-subtext">AMS</span>
                    </h2>
                </div>

                <nav className="landing-nav">
                    <a className="landing-nav-link" href="#solutions">Solutions</a>
                    <a className="landing-nav-link" href="#network">Network Hubs</a>
                    <a className="landing-nav-link" href="#compliance">Compliance</a>
                    <a className="landing-nav-link" href="#pricing">Pricing</a>
                </nav>

                <div className="landing-header-actions">
                    <button className="landing-login-button" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="landing-demo-button" onClick={handleContactAdmin}>
                        Request Demo
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-background">
                    <svg className="landing-hero-svg" viewBox="0 0 1000 800">
                        <path
                            d="M400,100 L600,100 L800,300 L800,600 L600,750 L200,750 L100,600 L100,300 Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                        />
                        <g className="landing-hub-markers">
                            {hubs.map((hub, index) => {
                                const positions = [
                                    { x: 650, y: 280 },
                                    { x: 630, y: 320 },
                                    { x: 250, y: 680 },
                                    { x: 750, y: 550 },
                                    { x: 550, y: 450 },
                                ];
                                return (
                                    <g key={hub.id}>
                                        <circle
                                            className="landing-hub-marker"
                                            cx={positions[index].x}
                                            cy={positions[index].y}
                                            fill="#94c73d"
                                            r="4"
                                        />
                                        <text
                                            fill="white"
                                            x={positions[index].x + 10}
                                            y={positions[index].y - 5}
                                            style={{ fontSize: '10px', fontWeight: 'bold' }}
                                        >
                                            {hub.location.toUpperCase()}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                <div className="landing-hero-content">
                    <div className="landing-hero-grid">
                        <div className="landing-hero-left">
                            <div className="landing-hero-badge">
                                <span className="landing-ping-dot">
                                    <span className="landing-ping-animation"></span>
                                    <span className="landing-ping-dot-inner"></span>
                                </span>
                                Neptune Tech Architecture
                            </div>

                            <h1 className="landing-hero-title">
                                Precision <span>Asset</span> <br />
                                Intelligence.
                            </h1>

                            <p className="landing-hero-description">
                                The next-generation B2B management system designed for mLab's pan-South African ecosystem.
                                Track, audit, and optimize hardware lifecycles with surgical accuracy.
                            </p>

                            <div className="landing-hero-actions">
                                <button className="landing-primary-button" onClick={handleExploreAssets}>
                                    Explore Assets
                                    <span className="material-icons">arrow_forward</span>
                                </button>

                                <button className="landing-secondary-button">
                                    <span className="landing-play-button">
                                        <span className="material-icons">play_arrow</span>
                                    </span>
                                    Watch System Overview
                                </button>
                            </div>
                        </div>

                        <div className="landing-hero-stats">
                            <div className="landing-stats-card">
                                <div className="landing-stats-header">
                                    <div>
                                        <h3 className="landing-stats-title">Network Health</h3>
                                        <p className="landing-stats-subtitle">All Nodes Active</p>
                                    </div>
                                    <span className="landing-stats-icon material-icons">monitoring</span>
                                </div>

                                <div className="landing-stats-chart">
                                    {[40, 65, 85, 55, 100, 75].map((height, index) => (
                                        <div
                                            key={index}
                                            className="landing-chart-bar"
                                            style={{
                                                height: `${height}%`,
                                                backgroundColor: `rgba(148, 199, 61, ${0.2 + index * 0.1})`
                                            }}
                                        ></div>
                                    ))}
                                </div>

                                <div className="landing-hub-labels">
                                    {hubs.map((hub) => (
                                        <span key={hub.id}>{hub.location}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <div className="landing-features-container">
                    <div className="landing-features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="landing-feature-card">
                                <div className="landing-feature-icon-container">
                                    <span className="landing-feature-icon material-icons">{feature.icon}</span>
                                </div>
                                <h3 className="landing-feature-title">{feature.title}</h3>
                                <p className="landing-feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-container">
                    <div className="landing-security-notice">
                        <span className="material-icons">shield</span>
                        <span className="landing-security-text">Secured by Neptune Tech Encryption</span>
                    </div>

                    <div className="landing-footer-links">
                        <a className="landing-footer-link" href="#">Privacy Policy</a>
                        <a className="landing-footer-link" href="#">System Status</a>
                        <a className="landing-footer-link" href="#">mLab South Africa © 2026</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};