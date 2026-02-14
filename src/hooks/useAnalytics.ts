import { useState, useEffect } from 'react';
import {
    analyticsService,
    DashboardStats,
    ConditionStats
} from '../../backend-firebase/src/services/AnalyticsService';

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await analyticsService.getAssetDashboardStats();
                setStats(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch dashboard statistics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};

export const useAssetConditionStats = () => {
    const [stats, setStats] = useState<ConditionStats | null>(null); // Fixed: Use ConditionStats type instead of any
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await analyticsService.getAssetConditionStats();
                setStats(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch condition statistics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};