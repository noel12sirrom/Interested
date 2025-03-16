import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import { respondToLinkRequest } from '../firebase/eventService';
import { updateNotificationStatus, markNotificationAsRead } from '../firebase/notificationService';
import '../styles/NotificationBell.css';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleAccept = async (notification: any) => {
    try {
      await respondToLinkRequest(notification.eventId, notification.fromUserId, 'accepted');
      await updateNotificationStatus(notification.id, 'accepted');
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error accepting link request:', error);
    }
  };

  const handleReject = async (notification: any) => {
    try {
      await respondToLinkRequest(notification.eventId, notification.fromUserId, 'rejected');
      await updateNotificationStatus(notification.id, 'rejected');
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error rejecting link request:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-bell')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.status} ${notification.read ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    <p>
                      <strong>{notification.fromUserName}</strong> wants to link with your event{' '}
                      <strong>{notification.eventTitle}</strong>
                    </p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {notification.status === 'pending' && (
                    <div className="notification-actions">
                      <button
                        className="accept-button"
                        onClick={() => handleAccept(notification)}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleReject(notification)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {notification.status === 'accepted' && (
                    <div className="notification-status accepted">Accepted</div>
                  )}
                  {notification.status === 'rejected' && (
                    <div className="notification-status rejected">Rejected</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 