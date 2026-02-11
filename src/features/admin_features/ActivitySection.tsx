import React from 'react';
import './dashboard.css';

export const ActivitySection: React.FC = () => {
    const activities = [
        {
            icon: 'logout',
            color: 'lime',
            title: 'Thabo Mokoena checked out Precision M7510',
            location: 'Pretoria Hub • 10:45 AM'
        },
        {
            icon: 'login',
            color: 'turquoise',
            title: 'Lerato Molefe returned MacBook Air M2',
            location: 'Cape Town Lab • 09:12 AM'
        },
        {
            icon: 'construction',
            color: 'amber',
            title: 'Andile Dlamini scheduled maintenance',
            location: 'Durban Tech Hub • 08:30 AM'
        },
        {
            icon: 'person_add',
            color: 'lime',
            title: 'Nomvula Sithole authorized new assets',
            location: 'Regional HQ • Yesterday'
        }
    ];

    return (
        <div className="dashboard-activity">
            <div className="activity-header">
                <h4>
                    <span className="material-icons">history</span>
                    Recent Activity
                </h4>
            </div>
            <div className="activity-list">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className={`activity-icon ${activity.color}`}>
                            <span className="material-icons">{activity.icon}</span>
                        </div>
                        <div className="activity-content">
                            <p className="activity-title">{activity.title}</p>
                            <p className="activity-location">{activity.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};