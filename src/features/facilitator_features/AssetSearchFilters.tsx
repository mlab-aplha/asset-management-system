import React, { useState } from 'react';
import './asset-requests-styles.css';

export const AssetSearchFilters: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortBy, setSortBy] = useState('');

    const categories = [
        'All Categories',
        'Computing',
        'AV Equipment',
        'Photography',
        'Furniture',
        'Networking'
    ];

    const locations = [
        'All Locations',
        'HQ - Floor 4',
        'Main Conference',
        'Studio B',
        'West Wing - R402'
    ];

    const sortOptions = [
        'Sort by',
        'Name (A-Z)',
        'Name (Z-A)',
        'Status',
        'Recent',
        'Availability'
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <div className="search-filters-container">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                    <span className="search-icon material-icons">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assets by name, category, or ID..."
                        className="search-input"
                    />
                </div>

                <div className="filter-select-wrapper">
                    <span className="filter-icon material-icons">category</span>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="filter-select"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-select-wrapper">
                    <span className="filter-icon material-icons">location_on</span>
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="filter-select"
                    >
                        {locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-select-wrapper">
                    <span className="filter-icon material-icons">sort</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        {sortOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    );
};