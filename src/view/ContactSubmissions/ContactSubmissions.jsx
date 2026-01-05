import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ContactService from '../../services/ContactService';
import { AdminLogService } from '../../services/AdminLogService';
import { useAuth } from '../../contexts/AuthContext';
import StatsGrid from './components/StatsGrid';
import FilterButtons from './components/FilterButtons';
import SearchBox from './components/SearchBox';
import SubmissionCard from './components/SubmissionCard';
import ReplyModal from './components/ReplyModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import './ContactSubmissions.css';

const ContactSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);

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

  const handleDelete = (submission) => {
    setSubmissionToDelete(submission);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    
    console.log('🗑️ Attempting to delete submission:', submissionToDelete.id);
    
    try {
      const result = await ContactService.deleteSubmission(submissionToDelete.id);
      console.log('Delete result:', result);
      
      if (result.success) {
        // Create admin log for deletion
        if (user?.id) {
          console.log('📝 Creating delete log...');
          const logResult = await AdminLogService.createLog({
            userId: user.id,
            actionType: 'Contact Deleted',
            actionDescription: `Deleted contact submission from ${submissionToDelete.name}`,
            targetType: 'contact_submissions',
            targetId: null,
            metadata: {
              submissionId: submissionToDelete.id,
              customerName: submissionToDelete.name,
              customerEmail: submissionToDelete.email,
              submissionSubject: submissionToDelete.subject || 'No subject',
              messagePreview: submissionToDelete.message?.substring(0, 100),
            },
          });
          console.log('Log result:', logResult);
        }
        
        // Close modal and clear state first
        setShowDeleteModal(false);
        setSubmissionToDelete(null);
        
        // Show success message
        toast.success('Submission deleted successfully');
        
        // Wait a moment then refresh data
        setTimeout(() => {
          console.log('🔄 Refreshing submissions list...');
          fetchSubmissions();
          fetchStats();
        }, 100);
      } else {
        console.error('❌ Delete failed:', result.error);
        toast.error(result.error || 'Failed to delete submission');
      }
    } catch (err) {
      console.error('❌ Delete exception:', err);
      toast.error('An error occurred while deleting');
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
      // Create admin log for reply sent
      if (user?.id) {
        await AdminLogService.createLog({
          userId: user.id,
          actionType: 'Contact Reply Sent',
          actionDescription: `Replied to contact submission from ${selectedSubmission.name}`,
          targetType: 'contact_submissions',
          targetId: null,
          metadata: {
            customerName: selectedSubmission.name,
            customerEmail: selectedSubmission.email,
            replyPreview: replyMessage.substring(0, 100),
            submissionSubject: selectedSubmission.subject,
          },
        });
      }
      
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
      <hr
        style={{
          marginBottom: "24px",
          border: "none",
          borderTop: "1px solid #e0e0e0",
        }}
      />
      {/* Statistics Cards */}
      <StatsGrid stats={stats} />

      {/* Filters and Search */}
      <div className="filter-search-section">
        <FilterButtons filter={filter} setFilter={setFilter} />
        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Submissions List */}
      {loading ? (
        <LoadingSpinner />
      ) : submissions.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onReply={handleReply}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <ReplyModal
        show={showReplyModal}
        selectedSubmission={selectedSubmission}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        onSend={sendReply}
        onClose={() => setShowReplyModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        submission={submissionToDelete}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ContactSubmissions;
