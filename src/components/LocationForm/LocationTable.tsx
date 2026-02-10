import React from 'react';
import { Button } from '../ui/Button';
import { Location } from '../../core/entities/Location';

interface LocationTableProps {
    locations: Location[];
    onViewAssets: (locationId: string) => void;
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
    loading?: boolean;
}

export const LocationTable: React.FC<LocationTableProps> = ({
    locations,
    onViewAssets,
    onEdit,
    onDelete,
    loading = false
}) => {
    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
        active: {
            bg: 'rgba(208, 250, 228, 0.3)',
            text: '#649e84',
            border: 'rgba(208, 250, 228, 0.5)'
        },
        maintenance: {
            bg: 'rgba(253, 242, 198, 0.3)',
            text: '#b67652',
            border: 'rgba(253, 242, 198, 0.5)'
        },
        offline: {
            bg: 'rgba(241, 245, 249, 0.3)',
            text: '#757b83',
            border: 'rgba(241, 245, 249, 0.5)'
        }
    };

    const typeColors: Record<string, { bg: string; text: string; border: string }> = {
        hq: {
            bg: 'rgba(219, 234, 254, 0.3)',
            text: '#6192f1',
            border: 'rgba(219, 234, 254, 0.5)'
        },
        hub: {
            bg: 'rgba(254, 243, 199, 0.3)',
            text: '#e49f4c',
            border: 'rgba(254, 243, 199, 0.5)'
        },
        branch: {
            bg: 'rgba(242, 231, 255, 0.3)',
            text: '#b065f0',
            border: 'rgba(242, 231, 255, 0.5)'
        },
        site: {
            bg: 'rgba(240, 244, 249, 0.3)',
            text: '#768495',
            border: 'rgba(240, 244, 249, 0.5)'
        }
    };

    const getTypeAbbreviation = (type: string): string => {
        switch (type) {
            case 'hq': return 'HQ';
            case 'hub': return 'Hub';
            case 'branch': return 'Branch';
            case 'site': return 'Site';
            default: return 'Loc';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading locations...</p>
            </div>
        );
    }

    if (locations.length === 0) {
        return (
            <div className="empty-container">
                <span className="material-icons">location_off</span>
                <p>No locations found</p>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="locations-table">
                <thead>
                    <tr>
                        <th>LOCATION NAME</th>
                        <th>ADDRESS</th>
                        <th>TOTAL ASSETS</th>
                        <th>PRIMARY CONTACT</th>
                        <th>STATUS</th>
                        <th className="actions-header">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((location) => (
                        <tr key={location.id} className="location-row">
                            <td className="location-info-cell">
                                <div
                                    className="location-icon"
                                    style={{
                                        backgroundColor: typeColors[location.type]?.bg,
                                        borderColor: typeColors[location.type]?.border
                                    }}
                                >
                                    <span
                                        className="location-icon-text"
                                        style={{ color: typeColors[location.type]?.text }}
                                    >
                                        {getTypeAbbreviation(location.type)}
                                    </span>
                                </div>
                                <div className="location-details">
                                    <span className="location-name">{location.name}</span>
                                    <span className="location-type">
                                        {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                                    </span>
                                </div>
                            </td>
                            <td className="location-address">
                                {location.address}
                            </td>
                            <td className="total-assets">
                                <span className="assets-count">{location.totalAssets}</span>
                            </td>
                            <td className="contact-cell">
                                <div className="contact-info">
                                    <span className="contact-name">{location.primaryContact?.name || 'Not assigned'}</span>
                                    <span className="contact-email">{location.primaryContact?.email || 'N/A'}</span>
                                    {location.primaryContact?.phone && (
                                        <span className="contact-phone">{location.primaryContact.phone}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div
                                    className="status-badge"
                                    style={{
                                        backgroundColor: statusColors[location.status]?.bg,
                                        color: statusColors[location.status]?.text,
                                        borderColor: statusColors[location.status]?.border
                                    }}
                                >
                                    {location.status?.charAt(0).toUpperCase() + location.status?.slice(1)}
                                </div>
                            </td>
                            <td className="actions-cell">
                                <div className="action-buttons">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon="visibility"
                                        onClick={() => onViewAssets(location.id)}
                                        title="View Assets"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon="edit"
                                        onClick={() => onEdit(location)}
                                        title="Edit"
                                    />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        icon="delete"
                                        onClick={() => onDelete(location)}
                                        title="Delete"
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};