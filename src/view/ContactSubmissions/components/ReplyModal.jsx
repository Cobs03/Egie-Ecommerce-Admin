import React from 'react';
import { X } from 'lucide-react';

const ReplyModal = ({ 
  show, 
  selectedSubmission, 
  replyMessage, 
  setReplyMessage, 
  onSend, 
  onClose 
}) => {
  if (!show || !selectedSubmission) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reply to Customer</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="original-message">
            <p>
              <strong>To:</strong> {selectedSubmission.email}
            </p>
            <p>
              <strong>Customer:</strong> {selectedSubmission.name}
            </p>
            <p>
              <strong>Original Message:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap", marginTop: "8px" }}>
              {selectedSubmission.message}
            </p>
          </div>

          <div className="reply-textarea-wrapper">
            <label>Your Reply</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={8}
              className="reply-textarea"
              placeholder="Type your reply here..."
            />
          </div>

          <div className="modal-actions">
            <button onClick={onSend} className="primary-button">
              Send Reply
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

export default ReplyModal;
