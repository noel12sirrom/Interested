import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendLinkRequest, getLinkRequestStatus } from '../firebase/eventService';
import { createNotification } from '../firebase/notificationService';
import { FaLink, FaCheck, FaTimes, FaHourglassHalf, FaPaperPlane } from 'react-icons/fa';
import '../styles/LinkRequestButton.css';

interface LinkRequestButtonProps {
  eventId: string;
  hostId: string;
  eventTitle: string;
}

const LinkRequestButton: React.FC<LinkRequestButtonProps> = ({ eventId, hostId, eventTitle }) => {
  const { user, userProfile } = useAuth();
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (user) {
        const status = await getLinkRequestStatus(eventId, user.uid);
        setRequestStatus(status);
      }
    };
    fetchRequestStatus();
  }, [eventId, user]);

  const handleLinkRequest = async () => {
    if (!user || !userProfile) return;
    
    try {
      setIsLoading(true);
      await sendLinkRequest(eventId, user.uid, userProfile.displayName || 'Anonymous');
      await createNotification(
        eventId,
        eventTitle,
        user.uid,
        userProfile.displayName || 'Anonymous',
        hostId
      );
      setRequestStatus('pending');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Error sending link request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.uid === hostId) return null;

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <FaPaperPlane className="sending" /> Sending Request...
        </>
      );
    }

    if (showSuccess) {
      return (
        <>
          <FaCheck /> Request Sent!
        </>
      );
    }

    switch (requestStatus) {
      case 'pending':
        return (
          <>
            <FaHourglassHalf /> Request Pending
          </>
        );
      case 'accepted':
        return (
          <>
            <FaCheck /> Linked
          </>
        );
      case 'rejected':
        return (
          <>
            <FaTimes /> Request Denied
          </>
        );
      default:
        return (
          <>
            <FaLink /> Request to Link
          </>
        );
    }
  };

  return (
    <button
      className={`link-request-button ${requestStatus} ${isLoading ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
      onClick={handleLinkRequest}
      disabled={isLoading || requestStatus !== 'none'}
      title={
        requestStatus === 'pending'
          ? 'Your request is being reviewed'
          : requestStatus === 'accepted'
          ? 'You are linked to this event'
          : requestStatus === 'rejected'
          ? 'Your request was denied'
          : 'Send a link request to the event creator'
      }
    >
      {getButtonContent()}
    </button>
  );
};

export default LinkRequestButton; 