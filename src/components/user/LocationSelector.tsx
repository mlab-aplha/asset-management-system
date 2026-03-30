// src/components/user/LocationSelector.tsx
import React, { useState, useEffect } from 'react';
import { LocationService } from '../../../backend-firebase/src/services/LocationService';

interface Location {
    id: string;
    name: string;
    code: string;
    type: string;
}

interface LocationSelectorProps {
    selectedLocations: string[];
    onChange: (locationIds: string[]) => void;
    disabled?: boolean;
    label?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    selectedLocations = [],
    onChange,
    disabled = false,
    label = 'Assigned Locations',
}) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => { loadLocations(); }, []);

    const loadLocations = async () => {
        setLoading(true);
        try {
            const result = await LocationService.getAllLocations();
            if (result.success && result.data) {
                setLocations(
                    result.data
                        .filter(loc => loc.status === 'active')
                        .map(loc => ({
                            id: loc.id,
                            name: loc.name,
                            code: loc.code || '',
                            type: loc.type || 'hub',
                        })),
                );
            }
        } catch (error) {
            console.error('Error loading locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleToggle = (id: string) => {
        onChange(
            selectedLocations.includes(id)
                ? selectedLocations.filter(x => x !== id)
                : [...selectedLocations, id],
        );
    };

    const handleSelectAll = () => {
        onChange(
            selectedLocations.length === locations.length
                ? []
                : locations.map(l => l.id),
        );
    };

    return (
        <div className="location-selector">
            {/* ── Label properly associated via htmlFor ── */}
            <label htmlFor="location-search" className="form-label">
                {label}{' '}
                <span className="location-count">{selectedLocations.length} selected</span>
            </label>

            <div className="location-selector-container">
                {/* Search input — now has id + name + autoComplete */}
                <div className="location-search">
                    <span className="material-icons search-icon" aria-hidden="true">search</span>
                    <input
                        id="location-search"
                        name="locationSearch"
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        disabled={disabled}
                        className="location-search-input"
                        autoComplete="off"
                    />
                </div>

                {/* Selected chips */}
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
                                        onClick={() => handleToggle(loc.id)}
                                        disabled={disabled}
                                        aria-label={`Remove ${loc.name}`}
                                    >
                                        <span className="material-icons" aria-hidden="true">close</span>
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                {/* Dropdown */}
                {showDropdown && !disabled && (
                    <div className="location-dropdown">
                        <div className="dropdown-header">
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={handleSelectAll}
                            >
                                {selectedLocations.length === locations.length
                                    ? 'Deselect All'
                                    : 'Select All'}
                            </button>
                            <button
                                type="button"
                                className="close-dropdown"
                                onClick={() => setShowDropdown(false)}
                                aria-label="Close location dropdown"
                            >
                                <span className="material-icons" aria-hidden="true">close</span>
                            </button>
                        </div>

                        <div className="locations-list">
                            {loading ? (
                                <div className="loading-indicator">
                                    <div className="spinner" />
                                    <span>Loading locations…</span>
                                </div>
                            ) : filtered.length > 0 ? (
                                filtered.map(loc => (
                                    <div
                                        key={loc.id}
                                        className={`location-item ${selectedLocations.includes(loc.id) ? 'selected' : ''}`}
                                        onClick={() => handleToggle(loc.id)}
                                        role="option"
                                        aria-selected={selectedLocations.includes(loc.id)}
                                    >
                                        <div className="location-item-info">
                                            <span className="location-item-name">{loc.name}</span>
                                            <span className="location-item-code">{loc.code}</span>
                                            <span className="location-item-type">{loc.type}</span>
                                        </div>
                                        {selectedLocations.includes(loc.id) && (
                                            <span className="material-icons check-icon" aria-hidden="true">
                                                check_circle
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <span className="material-icons" aria-hidden="true">location_off</span>
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