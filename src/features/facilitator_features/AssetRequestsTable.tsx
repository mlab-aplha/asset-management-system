import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../backend-firebase/src/firebase/config';

export const AssetRequestsTable: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [location, setLocation] = useState('All Locations');
    const [sort, setSort] = useState('Sort by');

    const assets = [
        { id: '1', name: 'Macbook Pro M2 - 14"', icon: '💻', color: '#3b82f6', category: 'Computing', location: 'HQ - Floor 4', status: 'Available' },
        { id: '2', name: 'Dell XPS 15', icon: '💻', color: '#3b82f6', category: 'Computing', location: 'HQ - Floor 4', status: 'Available' },
        { id: '3', name: 'Herman Miller Aerop', icon: '🪑', color: '#10b981', category: 'Furniture', location: 'West Wing - R402', status: 'In Use' },
        { id: '4', name: 'Epson 4K Projector', icon: '📽️', color: '#f59e0b', category: 'AV Equipment', location: 'Main Conference', status: 'Maintenance' },
        { id: '5', name: 'Sony Alpha A7R IV', icon: '📷', color: '#ef4444', category: 'Photography', location: 'Studio B', status: 'Available' },
        { id: '6', name: 'Logitech MX Master 3', icon: '🖱️', color: '#10b981', category: 'Computing', location: 'West Wing - R402', status: 'Available' }
    ];

    const categories = ['All Categories', 'Computing', 'Furniture', 'AV Equipment', 'Photography'];
    const locations = ['All Locations', 'HQ - Floor 4', 'West Wing - R402', 'Main Conference', 'Studio B'];
    const sortOptions = ['Sort by', 'Name (A-Z)', 'Name (Z-A)', 'Status', 'Category', 'Location'];

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    // Filter assets
    const filtered = assets.filter(a => {
        const matchSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'All Categories' || a.category === category;
        const matchLocation = location === 'All Locations' || a.location === location;
        return matchSearch && matchCategory && matchLocation;
    });

    // Sort assets
    const sorted = [...filtered].sort((a, b) => {
        if (sort === 'Name (A-Z)') return a.name.localeCompare(b.name);
        if (sort === 'Name (Z-A)') return b.name.localeCompare(a.name);
        if (sort === 'Category') return a.category.localeCompare(b.category);
        if (sort === 'Location') return a.location.localeCompare(b.location);
        if (sort === 'Status') return a.status.localeCompare(b.status);
        return 0;
    });

    const handleRequest = async (asset: any) => {
        if (!user) return alert('Please login');
        try {
            await addDoc(collection(db, 'requests'), {
                assetId: asset.id, assetName: asset.name, assetCategory: asset.category,
                requesterId: user.uid, requesterName: user.email, status: 'pending',
                requestDate: serverTimestamp()
            });
            alert(`✅ Requested ${asset.name}`);
        } catch (error) {
            alert('Failed to submit request');
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Available') return '#10b981';
        if (status === 'In Use') return '#3b82f6';
        if (status === 'Maintenance') return '#f59e0b';
        return '#666';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <div style={{ color: '#333' }}>Loading assets...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Asset Requests</h1>

            {/* Filter Row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ flex: 2, minWidth: '250px' }}>
                    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '5px', padding: '0 10px', background: '#fff' }}>
                        <span style={{ padding: '10px 5px', color: '#666' }}>🔍</span>
                        <input 
                            placeholder="Search assets..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            style={{ width: '100%', padding: '10px', border: 'none', outline: 'none', color: '#333' }}
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff', color: '#333' }}
                    >
                        {categories.map(c => <option key={c} style={{ color: '#333' }}>{c}</option>)}
                    </select>
                </div>

                {/* Location Filter */}
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <select 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff', color: '#333' }}
                    >
                        {locations.map(l => <option key={l} style={{ color: '#333' }}>{l}</option>)}
                    </select>
                </div>

                {/* Sort */}
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <select 
                        value={sort} 
                        onChange={e => setSort(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff', color: '#333' }}
                    >
                        {sortOptions.map(s => <option key={s} style={{ color: '#333' }}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div style={{ marginBottom: '15px', color: '#666' }}>
                Showing <span style={{ color: '#333', fontWeight: 'bold' }}>{sorted.length}</span> of {assets.length} assets
            </div>

            {/* Table Header */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '50px 2fr 1fr 1.5fr 1fr 80px', 
                gap: '10px', 
                padding: '12px 10px', 
                background: '#f5f5f5', 
                fontWeight: 'bold',
                borderRadius: '5px',
                marginBottom: '5px',
                color: '#333'
            }}>
                <div></div>
                <div>ASSET NAME</div>
                <div>CATEGORY</div>
                <div>LOCATION</div>
                <div>STATUS</div>
                <div>ACTION</div>
            </div>

            {/* Asset Rows */}
            {sorted.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '5px', color: '#666' }}>
                    No assets match your filters
                </div>
            ) : (
                sorted.map(asset => (
                    <div key={asset.id} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '50px 2fr 1fr 1.5fr 1fr 80px', 
                        gap: '10px', 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        marginTop: '5px', 
                        borderRadius: '5px',
                        background: '#fff',
                        alignItems: 'center'
                    }}>
                        <div style={{ 
                            background: asset.color, 
                            width: '35px', 
                            height: '35px', 
                            borderRadius: '5px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            fontSize: '18px'
                        }}>
                            {asset.icon}
                        </div>
                        <div style={{ color: '#333', fontWeight: '500' }}>{asset.name}</div>
                        <div style={{ color: '#666' }}>{asset.category}</div>
                        <div style={{ color: '#666' }}>{asset.location}</div>
                        <div>
                            <span style={{ 
                                background: getStatusColor(asset.status) + '20', 
                                color: getStatusColor(asset.status), 
                                padding: '4px 12px', 
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                {asset.status}
                            </span>
                        </div>
                        <div>
                            <button 
                                onClick={() => handleRequest(asset)} 
                                style={{ 
                                    background: '#000', 
                                    color: '#fff', 
                                    border: 'none', 
                                    padding: '8px 12px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
                            >
                                Request
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AssetRequestsTable;
