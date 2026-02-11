import React from 'react';
import { Button } from '../../components/ui/Button';
import './facilitator-styles.css';

interface LocationAsset {
    id: string;
    name: string;
    serialNumber: string;
    assetNumber: string;
    location: string;
    status: 'in-use' | 'available' | 'maintenance';
    assignedTo: string;
    facility: string;
}

interface LocationAssetsTableProps {
    onReportIssue: (assetId: string) => void;
}

export const LocationAssetsTable: React.FC<LocationAssetsTableProps> = ({ onReportIssue }) => {
    const assets: LocationAsset[] = [
        {
            id: '1',
            name: 'Sony Alpha A7 IV',
            serialNumber: 'SN-77344-',
            assetNumber: 'SNY',
            location: 'Camera Room B',
            status: 'in-use',
            assignedTo: 'Sarah Jenkins',
            facility: 'Sarah Jenkins'
        },
        {
            id: '2',
            name: 'HP LaserJet Enterprise',
            serialNumber: 'SN-12903-',
            assetNumber: 'HPP',
            location: '2nd Floor Common Area',
            status: 'available',
            assignedTo: 'Shared Asset',
            facility: 'Managed'
        },
        {
            id: '3',
            name: 'Poly Studio X50',
            serialNumber: 'SN-44510-',
            assetNumber: 'PLY',
            location: 'Conference Room "Golden Gate"',
            status: 'maintenance',
            assignedTo: 'Shared Asset',
            facility: 'Managed'
        }
    ];

    const getStatusBadge = (status: LocationAsset['status']) => {
        switch (status) {
            case 'in-use':
                return <span className="status-badge in-use">In Use</span>;
            case 'available':
                return <span className="status-badge available">Available</span>;
            case 'maintenance':
                return <span className="status-badge maintenance">Maintenance</span>;
        }
    };

    return (
        <div className="assets-table">
            <div className="table-header">
                <div className="table-row header-row">
                    <div className="table-cell">ASSET</div>
                    <div className="table-cell">ASSET NAME</div>
                    <div className="table-cell">SERIAL</div>
                    <div className="table-cell">NUMBER</div>
                    <div className="table-cell">ASSIGNED TO</div>
                    <div className="table-cell">FACILITY</div>
                    <div className="table-cell">STATUS</div>
                    <div className="table-cell">ACTIONS</div>
                </div>
            </div>

            <div className="table-body">
                {assets.map((asset) => (
                    <div key={asset.id} className="table-row">
                        <div className="table-cell asset-icon">
                            <span className="material-icons">
                                {asset.name.includes('Camera') ? 'photo_camera' :
                                    asset.name.includes('HP') ? 'print' :
                                        'video_camera_front'}
                            </span>
                        </div>
                        <div className="table-cell asset-info">
                            <div className="asset-name">{asset.name}</div>
                            <div className="asset-location">{asset.location}</div>
                        </div>
                        <div className="table-cell serial-number">
                            {asset.serialNumber}
                        </div>
                        <div className="table-cell asset-number">
                            {asset.assetNumber}
                        </div>
                        <div className="table-cell assigned-to">
                            {asset.assignedTo}
                        </div>
                        <div className="table-cell facility">
                            {asset.facility}
                        </div>
                        <div className="table-cell status">
                            {getStatusBadge(asset.status)}
                        </div>
                        <div className="table-cell actions">
                            <Button
                                variant="outline"
                                size="sm"
                                icon="report"
                                onClick={() => onReportIssue(asset.id)}
                            >
                                Report Issue
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="table-footer">
                <div className="pagination-info">
                    Showing 3 of 84 assets at this location
                </div>
                <div className="pagination-controls">
                    <Button variant="secondary" size="sm">Previous</Button>
                    <Button variant="secondary" size="sm">Next</Button>
                </div>
            </div>
        </div>
    );
};