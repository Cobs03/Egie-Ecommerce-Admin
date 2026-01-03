import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ContactService from '../../services/ContactService';
import { 
  Mail, 
  Search, 
  Eye, 
  Trash2, 
  Archive, 
  Reply, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import './ContactSubmissions.css';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [filter, searchTerm]);

  const fetchSubmissions = async () => {
    setLoading(true);
    const result = await ContactService.getContactSubmissions({
      status: filter,
      searchTerm: searchTerm.trim()
    });

    if (result.success) {
      setSubmissions(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await ContactService.getSubmissionStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const result = await ContactService.updateSubmissionStatus(id, newStatus);
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
      fetchSubmissions();
      fetchStats();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
      const result = await ContactService.deleteSubmission(id);
      if (result.success) {
        toast.success('Submission deleted');
        fetchSubmissions();
        fetchStats();
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleReply = (submission) => {
    setSelectedSubmission(submission);
    setReplyMessage(`Hi ${submission.name},\n\nThank you for contacting us.\n\n`);
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    const result = await ContactService.sendReplyEmail({
      to: selectedSubmission.email,
      customerName: selectedSubmission.name,
      subject: `Re: Your inquiry - ${selectedSubmission.name}`,
      message: replyMessage,
      submissionId: selectedSubmission.id
    });

    if (result.success) {
      toast.success(result.message);
      setShowReplyModal(false);
      setReplyMessage('');
      fetchSubmissions();
      fetchStats();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-green-100 text-green-800 border-green-300',
      read: 'bg-blue-100 text-blue-800 border-blue-300',
      replied: 'bg-purple-100 text-purple-800 border-purple-300',
      archived: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="contact-submissions-container">
      {/* Header */}
      <div className="contact-header">
        <h1>Contact Submissions</h1>
        <p>Manage and respond to customer inquiries</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeft: '4px solid #2196f3' }}>
            <div className="stat-value" style={{ color: '#2196f3' }}>{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.new}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #2196f3' }}>
            <div className="stat-value" style={{ color: '#2196f3' }}>{stats.read}</div>
            <div className="stat-label">Read</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #9c27b0' }}>
            <div className="stat-value" style={{ color: '#9c27b0' }}>{stats.replied}</div>
            <div className="stat-label">Replied</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #757575' }}>
            <div className="stat-value" style={{ color: '#757575' }}>{stats.archived}</div>
            <div className="stat-label">Archived</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
            <div className="stat-value" style={{ color: '#6366f1' }}>{stats.thisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filter-search-section">
        <div className="filter-buttons">
          {['all', 'new', 'read', 'replied', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-button ${filter === status ? 'active' : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <Mail size={60} />
          <h3>No submissions found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : 'No contact form submissions yet'}</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map(submission => (
            <div key={submission.id} className={`submission-card ${submission.status === 'new' ? 'new' : ''}`}>
              <div className="submission-content">
                <div className="submission-info">
                  <div className="submission-header">
                    <div className="customer-info">
                      <h3>{submission.name}</h3>
                      <a href={`mailto:${submission.email}`}>{submission.email}</a>
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
                      <span style={{ color: '#9c27b0' }}>
                        <CheckCircle size={14} />
                        Replied: {formatDate(submission.replied_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="action-buttons">
                  <button onClick={() => handleReply(submission)} className="action-button primary">
                    <Reply size={16} />
                    Reply via Email
                  </button>

                  {submission.status !== 'read' && (
                    <button onClick={() => handleStatusChange(submission.id, 'read')} className="action-button secondary">
                      <Eye size={16} />
                      Mark as Read
                    </button>
                  )}

                  {submission.status !== 'archived' && (
                    <button onClick={() => handleStatusChange(submission.id, 'archived')} className="action-button secondary">
                      <Archive size={16} />
                      Archive
                    </button>
                  )}

                  <button onClick={() => handleDelete(submission.id)} className="action-button danger">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reply to Customer</h2>
              <button onClick={() => setShowReplyModal(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="original-message">
                <p><strong>To:</strong> {selectedSubmission.email}</p>
                <p><strong>Customer:</strong> {selectedSubmission.name}</p>
                <p><strong>Original Message:</strong></p>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{selectedSubmission.message}</p>
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
                <button onClick={sendReply} className="primary-button">
                  Send Reply
                </button>
                <button onClick={() => setShowReplyModal(false)} className="secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
