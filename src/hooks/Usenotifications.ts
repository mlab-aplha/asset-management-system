// src/hooks/Usenotifications.ts
import { useState, useCallback, useEffect } from 'react';
import { NotificationService, Notification } from '../../backend-firebase/src/services/Notificationservice';
import { useAuth } from './useAuth';

// Re-export the service type so pages don't need to import from two places
export type AppNotification = Notification;

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // All NotificationService methods are static — call them directly, no getInstance()
    const loadNotifications = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        setError(null);
        try {
            const data = await NotificationService.getForUser(user.uid);
            setNotifications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n),
            );
        } catch (err) {
            console.error('markAsRead failed:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;
        try {
            await NotificationService.markAllAsRead(user.uid);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('markAllAsRead failed:', err);
        }
    }, [user?.uid]);

    const deleteNotification = useCallback((notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    useEffect(() => {
        if (user?.uid) loadNotifications();
    }, [user?.uid, loadNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
};