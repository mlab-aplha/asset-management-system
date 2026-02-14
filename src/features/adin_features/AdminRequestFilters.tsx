// src/features/requests/components/admin/AdminRequestFilters.tsx
import React, { useState } from 'react';
import { IRequestFilters } from '../../core/types/request.types';
import './admin-request-filters.css';

interface AdminRequestFiltersProps {
    onFilterChange: (filters: IRequestFilters) => void;
}

type FilterKey = keyof IRequestFilters;

export const AdminRequestFilters: React.FC<AdminRequestFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<IRequestFilters>({});
    const [isExpanded, setIsExpanded] = useState(false);

    const statusOptions = ['pending', 'under_review', 'approved', 'rejected', 'fulfilled', 'cancelled'] as const;
    const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const;

    const handleFilterChange = <K extends FilterKey>(key: K, value: IRequestFilters[K]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleStatusChange = (status: string, checked: boolean) => {
        const current = filters.status || [];
        const newStatus = checked
            ? [...current, status]
            : current.filter(s => s !== status);
        handleFilterChange('status', newStatus);
    };

    const handlePriorityChange = (priority: string, checked: boolean) => {
        const current = filters.priority || [];
        const newPriority = checked
            ? [...current, priority]
            : current.filter(p => p !== priority);
        handleFilterChange('priority', newPriority);
    };

    const handleDateChange = (type: 'from' | 'to', value: string) => {
        const date = value ? new Date(value) : undefined;
        if (type === 'from') {
            handleFilterChange('dateFrom', date);
        } else {
            handleFilterChange('dateTo', date);
        }
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    return (
        <div className="admin-filters-container">
            <div className="filters-header">
                <button
                    className="toggle-filters-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="material-icons">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    Filters
                </button>

                {Object.keys(filters).length > 0 && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        <span className="material-icons">close</span>
                        Clear All
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="filters-content">
                    <div className="filters-grid">
                        {/* Status Filter */}
                        <div className="filter-group">
                            <label>Status</label>
                            <div className="checkbox-group">
                                {statusOptions.map(status => (
                                    <label key={status} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.status?.includes(status) || false}
                                            onChange={(e) => handleStatusChange(status, e.target.checked)}
                                        />
                                        <span className="status-text">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div className="filter-group">
                            <label>Priority</label>
                            <div className="checkbox-group">
                                {priorityOptions.map(priority => (
                                    <label key={priority} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.priority?.includes(priority) || false}
                                            onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                                        />
                                        <span className="priority-text">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="filter-group">
                            <label>Date Range</label>
                            <div className="date-inputs">
                                <input
                                    type="date"
                                    placeholder="From"
                                    value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => handleDateChange('from', e.target.value)}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    placeholder="To"
                                    value={filters.dateTo?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => handleDateChange('to', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="filter-group">
                            <label>Department</label>
                            <input
                                type="text"
                                placeholder="Filter by department"
                                value={filters.department || ''}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="search-filter">
                        <span className="material-icons">search</span>
                        <input
                            type="text"
                            placeholder="Search by request ID, requester, or items..."
                            value={filters.searchTerm || ''}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};