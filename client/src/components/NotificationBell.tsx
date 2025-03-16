import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { respondToLinkRequest } from '../firebase/eventService';
import { updateNotificationStatus, markNotificationAsRead, createResponseNotification } from '../firebase/notificationService';
import '../styles/NotificationBell.css';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount } = useNotifications();
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleAccept = async (notification: any) => {
    try {
      await respondToLinkRequest(notification.eventId, notification.fromUserId, 'accepted');
      await updateNotificationStatus(notification.id, 'accepted');
      await markNotificationAsRead(notification.id);
      
      // Create a response notification for the requester
      if (userProfile) {
        await createResponseNotification(
          notification.eventId,
          notification.eventTitle,
          userProfile.uid,
          userProfile.displayName,
          notification.fromUserId,
          'accepted'
        );
      }
    } catch (error) {
      console.error('Error accepting link request:', error);
    }
  };

  const handleReject = async (notification: any) => {
    try {
      await respondToLinkRequest(notification.eventId, notification.fromUserId, 'rejected');
      await updateNotificationStatus(notification.id, 'rejected');
      await markNotificationAsRead(notification.id);
      
      // Create a response notification for the requester
      if (userProfile) {
        await createResponseNotification(
          notification.eventId,
          notification.eventTitle,
          userProfile.uid,
          userProfile.displayName,
          notification.fromUserId,
          'rejected'
        );
      }
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

  const renderNotificationContent = (notification: any) => {
    if (notification.type === 'linkRequest') {
      return (
        <>
          <p>
            <strong>{notification.fromUserName}</strong> wants to link with your event{' '}
            <strong>{notification.eventTitle}</strong>
          </p>
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
        </>
      );
    } else if (notification.type === 'linkResponse') {
      return (
        <p>
          <strong>{notification.fromUserName}</strong> has{' '}
          <span className={notification.status}>
            {notification.status}
          </span>{' '}
          your request to link with{' '}
          <strong>{notification.eventTitle}</strong>
        </p>
      );
    }
  };

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
                    {renderNotificationContent(notification)}
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
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