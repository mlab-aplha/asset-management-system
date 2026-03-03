import React, { useState, useEffect } from 'react';
import { LocationService } from '../../../backend-firebase/src/services/LocationService';

interface Location {
    id: string;
    name: string;
    code: string;
    type: string;
}

interface LocationSelectorProps {
    selectedLocations: string[]; // Array of location IDs
    onChange: (locationIds: string[]) => void;
    disabled?: boolean;
    label?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    selectedLocations = [],
    onChange,
    disabled = false,
    label = "Assigned Locations"
}) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        setLoading(true);
        try {
            const result = await LocationService.getAllLocations();
            if (result.success && result.data) {
                // Filter only active locations
                const activeLocations = result.data
                    .filter(loc => loc.status === 'active')
                    .map(loc => ({
                        id: loc.id,
                        name: loc.name,
                        code: loc.code || '',
                        type: loc.type || 'hub'
                    }));
                setLocations(activeLocations);
            }
        } catch (error) {
            console.error('Error loading locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleLocation = (locationId: string) => {
        if (selectedLocations.includes(locationId)) {
            onChange(selectedLocations.filter(id => id !== locationId));
        } else {
            onChange([...selectedLocations, locationId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedLocations.length === locations.length) {
            onChange([]);
        } else {
            onChange(locations.map(loc => loc.id));
        }
    };

    return (
        <div className="location-selector">
            <label className="form-label">
                {label} <span className="location-count">{selectedLocations.length} selected</span>
            </label>

            <div className="location-selector-container">
                {/* Search input */}
                <div className="location-search">
                    <span className="material-icons search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        disabled={disabled}
                        className="location-search-input"
                    />
                </div>

                {/* Selected locations chips */}
                {selectedLocations.length > 0 && (
                    <div className="selected-locations">
                        {locations
                            .filter(loc => selectedLocations.includes(loc.id))
                            .map(loc => (
                                <div key={loc.id} className="location-chip">
                                    <span className="location-chip-name">{loc.name}</span>
                                    <span className="location-chip-code">{loc.code}</span>
                                    <button
                                        type="button"
                                        className="location-chip-remove"
                                        onClick={() => handleToggleLocation(loc.id)}
                                        disabled={disabled}
                                    >
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                {/* Dropdown for location selection */}
                {showDropdown && !disabled && (
                    <div className="location-dropdown">
                        <div className="dropdown-header">
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={handleSelectAll}
                            >
                                {selectedLocations.length === locations.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                type="button"
                                className="close-dropdown"
                                onClick={() => setShowDropdown(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="locations-list">
                            {loading ? (
                                <div className="loading-indicator">
                                    <div className="spinner"></div>
                                    <span>Loading locations...</span>
                                </div>
                            ) : filteredLocations.length > 0 ? (
                                filteredLocations.map(loc => (
                                    <div
                                        key={loc.id}
                                        className={`location-item ${selectedLocations.includes(loc.id) ? 'selected' : ''}`}
                                        onClick={() => handleToggleLocation(loc.id)}
                                    >
                                        <div className="location-item-info">
                                            <span className="location-item-name">{loc.name}</span>
                                            <span className="location-item-code">{loc.code}</span>
                                            <span className="location-item-type">{loc.type}</span>
                                        </div>
                                        {selectedLocations.includes(loc.id) && (
                                            <span className="material-icons check-icon">check_circle</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <span className="material-icons">location_off</span>
                                    <p>No locations found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <small className="form-hint">
                Select locations this user will have access to. Users can only see assets in their assigned locations.
            </small>
        </div>
    );
};