import { supabase } from '../lib/supabase';

/**
 * Service for handling contact form submissions in admin panel
 */
class ContactService {
  /**
   * Get all contact submissions with filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status (new, read, replied, archived)
   * @param {string} filters.searchTerm - Search in name, email, or message
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async getContactSubmissions(filters = {}) {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,message.ilike.%${filters.searchTerm}%`
        );
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching contact submissions:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch contact submissions'
        };
      }

      return {
        success: true,
        data,
        count
      };
    } catch (error) {
      console.error('Unexpected error fetching contact submissions:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get single contact submission by ID
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async getSubmissionById(id) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching submission:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch submission'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Unexpected error fetching submission:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Update contact submission status
   * @param {string} id - Submission ID
   * @param {string} status - New status (new, read, replied, archived)
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async updateSubmissionStatus(id, status, adminNotes = null) {
    try {
      const updateData = { status };
      
      if (adminNotes !== null) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'replied') {
        updateData.replied_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission status:', error);
        return {
          success: false,
          error: error.message || 'Failed to update submission status'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Unexpected error updating submission:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Mark submission as read
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async markAsRead(id) {
    return this.updateSubmissionStatus(id, 'read');
  }

  /**
   * Mark submission as replied
   * @param {string} id - Submission ID
   * @param {string} adminNotes - Notes about the reply
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async markAsReplied(id, adminNotes) {
    return this.updateSubmissionStatus(id, 'replied', adminNotes);
  }

  /**
   * Archive submission
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} Result with success status and data/error
   */
  static async archiveSubmission(id) {
    return this.updateSubmissionStatus(id, 'archived');
  }

  /**
   * Delete submission (permanent)
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} Result with success status
   */
  static async deleteSubmission(id) {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting submission:', error);
        return {
          success: false,
          error: error.message || 'Failed to delete submission'
        };
      }

      return {
        success: true,
        message: 'Submission deleted successfully'
      };
    } catch (error) {
      console.error('Unexpected error deleting submission:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get contact submission statistics
   * @returns {Promise<Object>} Result with success status and statistics
   */
  static async getSubmissionStats() {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('status, created_at');

      if (error) {
        console.error('Error fetching submission stats:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch statistics'
        };
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: data.length,
        new: data.filter(item => item.status === 'new').length,
        read: data.filter(item => item.status === 'read').length,
        replied: data.filter(item => item.status === 'replied').length,
        archived: data.filter(item => item.status === 'archived').length,
        today: data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= today;
        }).length,
        thisWeek: data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= weekAgo;
        }).length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Unexpected error fetching stats:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Send reply email to customer via Supabase Edge Function
   * @param {Object} replyData
   * @param {string} replyData.to - Customer email
   * @param {string} replyData.customerName - Customer name
   * @param {string} replyData.subject - Email subject
   * @param {string} replyData.message - Reply message
   * @param {string} replyData.submissionId - Original submission ID
   * @returns {Promise<Object>} Result with success status
   */
  static async sendReplyEmail(replyData) {
    try {
      // Call Supabase Edge Function to send email via Resend
      const { data, error } = await supabase.functions.invoke('send-contact-reply', {
        body: {
          to: replyData.to,
          customerName: replyData.customerName,
          subject: replyData.subject,
          message: replyData.message,
          submissionId: replyData.submissionId
        }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        
        // Fallback to mailto if edge function fails
        const mailtoLink = `mailto:${replyData.to}?subject=${encodeURIComponent(replyData.subject)}&body=${encodeURIComponent(replyData.message)}`;
        window.open(mailtoLink, '_blank');
        
        // Still mark as replied
        await this.markAsReplied(
          replyData.submissionId,
          `Replied via email (fallback) on ${new Date().toLocaleString()}`
        );

        return {
          success: true,
          message: 'Email client opened (Edge function unavailable). Please send the email manually.'
        };
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Mark as replied in database
      await this.markAsReplied(
        replyData.submissionId,
        `Email sent automatically via Resend on ${new Date().toLocaleString()}`
      );

      return {
        success: true,
        message: 'Email sent successfully to customer!'
      };
    } catch (error) {
      console.error('Error sending reply email:', error);
      
      // Fallback to mailto
      try {
        const mailtoLink = `mailto:${replyData.to}?subject=${encodeURIComponent(replyData.subject)}&body=${encodeURIComponent(replyData.message)}`;
        window.open(mailtoLink, '_blank');
        
        await this.markAsReplied(
          replyData.submissionId,
          `Replied via email (fallback) on ${new Date().toLocaleString()}`
        );

        return {
          success: true,
          message: 'Email client opened. Please send the email manually.'
        };
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return {
          success: false,
          error: 'Failed to send email. Please try again.'
        };
      }
    }
  }
}

export default ContactService;
