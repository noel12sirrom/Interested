import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/Modal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-confirmation">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="confirmation-content">
          <FaExclamationTriangle className="warning-icon" />
          <h2>Delete Event</h2>
          <p>Are you sure you want to delete "{eventTitle}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="confirmation-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="delete-button" onClick={onConfirm}>
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 