import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../backend-firebase/src/firebase/config';

interface LocationAsset {
    id: string;
    name: string;
    category: string;
    status: string;
    condition: string;
}

export const LocationAssetsTable: React.FC = () => {
    const { user } = useAuth();
    const [locationName, setLocationName] = useState('');
    const [assets, setAssets] = useState<LocationAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocationAndAssets = async () => {
            if (!user) return;

            try {
                // 1. Get user's assigned location from user document
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.data();
                const locationId = userData?.primaryLocationId;

                if (locationId) {
                    // 2. Get location name
                    const locationDoc = await getDoc(doc(db, 'locations', locationId));
                    setLocationName(locationDoc.data()?.name || 'Unknown Location');

                    // 3. Get all assets at this location
                    const assetsQuery = query(
                        collection(db, 'assets'),
                        where('currentLocationId', '==', locationId)
                    );
                    const assetsSnapshot = await getDocs(assetsQuery);
                    const assetsData = assetsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as LocationAsset[];
                    
                    setAssets(assetsData);
                }
            } catch (error) {
                console.error('Error fetching location assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocationAndAssets();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'available': return '#10b981';
            case 'assigned': return '#3b82f6';
            case 'maintenance': return '#f59e0b';
            default: return '#666';
        }
    };

    if (loading) return <div>Loading location assets...</div>;

    return (
        <div>
            {/* Location Header */}
            <div style={{
                backgroundColor: '#f0f7ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #3b82f6'
            }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#3b82f6' }}>
                    📍 Your Location: {locationName || 'No location assigned'}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>
                    Total assets at this location: {assets.length}
                </p>
            </div>

            {/* Assets Table */}
            {assets.length === 0 ? (
                <p>No assets found at your location</p>
            ) : (
                <div>
                    {assets.map(asset => (
                        <div key={asset.id} style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{asset.name}</h4>
                                <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                                    Category: {asset.category}
                                </p>
                                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                                    Condition: {asset.condition}
                                </p>
                            </div>
                            <div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    backgroundColor: getStatusColor(asset.status) + '20',
                                    color: getStatusColor(asset.status)
                                }}>
                                    {asset.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
