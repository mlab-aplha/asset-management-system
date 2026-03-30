import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubLocation } from '../core/entities/Asset';
import './landing.css';

interface Asset {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'maintenance' | 'retired';
    hub: HubLocation;
    lastUpdated: string;
    health: number;
}

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedHub, setSelectedHub] = useState<HubLocation | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showHubDetails, setShowHubDetails] = useState(false);
    const [autoRotateHub, setAutoRotateHub] = useState(true);
    const [autoRotateIndex, setAutoRotateIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Use a ref to track if we should update selectedHub from auto-rotate
    const shouldUpdateHubRef = useRef(true);

    // Memoize hubs data to prevent unnecessary re-renders
    const hubs = useMemo(() => [
        { id: 1, location: HubLocation.PTA, name: 'Pretoria', assetCount: 234, health: 98, alerts: 2 },
        { id: 2, location: HubLocation.JHB, name: 'Johannesburg', assetCount: 567, health: 95, alerts: 5 },
        { id: 3, location: HubLocation.CPT, name: 'Cape Town', assetCount: 189, health: 99, alerts: 0 },
        { id: 4, location: HubLocation.DBN, name: 'Durban', assetCount: 312, health: 92, alerts: 3 },
        { id: 5, location: HubLocation.BFN, name: 'Bloemfontein', assetCount: 98, health: 100, alerts: 0 },
    ], []);

    // Memoize assets data
    const assets = useMemo<Asset[]>(() => [
        { id: 'AST001', name: 'MRI Scanner X7', type: 'Medical', status: 'active', hub: HubLocation.JHB, lastUpdated: '2024-01-15', health: 97 },
        { id: 'AST002', name: 'Network Router EX9', type: 'Network', status: 'maintenance', hub: HubLocation.PTA, lastUpdated: '2024-01-14', health: 65 },
        { id: 'AST003', name: 'Solar Array Type-S', type: 'Energy', status: 'active', hub: HubLocation.CPT, lastUpdated: '2024-01-15', health: 100 },
        { id: 'AST004', name: 'Cooling Unit C12', type: 'HVAC', status: 'active', hub: HubLocation.DBN, lastUpdated: '2024-01-13', health: 88 },
        { id: 'AST005', name: 'Security Gateway', type: 'Network', status: 'retired', hub: HubLocation.JHB, lastUpdated: '2024-01-10', health: 45 },
        { id: 'AST006', name: 'Power Distribution', type: 'Energy', status: 'active', hub: HubLocation.BFN, lastUpdated: '2024-01-15', health: 99 },
        { id: 'AST007', name: 'Ventilation System', type: 'HVAC', status: 'maintenance', hub: HubLocation.PTA, lastUpdated: '2024-01-12', health: 72 },
    ], []);

    // Memoize features data
    const features = useMemo(() => [
        {
            icon: 'location_on',
            title: 'Real-time Tracking',
            description: 'Sub-meter accuracy tracking across all provincial hubs with active RFID and GPS integration.',
            stats: { active: '1,234', accuracy: '99.8%', updateRate: '2.4s' }
        },
        {
            icon: 'verified_user',
            title: 'Automated Compliance',
            description: 'Instant audit logs and regulatory reporting for government and enterprise-grade accountability.',
            stats: { audits: '45,678', compliance: '100%', reports: '234' }
        },
        {
            icon: 'analytics',
            title: 'Lifecycle Analytics',
            description: 'Predictive maintenance and ROI modeling to maximize the lifespan of your technical infrastructure.',
            stats: { predicted: '94%', lifespan: '+3.2y', savings: 'R2.4M' }
        },
    ], []);

    // Memoize filtered assets
    const filteredAssets = useMemo(() => {
        let filtered = assets;
        if (searchTerm) {
            filtered = filtered.filter(asset =>
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedHub) {
            filtered = filtered.filter(asset => asset.hub === selectedHub);
        }
        return filtered;
    }, [searchTerm, selectedHub, assets]);

    // Update shouldUpdateHubRef when showHubDetails changes
    useEffect(() => {
        shouldUpdateHubRef.current = !showHubDetails;
    }, [showHubDetails]);

    // Auto-rotate hub display - only updates the index
    useEffect(() => {
        if (!autoRotateHub) return;

        const interval = setInterval(() => {
            setAutoRotateIndex(prev => (prev + 1) % hubs.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRotateHub, hubs.length]);

    // Update selectedHub based on autoRotateIndex
    useEffect(() => {
        setSelectedHub(prevSelected => {
            // Only update if auto-rotate is enabled and we should update
            if (autoRotateHub && shouldUpdateHubRef.current) {
                return hubs[autoRotateIndex].location;
            }
            return prevSelected; // Keep previous value
        });
    }, [autoRotateHub, autoRotateIndex, hubs]);

    // Memoize handlers
    const handleExploreAssets = useCallback(() => {
        setShowHubDetails(true);
        setAutoRotateHub(false);
    }, []);

    const handleHubClick = useCallback((hub: typeof hubs[0]) => {
        setSelectedHub(hub.location);
        setShowHubDetails(true);
        setAutoRotateHub(false);
    }, []);

    const handleAssetClick = useCallback((asset: Asset) => {
        setSelectedAsset(asset);
        setShowAssetModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowAssetModal(false);
        setSelectedAsset(null);
    }, []);

    const handleBackToOverview = useCallback(() => {
        setShowHubDetails(false);
        setSelectedHub(null);
        setAutoRotateHub(true);
        setSearchTerm('');
    }, []);

    // Updated to use CSS custom properties
    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'active': return 'var(--success)';
            case 'maintenance': return 'var(--warning)';
            case 'retired': return 'var(--danger)';
            default: return 'var(--gray-500)';
        }
    }, []);

    // Helper to get fill color for SVG markers
    const getMarkerFill = useCallback((isSelected: boolean) => {
        return isSelected ? 'var(--lime)' : 'var(--gray-500)';
    }, []);

    // Helper to get stroke color for pulse animation
    const getPulseStroke = useCallback(() => {
        return 'var(--lime)';
    }, []);

    return (
        <div className="landing-page">
            {/* Header with enhanced search */}
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
                    {!showHubDetails && (
                        <div className="landing-quick-search">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="landing-search-input"
                            />
                        </div>
                    )}

                    <button className="landing-login-button" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="landing-demo-button" onClick={handleExploreAssets}>
                        Live Demo
                    </button>
                </div>
            </header>

            {/* Main Content - Dynamic based on state */}
            {!showHubDetails ? (
                /* Original Hero Section with enhanced interactivity */
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
                                    const isSelected = selectedHub === hub.location;
                                    const isAutoRotating = autoRotateHub && autoRotateIndex === index;

                                    return (
                                        <g
                                            key={hub.id}
                                            onClick={() => handleHubClick(hub)}
                                            className={`landing-hub-group ${isSelected ? 'selected' : ''} ${isAutoRotating ? 'pulsing' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <circle
                                                className="landing-hub-marker"
                                                cx={positions[index].x}
                                                cy={positions[index].y}
                                                fill={getMarkerFill(isSelected)}
                                                r={isSelected ? '8' : '6'}
                                            />
                                            {isAutoRotating && (
                                                <circle
                                                    className="landing-hub-pulse"
                                                    cx={positions[index].x}
                                                    cy={positions[index].y}
                                                    r="12"
                                                    fill="none"
                                                    stroke={getPulseStroke()}
                                                    strokeWidth="2"
                                                />
                                            )}
                                            <text
                                                fill="white"
                                                x={positions[index].x + 15}
                                                y={positions[index].y - 10}
                                                style={{
                                                    fontSize: isSelected ? '12px' : '10px',
                                                    fontWeight: 'bold',
                                                    fill: isSelected ? 'var(--lime)' : 'white'
                                                }}
                                            >
                                                {hub.location.toUpperCase()}
                                                {isSelected && ` (${hub.assetCount})`}
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
                                    Neptune Tech Architecture • Live
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
                                            <p className="landing-stats-subtitle">
                                                {autoRotateHub ? 'Auto-rotating hubs' : `${selectedHub || 'All'} Nodes Active`}
                                            </p>
                                        </div>
                                        <button
                                            className="landing-auto-rotate-toggle"
                                            onClick={() => setAutoRotateHub(!autoRotateHub)}
                                        >
                                            <span className="material-icons">
                                                {autoRotateHub ? 'pause_circle' : 'play_circle'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="landing-stats-chart">
                                        {hubs.map((hub, index) => (
                                            <div
                                                key={hub.id}
                                                className={`landing-chart-bar ${selectedHub === hub.location ? 'selected' : ''}`}
                                                style={{
                                                    height: `${hub.health}%`,
                                                    backgroundColor: selectedHub === hub.location
                                                        ? 'var(--lime)'
                                                        : `rgba(103, 148, 54, ${0.2 + index * 0.1})`
                                                }}
                                                onClick={() => handleHubClick(hub)}
                                            ></div>
                                        ))}
                                    </div>

                                    <div className="landing-hub-labels">
                                        {hubs.map((hub) => (
                                            <span
                                                key={hub.id}
                                                className={selectedHub === hub.location ? 'selected' : ''}
                                                onClick={() => handleHubClick(hub)}
                                            >
                                                {hub.location}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="landing-quick-stats">
                                        <div className="quick-stat">
                                            <span className="stat-value">1,400</span>
                                            <span className="stat-label">Total Assets</span>
                                        </div>
                                        <div className="quick-stat">
                                            <span className="stat-value">98.2%</span>
                                            <span className="stat-label">Uptime</span>
                                        </div>
                                        <div className="quick-stat">
                                            <span className="stat-value">10</span>
                                            <span className="stat-label">Alerts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                /* Hub Details View */
                <section className="landing-hub-details">
                    <div className="hub-details-header">
                        <button
                            className="back-button"
                            onClick={handleBackToOverview}
                        >
                            <span className="material-icons">arrow_back</span>
                            Back to Overview
                        </button>

                        <div className="hub-details-search">
                            <span className="material-icons">search</span>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="hub-details-content">
                        <div className="hub-filters">
                            <h3>Filter by Hub</h3>
                            <div className="hub-filter-buttons">
                                <button
                                    className={`hub-filter ${!selectedHub ? 'active' : ''}`}
                                    onClick={() => setSelectedHub(null)}
                                >
                                    All Hubs
                                </button>
                                {hubs.map(hub => (
                                    <button
                                        key={hub.id}
                                        className={`hub-filter ${selectedHub === hub.location ? 'active' : ''}`}
                                        onClick={() => setSelectedHub(hub.location)}
                                    >
                                        {hub.name}
                                    </button>
                                ))}
                            </div>

                            <h3>Quick Stats</h3>
                            <div className="hub-quick-stats">
                                <div className="stat-card">
                                    <span className="stat-icon material-icons">inventory</span>
                                    <span className="stat-number">{filteredAssets.length}</span>
                                    <span className="stat-label">Assets</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-icon material-icons">check_circle</span>
                                    <span className="stat-number">
                                        {filteredAssets.filter(a => a.status === 'active').length}
                                    </span>
                                    <span className="stat-label">Active</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-icon material-icons">warning</span>
                                    <span className="stat-number">
                                        {filteredAssets.filter(a => a.status === 'maintenance').length}
                                    </span>
                                    <span className="stat-label">Maintenance</span>
                                </div>
                            </div>
                        </div>

                        <div className="assets-grid">
                            {filteredAssets.map(asset => (
                                <div
                                    key={asset.id}
                                    className="asset-card"
                                    onClick={() => handleAssetClick(asset)}
                                >
                                    <div className="asset-card-header">
                                        <span className="asset-id">{asset.id}</span>
                                        <span
                                            className="asset-status"
                                            style={{ backgroundColor: getStatusColor(asset.status), color: 'var(--navy)' }}
                                        >
                                            {asset.status}
                                        </span>
                                    </div>
                                    <h4 className="asset-name">{asset.name}</h4>
                                    <p className="asset-type">{asset.type}</p>
                                    <div className="asset-meta">
                                        <span className="asset-hub">
                                            <span className="material-icons">location_on</span>
                                            {asset.hub}
                                        </span>
                                        <span className="asset-health">
                                            <span className="material-icons">favorite</span>
                                            {asset.health}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section with expanded stats */}
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

                                {/* Expanded stats */}
                                <div className="feature-stats">
                                    {Object.entries(feature.stats).map(([key, value]) => (
                                        <div key={key} className="feature-stat">
                                            <span className="stat-label">{key}</span>
                                            <span className="stat-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Asset Detail Modal */}
            {showAssetModal && selectedAsset && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>
                            <span className="material-icons">close</span>
                        </button>

                        <div className="modal-header">
                            <h2>{selectedAsset.name}</h2>
                            <span
                                className="asset-status-badge"
                                style={{ backgroundColor: getStatusColor(selectedAsset.status), color: 'var(--navy)' }}
                            >
                                {selectedAsset.status}
                            </span>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Asset ID</span>
                                    <span className="detail-value">{selectedAsset.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Type</span>
                                    <span className="detail-value">{selectedAsset.type}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Hub Location</span>
                                    <span className="detail-value">{selectedAsset.hub}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Updated</span>
                                    <span className="detail-value">{selectedAsset.lastUpdated}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <span className="detail-label">Health Score</span>
                                    <div className="health-bar">
                                        <div
                                            className="health-fill"
                                            style={{
                                                width: `${selectedAsset.health}%`,
                                                background: `linear-gradient(90deg, var(--lime) 0%, var(--lime-light) 100%)`
                                            }}
                                        ></div>
                                        <span className="health-value">{selectedAsset.health}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="action-button primary">
                                    <span className="material-icons">edit</span>
                                    Edit Asset
                                </button>
                                <button className="action-button">
                                    <span className="material-icons">history</span>
                                    View History
                                </button>
                                <button className="action-button">
                                    <span className="material-icons">analytics</span>
                                    Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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