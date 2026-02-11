import React from 'react';
import { Button } from '../../components/ui/Button';
import './facilitator-styles.css';

interface Asset {
    id: string;
    name: string;
    serialNumber: string;
    assetNumber: string;
    brand: string;
    assignedTo: string;
    status: 'in-use' | 'available' | 'maintenance';
    location: string;
    assignedDate: string;
}

interface MyAssetsTableProps {
    onReportIssue: (assetId: string) => void;
}

export const MyAssetsTable: React.FC<MyAssetsTableProps> = ({ onReportIssue }) => {
    const assets: Asset[] = [
        {
            id: '1',
            name: 'MacBook Pro M2',
            serialNumber: 'SN-99201-',
            assetNumber: 'APP',
            brand: 'Apple',
            assignedTo: 'Max',
            status: 'in-use',
            location: 'San Francisco HQ',
            assignedDate: 'Oct 12, 2023'
        },
        {
            id: '2',
            name: 'Dell UltraSharp 32"',
            serialNumber: 'SN-88122',
            assetNumber: 'DLL',
            brand: 'Dell',
            assignedTo: '',
            status: 'available',
            location: 'San Francisco HQ',
            assignedDate: 'Nov 05, 2023'
        }
    ];


    return (
        <div className="assets-table">
            <div className="table-header">
                <div className="table-row header-row">
                    <div className="table-cell">ASSET</div>
                    <div className="table-cell">ASSET NAME</div>
                    <div className="table-cell">SERIAL</div>
                    <div className="table-cell">NUMBER</div>
                    <div className="table-cell">CURRENT LOCATION</div>
                    <div className="table-cell">DATE</div>
                    <div className="table-cell">ASSIGNED</div>
                    <div className="table-cell">ACTIONS</div>
                </div>
            </div>

            <div className="table-body">
                {assets.map((asset) => (
                    <div key={asset.id} className="table-row">
                        <div className="table-cell asset-icon">
                            <span className="material-icons">laptop_mac</span>
                        </div>
                        <div className="table-cell asset-info">
                            <div className="asset-name">{asset.name}</div>
                            <div className="asset-details">{asset.brand}</div>
                        </div>
                        <div className="table-cell serial-number">
                            {asset.serialNumber}
                        </div>
                        <div className="table-cell asset-number">
                            {asset.assetNumber}
                        </div>
                        <div className="table-cell location">
                            <div className="location-name">{asset.location}</div>
                            <div className="location-code">HQ</div>
                        </div>
                        <div className="table-cell date">{asset.assignedDate}</div>
                        <div className="table-cell assigned-to">{asset.assignedTo}</div>
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
        </div>
    );
};