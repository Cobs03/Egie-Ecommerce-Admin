import React from 'react';
import { Clock, CheckCircle, Reply, Eye, Archive, Trash2 } from 'lucide-react';

const SubmissionCard = ({ 
  submission, 
  onReply, 
  onStatusChange, 
  onDelete,
  formatDate 
}) => {
  return (
    <div
      className={`submission-card ${submission.status === "new" ? "new" : ""}`}
    >
      <div className="submission-content">
        <div className="submission-info">
          <div className="submission-header">
            <div className="customer-info">
              <h3>{submission.name}</h3>
              <a href={`mailto:${submission.email}`}>
                {submission.email}
              </a>
              {submission.phone && <p>📞 {submission.phone}</p>}
            </div>
            <span className={`status-badge ${submission.status}`}>
              {submission.status}
            </span>
          </div>

          <div className="submission-message">{submission.message}</div>

          {submission.admin_notes && (
            <div className="admin-notes">
              <strong>Admin Notes:</strong>
              <p>{submission.admin_notes}</p>
            </div>
          )}

          <div className="submission-meta">
            <span>
              <Clock size={14} />
              Submitted: {formatDate(submission.created_at)}
            </span>
            {submission.replied_at && (
              <span style={{ color: "#9c27b0" }}>
                <CheckCircle size={14} />
                Replied: {formatDate(submission.replied_at)}
              </span>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => onReply(submission)}
            className="action-button primary"
          >
            <Reply size={16} />
            Reply via Email
          </button>

          {submission.status !== "read" && (
            <button
              onClick={() => onStatusChange(submission.id, "read")}
              className="action-button secondary"
            >
              <Eye size={16} />
              Mark as Read
            </button>
          )}

          {submission.status !== "archived" && (
            <button
              onClick={() => onStatusChange(submission.id, "archived")}
              className="action-button secondary"
            >
              <Archive size={16} />
              Archive
            </button>
          )}

          <button
            onClick={() => onDelete(submission)}
            className="action-button danger"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;
