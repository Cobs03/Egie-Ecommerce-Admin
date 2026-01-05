import React from 'react';
import { X } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  show, 
  submission, 
  onConfirm, 
  onClose 
}) => {
  if (!show || !submission) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2>Delete Submission</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ padding: "20px 0" }}>
            <p style={{ marginBottom: "16px", fontSize: "16px" }}>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </p>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <p>
                <strong>From:</strong> {submission.name}
              </p>
              <p>
                <strong>Email:</strong> {submission.email}
              </p>
              <p>
                <strong>Message:</strong>{" "}
                {submission.message?.substring(0, 100)}...
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={onConfirm}
              className="primary-button"
              style={{ backgroundColor: "#ef4444" }}
            >
              Delete Submission
            </button>
            <button onClick={onClose} className="secondary-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
