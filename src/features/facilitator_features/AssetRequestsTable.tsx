import React from 'react';
import { Button } from '../../components/ui/Button';
import './asset-requests-styles.css';

interface Asset {
    id: string;
    name: string;
    assetId: string;
    category: string;
    location: string;
    status: 'available' | 'in-use' | 'maintenance';
    icon: string;
}

interface AssetRequestsTableProps {
    onRequestAsset: (assetId: string) => void;
    onViewDetails: (assetId: string) => void;
}

export const AssetRequestsTable: React.FC<AssetRequestsTableProps> = ({
    onRequestAsset,
    onViewDetails
}) => {
    const assets: Asset[] = [
        {
            id: '1',
            name: 'Macbook Pro M2 - 14"',
            assetId: 'AST-88219',
            category: 'Computing',
            location: 'HQ - Floor 4',
            status: 'available',
            icon: 'laptop_mac'
        },
        {
            id: '2',
            name: 'Epson 4K Projector',
            assetId: 'AV-55201',
            category: 'AV Equipment',
            location: 'Main Conference',
            status: 'maintenance',
            icon: 'videocam'
        },
        {
            id: '3',
            name: 'Herman Miller Aeron',
            assetId: 'FUR-10293',
            category: 'Furniture',
            location: 'West Wing - R402',
            status: 'in-use',
            icon: 'chair'
        },
        {
            id: '4',
            name: 'Sony Alpha A7 IV',
            assetId: 'CAM-44910',
            category: 'Photography',
            location: 'Studio B',
            status: 'available',
            icon: 'photo_camera'
        }
    ];

    const getStatusBadge = (status: Asset['status']) => {
        switch (status) {
            case 'available':
                return (
                    <div className="status-badge available">
                        <span className="material-icons">check_circle</span>
                        <span>Available</span>
                    </div>
                );
            case 'in-use':
                return (
                    <div className="status-badge in-use">
                        <span className="material-icons">schedule</span>
                        <span>In Use</span>
                    </div>
                );
            case 'maintenance':
                return (
                    <div className="status-badge maintenance">
                        <span className="material-icons">build</span>
                        <span>Maintenance</span>
                    </div>
                );
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Computing':
                return 'laptop_mac';
            case 'AV Equipment':
                return 'videocam';
            case 'Photography':
                return 'photo_camera';
            case 'Furniture':
                return 'chair';
            default:
                return 'devices';
        }
    };

    return (
        <div className="asset-requests-table-container">
            <div className="table-card">
                <div className="table-header">
                    <div className="table-row header-row">
                        <div className="table-cell asset-col">ASSET</div>
                        <div className="table-cell name-col">ASSET NAME</div>
                        <div className="table-cell category-col">CATEGORY</div>
                        <div className="table-cell location-col">LOCATION</div>
                        <div className="table-cell status-col">STATUS</div>
                        <div className="table-cell action-col">ACTION</div>
                    </div>
                </div>

                <div className="table-body">
                    {assets.map((asset) => (
                        <div key={asset.id} className="table-row">
                            <div className="table-cell asset-col">
                                <div className="asset-icon-wrapper">
                                    <span className="material-icons">
                                        {getCategoryIcon(asset.category)}
                                    </span>
                                </div>
                            </div>
                            <div className="table-cell name-col">
                                <div className="asset-name-info">
                                    <h4 className="asset-name">{asset.name}</h4>
                                    <p className="asset-id">ID: {asset.assetId}</p>
                                </div>
                            </div>
                            <div className="table-cell category-col">
                                <span className="category-text">{asset.category}</span>
                            </div>
                            <div className="table-cell location-col">
                                <span className="location-text">{asset.location}</span>
                            </div>
                            <div className="table-cell status-col">
                                {getStatusBadge(asset.status)}
                            </div>
                            <div className="table-cell action-col">
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={() => onRequestAsset(asset.id)}
                                    className="request-btn"
                                >
                                    Request
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewDetails(asset.id)}
                                    className="details-btn"
                                >
                                    Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="table-footer">
                    <div className="pagination-info">
                        Showing 1 to 10 of 42 assets
                    </div>
                    <div className="pagination-controls">
                        <button className="pagination-btn">
                            <span className="material-icons">chevron_left</span>
                        </button>
                        <div className="pagination-numbers">
                            <button className="page-number active">1</button>
                            <button className="page-number">2</button>
                            <button className="page-number">3</button>
                            <span className="page-dots">...</span>
                            <button className="page-number">5</button>
                        </div>
                        <button className="pagination-btn">
                            <span className="material-icons">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};